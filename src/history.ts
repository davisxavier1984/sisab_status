import type { CheckSample, HistoryMap } from './types';

const STORAGE_KEY = 'sisab-status:history';
export const MAX_SAMPLES = 90;

export function loadHistory(): HistoryMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function saveHistory(history: HistoryMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // localStorage indisponível (modo privativo / cota) — segue sem persistir.
  }
}

export function appendSample(
  history: HistoryMap,
  serviceId: string,
  sample: CheckSample,
): HistoryMap {
  const previous = history[serviceId] ?? [];
  const next = [...previous, sample].slice(-MAX_SAMPLES);
  return { ...history, [serviceId]: next };
}
