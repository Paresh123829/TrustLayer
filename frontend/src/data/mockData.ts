import { TrustAssessment, ConsentData, MonitoringEvent } from '@/types';

export const mockTrustAssessment: TrustAssessment = {
  score: 87,
  riskLevel: 'low',
  explanation: 'The response demonstrates high factual accuracy with verifiable claims. Source material was cross-referenced against multiple trusted databases.',
  factors: [
    {
      name: 'Source Verification',
      impact: 'positive',
      description: 'All cited sources are from verified, reputable origins'
    },
    {
      name: 'Factual Consistency',
      impact: 'positive',
      description: 'Claims are internally consistent and align with established knowledge'
    },
    {
      name: 'Confidence Calibration',
      impact: 'positive',
      description: 'Uncertainty is appropriately expressed where relevant'
    },
    {
      name: 'Temporal Relevance',
      impact: 'neutral',
      description: 'Some referenced data may require recency verification'
    }
  ]
};

export const mockConsentData: ConsentData = {
  purpose: 'Query processing and response generation for enterprise AI governance assessment',
  dataScope: ['Text input', 'Uploaded documents', 'Session metadata'],
  retentionTime: 1800, // 30 minutes
  sessionActive: true,
  sessionStarted: new Date(Date.now() - 300000) // 5 minutes ago
};

export const mockMonitoringEvents: MonitoringEvent[] = [
  {
    id: '1',
    type: 'query',
    message: 'User query received and parsed',
    timestamp: new Date(Date.now() - 120000),
    status: 'success'
  },
  {
    id: '2',
    type: 'consent_validation',
    message: 'Data processing consent validated',
    timestamp: new Date(Date.now() - 118000),
    status: 'success'
  },
  {
    id: '3',
    type: 'policy_check',
    message: 'Content policy compliance verified',
    timestamp: new Date(Date.now() - 115000),
    status: 'success'
  },
  {
    id: '4',
    type: 'response_evaluation',
    message: 'Response generated and trust-scored',
    timestamp: new Date(Date.now() - 110000),
    status: 'success'
  },
  {
    id: '5',
    type: 'policy_check',
    message: 'Output safety review completed',
    timestamp: new Date(Date.now() - 108000),
    status: 'success'
  }
];

export const mockMessages = [
  {
    id: '1',
    role: 'assistant' as const,
    content: 'Welcome to TrustStack. I can help you understand AI governance, assess trust metrics, and manage data consent. How can I assist you today?',
    timestamp: new Date(Date.now() - 300000),
    metrics: {
      confidence: 95,
      safety: 98,
      truth: 92,
      flagged: false
    }
  }
];

// Generate mock metrics for responses
export function generateMockMetrics(filtersEnabled: boolean) {
  const base = {
    confidence: Math.floor(Math.random() * 40) + 60,
    safety: filtersEnabled ? Math.floor(Math.random() * 20) + 80 : Math.floor(Math.random() * 50) + 20,
    truth: Math.floor(Math.random() * 30) + 70,
  };
  return {
    ...base,
    flagged: base.safety < 50 || base.confidence < 40
  };
}
