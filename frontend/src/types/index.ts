export interface ConfidenceMetrics {
  confidence: number;
  safety: number;
  truth: number;
  flagged?: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: FileAttachment[];
  metrics?: ConfidenceMetrics;
}

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
}

export interface TrustAssessment {
  score: number;
  riskLevel: 'low' | 'medium' | 'high';
  explanation: string;
  factors: TrustFactor[];
}

export interface TrustFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface ConsentData {
  purpose: string;
  dataScope: string[];
  retentionTime: number; // seconds remaining
  sessionActive: boolean;
  sessionStarted: Date;
}

export interface MonitoringEvent {
  id: string;
  type: 'query' | 'policy_check' | 'consent_validation' | 'response_evaluation';
  message: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'error';
}

export interface SessionState {
  active: boolean;
  timeRemaining: number; // seconds
  startedAt: Date | null;
}

export type DrawerType = 'trust' | 'consent' | 'monitoring' | 'settings' | null;
