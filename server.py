from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from fastapi.responses import StreamingResponse
import agent 
import indexer 
import uuid

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Models ---
class AppSettings(BaseModel):
    model: str = "gemini-2.0-flash"
    searchDepth: int = 3
    creativity: float = 0.1

class QueryRequest(BaseModel):
    query: str
    settings: AppSettings
    ticker: Optional[str] = None # <--- NEW: Optional filter

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
    depth: int = 1 # Default to 1 year

# --- ENDPOINT 1: Analyze Questions ---
@app.post("/api/analyze", response_model=AgentResponse)
async def analyze_query(request: QueryRequest):
    user_query = request.query
    settings = request.settings
    target_ticker = request.ticker # <--- Get the filter
    
    print(f"📥 Received Query: {user_query} (Filter: {target_ticker or 'None'})")
    
    steps = []
    steps.append({"id": "1", "title": "Query Decomposition", "description": "Breaking down query", "status": "complete", "substeps": []})
    sub_queries = agent.get_sub_queries(user_query, model_name=settings.model)
    steps[0]["substeps"] = sub_queries
    
    steps.append({"id": "2", "title": "Document Retrieval", "description": f"Searching SEC (Depth: {settings.searchDepth})", "status": "complete", "substeps": []})
    all_findings = []
    sources_list = []
    
    for q in sub_queries:
        # PASS THE FILTER TO THE AGENT
        raw_result, metadatas = agent.query_vector_db(
            q, 
            n_results=settings.searchDepth, 
            ticker_filter=target_ticker # <--- APPLY IT HERE
        )
        
        for meta in metadatas:
            sources_list.append(SourceCard(
                id=str(uuid.uuid4()),
                ticker=meta.get('company', 'SEC'),
                company=meta.get('company', 'Unknown'),
                year=int(meta.get('year', 2023)),
                docType="10-K",
                snippet=meta.get('source', 'Text snippet...'),
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

    steps.append({"id": "3", "title": "Synthesis", "description": "Generating answer", "status": "complete", "substeps": [f"Using {settings.model}"]})
    
    final_text = agent.synthesize_answer(user_query, "\n".join(all_findings), model_name=settings.model, creativity=settings.creativity)

    return {
        "thinking": {"steps": steps, "isComplete": True},
        "answer": {
            "reasoning": final_text,
            "sources": unique_sources,
            "mainMetric": {"label": "Analysis Complete", "value": "Done", "trend": "neutral"},
            "chartData": None, "sentiment": None
        }
    }

# --- UPDATED ADD TICKER ENDPOINT ---
# 1. UPDATE THE MODEL
class TickerRequest(BaseModel):
    ticker: str
    depth: int = 1 # Default to 1 year

# 2. UPDATE THE ENDPOINT
@app.post("/api/add_ticker")
async def add_ticker(request: TickerRequest):
    ticker = request.ticker.upper()
    depth = request.depth
    
    print(f"📥 Request to add ticker: {ticker} (Depth: {depth})")
    
    return StreamingResponse(
        indexer.process_ticker_stream(ticker, depth=depth),
        media_type="application/x-ndjson"
    )
    
    if result["success"]:
        return {
            "status": "success", 
            "message": result["message"], 
            "company": result.get("company"),
            "ticker": result.get("ticker"),
            "year": result.get("year")
        }
    else:
        raise HTTPException(status_code=400, detail=result["error"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)