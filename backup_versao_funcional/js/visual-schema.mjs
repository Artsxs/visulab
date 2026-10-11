import { TYPES, SPECIALS, ELEMENTS, ACTIONS, ICONS, PALETTE, BACKDROPS } from './visual-validator.mjs';
const text = maxLength => ({ type: 'string', maxLength });
const enumeration = values => ({ type: 'string', enum: values });
const numeric = (minimum, maximum) => ({ type: 'number', minimum, maximum });
const object = (properties, required = Object.keys(properties)) => ({ type: 'object', additionalProperties: false, properties, required });
const EXPERIENCE_SCHEMA = object({
  analise: object({ assunto: text(90), foco: text(180),
    entidades: { type: 'array', minItems: 1, maxItems: 10, items: object({ id: text(40), papel: text(120) }) },
    relacoes: { type: 'array', minItems: 1, maxItems: 8, items: text(180) },
    sequencia: { type: 'array', minItems: 1, maxItems: 6, items: text(180) },
  }),
  simplificacoes: text(340),
  versao: enumeration(['1.0']), disciplina: enumeration(['ciencias', 'historia', 'geografia', 'outro']), titulo: text(90), resumo: text(280), tipoDeCena: enumeration(TYPES), experienciaEspecial: enumeration(SPECIALS),
  cenas: { type: 'array', minItems: 1, maxItems: 6, items: object({ cenario: enumeration(BACKDROPS), titulo: text(90), objetivo: text(180), explicacao: text(340), duracaoMs: numeric(1000, 8000),
    elementos: { type: 'array', minItems: 1, maxItems: 10, items: object({ id: { ...text(40), pattern: '^[a-zA-Z0-9_-]+$' }, tipo: enumeration(ELEMENTS), rotulo: text(40), x: numeric(0, 100), y: numeric(0, 100), destinoX: numeric(0, 100), destinoY: numeric(0, 100), largura: numeric(1, 100), altura: numeric(1, 100), cor: enumeration(Object.keys(PALETTE)), icone: enumeration(ICONS) }, ['id', 'tipo', 'rotulo', 'x', 'y', 'cor']) },
    acoes: { type: 'array', maxItems: 12, items: object({ alvo: text(40), tipo: enumeration(ACTIONS), paraX: numeric(0, 100), paraY: numeric(0, 100), duracaoMs: numeric(100, 8000), atrasoMs: numeric(0, 7900) }, ['alvo', 'tipo', 'duracaoMs', 'atrasoMs']) }
  }, ['titulo', 'objetivo', 'explicacao', 'duracaoMs', 'elementos', 'acoes']) }, conclusao: text(280), curiosidade: text(220)
}, ['analise', 'simplificacoes', 'versao', 'disciplina', 'titulo', 'resumo', 'tipoDeCena', 'cenas', 'conclusao', 'curiosidade']);

export const RESPONSE_SCHEMA = { anyOf: [EXPERIENCE_SCHEMA, object({ esclarecimento: text(250) })] };
