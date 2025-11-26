import { TrendingUp, TrendingDown, Minus, Download, Share2 } from 'lucide-react';
import { AnswerData } from '../types';
import SourceCards from './SourceCards';
import MetricChart from './MetricChart';
import SentimentRadar from './SentimentRadar';

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
              <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
                <Share2 className="w-4 h-4 text-slate-300" />
              </button>
              <button className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                <Download className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
          Analysis & Reasoning
        </h3>
        <p className="text-slate-300 leading-relaxed">{answer.reasoning}</p>
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
