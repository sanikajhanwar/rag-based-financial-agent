import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import RightPanel, { ActiveDoc } from './components/RightPanel';
import QueryInput from './components/QueryInput';
import MessageList from './components/MessageList';
import EmptyState from './components/EmptyState';
import SettingsModal from './components/SettingsModal';
import AddTickerModal from './components/AddTickerModal'; // <--- IMPORT
import { Message, AppSettings } from './types';
import { querySuggestions } from './data/mockData';
import { X, TrendingUp } from 'lucide-react';

interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    timestamp: Date;
}

function App() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('finsight_sessions');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            return parsed.map((s: any) => ({
                ...s,
                timestamp: new Date(s.timestamp),
                messages: s.messages.map((m: any) => ({
                    ...m,
                    timestamp: new Date(m.timestamp)
                }))
            }));
        } catch (e) {
            console.error("Failed to parse sessions", e);
            return [];
        }
    }
    return [];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [activeDocs, setActiveDocs] = useState<ActiveDoc[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isProcessing, setIsProcessing] = useState(false);
  
  // MODAL STATES
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAddTickerModal, setShowAddTickerModal] = useState(false); // <--- NEW STATE

  const [settings, setSettings] = useState<AppSettings>({
    model: 'gemini-2.0-flash',
    searchDepth: 3,
    creativity: 0.1
  });

  useEffect(() => {
    localStorage.setItem('finsight_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
        setSessions(prev => prev.map(s => 
            s.id === currentSessionId 
            ? { ...s, messages: messages }
            : s
        ));
    }
  }, [messages, currentSessionId]);

  // Replace the existing handleAddTicker function with this:
  
  const handleAddTicker = async (ticker: string, year: string) => {
    const response = await fetch('http://127.0.0.1:8000/api/add_ticker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
          ticker: ticker, 
          year: year ? parseInt(year) : null // Send year if present
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to add ticker');
    }
    
    const data = await response.json();
    
    // --- CRITICAL: UPDATE UI IMMEDIATELY ---
    // Add the new company to the Active Documents list
    if (data.status === 'success') {
        const newDoc: ActiveDoc = {
            ticker: data.ticker,
            name: data.company,
            doc: `10-K ${data.year}`,
            status: 'idle' // Idle until used in a chat
        };
        
        setActiveDocs(prev => {
            // Check if it already exists to avoid duplicates
            const exists = prev.some(d => d.ticker === newDoc.ticker && d.doc === newDoc.doc);
            if (exists) return prev;
            return [newDoc, ...prev];
        });
    }
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setActiveDocs([]);
  };

  const handleLoadSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
        setCurrentSessionId(session.id);
        setMessages(session.messages);
        
        const lastAgentMsg = [...session.messages].reverse().find(m => m.type === 'agent');
        if (lastAgentMsg?.answer?.sources) {
            updateActiveDocs(lastAgentMsg.answer.sources);
        } else {
            setActiveDocs([]);
        }
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
        handleNewChat();
    }
  };

  const updateActiveDocs = (sources: any[]) => {
    const newDocs: ActiveDoc[] = sources.map((src: any) => ({
        ticker: src.ticker || "DOC",
        name: src.company || "Unknown Company",
        doc: `${src.docType} ${src.year}`,
        status: 'active'
    }));
    
    setActiveDocs(prev => {
        const combined = [...prev, ...newDocs];
        return combined.filter((doc, index, self) =>
            index === self.findIndex((d) => (
                d.ticker === doc.ticker && d.doc === doc.doc
            ))
        );
    });
  };

  const handleQuerySubmit = async (query: string) => {
    let sessionId = currentSessionId;
    if (!sessionId) {
        sessionId = Date.now().toString();
        const newSession: ChatSession = {
            id: sessionId,
            title: query, 
            messages: [],
            timestamp: new Date()
        };
        setSessions(prev => [newSession, ...prev]);
        setCurrentSessionId(sessionId);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: query,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    const tempAgentId = (Date.now() + 1).toString();
    const initialAgentMessage: Message = {
      id: tempAgentId,
      type: 'agent',
      content: '',
      timestamp: new Date(),
      thinking: {
        steps: [{
          id: 'init',
          title: 'Initializing Agent',
          description: 'Connecting to Python backend...',
          status: 'active',
          substeps: []
        }],
        isComplete: false
      }
    };
    setMessages(prev => [...prev, initialAgentMessage]);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query, settings: settings })
      });

      if (!response.ok) throw new Error('API Request failed');
      const data = await response.json();

      if (data.answer.sources) {
        updateActiveDocs(data.answer.sources);
      }

      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempAgentId 
            ? { ...msg, thinking: data.thinking, answer: data.answer }
            : msg
        )
      );

    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempAgentId 
            ? { ...msg, content: "Error connecting to agent.", thinking: undefined }
            : msg
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = () => {
    if (messages.length === 0) return;
    let content = "FinSight AI Report\n==================\n\n";
    messages.forEach(m => {
        content += `[${m.type.toUpperCase()}]: ${m.content || m.answer?.reasoning}\n\n`;
    });
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Report_${new Date().toISOString()}.txt`;
    a.click();
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden relative">
      <Sidebar 
        history={sessions.map(s => ({
            id: s.id,
            title: s.title,
            time: s.timestamp.toLocaleDateString()
        }))} 
        onSelectHistory={handleLoadSession} 
        onDeleteHistory={handleDeleteSession}
        onNewChat={handleNewChat}
        onExport={handleExport}
        onOpenRiskMap={() => setShowRiskModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onAddTicker={() => setShowAddTickerModal(true)} // <--- CONNECT NEW MODAL
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 py-8">
            {messages.length === 0 ? <EmptyState /> : <MessageList messages={messages} />}
          </div>
        </div>
        <div className="border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-6 py-6">
            <QueryInput suggestions={querySuggestions} onSubmit={handleQuerySubmit} />
          </div>
        </div>
      </div>

      <RightPanel documents={activeDocs} />

      <SettingsModal 
        isOpen={showSettingsModal} 
        onClose={() => setShowSettingsModal(false)}
        currentSettings={settings}
        onSave={setSettings}
      />

      {/* NEW TICKER MODAL */}
      <AddTickerModal
        isOpen={showAddTickerModal}
        onClose={() => setShowAddTickerModal(false)}
        onAddTicker={handleAddTicker}
      />

      {showRiskModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-2xl shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Risk Heatmap (Demo)</h2>
                    <button 
                        onClick={() => setShowRiskModal(false)}
                        aria-label="Close modal"
                        title="Close"
                        className="p-2 hover:bg-slate-800 rounded text-slate-400 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="text-center text-slate-400 py-10">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                    <p>Visual risk analysis across selected 10-K filings.</p>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

export default App;