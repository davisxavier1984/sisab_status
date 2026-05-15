import type { CheckSample } from '../types';
import { MAX_SAMPLES } from '../history';
import { STATE_LABEL } from '../labels';

export function UptimeBars({ samples }: { samples: CheckSample[] }) {
  const padding = Math.max(0, MAX_SAMPLES - samples.length);

  return (
    <div className="bars" aria-hidden="true">
      {Array.from({ length: padding }).map((_, i) => (
        <span key={`pad-${i}`} className="bar bar--empty" />
      ))}
      {samples.map((s) => (
        <span
          key={s.at}
          className={`bar bar--${s.state}`}
          title={`${new Date(s.at).toLocaleString('pt-BR')} — ${STATE_LABEL[s.state]}${
            s.responseTime != null ? ` (${s.responseTime} ms)` : ''
          }`}
        />
      ))}
    </div>
  );
}
