import type { ServiceState } from '../types';

const TITLE: Record<ServiceState, string> = {
  operational: 'Todos os sistemas operacionais',
  degraded: 'Desempenho degradado em alguns sistemas',
  down: 'Interrupção em um ou mais sistemas',
  checking: 'Verificando o status dos sistemas…',
};

export function OverallBanner({ state }: { state: ServiceState }) {
  return (
    <div className={`banner banner--${state}`}>
      <span className="banner__icon" />
      <span className="banner__title">{TITLE[state]}</span>
    </div>
  );
}
