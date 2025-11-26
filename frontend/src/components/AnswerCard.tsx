import { TrendingUp, TrendingDown, Minus, Download, Share2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AnswerData } from '../types';
import SourceCards from './SourceCards';
import MetricChart from './MetricChart';
import SentimentRadar from './SentimentRadar';

// FIX: Bypass strict type checking for ReactMarkdown to resolve React 18/TypeScript conflict
const Markdown = ReactMarkdown as any;

interface AnswerCardProps {
  answer: AnswerData;
}

export default function AnswerCard({ answer }: AnswerCardProps) {
  const getTrendIcon = () => {
    if (!answer.mainMetric?.trend) return null;
    switch (answer.mainMetric.trend) {
      case 'up':
        return <TrendingUp className="w-6 h-6 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-6 h-6 text-red-500" />;
      case 'neutral':
        return <Minus className="w-6 h-6 text-slate-500" />;
    }
  };

  const getTrendColor = () => {
    if (!answer.mainMetric?.trend) return 'text-slate-400';
    switch (answer.mainMetric.trend) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      case 'neutral':
        return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Metric Section */}
      {answer.mainMetric && (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-slate-400 text-sm mb-2">{answer.mainMetric.label}</p>
              <div className="flex items-center gap-3">
                <span className={`text-5xl font-bold font-mono ${getTrendColor()}`}>
                  {answer.mainMetric.value}
                </span>
                {getTrendIcon()}
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors" title="Share">
                <Share2 className="w-4 h-4 text-slate-300" />
              </button>
              <button className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors" title="Download">
                <Download className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Section with MARKDOWN Rendering */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
          Analysis & Reasoning
        </h3>
        
        <div className="prose prose-invert max-w-none text-slate-300">
          <Markdown 
            remarkPlugins={[remarkGfm]}
            components={{
              // Helper to strip 'node' prop which causes HTML errors
              table: ({node, ...props}: any) => (
                <div className="overflow-x-auto my-4 border border-slate-700 rounded-lg">
                  <table className="min-w-full divide-y divide-slate-700" {...props} />
                </div>
              ),
              thead: ({node, ...props}: any) => (
                <thead className="bg-slate-900/50" {...props} />
              ),
              th: ({node, ...props}: any) => (
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider" {...props} />
              ),
              td: ({node, ...props}: any) => (
                <td className="px-4 py-3 text-sm text-slate-300 whitespace-nowrap border-t border-slate-700/50" {...props} />
              ),
              ul: ({node, ...props}: any) => (
                <ul className="list-disc pl-5 space-y-1 my-2" {...props} />
              ),
              ol: ({node, ...props}: any) => (
                <ol className="list-decimal pl-5 space-y-1 my-2" {...props} />
              ),
              li: ({node, ...props}: any) => (
                <li className="text-slate-300" {...props} />
              ),
              strong: ({node, ...props}: any) => (
                <strong className="text-white font-semibold" {...props} />
              ),
              h1: ({node, ...props}: any) => <h1 className="text-xl font-bold text-white mt-4 mb-2" {...props} />,
              h2: ({node, ...props}: any) => <h2 className="text-lg font-bold text-white mt-4 mb-2" {...props} />,
              h3: ({node, ...props}: any) => <h3 className="text-md font-bold text-white mt-3 mb-1" {...props} />,
              blockquote: ({node, ...props}: any) => (
                <blockquote className="border-l-4 border-blue-500 pl-4 italic text-slate-400 my-4" {...props} />
              ),
            }}
          >
            {answer.reasoning}
          </Markdown>
        </div>
      </div>

      {answer.chartData && (
        <MetricChart data={answer.chartData} />
      )}

      {answer.sentiment && (
        <SentimentRadar sentiment={answer.sentiment} />
      )}

      <SourceCards sources={answer.sources} />
    </div>
  );
}