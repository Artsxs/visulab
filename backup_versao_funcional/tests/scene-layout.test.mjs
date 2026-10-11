import { test } from 'node:test';
import assert from 'node:assert/strict';
import { layoutScene, layoutLabels, overlaps, labelLines } from '../js/scene-renderer.mjs';
import { validateVisualExperience } from '../js/visual-validator.mjs';
import { fixtureFor } from './fixtures.mjs';

test('centraliza e amplia protagonistas preservando direção e destino das ações', () => {
  const scene = validateVisualExperience(fixtureFor('água')).cenas[0];
  scene.elementos[0].largura = 4; scene.elementos[0].altura = 4;
  const before = structuredClone(scene);
  const { elements, actions } = layoutScene(scene);
  assert.deepEqual(scene, before, 'não modifica o roteiro');
  assert.ok(elements[0].largura > 4 && elements[0].altura > 4);
  const particle = elements.find(e => e.id === 'particula');
  const movement = actions.find(a => a.tipo === 'mover');
  assert.ok(movement.paraX > particle.x);
  assert.equal(movement.paraY, particle.y, 'movimento horizontal continua horizontal');
  assert.ok(elements.every(e => e.x >= 0 && e.x <= 100 && e.y >= 0 && e.y <= 100));
});
test('dez rótulos próximos são separados sem perder texto ou ultrapassar o SVG', () => {
  const elements = Array.from({ length: 10 }, (_, i) => ({ id: `e${i}`, tipo: 'icone', x: 50, y: 44, largura: 18, altura: 28, rotulo: `Elemento ${i} com rótulo longo` }));
  const { labels, bottom } = layoutLabels(elements);
  assert.equal(labels.length, 10);
  labels.forEach((label, i) => {
    assert.equal(label.lines.join(' '), elements[i].rotulo);
    assert.ok(label.x >= -16 && label.x + label.width <= 824);
    assert.ok(label.y + label.height <= bottom);
    labels.slice(i + 1).forEach(other => assert.equal(overlaps(label, other), false));
  });
  assert.ok(labelLines('palavraextremamentelongaparatestar').every(line => line.length <= 18));
});
test('cenários e ícones específicos passam pela lista permitida; código é descartado', () => {
  const scene = fixtureFor('água').cenas[0];
  scene.cenario = 'url(https://exemplo.invalid)';
  scene.elementos[0].icone = 'estomago';
  const result = validateVisualExperience({ cenas: [scene], origem: 'premium' });
  assert.equal(result.cenas[0].cenario, 'neutro');
  assert.equal(result.cenas[0].elementos[0].icone, 'estomago');
  assert.equal(result.origem, 'premium');
  assert.deepEqual(validateVisualExperience(result), result);
});

test('enquadramento comum mantém entidades persistentes e direção de setas', () => {
  const first = validateVisualExperience(fixtureFor('água')).cenas[0];
  first.elementos.push({ id: 'subida', tipo: 'seta', rotulo: '', x: 42, y: 70, destinoX: 42, destinoY: 20, largura: 3, altura: 3, cor: 'azul' });
  const second = structuredClone(first);
  second.elementos.push({ id: 'extra', tipo: 'icone', icone: 'sol', rotulo: 'Sol', x: 92, y: 12, largura: 18, altura: 28, cor: 'amarelo' });
  const all = [first, second];
  const a = layoutScene(first, all), b = layoutScene(second, all);
  assert.equal(a.elements[0].x, b.elements[0].x);
  assert.equal(a.elements[0].y, b.elements[0].y);
  const arrow = a.elements.find(e => e.id === 'subida');
  assert.equal(arrow.x, arrow.destinoX);
  assert.ok(arrow.destinoY < arrow.y, 'a seta aponta para cima');
});
