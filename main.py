import chromadb
import google.generativeai as genai
from chromadb.utils import embedding_functions

# --- CONFIGURATION ---
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)

# --- REUSE THE EMBEDDING FUNCTION ---
# We must use the EXACT same embedding logic as we did when creating the DB.
# If we use a different model, the "numbers" won't match, and search will fail.
class GeminiEmbeddingFunction(chromadb.EmbeddingFunction):
    def __call__(self, input):
        response = genai.embed_content(
            model="models/text-embedding-004",
            content=input,
            task_type="retrieval_query", # Note: 'retrieval_query' is best for searching
            
        )
        return response['embedding']

# --- THE SEARCH ENGINE ---
def query_vector_db(query_text, n_results=5):
    """
    1. Embeds the user's question.
    2. Searches ChromaDB for the top N matching chunks.
    """
    # Connect to the existing database
    chroma_client = chromadb.PersistentClient(path="chroma_db")
    gemini_ef = GeminiEmbeddingFunction()
    collection = chroma_client.get_collection(name="financial_filings", embedding_function=gemini_ef)
    
    # Perform the search
    results = collection.query(
        query_texts=[query_text],
        n_results=n_results
    )
    
    # Extract the text and metadata from the complex results dictionary
    # results['documents'] is a list of lists, so we take the first one
    documents = results['documents'][0] 
    metadatas = results['metadatas'][0]
    
    return documents, metadatas

# --- THE GENERATION ENGINE ---
def generate_answer(query, retrieved_docs):
    """
    Sends the question + retrieved text to Gemini to get a human answer.
    """
    # 1. Construct the "Context"
    # We join all the found paragraphs into one big string.
    context_text = "\n\n".join(retrieved_docs)
    
    # 2. The Prompt
    # This is the instruction we give the LLM.
    prompt = f"""
    You are a helpful financial analyst AI. 
    Use the following Context to answer the User's Question.
    
    --- CONTEXT STARTS ---
    {context_text}
    --- CONTEXT ENDS ---
    
    User's Question: {query}
    
    Instructions:
    - Answer strictly based on the context provided.
    - If the answer is not in the context, say "I cannot find this information in the documents."
    - Cite the source (company and year) for your numbers.
    """
    
    # 3. Call Gemini
    model = genai.GenerativeModel('gemini-2.0-flash')
    response = model.generate_content(prompt)
    
    return response.text

# --- MAIN LOOP ---
if __name__ == "__main__":
    print("🤖 Financial Agent is Ready! (Type 'exit' to stop)")
    
    while True:
        user_query = input("\n📝 Ask a question: ")
        
        if user_query.lower() in ['exit', 'quit']:
            break
            
        print("🔍 Searching 10-K filings...")
        
        # 1. Retrieve
        documents, metadatas = query_vector_db(user_query)
        
        # Optional: Print what we found (Debug)
        # print(f"   (Found {len(documents)} chunks)")
        
        # 2. Generate
        print("💡 Thinking...")
        answer = generate_answer(user_query, documents)
        
        # 3. Output
        print("\n" + "="*50)
        print("ANSWER:")
        print(answer)
        print("="*50)
        
        # 4. Show Sources (Good for the assignment requirement)
        print("\nSources used:")
        for meta in metadatas:
            print(f"- {meta['company']} {meta['year']} ({meta['source']})")