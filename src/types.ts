export type ServiceState = 'operational' | 'degraded' | 'down' | 'checking';

export interface ServiceConfig {
  id: string;
  name: string;
  description: string;
  url: string;
}

export interface CheckSample {
  at: number;
  state: Exclude<ServiceState, 'checking'>;
  responseTime: number | null;
}

export type HistoryMap = Record<string, CheckSample[]>;
