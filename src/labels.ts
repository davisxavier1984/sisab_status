import type { ServiceState } from './types';

export const STATE_LABEL: Record<ServiceState, string> = {
  operational: 'Operacional',
  degraded: 'Lento',
  down: 'Fora do ar',
  checking: 'Verificando…',
};
