import { TrendingUp, AlertCircle, Bookmark, Plus, FileText, Filter } from 'lucide-react';

export interface ActiveDoc {
    ticker: string;
    name: string;
    doc: string;
    status: 'active' | 'idle';
}

interface RightPanelProps {
    documents: ActiveDoc[];
    selectedTicker: string | null;
    onSelectTicker: (ticker: string | null) => void;
}

export default function RightPanel({ documents, selectedTicker, onSelectTicker }: RightPanelProps) {
  const watchlist = [
    { ticker: 'MSFT', name: 'Microsoft', change: 1.8, positive: true },
    { ticker: 'NVDA', name: 'Nvidia', change: 4.5, positive: true },
    { ticker: 'GOOGL', name: 'Alphabet', change: -0.5, positive: false }
  ];

  return (
    <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col h-screen overflow-y-auto">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-1">
            <h2 className="text-white font-semibold">Active Documents</h2>
            {selectedTicker && (
                <button 
                    onClick={() => onSelectTicker(null)}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                    Clear Filter <Filter className="w-3 h-3" />
                </button>
            )}
        </div>
        <p className="text-slate-400 text-xs">
            {selectedTicker 
                ? `Focusing on ${selectedTicker} only` 
                : "Searching all documents"}
        </p>
      </div>

      {/* Document List */}
      <div className="p-3 space-y-2">
        {documents.length === 0 ? (
            <div className="p-4 text-center">
                <p className="text-slate-500 text-sm">No documents loaded.</p>
            </div>
        ) : (
            documents.map((doc, idx) => {
                const isSelected = selectedTicker === doc.ticker;
                return (
                    <div
                        key={`${doc.ticker}-${idx}`}
                        onClick={() => onSelectTicker(isSelected ? null : doc.ticker)}
                        className={`border rounded-lg p-3 transition-all cursor-pointer group ${
                            isSelected 
                                ? 'bg-blue-900/20 border-blue-500 shadow-lg shadow-blue-900/20' 
                                : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'
                        }`}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded flex items-center justify-center ${
                                    isSelected ? 'bg-blue-500 text-white' : 'bg-blue-600/20 text-blue-400'
                                }`}>
                                    <span className="font-bold text-xs">{doc.ticker}</span>
                                </div>
                                <div>
                                    <p className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                                        {doc.name}
                                    </p>
                                    <p className="text-slate-400 text-xs flex items-center gap-1">
                                        <FileText className="w-3 h-3" /> {doc.doc}
                                    </p>
                                </div>
                            </div>
                            {/* Status Indicator */}
                            {isSelected && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                            )}
                        </div>
                    </div>
                );
            })
        )}
      </div>

      {/* Static Watchlist */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-slate-400" />
            <h3 className="text-white font-semibold text-sm">Watchlist</h3>
          </div>
          <button 
            className="p-1 hover:bg-slate-800 rounded transition-colors"
            aria-label="Add to watchlist"
            title="Add to Watchlist"
          >
            <Plus className="w-4 h-4 text-slate-400" />
          </button>
        </div>
        <div className="space-y-2">
          {watchlist.map((item) => (
            <div
              key={item.ticker}
              className="flex items-center justify-between py-2 px-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              <div>
                <p className="text-white text-sm font-mono font-bold">{item.ticker}</p>
                <p className="text-slate-400 text-xs">{item.name}</p>
              </div>
              <div
                className={`flex items-center gap-1 ${
                  item.positive ? 'text-green-500' : 'text-red-500'
                }`}
              >
                <TrendingUp
                  className={`w-3 h-3 ${item.positive ? '' : 'rotate-180'}`}
                />
                <span className="text-sm font-mono font-bold">
                  {item.positive ? '+' : ''}
                  {item.change}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-slate-800 mt-auto">
        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-700/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-white font-semibold text-sm mb-1">Pro Tip</h4>
              <p className="text-slate-300 text-xs leading-relaxed">
                Click a document card to <b>Lock Focus</b>. The agent will only search within that company's data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}