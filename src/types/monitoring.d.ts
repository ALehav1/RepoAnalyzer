declare global {
  interface Window {
    gtag?: (
      command: 'event',
      action: string,
      params?: Record<string, any>
    ) => void;
  }
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit?: string;
}

export interface MonitoringEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  nonInteraction?: boolean;
}

export interface ErrorContext {
  component?: string;
  action?: string;
  data?: Record<string, any>;
  userId?: string;
  timestamp?: number;
}

export interface ApiCallMetrics {
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  error?: string;
}
