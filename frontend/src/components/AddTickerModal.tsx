import { X, Plus, Download, Loader2, Terminal, Layers } from 'lucide-react';
import { useState, useRef } from 'react';

interface AddTickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTickerAdded: (ticker: string, company: string, years: string[]) => void;
}

export default function AddTickerModal({ isOpen, onClose, onTickerAdded }: AddTickerModalProps) {
  const [ticker, setTicker] = useState('');
  const [depth, setDepth] = useState('1');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  
  const logsEndRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker.trim()) return;

    setStatus('loading');
    setLogs([`Initializing multi-year search (${depth} years)...`]);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/add_ticker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            ticker: ticker, 
            depth: parseInt(depth)
        })
      });

      if (!response.ok) throw new Error('Connection failed');
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
            if (!line.trim()) continue;
            try {
                const data = JSON.parse(line);
                
                if (data.type === 'log') {
                    setLogs(prev => [...prev, data.message]);
                } else if (data.type === 'success') {
                    setStatus('success');
                    setLogs(prev => [...prev, '✨ ' + data.message]);
                    
                    onTickerAdded(data.ticker, data.company, data.years || []);

                    setTimeout(() => {
                        onClose();
                        setStatus('idle');
                        setLogs([]);
                        setTicker('');
                        setDepth('1');
                    }, 2000);
                } else if (data.type === 'error') {
                    setStatus('error');
                    setLogs(prev => [...prev, '❌ ' + data.message]);
                }
            } catch (e) {
                console.log("Stream parse error", e);
            }
        }
      }

    } catch (error: any) {
      setStatus('error');
      setLogs(prev => [...prev, '❌ ' + (error.message || 'Failed to add ticker')]);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
        
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-500" />
            Add Knowledge
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Close"
            title="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          <div className="space-y-4">
            {/* Ticker Input */}
            <div>
                <label className="text-sm font-medium text-slate-300 block mb-1">Company Ticker</label>
                <input
                    type="text"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value.toUpperCase())}
                    placeholder="e.g. AAPL"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase font-mono"
                    disabled={status === 'loading'}
                />
            </div>

            {/* Depth Dropdown */}
            <div>
                <label className="text-sm font-medium text-slate-300 block mb-1 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-400" />
                    Analysis Depth
                </label>
                {/* FIX: Added aria-label and title */}
                <select
                    value={depth}
                    onChange={(e) => setDepth(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                    disabled={status === 'loading'}
                    aria-label="Select analysis depth"
                    title="Select analysis depth"
                >
                    <option value="1">Latest 10-K (Quick)</option>
                    <option value="3">Last 3 Years (Trend Analysis)</option>
                    <option value="5">Last 5 Years (Deep Dive)</option>
                </select>
                <p className="text-xs text-slate-500 mt-1 ml-1">
                    "Trend Analysis" allows questions like "How did revenue change since 2021?"
                </p>
            </div>

            <button
                type="submit"
                disabled={status === 'loading' || !ticker}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
            >
                {status === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                Download & Index
            </button>
          </div>

          {/* LIVE LOGS */}
          {(status === 'loading' || logs.length > 0) && (
            <div className="bg-black/50 border border-slate-800 rounded-lg p-4 font-mono text-xs h-48 overflow-y-auto flex flex-col-reverse">
                <div ref={logsEndRef} />
                {logs.slice().reverse().map((log, i) => (
                    <div key={i} className={`mb-1 ${log.includes('❌') ? 'text-red-400' : log.includes('✨') ? 'text-green-400' : 'text-slate-400'}`}>
                        {log.includes('🚀') || log.includes('✅') || log.includes('⬇️') ? <span className="text-blue-400">{log}</span> : log}
                    </div>
                ))}
                <div className="text-slate-600 border-b border-slate-800 pb-1 mb-2 flex items-center gap-2">
                    <Terminal className="w-3 h-3" /> Backend Logs
                </div>
            </div>
          )}

        </form>
      </div>
    </div>
  );
}