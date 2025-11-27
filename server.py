from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
import agent 
import indexer 
import uuid
import os # <--- NEW IMPORT

app = FastAPI()

# FIX: Allow both Localhost AND Cloud Frontend
# When you deploy to Vercel, you will add your Vercel URL here
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "*" # Temporarily allow all for easier deployment debugging
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Data Models ---
class AppSettings(BaseModel):
    model: str = "gemini-2.0-flash"
    searchDepth: int = 3
    creativity: float = 0.1

class QueryRequest(BaseModel):
    query: str
    settings: AppSettings
    ticker: Optional[str] = None

class SourceCard(BaseModel):
    id: str
    ticker: str
    company: str
    year: int
    docType: str
    snippet: str
    page: int
    confidence: float

class AgentResponse(BaseModel):
    thinking: dict
    answer: dict

class TickerRequest(BaseModel):
    ticker: str
    depth: int = 1

# --- ENDPOINTS ---

@app.post("/api/analyze", response_model=AgentResponse)
async def analyze_query(request: QueryRequest):
    user_query = request.query
    settings = request.settings
    target_ticker = request.ticker
    
    print(f"📥 Received Query: {user_query} (Filter: {target_ticker or 'None'})")
    
    steps = []
    
    # 1. Planning
    steps.append({
        "id": "1",
        "title": "Query Decomposition",
        "description": "Breaking down complex query into retrieval sub-tasks",
        "status": "complete",
        "substeps": []
    })
    
    sub_queries = agent.get_sub_queries(user_query, model_name=settings.model)
    steps[0]["substeps"] = sub_queries
    
    # 2. Retrieval
    steps.append({
        "id": "2",
        "title": "Document Retrieval",
        "description": f"Searching SEC EDGAR database (Depth: {settings.searchDepth})",
        "status": "complete",
        "substeps": []
    })
    
    all_findings = []
    sources_list = []
    
    for q in sub_queries:
        raw_result, metadatas = agent.query_vector_db(
            q, 
            n_results=settings.searchDepth, 
            ticker_filter=target_ticker
        )
        
        all_findings.append(f"--- Results for '{q}' ---\n{raw_result}\n")
        steps[1]["substeps"].append(f"Executed search: {q}")
        
        for meta in metadatas:
            snippet_text = meta.get('excerpt') or meta.get('source') or "No text preview available"
            sources_list.append(SourceCard(
                id=str(uuid.uuid4()),
                ticker=meta.get('company', 'SEC'),
                company=meta.get('company', 'Unknown'),
                year=int(meta.get('year', 2023)),
                docType="10-K",
                snippet=snippet_text,
                page=1, 
                confidence=0.95
            ))

    seen_sources = set()
    unique_sources = []
    for s in sources_list:
        key = f"{s.company}-{s.year}"
        if key not in seen_sources:
            unique_sources.append(s)
            seen_sources.add(key)

    # 3. Synthesis
    steps.append({
        "id": "3",
        "title": "Synthesis & Validation",
        "description": "Cross-referencing sources and generating final answer",
        "status": "complete",
        "substeps": [f"Generating answer with {settings.model}"]
    })
    
    combined_data = "\n".join(all_findings)
    
    final_text = agent.synthesize_answer(
        user_query, 
        combined_data, 
        model_name=settings.model, 
        creativity=settings.creativity
    )

    return {
        "thinking": {
            "steps": steps,
            "isComplete": True
        },
        "answer": {
            "reasoning": final_text,
            "sources": unique_sources,
            "mainMetric": {
                "label": "Analysis Complete",
                "value": "Done",
                "trend": "neutral"
            },
            "chartData": None,
            "sentiment": None
        }
    }

@app.post("/api/add_ticker")
async def add_ticker(request: TickerRequest):
    ticker = request.ticker.upper()
    depth = request.depth
    
    print(f"📥 Request to add ticker: {ticker} (Depth: {depth})")
    
    return StreamingResponse(
        indexer.process_ticker_stream(ticker, depth=depth),
        media_type="application/x-ndjson"
    )

# --- CLOUD CONFIGURATION ---
if __name__ == "__main__":
    import uvicorn
    # Get the PORT from the environment variable (Render sets this)
    # If not found (local), default to 8000
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)