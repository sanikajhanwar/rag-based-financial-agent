import { ChevronDown, ChevronRight, CheckCircle2, Loader2, Circle } from 'lucide-react';
import { useState } from 'react';
import { ThinkingStep } from '../types';

interface ThinkingProcessProps {
  steps: ThinkingStep[];
  isComplete: boolean;
}

export default function ThinkingProcess({ steps, isComplete }: ThinkingProcessProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const getStatusIcon = (status: ThinkingStep['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'active':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'pending':
        return <Circle className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-800/70 transition-colors"
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-slate-400" />
          )}
          <div className="flex items-center gap-2">
            {isComplete ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            )}
            <span className="text-white font-medium">Agent Thought Process</span>
          </div>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {steps.filter((s) => s.status === 'complete').length}/{steps.length} steps
        </span>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">{getStatusIcon(step.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-slate-500">
                      STEP {index + 1}
                    </span>
                    <h4 className="text-sm font-semibold text-white">{step.title}</h4>
                  </div>
                  <p className="text-sm text-slate-400 mb-2">{step.description}</p>
                  {step.substeps && step.substeps.length > 0 && (
                    <div className="mt-3 space-y-1.5 pl-3 border-l-2 border-slate-700">
                      {step.substeps.map((substep, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 text-xs text-slate-400"
                        >
                          <span className="text-slate-600 mt-0.5">→</span>
                          <span className="font-mono">{substep}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
