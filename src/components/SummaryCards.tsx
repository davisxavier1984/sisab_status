import type { Equipe } from '../types';

interface Props {
  equipes: Equipe[];
}

export function SummaryCards({ equipes }: Props) {
  const total = equipes.length;
  const enviado = equipes.filter((e) => e.status === 'enviado').length;
  const pendente = equipes.filter((e) => e.status === 'pendente').length;
  const atrasado = equipes.filter((e) => e.status === 'atrasado').length;
  const cobertura = total ? Math.round((enviado / total) * 100) : 0;

  const cards = [
    { label: 'Equipes', value: total, tone: 'neutral' },
    { label: 'Enviados', value: enviado, tone: 'enviado' },
    { label: 'Pendentes', value: pendente, tone: 'pendente' },
    { label: 'Atrasados', value: atrasado, tone: 'atrasado' },
    { label: 'Cobertura de envio', value: `${cobertura}%`, tone: 'neutral' },
  ];

  return (
    <div className="cards">
      {cards.map((c) => (
        <div key={c.label} className={`card card--${c.tone}`}>
          <span className="card__value">{c.value}</span>
          <span className="card__label">{c.label}</span>
        </div>
      ))}
    </div>
  );
}
