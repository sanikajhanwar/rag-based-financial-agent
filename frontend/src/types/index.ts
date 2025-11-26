export interface Message {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  thinking?: ThinkingProcess;
  answer?: AnswerData;
}

export interface ThinkingProcess {
  steps: ThinkingStep[];
  isComplete: boolean;
}

export interface ThinkingStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'complete';
  substeps?: string[];
}

export interface AnswerData {
  mainMetric?: MetricHighlight;
  reasoning: string;
  sources: SourceCard[];
  chartData?: ChartData;
  sentiment?: SentimentData;
}

export interface MetricHighlight {
  label: string;
  value: string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
}

export interface SourceCard {
  id: string;
  ticker: string;
  company: string;
  year: number;
  docType: string;
  snippet: string;
  page: number;
  confidence: number;
}

export interface ChartData {
  type: 'bar' | 'line';
  title: string;
  data: ChartDataPoint[];
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface SentimentData {
  score: number;
  label: 'Optimistic' | 'Neutral' | 'Cautious';
  factors: string[];
}

export interface QuerySuggestion {
  id: string;
  text: string;
  category: string;
}

export interface AppSettings {
  model: string;
  searchDepth: number;
  creativity: number; // 0.0 to 1.0
}