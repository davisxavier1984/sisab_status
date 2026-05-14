import type { Equipe } from '../types';
import { StatusBadge } from './StatusBadge';

interface Props {
  equipes: Equipe[];
}

export function EquipeTable({ equipes }: Props) {
  if (equipes.length === 0) {
    return <p className="empty">Nenhuma equipe encontrada para o filtro atual.</p>;
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>INE</th>
            <th>Equipe</th>
            <th>Tipo</th>
            <th>Município</th>
            <th>UF</th>
            <th className="num">Fichas</th>
            <th>Último envio</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {equipes.map((e) => (
            <tr key={e.ine}>
              <td className="mono">{e.ine}</td>
              <td>{e.nome}</td>
              <td>{e.tipo}</td>
              <td>{e.municipio}</td>
              <td>{e.uf}</td>
              <td className="num">{e.fichas.toLocaleString('pt-BR')}</td>
              <td>{e.ultimoEnvio ?? '—'}</td>
              <td>
                <StatusBadge status={e.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
