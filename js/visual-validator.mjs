// Contrato compartilhado: somente propriedades explicitamente copiadas atravessam esta fronteira.
export const TYPES = ['fluxo', 'ciclo', 'linha_do_tempo', 'mapa', 'comparacao', 'sistema_biologico', 'microscopico', 'camadas', 'movimento', 'especial'];
export const SPECIALS = [
  'terremoto', 'fotossintese', 'brasil_colonial', 'vulcao', 'celula', 'agua', 'eclipse',
  'translacao_terra', 'revolucao_industrial', 'urbanizacao', 'rotacao_terra', 'sistema_respiratorio',
  'hidreletrica',
];
export const SPECIAL_ALIASES = {
  'earth-translation': 'translacao_terra',
  'translacao': 'translacao_terra',
  'translacao-da-terra': 'translacao_terra',
  'industrial-revolution': 'revolucao_industrial',
  'revolucao-industrial': 'revolucao_industrial',
  'urbanization': 'urbanizacao',
  'urbanizacao': 'urbanizacao',
  'earth-rotation': 'rotacao_terra',
  'rotacao': 'rotacao_terra',
  'rotacao-da-terra': 'rotacao_terra',
  'respiratory-system': 'sistema_respiratorio',
  'sistema-respiratorio': 'sistema_respiratorio',
  'volcanic-eruption': 'vulcao',
  'erupcao-vulcanica': 'vulcao',
  'vulcao': 'vulcao',
  'photosynthesis': 'fotossintese',
  'water-cycle': 'agua',
  'ciclo-da-agua': 'agua',
  'solar-eclipse': 'eclipse',
  'eclipse-solar': 'eclipse',
  'tectonic-plates': 'terremoto',
  'placas-tectonicas': 'terremoto',
  'historical-timeline': 'brasil_colonial',
  'linha-do-tempo': 'linha_do_tempo',
  'historical-map': 'mapa',
  'geographic-map': 'mapa',
  'geographic-flow': 'fluxo',
  'cell-structure': 'celula',
  'celula': 'celula',
  'anatomy': 'sistema_respiratorio',
  'generic-support': 'fluxo',
  'hydroelectric-plant': 'hidreletrica',
  'hydroelectric': 'hidreletrica',
  'usina_hidreletrica': 'hidreletrica',
  'usina-hidreletrica': 'hidreletrica',
};
export const ELEMENTS = ['circulo', 'elipse', 'retangulo', 'texto', 'seta', 'linha', 'onda', 'particula', 'icone'];
export const ACTIONS = ['aparecer', 'desaparecer', 'mover', 'pulsar', 'girar', 'crescer', 'vibrar', 'destacar', 'fluir'];
export const ICONS = [
  'sol', 'agua', 'nuvem', 'folha', 'arvore', 'oxigenio', 'gas_carbonico',
  'planeta', 'celula', 'coracao', 'atomo', 'cidade', 'livro', 'relogio',
  'placa_tectonica', 'estomago', 'pulmao', 'cerebro', 'bacteria', 'lua',
  'montanha', 'vulcao', 'dna', 'foguete', 'computador', 'vacina', 'virus',
  'bateria', 'raio', 'engrenagem', 'lampada', 'olho', 'telescopio', 'som',
  'ima', 'aviao', 'fogo', 'gota', 'globo', 'estrela', 'buraco_negro', 'urna'
];
export const BACKDROPS = ['neutro', 'natureza', 'espaco', 'laboratorio', 'historico'];
export const PALETTE = { azul: '#3977d5', claro: '#b9def5', verde: '#25856a', amarelo: '#e8ac27', vermelho: '#ce5264', roxo: '#8c65c3', escuro: '#334366', branco: '#ffffff' };

export const mapToPaletteColor = (val) => {
  if (!val || typeof val !== 'string') return 'azul';
  const v = val.toLowerCase().trim();
  if (Object.keys(PALETTE).includes(v)) return v;
  for (const [k, hex] of Object.entries(PALETTE)) {
    if (hex.toLowerCase() === v) return k;
  }
  if (v.startsWith('#')) {
    const hex = v.replace('#', '');
    const num = parseInt(hex.length === 3 ? hex.split('').map(c => c + c).join('') : hex, 16);
    if (!isNaN(num)) {
      const r = (num >> 16) & 255, g = (num >> 8) & 255, b = num & 255;
      if (r > 215 && g > 215 && b > 215) return 'branco';
      if (r < 70 && g < 70 && b < 90) return 'escuro';
      if (r > 190 && g > 150 && b < 90) return 'amarelo';
      if (r > 180 && g < 110 && b < 110) return 'vermelho';
      if (g > r && g > b) return 'verde';
      if (b > r && b > g) return 'azul';
      if (r > 120 && b > 120 && g < 110) return 'roxo';
    }
  }
  if (/amarel|yellow|gold|laranja|orange/.test(v)) return 'amarelo';
  if (/verd|green/.test(v)) return 'verde';
  if (/verm|red/.test(v)) return 'vermelho';
  if (/rox|purpl|violet/.test(v)) return 'roxo';
  if (/clar|light|cyan|celeste/.test(v)) return 'claro';
  if (/escur|dark|black|pret|cinza|gray/.test(v)) return 'escuro';
  if (/branc|white/.test(v)) return 'branco';
  return 'azul';
};

export const resolveIcon = (tipo, label = '') => {
  const norm = String(label || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (ICONS.includes(tipo)) return tipo;
  if (ICONS.includes(norm)) return norm;
  if (/sol|sun/.test(norm)) return 'sol';
  if (/estrela|star|astro/.test(norm)) return 'estrela';
  if (/buraco.*negro|black.*hole|singularidade/.test(norm)) return 'buraco_negro';
  if (/lua|moon/.test(norm)) return 'lua';
  if (/terra|planeta|globe|orbita/.test(norm)) return 'planeta';
  if (/globo|mapa|cartograf|mundo/.test(norm)) return 'globo';
  if (/agua|chuva|rio|mar|oceano|hidro/.test(norm)) return 'agua';
  if (/gota|liquido|orvalho/.test(norm)) return 'gota';
  if (/nuvem|cloud|vapor|atmosfera/.test(norm)) return 'nuvem';
  if (/folha|leaf|vegeta|clorofila/.test(norm)) return 'folha';
  if (/arvore|tree|floresta|bosque/.test(norm)) return 'arvore';
  if (/oxigenio|o2/.test(norm)) return 'oxigenio';
  if (/carbonico|co2|carbon/.test(norm)) return 'gas_carbonico';
  if (/dna|gen|cromossom|hereditari/.test(norm)) return 'dna';
  if (/vacina|anticorpo|imun|seringa|defesa/.test(norm)) return 'vacina';
  if (/virus|viral|patogeno|covid/.test(norm)) return 'virus';
  if (/bacteria|microbio/.test(norm)) return 'bacteria';
  if (/celula|cell|citoplasma|membrana/.test(norm)) return 'celula';
  if (/coracao|heart|cardiac|circulac/.test(norm)) return 'coracao';
  if (/pulmao|respirat|alveolo|ar/.test(norm)) return 'pulmao';
  if (/estomago|digest|nutriente/.test(norm)) return 'estomago';
  if (/cerebro|neuronio|mente|sinapse/.test(norm)) return 'cerebro';
  if (/olho|visao|retina|otica|lente/.test(norm)) return 'olho';
  if (/telescopio|microscopio/.test(norm)) return 'telescopio';
  if (/atomo|atom|molecula|eletron|proton/.test(norm)) return 'atomo';
  if (/bateria|pilha|eletricidade|energia/.test(norm)) return 'bateria';
  if (/raio|eletrico|descarga|voltagem/.test(norm)) return 'raio';
  if (/engrenagem|motor|maquina|mecanic|turbina/.test(norm)) return 'engrenagem';
  if (/foguete|rocket|espaconave|lancamento|propulsao/.test(norm)) return 'foguete';
  if (/aviao|asa|voo|aerodinamica/.test(norm)) return 'aviao';
  if (/computador|internet|rede|chip|dados|servidor|digital/.test(norm)) return 'computador';
  if (/som|acustic|audio|onda.*sonora|ouvido/.test(norm)) return 'som';
  if (/ima|magnet|campo.*magnet/.test(norm)) return 'ima';
  if (/lampada|luz|iluminacao|ideia/.test(norm)) return 'lampada';
  if (/fogo|chama|combust|calor|termic/.test(norm)) return 'fogo';
  if (/urna|voto|eleicao|democracia|justica|cidada/.test(norm)) return 'urna';
  if (/cidade|city|fabrica|predio|metropole|urbano/.test(norm)) return 'cidade';
  if (/livro|book|documento|historia/.test(norm)) return 'livro';
  if (/relogio|tempo|ano|dias|horas|seculos/.test(norm)) return 'relogio';
  if (/tectonica|sismo|falha|terremoto/.test(norm)) return 'placa_tectonica';
  if (/montanha|relevo|cordilheira/.test(norm)) return 'montanha';
  if (/vulcao|erupcao|magma|lava/.test(norm)) return 'vulcao';
  return null;
};

const object = v => v && typeof v === 'object' && !Array.isArray(v);
export const safeText = (v, max = 90, fallback = '') => typeof v === 'string' && !/[<>\u0000-\u001f\u007f]/.test(v) ? [...v.trim()].slice(0, max).join('') || fallback : fallback;
const number = (v, min, max, fallback) => typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;
const list = (v, max) => Array.isArray(v) ? v.slice(0, max) : [];
const member = (v, choices, fallback) => choices.includes(v) ? v : fallback;
export function validateVisualExperience(input) {
  const c = object(input) ? input : {};
  const rawRequested = c.sceneType ?? c.tipoDeCena ?? c.tipoVisual;
  const requestedType = SPECIAL_ALIASES[rawRequested] || rawRequested;
  const rawSpecial = c.experienciaEspecial ? (SPECIAL_ALIASES[c.experienciaEspecial] || c.experienciaEspecial) : undefined;
  const special = member(rawSpecial, SPECIALS, member(requestedType, SPECIALS, undefined));
  let tipoVisual = special || member(requestedType, TYPES, 'fluxo');
  if (tipoVisual === 'especial' && !special) tipoVisual = 'fluxo';

  let disciplina = c.disciplina;
  if (!disciplina && typeof c.category === 'string') {
    const normCat = c.category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (normCat.includes('cien') || normCat.includes('astro') || normCat.includes('corpo') || normCat.includes('meio') || normCat.includes('tec') || normCat.includes('mat')) disciplina = 'ciencias';
    else if (normCat.includes('hist')) disciplina = 'historia';
    else if (normCat.includes('geog')) disciplina = 'geografia';
  }

  const rawEntities = Array.isArray(c.entities) ? c.entities.map(e => {
    const rawLabel = e.rotulo || e.label || '';
    const mappedColor = mapToPaletteColor(e.cor || e.color);
    const resolvedIco = resolveIcon(e.icone || e.type, rawLabel);
    let tipo = e.tipo || (e.type === 'circle' ? 'circulo' : e.type === 'rectangle' ? 'retangulo' : e.type === 'arrow' ? 'seta' : e.type === 'particle' ? 'particula' : (ELEMENTS.includes(e.type) ? e.type : (resolvedIco ? 'icone' : 'circulo')));
    return {
      id: String(e.id || 'ent').slice(0, 40),
      tipo,
      rotulo: rawLabel,
      x: e.x ?? (e.position && e.position.x) ?? 50,
      y: e.y ?? (e.position && e.position.y) ?? 50,
      cor: mappedColor,
      ...(resolvedIco ? { icone: resolvedIco } : {}),
    };
  }) : [];

  const rawFlows = Array.isArray(c.flows) ? c.flows.map((f, i) => {
    const fromEnt = rawEntities.find(e => e.id === f.from);
    const toEnt = rawEntities.find(e => e.id === f.to);
    return {
      id: `flow_${i}`,
      tipo: 'seta',
      rotulo: f.label || '',
      x: fromEnt ? fromEnt.x : 30,
      y: fromEnt ? fromEnt.y : 50,
      destinoX: toEnt ? toEnt.x : 70,
      destinoY: toEnt ? toEnt.y : 50,
      cor: 'azul',
      animated: f.animated !== false,
    };
  }) : [];

  const combinedEntities = [...rawEntities, ...rawFlows];

  const source = Array.isArray(c.cenas) && c.cenas.length ? c.cenas : (Array.isArray(c.steps) && c.steps.length ? c.steps : c.etapas);
  let fallback = false;
  let cenas = list(source, 6).filter(object).map(s => {
    const ids = new Set();
    const sourceElements = Array.isArray(s.elementos) && s.elementos.length ? s.elementos : combinedEntities;
    const elementos = list(sourceElements, 10).filter(object).flatMap(e => {
      if (!ELEMENTS.includes(e.tipo) || typeof e.id !== 'string' || !/^[a-zA-Z0-9_-]{1,40}$/.test(e.id) || ids.has(e.id)) return [];
      if (e.tipo === 'icone' && !ICONS.includes(e.icone)) return [];
      ids.add(e.id);
      return [{ id: e.id, tipo: e.tipo, rotulo: safeText(e.rotulo || e.label, 40), x: number(e.x ?? e.position?.x, 0, 100, 50), y: number(e.y ?? e.position?.y, 0, 100, 50), largura: number(e.largura, 1, 100, 16), altura: number(e.altura, 1, 100, 12), cor: member(e.cor, Object.keys(PALETTE), 'azul'), ...(['seta', 'linha'].includes(e.tipo) && Number.isFinite(e.destinoX) && Number.isFinite(e.destinoY) ? { destinoX: number(e.destinoX, 0, 100, e.x), destinoY: number(e.destinoY, 0, 100, e.y) } : {}), ...(e.tipo === 'icone' ? { icone: e.icone } : {}) }];
    });
    const duracaoMs = number(s.duracaoMs, 1000, 8000, 4000);

    let rawActions = Array.isArray(s.acoes) ? s.acoes : [];
    if (!rawActions.length) {
      if (Array.isArray(s.focusEntities) && s.focusEntities.length) {
        rawActions = s.focusEntities.filter(id => ids.has(id)).map((id, idx) => ({
          alvo: id,
          tipo: 'destacar',
          duracaoMs: 1500,
          atrasoMs: idx * 250,
        }));
      }
      for (const flow of rawFlows) {
        if (ids.has(flow.id) && flow.animated) {
          rawActions.push({
            alvo: flow.id,
            tipo: 'fluir',
            duracaoMs: 2000,
            atrasoMs: 300,
          });
        }
      }
      if (!rawActions.length && elementos.length) {
        rawActions.push({
          alvo: elementos[0].id,
          tipo: 'pulsar',
          duracaoMs: 1500,
          atrasoMs: 200,
        });
      }
    }

    const acoes = list(rawActions, 12).filter(a => object(a) && ids.has(a.alvo) && ACTIONS.includes(a.tipo)).map(a => {
      const target = elementos.find(e => e.id === a.alvo);
      const atrasoMs = number(a.atrasoMs, 0, duracaoMs - 100, 0);
      return { alvo: a.alvo, tipo: a.tipo, paraX: number(a.paraX, 0, 100, target.x), paraY: number(a.paraY, 0, 100, target.y), duracaoMs: number(a.duracaoMs, 100, duracaoMs - atrasoMs, Math.min(1000, duracaoMs - atrasoMs)), atrasoMs };
    });
    if (!elementos.length) fallback = true;
    return { titulo: safeText(s.titulo || s.title, 90, 'Observe esta etapa'), explicacao: safeText(s.explicacao || s.description, 340, 'Consulte seu material de estudo para aprofundar este assunto.'), duracaoMs, elementos, acoes, cenario: member(s.cenario, BACKDROPS, 'neutro') };
  });
  if (!cenas.length) {
    fallback = true;
    cenas = [{ titulo: 'Vamos estudar', explicacao: safeText(c.resumo || c.summary, 280, 'Não foi possível representar este assunto. Reformule a pergunta ou explore uma experiência pronta.'), duracaoMs: 4000, elementos: [], acoes: [], cenario: 'neutro' }];
  }
  return { revisao: member(c.revisao, ['agua', 'eclipse', 'ia'], ''), fontes: list(c.fontes, 5).filter(id => ['agua', 'eclipse', 'ia'].includes(id)), simplificacoes: safeText(c.simplificacoes || c.accuracyNote, 340), versao: '1.0', disciplina: member(disciplina, ['ciencias', 'historia', 'geografia', 'outro'], 'outro'), titulo: safeText(c.titulo || c.title, 90, 'Uma explicação visual'), resumo: safeText(c.resumo || c.summary, 280, 'Acompanhe a explicação por etapas.'), tipoVisual, cenas, etapas: cenas.map(({ titulo, explicacao }) => ({ titulo, explicacao })), conclusao: safeText(c.conclusao, 280), curiosidade: safeText(c.curiosidade, 220), origem: member(c.origem, ['premium', 'local', 'ia'], 'ia'), fallback };
}
