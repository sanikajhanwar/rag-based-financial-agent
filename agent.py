import google.generativeai as genai
import chromadb
from chromadb.utils import embedding_functions
import json
import re

# --- CONFIGURATION ---
# PASTE YOUR API KEY HERE
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)

class GeminiEmbeddingFunction(chromadb.EmbeddingFunction):
    def __call__(self, input):
        response = genai.embed_content(
            model="models/text-embedding-004",
            content=input,
            task_type="retrieval_query"
        )
        return response['embedding']

# --- TOOL: SEARCH DATABASE ---
def query_vector_db(query_text, n_results=3, ticker_filter=None):
    """
    ticker_filter: (str) Optional. If provided (e.g. 'TSLA'), restricts search.
    """
    chroma_client = chromadb.PersistentClient(path="chroma_db")
    gemini_ef = GeminiEmbeddingFunction()
    collection = chroma_client.get_collection(name="financial_filings", embedding_function=gemini_ef)
    
    # Construct the 'where' clause for ChromaDB
    where_clause = None
    if ticker_filter:
        # This tells Chroma: "Only look at chunks where metadata['company'] == ticker_filter"
        where_clause = {"company": ticker_filter}
    
    results = collection.query(
        query_texts=[query_text], 
        n_results=n_results,
        where=where_clause # <--- APPLY FILTER
    )
    
    documents = results['documents'][0]
    metadatas = results['metadatas'][0]
    
    formatted_results = []
    sources = []
    
    for doc, meta in zip(documents, metadatas):
        formatted_results.append(f"Source ({meta['company']} {meta['year']}): {doc}")
        sources.append(meta)
    
    return "\n".join(formatted_results), sources

# --- STEP 1: DECOMPOSITION ---
def get_sub_queries(original_query, model_name='gemini-2.0-flash'):
    clean_model = model_name.replace("models/", "")
    model = genai.GenerativeModel(clean_model)
    
    prompt = f"""
    You are a smart financial research assistant.
    Your goal is to break down a complex user question into simple search queries.
    
    User Question: "{original_query}"
    
    Rules:
    1. If the question is simple, return just that one query.
    2. If the question is complex, break it into steps.
    3. Return the output STRICTLY as a JSON list of strings. No markdown.
    
    Example Input: "Compare Microsoft and Google revenue"
    Example Output: ["Microsoft revenue", "Google revenue"]
    """
    
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        text = re.sub(r"```json|```", "", text).strip()
        return json.loads(text)
    except Exception as e:
        print(f"Error in decomposition: {e}")
        return [original_query]

# --- STEP 2: SYNTHESIS ---
def synthesize_answer(original_query, research_data, model_name='gemini-2.0-flash', creativity=0.1):
    clean_model = model_name.replace("models/", "")
    generation_config = genai.types.GenerationConfig(temperature=creativity)
    model = genai.GenerativeModel(clean_model)
    
    prompt = f"""
    You are a senior financial analyst. 
    Answer the User's Question using the provided Research Data.
    
    User Question: {original_query}
    
    --- RESEARCH DATA START ---
    {research_data}
    --- RESEARCH DATA END ---
    
    Instructions:
    1. Answer specifically and accurately.
    2. If the data contains numbers, COMPARE them explicitly.
    3. Cite the company and year for every fact.
    4. If data is missing, state clearly what is missing.
    """
    
    response = model.generate_content(prompt, generation_config=generation_config)
    return response.text