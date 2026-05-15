import type { CheckSample, ServiceConfig, ServiceState } from '../types';
import { STATE_LABEL } from '../labels';
import { UptimeBars } from './UptimeBars';

interface Props {
  service: ServiceConfig;
  samples: CheckSample[];
}

export function ServiceCard({ service, samples }: Props) {
  const latest = samples[samples.length - 1];
  const state: ServiceState = latest ? latest.state : 'checking';
  const ok = samples.filter((s) => s.state === 'operational').length;
  const uptime = samples.length ? Math.round((ok / samples.length) * 100) : null;

  return (
    <div className="service">
      <div className="service__head">
        <div className="service__id">
          <a
            className="service__name"
            href={service.url}
            target="_blank"
            rel="noreferrer"
          >
            {service.name}
          </a>
          <p className="service__desc">{service.description}</p>
        </div>
        <span className={`pill pill--${state}`}>
          <span className="pill__dot" />
          {STATE_LABEL[state]}
        </span>
      </div>

      <UptimeBars samples={samples} />

      <div className="service__foot">
        <span>
          {latest?.responseTime != null
            ? `${latest.responseTime} ms`
            : state === 'down'
              ? 'sem resposta'
              : '—'}
        </span>
        <span>
          {uptime != null
            ? `${uptime}% operacional · ${samples.length} verificaç${
                samples.length === 1 ? 'ão' : 'ões'
              }`
            : 'sem histórico ainda'}
        </span>
      </div>
    </div>
  );
}
