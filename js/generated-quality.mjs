import { RESPONSE_SCHEMA } from './visual-schema.mjs';
import { validateVisualExperience } from './visual-validator.mjs';

// Checagem de contrato e de sinais de roteiro vazio. Não verifica a verdade
// científica nem substitui revisão editorial ou consulta a fontes.
function check(value, schema) {
  if (schema.anyOf) return schema.anyOf.some(option => check(value, option));
  if (schema.enum && !schema.enum.includes(value)) return false;
  if (schema.type === 'string') return typeof value === 'string' && (schema.maxLength === undefined || value.length <= schema.maxLength) && !/[<>\u0000-\u001f\u007f]/.test(value) && (!schema.pattern || new RegExp(schema.pattern).test(value));
  if (schema.type === 'number') return typeof value === 'number' && Number.isFinite(value) && value >= schema.minimum && value <= schema.maximum;
  if (schema.type === 'array') return Array.isArray(value) && value.length >= (schema.minItems || 0) && value.length <= schema.maxItems && value.every(item => check(item, schema.items));
  if (schema.type === 'object') return value && typeof value === 'object' && !Array.isArray(value)
    && schema.required.every(key => Object.hasOwn(value, key))
    && Object.keys(value).every(key => Object.hasOwn(schema.properties, key) && check(value[key], schema.properties[key]));
  return true;
}
const generic = /identifique o tema|acompanhe as rela[çc][õo]es|organize a sequ[êe]ncia|observe os principais elementos|partes de um assunto/i;
export function validateGeneratedExperience(input) {
  if (!check(input, RESPONSE_SCHEMA)) throw Error('Contrato do roteiro inválido.');
  if (typeof input.esclarecimento === 'string' && !input.esclarecimento.trim()) throw Error('Esclarecimento vazio.');
  if (input.esclarecimento) return { esclarecimento: input.esclarecimento };
  const allIds = new Set(input.cenas.flatMap(scene => scene.elementos.map(e => e.id)));
  if (!input.analise.entidades.every(entity => allIds.has(entity.id))) throw Error('Entidade planejada ausente do desenho.');
  if (input.analise.sequencia.length !== input.cenas.length) throw Error('Sequência e cenas não correspondem.');
  const titles = new Set();
  for (const scene of input.cenas) {
    if (!scene.titulo.trim() || !scene.explicacao.trim() || !scene.objetivo.trim()) throw Error('Cena sem conteúdo.');
    if (generic.test(`${scene.titulo} ${scene.explicacao}`) || titles.has(scene.titulo)) throw Error('Etapa genérica ou repetida.');
    titles.add(scene.titulo);
    const ids = new Set(scene.elementos.map(e => e.id));
    if (ids.size !== scene.elementos.length) throw Error('IDs duplicados.');
    for (const action of scene.acoes) {
      if (!ids.has(action.alvo) || action.atrasoMs + action.duracaoMs > scene.duracaoMs) throw Error('Ação inconsistente.');
      if (action.tipo === 'mover' && (!Number.isFinite(action.paraX) || !Number.isFinite(action.paraY))) throw Error('Movimento sem destino.');
    }
  }
  return { experiencia: { ...validateVisualExperience(input), origem: 'ia', fontes: [], revisao: '' } };
}
