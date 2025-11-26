import { Search, Sparkles } from 'lucide-react';
import { QuerySuggestion } from '../types';

interface QueryInputProps {
  suggestions: QuerySuggestion[];
  onSubmit: (query: string) => void;
}

export default function QueryInput({ suggestions, onSubmit }: QueryInputProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('query') as string;
    if (query.trim()) {
      onSubmit(query);
      e.currentTarget.reset();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            name="query"
            placeholder="Ask anything about SEC filings, financial metrics, or comparative analysis..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-12 pr-4 py-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Analyze
          </button>
        </div>
      </form>

      <div className="mt-4">
        <p className="text-xs text-slate-500 mb-3 font-medium">TRY THESE QUERIES</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => onSubmit(suggestion.text)}
              className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm text-slate-300 hover:text-white transition-colors"
            >
              {suggestion.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
