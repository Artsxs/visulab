import { TYPES, SPECIALS, ELEMENTS, ACTIONS, ICONS, PALETTE } from './visual-validator.mjs';
const text = maxLength => ({ type: 'string', maxLength });
const enumeration = values => ({ type: 'string', enum: values });
const numeric = (minimum, maximum) => ({ type: 'number', minimum, maximum });
const object = (properties, required = Object.keys(properties)) => ({ type: 'object', additionalProperties: false, properties, required });
export const RESPONSE_SCHEMA = object({
  versao: enumeration(['1.0']), disciplina: enumeration(['ciencias', 'historia', 'geografia', 'outro']), titulo: text(90), resumo: text(280), tipoVisual: enumeration(TYPES), experienciaEspecial: enumeration(SPECIALS),
  cenas: { type: 'array', minItems: 1, maxItems: 6, items: object({ titulo: text(90), explicacao: text(340), duracaoMs: numeric(1000, 8000),
    elementos: { type: 'array', maxItems: 10, items: object({ id: { ...text(40), pattern: '^[a-zA-Z0-9_-]+$' }, tipo: enumeration(ELEMENTS), rotulo: text(40), x: numeric(0, 100), y: numeric(0, 100), largura: numeric(1, 100), altura: numeric(1, 100), cor: enumeration(Object.keys(PALETTE)), icone: enumeration(ICONS) }, ['id', 'tipo', 'rotulo', 'x', 'y', 'cor']) },
    acoes: { type: 'array', maxItems: 12, items: object({ alvo: text(40), tipo: enumeration(ACTIONS), paraX: numeric(0, 100), paraY: numeric(0, 100), duracaoMs: numeric(100, 8000), atrasoMs: numeric(0, 7900) }, ['alvo', 'tipo', 'duracaoMs', 'atrasoMs']) }
  }) }, conclusao: text(280), curiosidade: text(220)
}, ['versao', 'disciplina', 'titulo', 'resumo', 'tipoVisual', 'cenas', 'conclusao', 'curiosidade']);
