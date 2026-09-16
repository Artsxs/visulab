import { validateVisualExperience } from './visual-validator.mjs';

const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const cleanTopic = value => [...String(value).trim()].slice(0, 90).join('') || 'Tema de estudo';

const inferType = topic => {
  const text = normalize(topic);
  if (/histori|colon|revolu|guerra|idade media|imperio|republica/.test(text)) return 'linha_do_tempo';
  if (/mapa|pais|continente|regiao|territorio|bioma|relevo|rio\b/.test(text)) return 'mapa';
  if (/antes|depois|compar|diferen|versus|\bvs\b/.test(text)) return 'comparacao';
  if (/celul|microscop|atomo|molecul|bacter|virus/.test(text)) return 'microscopico';
  if (/sistema|corpo|digest|respir|circul|nervoso|orgao/.test(text)) return 'sistema_biologico';
  if (/orbita|eclipse|movimento|forca|velocidade|queda|onda|placa|terremot/.test(text)) return 'movimento';
  if (/ciclo/.test(text)) return 'ciclo';
  return 'fluxo';
};

const scene = (title, explanation, index) => {
  const start = 18 + index * 8;
  const end = 75 - index * 5;
  return {
    titulo: title,
    explicacao: explanation,
    duracaoMs: 3200,
    elementos: [
      { id: 'tema', tipo: 'retangulo', rotulo: title, x: 50, y: 28, largura: 22, altura: 10, cor: index === 1 ? 'verde' : 'azul' },
      { id: 'movimento', tipo: 'particula', rotulo: 'em movimento', x: start, y: 68, largura: 5, altura: 5, cor: 'amarelo' },
      { id: 'direcao', tipo: 'seta', rotulo: 'sequência', x: 50, y: 68, largura: 18, altura: 5, cor: 'roxo' },
    ],
    acoes: [
      { alvo: 'tema', tipo: 'pulsar', duracaoMs: 1400, atrasoMs: 0 },
      { alvo: 'movimento', tipo: 'mover', paraX: end, paraY: 68 - index * 8, duracaoMs: 2600, atrasoMs: 250 },
      { alvo: 'direcao', tipo: 'fluir', duracaoMs: 2200, atrasoMs: 450 },
    ],
  };
};

export function createLocalFallback(question) {
  const topic = cleanTopic(question);
  const type = inferType(topic);
  return validateVisualExperience({
    versao: '1.0',
    disciplina: 'outro',
    titulo: topic,
    resumo: `Uma representação visual introdutória de ${topic}, criada no navegador enquanto a explicação detalhada não está disponível.`,
    tipoVisual: type,
    cenas: [
      scene('Identifique o tema', `Observe os principais elementos relacionados a ${topic}.`, 0),
      scene('Acompanhe as relações', 'As formas e setas mostram que as partes de um assunto se conectam e mudam ao longo da explicação.', 1),
      scene('Organize a sequência', 'Use esta visão inicial para formular novas perguntas e aprofundar cada etapa no material didático.', 2),
    ],
    conclusao: `Esta é uma animação local de apoio sobre ${topic}.`,
    curiosidade: 'Quando a conexão com a IA voltar, tente novamente para receber um roteiro específico e mais detalhado.',
    origem: 'local',
  });
}

