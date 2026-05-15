import type { CheckSample, ServiceConfig } from './types';

export const SERVICES: ServiceConfig[] = [
  {
    id: 'esusab',
    name: 'Portal e-SUS APS',
    description: 'Portal principal do e-SUS Atenção Primária à Saúde',
    url: 'https://esusab.saude.gov.br/',
  },
  {
    id: 'sisab',
    name: 'SISAB — Relatórios',
    description: 'Sistema de Informação em Saúde para a Atenção Básica',
    url: 'https://sisab.saude.gov.br/',
  },
  {
    id: 'egestorab',
    name: 'e-Gestor AB',
    description: 'Portal de gestão e credenciamento da Atenção Básica',
    url: 'https://egestorab.saude.gov.br/',
  },
];

const TIMEOUT_MS = 10_000;
const SLOW_THRESHOLD_MS = 3_000;

// Requisição cross-origin com mode 'no-cors': a resposta é opaca, então
// medimos alcançabilidade e latência — não o status HTTP exato. Falha de
// rede, DNS ou timeout cai no catch e marca o serviço como fora do ar.
export async function checkService(url: string): Promise<CheckSample> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const start = performance.now();
  try {
    await fetch(url, {
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller.signal,
    });
    const responseTime = Math.round(performance.now() - start);
    return {
      at: Date.now(),
      state: responseTime > SLOW_THRESHOLD_MS ? 'degraded' : 'operational',
      responseTime,
    };
  } catch {
    return { at: Date.now(), state: 'down', responseTime: null };
  } finally {
    clearTimeout(timer);
  }
}
