import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findPremiumTopic } from '../js/local-fallback.mjs';

test('reconhece os sinônimos premium com acentos, caixa e pontuação', () => {
  const cases = {
    terremoto: ['Como acontecem os terremotos?', 'PLACAS TECTÔNICAS', 'abalos sísmicos', 'ondas sísmicas'],
    fotossintese: ['fotossíntese', 'como a planta produz alimento', 'planta, luz, gás carbônico', 'Como as plantas produzem glicose?'],
    brasil_colonial: ['Brasil colonial', 'período colonial', 'capitanias hereditárias', 'colonização do Brasil'],
  };
  for (const [topic, questions] of Object.entries(cases)) {
    for (const question of questions) assert.equal(findPremiumTopic(question), topic, question);
  }
});
test('temas diferentes e palavras ambíguas continuam livres para a IA', () => {
  for (const question of ['eclipse solar', 'sistema digestivo', 'ciclo da água', 'colônia de bactérias', 'plantas carnívoras', 'abalo emocional', 'Brasil imperial', 'placas de trânsito']) {
    assert.equal(findPremiumTopic(question), null, question);
  }
});
