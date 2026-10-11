import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reviewedExperiences, SOURCES, findReviewedTopic, clarificationFor } from '../js/reviewed-experiences.mjs';
import { validateVisualExperience } from '../js/visual-validator.mjs';

test('reformulações mantêm o assunto e casos específicos não recebem introdução genérica', () => {
  for (const [q, id] of [
    ['Como funciona o ciclo da água?', 'agua'], ['Explique o ciclo hidrológico', 'agua'], ['Como a água retorna?', 'agua'],
    ['Como acontece um eclipse solar?', 'eclipse'], ['A Lua fica entre o Sol e a Terra', 'eclipse'],
    ['Como funciona uma IA?', 'ia'], ['Explique a inteligência artificial', 'ia'], ['Como uma IA classifica um email?', 'ia'],
  ]) assert.equal(findReviewedTopic(q), id, q);
  for (const q of ['Quando é o próximo eclipse solar?', 'Compare eclipse solar e lunar', 'Como funciona uma IA generativa?', 'Mudanças climáticas e ciclo da água']) assert.equal(findReviewedTopic(q), null, q);
  assert.match(clarificationFor('Explique um eclipse'), /solar.*lunar/);
  assert.ok(clarificationFor('Como funciona uma rede?'));
});
test('roteiros revisados têm fontes locais conhecidas e ressalvas específicas', () => {
  for (const raw of Object.values(reviewedExperiences)) {
    const exp = validateVisualExperience(raw);
    assert.equal(exp.revisao, raw.revisao);
    assert.ok(exp.simplificacoes.length > 60);
    assert.ok(exp.fontes.every(id => SOURCES[id]?.url.startsWith('https://')));
    assert.ok(exp.cenas.every(s => s.explicacao.length > 60));
    assert.doesNotMatch(JSON.stringify(exp), /Identifique o tema|Organize a sequência/);
  }
  assert.equal(reviewedExperiences.agua.cenas.length, 4);
  assert.match(reviewedExperiences.agua.cenas[3].explicacao, /infiltra/);
  assert.match(reviewedExperiences.eclipse.cenas[1].explicacao, /umbra.*penumbra/);
  assert.match(reviewedExperiences.ia.cenas[2].explicacao, /0,88/);
});
