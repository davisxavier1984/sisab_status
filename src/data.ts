import type { Competencia, Equipe, EnvioStatus } from './types';

export const competencias: Competencia[] = [
  { id: '2026-04', label: 'Abril / 2026', prazo: '2026-05-31' },
  { id: '2026-03', label: 'Março / 2026', prazo: '2026-04-30' },
  { id: '2026-02', label: 'Fevereiro / 2026', prazo: '2026-03-31' },
  { id: '2026-01', label: 'Janeiro / 2026', prazo: '2026-02-28' },
];

interface EquipeBase {
  ine: string;
  nome: string;
  tipo: string;
  municipio: string;
  uf: string;
}

const equipesBase: EquipeBase[] = [
  { ine: '0000123456', nome: 'ESF Centro', tipo: 'eSF', municipio: 'Recife', uf: 'PE' },
  { ine: '0000123457', nome: 'ESF Boa Viagem', tipo: 'eSF', municipio: 'Recife', uf: 'PE' },
  { ine: '0000123458', nome: 'ESF Casa Amarela', tipo: 'eSF', municipio: 'Recife', uf: 'PE' },
  { ine: '0000223456', nome: 'eAP Tamarineira', tipo: 'eAP', municipio: 'Recife', uf: 'PE' },
  { ine: '0000323456', nome: 'ESF Jardim São Paulo', tipo: 'eSF', municipio: 'Olinda', uf: 'PE' },
  { ine: '0000323457', nome: 'ESF Peixinhos', tipo: 'eSF', municipio: 'Olinda', uf: 'PE' },
  { ine: '0000423456', nome: 'eMulti Sul', tipo: 'eMulti', municipio: 'Olinda', uf: 'PE' },
  { ine: '0000523456', nome: 'ESF Vila Rica', tipo: 'eSF', municipio: 'Jaboatão dos Guararapes', uf: 'PE' },
  { ine: '0000523457', nome: 'ESF Cavaleiro', tipo: 'eSF', municipio: 'Jaboatão dos Guararapes', uf: 'PE' },
  { ine: '0000623456', nome: 'eAP Prazeres', tipo: 'eAP', municipio: 'Jaboatão dos Guararapes', uf: 'PE' },
  { ine: '0000723456', nome: 'ESF Maranguape', tipo: 'eSF', municipio: 'Paulista', uf: 'PE' },
  { ine: '0000823456', nome: 'ESF Centro', tipo: 'eSF', municipio: 'Caruaru', uf: 'PE' },
  { ine: '0000823457', nome: 'ESF Salgado', tipo: 'eSF', municipio: 'Caruaru', uf: 'PE' },
  { ine: '0000923456', nome: 'eMulti Agreste', tipo: 'eMulti', municipio: 'Caruaru', uf: 'PE' },
  { ine: '0001023456', nome: 'ESF Heliópolis', tipo: 'eSF', municipio: 'Garanhuns', uf: 'PE' },
];

// Pseudo-aleatório determinístico para gerar status estável por competência.
function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

function statusFor(competenciaId: string, ine: string): EnvioStatus {
  const isAtual = competenciaId === competencias[0].id;
  const r = hash(`${competenciaId}:${ine}`);
  if (!isAtual) {
    // Competências fechadas: maioria enviada.
    return r < 0.88 ? 'enviado' : 'atrasado';
  }
  if (r < 0.55) return 'enviado';
  if (r < 0.82) return 'pendente';
  return 'atrasado';
}

export function getEquipes(competenciaId: string): Equipe[] {
  const competencia = competencias.find((c) => c.id === competenciaId) ?? competencias[0];
  const [prazoAno, prazoMes] = competencia.prazo.split('-').map(Number);

  return equipesBase.map((base) => {
    const status = statusFor(competenciaId, base.ine);
    const r = hash(`fichas:${competenciaId}:${base.ine}`);
    const fichas = status === 'enviado' ? 120 + Math.floor(r * 480) : 0;
    let ultimoEnvio: string | null = null;
    if (status === 'enviado') {
      const dia = 1 + Math.floor(hash(`data:${competenciaId}:${base.ine}`) * 27);
      ultimoEnvio = `${String(dia).padStart(2, '0')}/${String(prazoMes).padStart(2, '0')}/${prazoAno}`;
    }
    return { ...base, status, fichas, ultimoEnvio };
  });
}
