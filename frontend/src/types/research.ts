export interface ResearchStep {
  step: string;
  progress: number;
  timestamp: string;
}

export interface ResearchState {
  isConnected: boolean;
  isStreaming: boolean;
  steps: ResearchStep[];
  currentStep: string;
  progress: number;
  error: string | null;
}
