import os
import glob
from bs4 import BeautifulSoup
import chromadb
import google.generativeai as genai
from chromadb.utils import embedding_functions

# --- CONFIGURATION ---
# PASTE YOUR API KEY HERE (Keep quotes)
GOOGLE_API_KEY = "AIzaSyAeFmaggs0ptEJhbR4luMgC3O15TTTrlKg" 

# Configure Gemini
genai.configure(api_key=GOOGLE_API_KEY)

def clean_html(html_content):
    """
    Parses HTML file and extracts clean text.
    In a real job, we would use complex logic to keep tables formatted.
    For this sprint, we just get raw text.
    """
    soup = BeautifulSoup(html_content, 'html.parser')
    # Get all text, separate by space
    text = soup.get_text(separator=' ', strip=True)
    return text

def chunk_text(text, chunk_size=1000, overlap=100):
    """
    Splits text into chunks.
    overlap: We keep a bit of the previous chunk so sentences aren't cut in half.
    """
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        # Move forward, but step back by 'overlap' amount
        start += (chunk_size - overlap)
    return chunks

class GeminiEmbeddingFunction(chromadb.EmbeddingFunction):
    """
    Custom class to tell ChromaDB how to use Google's Embedding Model.
    """
    def __call__(self, input):
        # We use the 'text-embedding-004' model which is optimized for retrieval
        # task_type="retrieval_document" helps the model understand this is for a database
        response = genai.embed_content(
            model="models/text-embedding-004",
            content=input,
            task_type="retrieval_document",
            title="Financial 10-K Document" 
        )
        return response['embedding']

def main():
    print("🚀 Starting Database Build...")
    
    # 1. Initialize Vector Database (ChromaDB)
    # We save it to a folder named 'chroma_db' so it persists after the script stops
    chroma_client = chromadb.PersistentClient(path="chroma_db")
    
    # 2. Set up the Embedding Function
    gemini_ef = GeminiEmbeddingFunction()
    
    # 3. Create (or get) the Collection
    # A 'collection' is like a table in SQL
    collection = chroma_client.get_or_create_collection(
        name="financial_filings",
        embedding_function=gemini_ef
    )
    
    # 4. Process each file
    files = glob.glob("data/*.html") # Find all HTML files in data folder
    
    count = 0
    
    for file_path in files:
        print(f"📄 Processing: {file_path}")
        
        # Extract metadata from filename (e.g., "data/MSFT_2023_10K.html")
        filename = os.path.basename(file_path)
        parts = filename.split("_") # ["MSFT", "2023", "10K.html"]
        company = parts[0]
        year = parts[1]
        
        # A. Read file
        with open(file_path, "r", encoding="utf-8") as f:
            html_content = f.read()
            
        # B. Clean Text
        clean_text = clean_html(html_content)
        
        # C. Chunk Text
        chunks = chunk_text(clean_text)
        print(f"   -> Split into {len(chunks)} chunks")
        
        # D. Prepare Data for DB
        # We need unique IDs for every chunk
        ids = [f"{company}_{year}_{i}" for i in range(len(chunks))]
        metadatas = [{"company": company, "year": year, "source": filename} for _ in chunks]
        
        # E. Add to ChromaDB (Batch processing is better, but simple add works for this size)
        # Chroma automatically calls our 'GeminiEmbeddingFunction' to turn text -> vectors
        collection.add(
            documents=chunks,
            ids=ids,
            metadatas=metadatas
        )
        count += len(chunks)
        print(f"   -> Saved to DB")

    print(f"\n✨ Database built! Total chunks stored: {count}")

if __name__ == "__main__":
    main()