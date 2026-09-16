// Contrato compartilhado: somente propriedades explicitamente copiadas atravessam esta fronteira.
export const TYPES = ['fluxo', 'ciclo', 'linha_do_tempo', 'mapa', 'comparacao', 'sistema_biologico', 'microscopico', 'camadas', 'movimento', 'especial'];
export const SPECIALS = ['terremoto', 'fotossintese', 'brasil_colonial'];
export const ELEMENTS = ['circulo', 'elipse', 'retangulo', 'texto', 'seta', 'linha', 'onda', 'particula', 'icone'];
export const ACTIONS = ['aparecer', 'desaparecer', 'mover', 'pulsar', 'girar', 'crescer', 'vibrar', 'destacar', 'fluir'];
export const ICONS = ['sol', 'agua', 'nuvem', 'folha', 'arvore', 'oxigenio', 'gas_carbonico', 'planeta', 'celula', 'coracao', 'atomo', 'cidade', 'livro', 'relogio', 'placa_tectonica', 'estomago', 'pulmao', 'cerebro', 'bacteria', 'lua', 'montanha', 'vulcao'];
export const BACKDROPS = ['neutro', 'natureza', 'espaco', 'laboratorio', 'historico'];
export const PALETTE = { azul: '#3977d5', claro: '#b9def5', verde: '#25856a', amarelo: '#e8ac27', vermelho: '#ce5264', roxo: '#8c65c3', escuro: '#334366', branco: '#ffffff' };
const object = v => v && typeof v === 'object' && !Array.isArray(v);
export const safeText = (v, max = 90, fallback = '') => typeof v === 'string' && !/[<>\u0000-\u001f\u007f]/.test(v) ? [...v.trim()].slice(0, max).join('') || fallback : fallback;
const number = (v, min, max, fallback) => typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;
const list = (v, max) => Array.isArray(v) ? v.slice(0, max) : [];
const member = (v, choices, fallback) => choices.includes(v) ? v : fallback;
export function validateVisualExperience(input) {
  const c = object(input) ? input : {};
  const requestedType = c.tipoDeCena ?? c.tipoVisual;
  const special = member(c.experienciaEspecial, SPECIALS, member(requestedType, SPECIALS, undefined));
  let tipoVisual = special || member(requestedType, TYPES, 'fluxo');
  if (tipoVisual === 'especial' && !special) tipoVisual = 'fluxo';
  const source = Array.isArray(c.cenas) && c.cenas.length ? c.cenas : c.etapas;
  let fallback = false;
  let cenas = list(source, 6).filter(object).map(s => {
    const ids = new Set();
    const elementos = list(s.elementos, 10).filter(object).flatMap(e => {
      if (!ELEMENTS.includes(e.tipo) || typeof e.id !== 'string' || !/^[a-zA-Z0-9_-]{1,40}$/.test(e.id) || ids.has(e.id)) return [];
      if (e.tipo === 'icone' && !ICONS.includes(e.icone)) return [];
      ids.add(e.id);
      return [{ id: e.id, tipo: e.tipo, rotulo: safeText(e.rotulo, 40), x: number(e.x, 0, 100, 50), y: number(e.y, 0, 100, 50), largura: number(e.largura, 1, 100, 16), altura: number(e.altura, 1, 100, 12), cor: member(e.cor, Object.keys(PALETTE), 'azul'), ...(e.tipo === 'icone' ? { icone: e.icone } : {}) }];
    });
    const duracaoMs = number(s.duracaoMs, 1000, 8000, 4000);
    const acoes = list(s.acoes, 12).filter(a => object(a) && ids.has(a.alvo) && ACTIONS.includes(a.tipo)).map(a => {
      const target = elementos.find(e => e.id === a.alvo);
      const atrasoMs = number(a.atrasoMs, 0, duracaoMs - 100, 0);
      return { alvo: a.alvo, tipo: a.tipo, paraX: number(a.paraX, 0, 100, target.x), paraY: number(a.paraY, 0, 100, target.y), duracaoMs: number(a.duracaoMs, 100, duracaoMs - atrasoMs, Math.min(1000, duracaoMs - atrasoMs)), atrasoMs };
    });
    if (!elementos.length) fallback = true;
    return { titulo: safeText(s.titulo, 90, 'Observe esta etapa'), explicacao: safeText(s.explicacao, 340, 'Consulte seu material de estudo para aprofundar este assunto.'), duracaoMs, elementos, acoes, cenario: member(s.cenario, BACKDROPS, 'neutro') };
  });
  if (!cenas.length) {
    fallback = true;
    cenas = [{ titulo: 'Vamos estudar', explicacao: safeText(c.resumo, 280, 'Não foi possível representar este assunto. Reformule a pergunta ou explore uma experiência pronta.'), duracaoMs: 4000, elementos: [], acoes: [], cenario: 'neutro' }];
  }
  return { versao: '1.0', disciplina: member(c.disciplina, ['ciencias', 'historia', 'geografia', 'outro'], 'outro'), titulo: safeText(c.titulo, 90, 'Uma explicação visual'), resumo: safeText(c.resumo, 280, 'Acompanhe a explicação por etapas.'), tipoVisual, cenas, etapas: cenas.map(({ titulo, explicacao }) => ({ titulo, explicacao })), conclusao: safeText(c.conclusao, 280), curiosidade: safeText(c.curiosidade, 220), origem: member(c.origem, ['premium', 'local', 'ia'], 'ia'), fallback };
}
