import { FileText, ExternalLink, CheckCircle } from 'lucide-react';
import { SourceCard } from '../types';

interface SourceCardsProps {
  sources: SourceCard[];
}

export default function SourceCards({ sources }: SourceCardsProps) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-500" />
          Source Citations
        </h3>
        <span className="text-xs text-slate-400 font-mono">
          {sources.length} documents referenced
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sources.map((source) => (
          <div
            key={source.id}
            className="bg-slate-900/70 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <span className="text-blue-400 font-bold text-sm font-mono">
                    {source.ticker}
                  </span>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{source.company}</p>
                  <p className="text-slate-400 text-xs">
                    {source.docType} • {source.year}
                  </p>
                </div>
              </div>
              {/* FIX: Added aria-label and title */}
              <button 
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Open source document"
                title="Open source document"
              >
                <ExternalLink className="w-4 h-4 text-slate-400 hover:text-white" />
              </button>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed mb-3 line-clamp-3">
              {source.snippet}
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-slate-700">
              <span className="text-xs text-slate-500 font-mono">Page {source.page}</span>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-500 font-mono">
                  {source.confidence.toFixed(1)}% confident
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}