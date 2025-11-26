import { BarChart3 } from 'lucide-react';
import { ChartData } from '../types';

interface MetricChartProps {
  data: ChartData;
}

export default function MetricChart({ data }: MetricChartProps) {
  const maxValue = Math.max(...data.data.map((d) => d.value));

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-blue-500" />
        <h3 className="text-white font-semibold">{data.title}</h3>
      </div>

      <div className="space-y-4">
        {data.data.map((item) => {
          const percentage = (item.value / maxValue) * 100;
          return (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 font-medium font-mono">{item.label}</span>
                <span className="text-white font-bold font-mono text-lg">
                  {item.value.toFixed(1)}%
                </span>
              </div>
              <div className="h-3 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: item.color || '#3b82f6',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700">
        <p className="text-xs text-slate-500">
          Data extracted from SEC 10-K filings • Calculated from year-over-year revenue changes
        </p>
      </div>
    </div>
  );
}
