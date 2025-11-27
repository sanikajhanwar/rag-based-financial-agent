# FinSight AI: Agentic RAG Financial Analyst 📈

A full-stack **Agentic Retrieval-Augmented Generation (RAG)** platform that performs autonomous financial analysis on SEC 10-K filings. Unlike standard chatbots, FinSight AI uses **query decomposition**, **multi-step reasoning**, and **real-time data ingestion** to provide accurate, cited answers with trend analysis.

![Project Status](https://img.shields.io/badge/Status-Production--Ready-success)
![Tech Stack](https://img.shields.io/badge/Stack-FastAPI%20%7C%20React%20%7C%20ChromaDB%20%7C%20Gemini-blue)

## 🚀 Advanced Features

### 🧠 Agentic Intelligence
* **Query Decomposition:** Automatically breaks down complex questions (e.g., "Compare MSFT and NVDA revenue") into sub-queries.
* **Multi-Step Reasoning:** Executes sequential searches to build a complete answer from multiple sources.
* **Smart Citations:** Every answer is backed by exact source references with text previews to verify accuracy.

### 🔒 Context & Precision
* **Focus Mode (Context Locking):** Click on any document card to lock the AI's attention. It will strictly search *only* within that company's data to prevent hallucinations during deep dives.
* **Customizable Settings:** Users can configure the AI Brain on the fly:
    * **Model:** Switch between `Gemini 2.0 Flash` (Speed) and `Gemini 1.5 Pro` (Reasoning).
    * **Depth:** Adjust search depth (how many chunks to read).
    * **Creativity:** Control the temperature for strict fact-checking vs. creative synthesis.

### 🏭 Live Data Engineering
* **Real-Time SEC Scraper:** Fetches 10-K filings directly from the SEC EDGAR database on demand via Ticker symbol.
* **Time-Series Ingestion:** "Trend Analysis" mode automatically downloads and indexes historical data (e.g., Last 3 Years or Last 5 Years) for longitudinal analysis.
* **Streaming ETL Pipeline:** Visualizes the entire ingestion process (Downloading -> Parsing -> Chunking -> Indexing) via Server-Sent Events (SSE) logs in the UI.

### 💻 Professional Dashboard
* **Active Document Tracking:** Real-time UI updates showing exactly which documents are available for analysis.
* **Rich Text Rendering:** Answers are formatted with **Markdown tables**, bold key terms, and clean lists.
* **Persistence:** Chat history and user preferences are auto-saved locally.

## 🛠️ Technical Architecture

**1. The Brain (Python Backend)**
* **`agent.py`:** Core logic using Google Gemini for reasoning and ChromaDB for semantic search. Handles metadata filtering for Context Locking.
* **`indexer.py`:** An ETL engine that scrapes SEC.gov, cleans HTML, chunks text, and generates vector embeddings. Supports multi-year loop logic.
* **`server.py`:** High-performance FastAPI server handling REST endpoints and SSE streams for live logs.

**2. The Body (React Frontend)**
* **State Management:** Complex handling of multi-step agent thinking processes and active document states.
* **Dynamic UI:** "Bloomberg-style" dark mode dashboard built with Vite, Tailwind CSS, and Lucide React.

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
pip install fastapi uvicorn python-multipart requests beautifulsoup4 chromadb google-generativeai python-dotenv

# Configure API Key (Securely)
# Create a file named .env in the root folder and add:
# GOOGLE_API_KEY=your_api_key_here
```
## 2. Frontend Setup
```bash
cd frontend

# Install libraries
npm install

# Start the UI
npm run dev
```
## 3. Run the System
Open two terminals:
1. Backend: python server.py
2. Frontend: npm run dev

Visit http://localhost:5173 to start analyzing!

## 📸 Capabilities Guide
1. Adding Knowledge (Live Trend Analysis)

*Click "Add Company" in the sidebar.

*Enter a Ticker (e.g., TSLA) and select "Last 3 Years".

*Watch the terminal output as it scrapes 2023, 2022, and 2021 reports live.

2. Comparative Analysis

*User: "Compare the revenue growth of Tesla and Ford from 2021 to 2023."

*Agent: Decomposes request -> Fetches data for both companies across all years -> Calculates growth -> Returns a formatted Markdown table.

3. Focus Mode

*Click the Tesla 10-K card in the right panel.

*The chat bar will show a "Context Locked: TSLA" badge.

*Ask generic questions like "What are the risk factors?" and get answers specific to Tesla only.

## 📄 License
MIT License. Built for educational purposes.