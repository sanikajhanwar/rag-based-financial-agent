# FinSight AI: Agentic RAG Financial Analyst 📈

A full-stack **Agentic Retrieval-Augmented Generation (RAG)** platform that performs autonomous financial analysis on SEC 10-K filings. Unlike standard chatbots, FinSight AI uses **query decomposition**, **multi-step reasoning**, and **real-time data ingestion** to provide accurate, cited answers.

![Project Status](https://img.shields.io/badge/Status-Production--Ready-success)
![Tech Stack](https://img.shields.io/badge/Stack-FastAPI%20%7C%20React%20%7C%20ChromaDB%20%7C%20Gemini-blue)

## 🚀 Features

### 🧠 Agentic Intelligence
* **Query Decomposition:** Breaks down complex questions (e.g., "Compare MSFT and NVDA revenue") into sub-queries.
* **Context Awareness:** "Focus Mode" locks analysis to specific companies to prevent hallucinations.
* **Smart Citations:** Every answer is backed by exact source references (Document & Year).

### 🏭 Live Data Engineering
* **Real-Time SEC Scraper:** Fetches 10-K filings directly from the SEC EDGAR database on demand.
* **Multi-Year Trend Analysis:** Automatically downloads and indexes historical data (last 1/3/5 years) for time-series comparison.
* **Streaming ETL Pipeline:** Visualizes the ingestion process (Downloading -> Parsing -> Chunking -> Indexing) via Server-Sent Events (SSE).

### 💻 Professional Dashboard
* **Active Document Tracking:** Real-time UI updates showing exactly which documents are being analyzed.
* **Rich Text Rendering:** Answers are formatted with Markdown tables, bold key terms, and lists.
* **Persistence:** Chat history and settings are saved locally.

## 🛠️ Technical Architecture

**1. The Brain (Python Backend)**
* **`agent.py`:** Core logic using Google Gemini 2.0 for reasoning and ChromaDB for semantic search.
* **`indexer.py`:** An ETL engine that scrapes SEC.gov, cleans HTML, chunks text, and generates vector embeddings.
* **`server.py`:** High-performance FastAPI server handling REST endpoints and SSE streams.

**2. The Body (React Frontend)**
* **State Management:** Handles complex multi-step agent thinking processes.
* **Dynamic UI:** "Bloomberg-style" dark mode dashboard with Tailwind CSS.

## ⚡ Quick Start

### Prerequisites
* Python 3.9+
* Node.js & npm
* Google Gemini API Key (Free)

### 1. Backend Setup
```bash
# Clone the repo
git clone [https://github.com/sanikajhanwar/rag-based-financial-agent.git](https://github.com/sanikajhanwar/rag-based-financial-agent.git)
cd rag-based-financial-agent

# Create virtual env
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn python-multipart requests beautifulsoup4 chromadb google-generativeai

# Configure API Key
# Open agent.py and indexer.py and paste your Google API Key
```
### 2. Frontend Setup
```bash
cd frontend

# Install libraries
npm install

# Start the UI
npm run dev
```
### 3. Run the System
** Open two terminals:
* Backend: python server.py
* Frontend: npm run dev
* Visit http://localhost:5173 to start analyzing!

### 📸 Capabilities
1. Adding Knowledge (Live Ingestion) Users can add any public company (e.g., TSLA, IBM) and specify a depth (e.g., "Last 3 Years"). The system scrapes the SEC database live.
2. Comparative Analysis User: "Compare the revenue growth of Tesla and Ford from 2021 to 2023." Agent: Decomposes request -> Fetches data for both companies -> Calculates growth -> Returns a formatted table.

  
