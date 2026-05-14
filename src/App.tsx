import { useMemo, useState } from 'react';
import { competencias, getEquipes } from './data';
import type { EnvioStatus } from './types';
import { SummaryCards } from './components/SummaryCards';
import { EquipeTable } from './components/EquipeTable';

type Filtro = EnvioStatus | 'todos';

const FILTROS: { id: Filtro; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'enviado', label: 'Enviados' },
  { id: 'pendente', label: 'Pendentes' },
  { id: 'atrasado', label: 'Atrasados' },
];

export function App() {
  const [competenciaId, setCompetenciaId] = useState(competencias[0].id);
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [busca, setBusca] = useState('');

  const competencia = competencias.find((c) => c.id === competenciaId)!;
  const equipes = useMemo(() => getEquipes(competenciaId), [competenciaId]);

  const equipesFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return equipes.filter((e) => {
      if (filtro !== 'todos' && e.status !== filtro) return false;
      if (!termo) return true;
      return (
        e.nome.toLowerCase().includes(termo) ||
        e.municipio.toLowerCase().includes(termo) ||
        e.ine.includes(termo)
      );
    });
  }, [equipes, filtro, busca]);

  const prazoFmt = new Date(`${competencia.prazo}T00:00:00`).toLocaleDateString('pt-BR');

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>SISAB Status</h1>
          <p className="subtitle">
            Acompanhamento de envios de produção à Atenção Primária
          </p>
        </div>
        <label className="competencia">
          <span>Competência</span>
          <select
            value={competenciaId}
            onChange={(ev) => setCompetenciaId(ev.target.value)}
          >
            {competencias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      </header>

      <p className="prazo">
        Prazo de envio desta competência: <strong>{prazoFmt}</strong>
      </p>

      <SummaryCards equipes={equipes} />

      <div className="toolbar">
        <div className="filtros">
          {FILTROS.map((f) => (
            <button
              key={f.id}
              className={`chip ${filtro === f.id ? 'chip--active' : ''}`}
              onClick={() => setFiltro(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          className="busca"
          type="search"
          placeholder="Buscar por equipe, município ou INE"
          value={busca}
          onChange={(ev) => setBusca(ev.target.value)}
        />
      </div>

      <EquipeTable equipes={equipesFiltradas} />

      <footer className="footer">
        {equipesFiltradas.length} de {equipes.length} equipes exibidas · Dados
        de demonstração
      </footer>
    </div>
  );
}
