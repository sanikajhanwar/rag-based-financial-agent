import { Activity, TrendingUp, Minus, AlertTriangle } from 'lucide-react';
import { SentimentData } from '../types';

interface SentimentRadarProps {
  sentiment: SentimentData;
}

export default function SentimentRadar({ sentiment }: SentimentRadarProps) {
  const getSentimentColor = () => {
    switch (sentiment.label) {
      case 'Optimistic':
        return 'text-green-500';
      case 'Neutral':
        return 'text-blue-500';
      case 'Cautious':
        return 'text-yellow-500';
    }
  };

  const getSentimentIcon = () => {
    switch (sentiment.label) {
      case 'Optimistic':
        return <TrendingUp className="w-5 h-5" />;
      case 'Neutral':
        return <Minus className="w-5 h-5" />;
      case 'Cautious':
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getSentimentBg = () => {
    switch (sentiment.label) {
      case 'Optimistic':
        return 'from-green-600/20 to-green-800/20';
      case 'Neutral':
        return 'from-blue-600/20 to-blue-800/20';
      case 'Cautious':
        return 'from-yellow-600/20 to-yellow-800/20';
    }
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-purple-500" />
        <h3 className="text-white font-semibold">Sentiment Analysis</h3>
      </div>

      <div className={`bg-gradient-to-br ${getSentimentBg()} border border-slate-700 rounded-lg p-4 mb-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`${getSentimentColor()}`}>
              {getSentimentIcon()}
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-1">Overall Tone</p>
              <p className={`text-lg font-bold ${getSentimentColor()}`}>
                {sentiment.label}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-xs mb-1">Confidence</p>
            <p className={`text-2xl font-bold font-mono ${getSentimentColor()}`}>
              {sentiment.score}
            </p>
          </div>
        </div>

        <div className="mt-3 h-2 bg-slate-900/50 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              sentiment.label === 'Optimistic'
                ? 'bg-green-500'
                : sentiment.label === 'Neutral'
                ? 'bg-blue-500'
                : 'bg-yellow-500'
            }`}
            style={{ width: `${sentiment.score}%` }}
          />
        </div>
      </div>

      <div>
        <p className="text-slate-400 text-sm mb-3">Key Indicators:</p>
        <div className="space-y-2">
          {sentiment.factors.map((factor, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-slate-600 mt-1">•</span>
              <span className="text-slate-300 text-sm">{factor}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
