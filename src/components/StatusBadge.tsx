import type { EnvioStatus } from '../types';

const LABELS: Record<EnvioStatus, string> = {
  enviado: 'Enviado',
  pendente: 'Pendente',
  atrasado: 'Atrasado',
};

export function StatusBadge({ status }: { status: EnvioStatus }) {
  return <span className={`badge badge--${status}`}>{LABELS[status]}</span>;
}
