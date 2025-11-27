import requests
import os
import json
import time
from bs4 import BeautifulSoup
import chromadb
import google.generativeai as genai
from chromadb.utils import embedding_functions
from dotenv import load_dotenv # <--- RESTORED IMPORT

# --- CONFIGURATION ---
load_dotenv() # <--- RESTORED: Load environment variables
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY") # <--- RESTORED: Read from .env

# Safety check
if not GOOGLE_API_KEY:
    print("❌ ERROR: GOOGLE_API_KEY not found. Check your .env file.")
else:
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
def process_ticker_stream(ticker, depth=1):
    """
    depth: (int) Number of years to go back (1, 3, or 5).
    """
    yield json.dumps({"type": "log", "message": f"🚀 Starting search for {ticker} (Last {depth} years)..."}) + "\n"
    
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
        
        found_count = 0
        processed_years = []

        # Loop through filings
        for i, form in enumerate(filings['form']):
            if form == '10-K':
                date = filings['filingDate'][i]
                filing_year = int(date.split("-")[0])
                
                # Prevent duplicates if re-running
                if str(filing_year) in processed_years:
                    continue

                # PROCESSING LOGIC
                accession = filings['accessionNumber'][i]
                primary_doc = filings['primaryDocument'][i]
                
                yield json.dumps({"type": "log", "message": f"⬇️ Downloading 10-K for {filing_year}..."}) + "\n"
                
                # Download
                accession_no_hyphen = accession.replace("-", "")
                dl_url = f"https://www.sec.gov/Archives/edgar/data/{cik.lstrip('0')}/{accession_no_hyphen}/{primary_doc}"
                dl_headers = {"User-Agent": "StudentProject contact@bennett.edu.in", "Host": "www.sec.gov"}
                
                dl_response = requests.get(dl_url, headers=dl_headers)
                if dl_response.status_code == 200:
                    # Index
                    clean_text = clean_html(dl_response.content)
                    chunks = chunk_text(clean_text)
                    yield json.dumps({"type": "log", "message": f"   -> Indexing {len(chunks)} chunks for {filing_year}..."}) + "\n"
                    
                    chroma_client = chromadb.PersistentClient(path="chroma_db")
                    gemini_ef = GeminiEmbeddingFunction()
                    collection = chroma_client.get_or_create_collection(name="financial_filings", embedding_function=gemini_ef)
                    
                    
                    ids = [f"{ticker}_{filing_year}_{j}" for j in range(len(chunks))]
                    
                    metadatas = []
                    for chunk in chunks:
                        metadatas.append({
                            "company": ticker, 
                            "year": str(filing_year), 
                            "source": "Live Fetch",
                            "excerpt": chunk[:400]
                        })

                    # --- FIX: BATCHING TO PREVENT API CRASHES ---
                    BATCH_SIZE = 5  # <--- REDUCED from 20 to 5
                    total_batches = (len(chunks) + BATCH_SIZE - 1) // BATCH_SIZE
                    
                    for i in range(0, len(chunks), BATCH_SIZE):
                        batch_chunks = chunks[i : i + BATCH_SIZE]
                        batch_ids = ids[i : i + BATCH_SIZE]
                        batch_meta = metadatas[i : i + BATCH_SIZE]
                        
                        # Add batch to DB
                        collection.add(documents=batch_chunks, ids=batch_ids, metadatas=batch_meta)
                        
                        # Log progress for every batch so the user sees movement
                        current_batch = (i // BATCH_SIZE) + 1
                        yield json.dumps({"type": "log", "message": f"   -> Indexed batch {current_batch}/{total_batches}..."}) + "\n"
                        
                        # Sleep to be polite to the API limit
                        time.sleep(2.0) 
                    
                    processed_years.append(str(filing_year))
                    found_count += 1
                                        
                    # Add delay to be polite to SEC
                    time.sleep(0.5)
                else:
                    yield json.dumps({"type": "log", "message": f"⚠️ Failed to download {filing_year}"}) + "\n"

            # Stop if we hit the depth target
            if found_count >= depth:
                break
        
        if found_count == 0:
            yield json.dumps({"type": "error", "message": "No 10-K filings found."}) + "\n"
        else:
            yield json.dumps({
                "type": "success", 
                "message": f"Successfully indexed {found_count} reports for {ticker}.",
                "ticker": ticker,
                "years": processed_years, # Return list of years
                "company": company_name
            }) + "\n"

    except Exception as e:
        yield json.dumps({"type": "error", "message": str(e)}) + "\n"