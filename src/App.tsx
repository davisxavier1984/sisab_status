import { useCallback, useEffect, useMemo, useState } from 'react';
import { SERVICES, checkService } from './monitor';
import { appendSample, loadHistory, saveHistory } from './history';
import type { HistoryMap, ServiceState } from './types';
import { OverallBanner } from './components/OverallBanner';
import { ServiceCard } from './components/ServiceCard';

const REFRESH_MS = 60_000;

function overallState(history: HistoryMap): ServiceState {
  let result: ServiceState = 'operational';
  let hasData = false;
  for (const service of SERVICES) {
    const samples = history[service.id];
    const latest = samples?.[samples.length - 1];
    if (!latest) continue;
    hasData = true;
    if (latest.state === 'down') return 'down';
    if (latest.state === 'degraded') result = 'degraded';
  }
  return hasData ? result : 'checking';
}

export function App() {
  const [history, setHistory] = useState<HistoryMap>(() => loadHistory());
  const [checking, setChecking] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const runChecks = useCallback(async () => {
    setChecking(true);
    const results = await Promise.all(
      SERVICES.map(async (s) => ({ id: s.id, sample: await checkService(s.url) })),
    );
    setHistory((prev) => {
      let next = prev;
      for (const { id, sample } of results) {
        next = appendSample(next, id, sample);
      }
      saveHistory(next);
      return next;
    });
    setLastUpdated(new Date());
    setChecking(false);
  }, []);

  useEffect(() => {
    runChecks();
    const id = setInterval(runChecks, REFRESH_MS);
    return () => clearInterval(id);
  }, [runChecks]);

  const overall = useMemo(() => overallState(history), [history]);

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>SISAB Status</h1>
          <p className="subtitle">
            Status operacional dos sistemas do e-SUS Atenção Primária à Saúde
          </p>
        </div>
        <button className="refresh" onClick={runChecks} disabled={checking}>
          {checking ? 'Verificando…' : 'Atualizar'}
        </button>
      </header>

      <OverallBanner state={overall} />

      <div className="services">
        {SERVICES.map((s) => (
          <ServiceCard key={s.id} service={s} samples={history[s.id] ?? []} />
        ))}
      </div>

      <footer className="footer">
        <span>
          {lastUpdated
            ? `Atualizado às ${lastUpdated.toLocaleTimeString('pt-BR')} · atualização automática a cada 60 s`
            : 'Verificando…'}
        </span>
        <span>
          Verificação cross-origin (no-cors): mede alcançabilidade e latência, não
          o status HTTP exato. Histórico mantido apenas neste navegador.
        </span>
      </footer>
    </div>
  );
}
