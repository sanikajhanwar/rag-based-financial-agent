```mermaid
graph TD

%% =============== FRONTEND ===============
subgraph FRONTEND[Frontend]
  direction TB
  U[User]
  UI_SELECT[Select companies]
  UI_CHAT[Ask comparison question]
end

U --> UI_SELECT
U --> UI_CHAT

%% =============== INGESTION ===============
subgraph INGEST[Ingestion and Indexing]
  direction TB
  SCRAPE[Scrape SEC filings HTML]
  CLEAN[Clean HTML with Beautiful Soup]
  CHUNK[Chunk cleaned text]
  EMBED_CH[Create embeddings for chunks]
  TAG[Add metadata to each chunk]
  STORE_CH[Store embeddings in ChromaDB]
end

UI_SELECT --> SCRAPE --> CLEAN --> CHUNK --> EMBED_CH --> TAG --> STORE_CH

%% =============== VECTOR STORE ===============
subgraph DATA[Vector Store]
  VSTORE[ChromaDB]
end

STORE_CH --> VSTORE

%% =============== QUERY ENGINE ===============
subgraph QUERY[Query Orchestrator]
  direction TB
  Q_RECEIVE[Receive user query]
  Q_DECOMP[Break query into subqueries]
  SUB_LIST[List of subqueries]
  EMBED_SUB[Embed subqueries]
  RETRIEVE[Retrieve similar chunks using cosine similarity]
  CONF{Is similarity score above 0.8}
  FILTERED[High confidence results]
  MAP_PAR[Map subqueries to chunks in parallel]
  AGG_FACTS[Aggregate and align facts]
  LOWCONF[Return fallback no confident evidence]
end

UI_CHAT --> Q_RECEIVE --> Q_DECOMP --> SUB_LIST --> EMBED_SUB --> RETRIEVE
VSTORE --> RETRIEVE

RETRIEVE --> CONF
CONF -->|Yes| FILTERED --> MAP_PAR --> AGG_FACTS
CONF -->|No| LOWCONF --> UI_CHAT

%% =============== LLM ===============
subgraph LLM[Gemini Layer]
  direction TB
  G_ANS[Generate final answer]
end

AGG_FACTS --> G_ANS --> UI_CHAT


%% =============== STYLING ===============
classDef front fill:#E3F2FD,stroke:#1E88E5,color:#0D47A1,font-weight:bold;
classDef ingest fill:#FFF3E0,stroke:#FB8C00,color:#E65100;
classDef store fill:#E0F7FA,stroke:#00838F,color:#006064;
classDef query fill:#F1F8E9,stroke:#7CB342,color:#33691E;
classDef llm fill:#F3E5F5,stroke:#8E24AA,color:#6A1B9A;
classDef fallback fill:#FFEBEE,stroke:#C62828,color:#B71C1C,font-weight:bold;

class U,UI_SELECT,UI_CHAT front;
class SCRAPE,CLEAN,CHUNK,EMBED_CH,TAG,STORE_CH ingest;
class VSTORE store;
class Q_RECEIVE,Q_DECOMP,SUB_LIST,EMBED_SUB,RETRIEVE,CONF,FILTERED,MAP_PAR,AGG_FACTS query;
class G_ANS llm;
class LOWCONF fallback;
