import { Message, QuerySuggestion, ThinkingStep, SourceCard, ChartData, SentimentData } from '../types';

export const querySuggestions: QuerySuggestion[] = [
  {
    id: '1',
    text: 'Compare Microsoft vs Nvidia revenue growth in 2023',
    category: 'Comparative Analysis'
  },
  {
    id: '2',
    text: 'Analyze Google\'s top 3 risk factors from latest 10-K',
    category: 'Risk Assessment'
  },
  {
    id: '3',
    text: 'What was Apple\'s R&D spending trend 2021-2023?',
    category: 'Financial Metrics'
  },
  {
    id: '4',
    text: 'Compare operating margins: Tesla vs Ford',
    category: 'Comparative Analysis'
  }
];

export const mockThinkingSteps: ThinkingStep[] = [
  {
    id: '1',
    title: 'Entity Identification',
    description: 'Identifying companies and time periods from query',
    status: 'complete',
    substeps: [
      'Detected entities: Microsoft (MSFT), Nvidia (NVDA)',
      'Time period: FY 2023',
      'Metric: Revenue Growth'
    ]
  },
  {
    id: '2',
    title: 'Query Decomposition',
    description: 'Breaking down complex query into retrieval sub-tasks',
    status: 'complete',
    substeps: [
      'Sub-query 1: Retrieve MSFT 2023 revenue data',
      'Sub-query 2: Retrieve MSFT 2022 revenue for comparison',
      'Sub-query 3: Retrieve NVDA 2023 revenue data',
      'Sub-query 4: Retrieve NVDA 2022 revenue for comparison'
    ]
  },
  {
    id: '3',
    title: 'Document Retrieval',
    description: 'Searching SEC EDGAR database for relevant filings',
    status: 'complete',
    substeps: [
      'Retrieved: MSFT 10-K 2023 (Filed: July 2023)',
      'Retrieved: MSFT 10-K 2022 (Filed: July 2022)',
      'Retrieved: NVDA 10-K 2023 (Filed: March 2023)',
      'Retrieved: NVDA 10-K 2022 (Filed: March 2022)'
    ]
  },
  {
    id: '4',
    title: 'Data Extraction & Calculation',
    description: 'Extracting exact figures and computing metrics',
    status: 'complete',
    substeps: [
      'MSFT: $211.9B (2023) vs $198.3B (2022) → 6.9% growth',
      'NVDA: $26.97B (2023) vs $26.91B (2022) → 0.2% growth',
      'Calculated difference: 6.7 percentage points'
    ]
  },
  {
    id: '5',
    title: 'Synthesis & Validation',
    description: 'Cross-referencing sources and generating final answer',
    status: 'complete',
    substeps: [
      'Validated all figures against official 10-K documents',
      'Confidence score: 98.5%',
      'Generated comparative analysis'
    ]
  }
];

export const mockSources: SourceCard[] = [
  {
    id: '1',
    ticker: 'MSFT',
    company: 'Microsoft Corporation',
    year: 2023,
    docType: '10-K',
    snippet: 'Revenue increased $13.6 billion or 6.9% driven by growth across each of our segments. Intelligent Cloud revenue increased driven by Azure...',
    page: 42,
    confidence: 99.2
  },
  {
    id: '2',
    ticker: 'MSFT',
    company: 'Microsoft Corporation',
    year: 2022,
    docType: '10-K',
    snippet: 'Total revenue was $198.3 billion and increased 18% (up 19% in constant currency), driven by growth across our segments...',
    page: 38,
    confidence: 98.8
  },
  {
    id: '3',
    ticker: 'NVDA',
    company: 'NVIDIA Corporation',
    year: 2023,
    docType: '10-K',
    snippet: 'Revenue for fiscal 2023 was $26.97 billion, relatively flat compared to a year ago. Data Center revenue was up 41% from a year ago...',
    page: 51,
    confidence: 99.5
  },
  {
    id: '4',
    ticker: 'NVDA',
    company: 'NVIDIA Corporation',
    year: 2022,
    docType: '10-K',
    snippet: 'Revenue was $26.91 billion, up 61% from a year ago. Record Data Center revenue was up 83% from a year ago...',
    page: 48,
    confidence: 98.1
  }
];

export const mockChartData: ChartData = {
  type: 'bar',
  title: 'Revenue Growth Comparison (YoY %)',
  data: [
    { label: 'MSFT', value: 6.9, color: '#10b981' },
    { label: 'NVDA', value: 0.2, color: '#3b82f6' }
  ]
};

export const mockSentiment: SentimentData = {
  score: 72,
  label: 'Optimistic',
  factors: [
    'Strong cloud revenue growth mentioned',
    'Positive language around AI opportunities',
    'Increased investment in R&D'
  ]
};

export const mockMessages: Message[] = [
  {
    id: '1',
    type: 'user',
    content: 'Compare Microsoft vs Nvidia revenue growth in 2023',
    timestamp: new Date(Date.now() - 120000)
  },
  {
    id: '2',
    type: 'agent',
    content: '',
    timestamp: new Date(Date.now() - 60000),
    thinking: {
      steps: mockThinkingSteps,
      isComplete: true
    },
    answer: {
      mainMetric: {
        label: 'Revenue Growth Difference',
        value: '6.7%',
        change: 6.7,
        trend: 'up'
      },
      reasoning: 'Microsoft demonstrated significantly stronger revenue growth in fiscal 2023 compared to Nvidia. MSFT achieved 6.9% YoY growth ($211.9B vs $198.3B), primarily driven by their Intelligent Cloud segment and Azure adoption. In contrast, NVDA showed minimal growth at 0.2% ($26.97B vs $26.91B), despite strong Data Center performance, likely impacted by Gaming segment headwinds. The 6.7 percentage point difference highlights Microsoft\'s more diversified revenue streams and resilience.',
      sources: mockSources,
      chartData: mockChartData,
      sentiment: mockSentiment
    }
  }
];
