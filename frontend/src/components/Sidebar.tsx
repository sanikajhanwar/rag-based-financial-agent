import { MessageSquare, TrendingUp, Clock, Bookmark, Settings, Download, Trash2, Database } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  history: { id: string; title: string; time: string }[];
  onSelectHistory: (id: string) => void;
  onDeleteHistory: (id: string) => void;
  onExport: () => void;
  onOpenRiskMap: () => void;
  onOpenSettings: () => void;
  onNewChat: () => void;
  onAddTicker: () => void; // <--- NEW PROP
}

export default function Sidebar({ 
  history, 
  onSelectHistory, 
  onDeleteHistory, 
  onExport, 
  onOpenRiskMap, 
  onOpenSettings,
  onNewChat,
  onAddTicker 
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState('New Chat');

  const navigationItems = [
    { icon: MessageSquare, label: 'New Chat', action: onNewChat },
    { icon: Clock, label: 'History', count: history.length, action: () => {} },
    { icon: Bookmark, label: 'Watchlist', count: 5, action: () => {} },
    { icon: TrendingUp, label: 'Risk Heatmap', action: onOpenRiskMap },
    // NEW BUTTON
    { icon: Database, label: 'Add Company', action: onAddTicker }, 
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen">
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-semibold text-lg">FinSight AI</h1>
            <p className="text-slate-400 text-xs">Agentic Analysis</p>
          </div>
        </div>
      </div>

      <nav className="p-3 space-y-1">
        {navigationItems.map((item) => (
          <button
            key={item.label}
            onClick={() => {
                item.action();
                setActiveTab(item.label);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              item.label === activeTab
                ? 'text-slate-300 bg-slate-800'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
            {item.count !== undefined && (
              <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                {item.count}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="flex-1 overflow-y-auto p-3">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">
          Recent Analysis
        </h3>
        <div className="space-y-1">
          {history.length === 0 ? (
            <p className="text-xs text-slate-600 px-3 py-2">No history yet</p>
          ) : (
            history.map((query) => (
              <div
                key={query.id}
                className="group relative flex items-center w-full p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
              >
                <button
                    onClick={() => onSelectHistory(query.id)}
                    className="flex-1 text-left overflow-hidden"
                >
                    <p className="text-sm text-slate-300 group-hover:text-white truncate pr-6">
                    {query.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{query.time}</p>
                </button>
                
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onDeleteHistory(query.id);
                    }}
                    aria-label="Delete history item"
                    className="absolute right-2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-900/30 rounded-md transition-all"
                    title="Delete from history"
                >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="p-3 border-t border-slate-800 space-y-1">
        <button 
            onClick={onExport}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800/50 hover:text-white transition-colors"
        >
          <Download className="w-5 h-5" />
          <span className="text-sm font-medium">Export Reports</span>
        </button>
        <button 
            onClick={onOpenSettings}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800/50 hover:text-white transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">Settings</span>
        </button>
      </div>
    </div>
  );
}