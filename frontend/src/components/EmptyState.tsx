import { Sparkles, TrendingUp, Search, FileText } from 'lucide-react';

export default function EmptyState() {
  const features = [
    {
      icon: Search,
      title: 'Comparative Analysis',
      description: 'Compare metrics across multiple companies and time periods'
    },
    {
      icon: FileText,
      title: 'Source Citations',
      description: 'Every answer backed by exact SEC filing references'
    },
    {
      icon: TrendingUp,
      title: 'Dynamic Insights',
      description: 'Charts, sentiment analysis, and trend visualization'
    },
    {
      icon: Sparkles,
      title: 'Agentic RAG',
      description: 'Query decomposition and multi-step reasoning process'
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-600/20">
        <TrendingUp className="w-10 h-10 text-white" />
      </div>

      <h2 className="text-3xl font-bold text-white mb-3">
        Welcome to FinSight AI
      </h2>
      <p className="text-slate-400 text-center max-w-md mb-12">
        Your intelligent financial analysis assistant powered by Agentic RAG.
        Ask complex questions about SEC filings and get precise, cited answers.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-slate-500 text-sm">
          Try asking a question above to see the agent in action
        </p>
      </div>
    </div>
  );
}
