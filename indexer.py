import requests
import os
import time
import json
from bs4 import BeautifulSoup
import chromadb
import google.generativeai as genai
from chromadb.utils import embedding_functions

# --- CONFIGURATION ---
GOOGLE_API_KEY = "AIzaSyA0j-TWhhay7rmclCP5_Xbfyec0XUFTHCE"
genai.configure(api_key=GOOGLE_API_KEY)

HEADERS = {
    "User-Agent": "StudentProject contact@bennett.edu.in",
    "Accept-Encoding": "gzip, deflate",
    "Host": "data.sec.gov"
}

class GeminiEmbeddingFunction(chromadb.EmbeddingFunction):
    def __call__(self, input):
        response = genai.embed_content(
            model="models/text-embedding-004",
            content=input,
            task_type="retrieval_document",
            title="Financial 10-K Document" 
        )
        return response['embedding']

def clean_html(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')
    return soup.get_text(separator=' ', strip=True)

def chunk_text(text, chunk_size=1000, overlap=100):
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start += (chunk_size - overlap)
    return chunks

def get_cik(ticker):
    ticker = ticker.upper()
    url = "https://www.sec.gov/files/company_tickers.json"
    headers = {"User-Agent": "StudentProject contact@bennett.edu.in"}
    try:
        response = requests.get(url, headers=headers)
        data = response.json()
        for key, entry in data.items():
            if entry['ticker'] == ticker:
                return str(entry['cik_str']).zfill(10), entry['title']
        return None, None
    except Exception as e:
        print(f"Error fetching CIK: {e}")
        return None, None

# --- MAIN STREAMING LOGIC ---
def process_ticker_stream(ticker, target_year=None):
    """
    Yields JSON strings to report progress.
    """
    yield json.dumps({"type": "log", "message": f"🚀 Starting search for {ticker}..."}) + "\n"
    
    # 1. Get CIK
    cik, company_name = get_cik(ticker)
    if not cik:
        yield json.dumps({"type": "error", "message": "Ticker not found in SEC database"}) + "\n"
        return
    
    yield json.dumps({"type": "log", "message": f"✅ Found {company_name} (CIK: {cik})"}) + "\n"

    # 2. Fetch Filing History
    url = f"https://data.sec.gov/submissions/CIK{cik}.json"
    try:
        response = requests.get(url, headers=HEADERS)
        data = response.json()
        filings = data['filings']['recent']
        
        target_accession = None
        target_doc = None
        found_year = None

        yield json.dumps({"type": "log", "message": f"🔍 Scanning filings for {target_year or 'latest'} 10-K..."}) + "\n"

        for i, form in enumerate(filings['form']):
            if form == '10-K':
                date = filings['filingDate'][i]
                filing_year = int(date.split("-")[0])
                
                if target_year:
                    if filing_year == int(target_year):
                        target_accession = filings['accessionNumber'][i]
                        target_doc = filings['primaryDocument'][i]
                        found_year = filing_year
                        break
                else:
                    target_accession = filings['accessionNumber'][i]
                    target_doc = filings['primaryDocument'][i]
                    found_year = filing_year
                    break
        
        if not target_accession:
            yield json.dumps({"type": "error", "message": f"No 10-K found for {target_year or 'latest'}"}) + "\n"
            return

        # 3. Download
        yield json.dumps({"type": "log", "message": f"⬇️ Downloading 10-K for {found_year}..."}) + "\n"
        
        accession_no_hyphen = target_accession.replace("-", "")
        dl_url = f"https://www.sec.gov/Archives/edgar/data/{cik.lstrip('0')}/{accession_no_hyphen}/{target_doc}"
        
        dl_headers = {"User-Agent": "StudentProject contact@bennett.edu.in", "Host": "www.sec.gov"}
        dl_response = requests.get(dl_url, headers=dl_headers)
        
        if dl_response.status_code != 200:
            yield json.dumps({"type": "error", "message": "Failed to download file from SEC"}) + "\n"
            return

        # 4. Process & Index
        yield json.dumps({"type": "log", "message": "📄 Parsing HTML and extracting text..."}) + "\n"
        clean_text = clean_html(dl_response.content)
        
        yield json.dumps({"type": "log", "message": "✂️ Splitting text into semantic chunks..."}) + "\n"
        chunks = chunk_text(clean_text)
        yield json.dumps({"type": "log", "message": f"   -> Generated {len(chunks)} chunks"}) + "\n"

        # 5. Add to ChromaDB
        yield json.dumps({"type": "log", "message": "🧠 Generating embeddings & indexing (this takes a moment)..."}) + "\n"
        
        chroma_client = chromadb.PersistentClient(path="chroma_db")
        gemini_ef = GeminiEmbeddingFunction()
        collection = chroma_client.get_or_create_collection(name="financial_filings", embedding_function=gemini_ef)
        
        ids = [f"{ticker}_{found_year}_{i}" for i in range(len(chunks))]
        metadatas = [{"company": ticker, "year": str(found_year), "source": "Live Fetch"} for _ in chunks]
        
        collection.add(documents=chunks, ids=ids, metadatas=metadatas)
        
        yield json.dumps({
            "type": "success", 
            "message": f"Successfully indexed {ticker} ({found_year})",
            "ticker": ticker,
            "year": found_year,
            "company": company_name
        }) + "\n"

    except Exception as e:
        yield json.dumps({"type": "error", "message": str(e)}) + "\n"