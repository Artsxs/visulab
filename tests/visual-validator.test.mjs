import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateVisualExperience, ACTIONS, ELEMENTS, ICONS } from '../js/visual-validator.mjs';
import { createLocalFallback } from '../js/local-fallback.mjs';
const scene = () => ({ titulo: 'Evaporação', explicacao: 'A água recebe calor e evapora.', duracaoMs: 4000, elementos: [{ id: 'vapor', tipo: 'particula', rotulo: 'Vapor', x: 30, y: 70, cor: 'claro' }], acoes: [{ alvo: 'vapor', tipo: 'mover', paraX: 30, paraY: 20, duracaoMs: 2500, atrasoMs: 300 }] });
const validate = s => validateVisualExperience({ versao: '1.0', tipoVisual: 'ciclo', titulo: 'Ciclo da água', cenas: [s] });
test('roteiro válido é normalizado e idempotente entre servidor e navegador', () => { const r = validate(scene()); assert.equal(r.cenas[0].acoes[0].paraY, 20); assert.equal(r.fallback, false); assert.deepEqual(validateVisualExperience(r), r); });
test('elementos proibidos e atributos executáveis são descartados', () => { const s = scene(); s.elementos.push({ id: 'ataque', tipo: 'script' }); Object.assign(s.elementos[0], { onload: 'alert(1)', style: 'url(x)', d: 'M0 0' }); const r = validate(s); assert.equal(r.cenas[0].elementos.length, 1); for (const field of ['onload', 'style', 'd']) assert.equal(field in r.cenas[0].elementos[0], false); });
test('alvos inexistentes, ações proibidas e IDs duplicados são descartados', () => { const s = scene(); s.acoes.push({ alvo: 'inexistente', tipo: 'mover' }, { alvo: 'vapor', tipo: 'executar' }); s.elementos.push(s.elementos[0], { ...s.elementos[0], id: 'url(x)' }); const r = validate(s); assert.equal(r.cenas[0].acoes.length, 1); assert.equal(r.cenas[0].elementos.length, 1); });
test('coordenadas, durações, dimensões e paleta são limitadas', () => { const s = scene(); Object.assign(s.elementos[0], { x: -99, y: 400, largura: Infinity, cor: 'url(x)' }); Object.assign(s.acoes[0], { paraX: -3, paraY: 200, atrasoMs: 99999, duracaoMs: NaN }); s.duracaoMs = 99999; const r = validate(s).cenas[0]; assert.equal(r.elementos[0].x, 0); assert.equal(r.elementos[0].y, 100); assert.equal(r.elementos[0].cor, 'azul'); assert.equal(r.duracaoMs, 8000); assert.ok(r.acoes[0].duracaoMs + r.acoes[0].atrasoMs <= r.duracaoMs); });
test('texto HTML não atravessa nenhum campo textual', () => { const s = scene(); s.titulo = '<svg onload=alert(1)>'; s.explicacao = '<script>oi</script>'; s.elementos[0].rotulo = '<img>'; const r = validate(s); assert.doesNotMatch(JSON.stringify(r), /[<>]/); });
test('limita seis cenas, dez elementos e doze ações', () => { const s = scene(); s.elementos = Array.from({ length: 20 }, (_, i) => ({ ...s.elementos[0], id: `e${i}` })); s.acoes = Array.from({ length: 20 }, () => ({ alvo: 'e0', tipo: 'pulsar' })); const r = validateVisualExperience({ cenas: Array(20).fill(s) }); assert.equal(r.cenas.length, 6); assert.equal(r.cenas[0].elementos.length, 10); assert.equal(r.cenas[0].acoes.length, 12); });
test('JSON inutilizável ou cenas sem gráficos recebem fallback textual seguro', () => { for (const input of [null, {}, [], { cenas: [null] }]) { const r = validateVisualExperience(input); assert.equal(r.cenas.length, 1); assert.equal(r.fallback, true); } const r = validateVisualExperience({ etapas: [{ titulo: 'Primeiro', explicacao: 'Observe.' }] }); assert.equal(r.cenas[0].titulo, 'Primeiro'); });
test('todas as listas permitidas e quinze ícones têm contrato válido', () => { const s = scene(); for (const tipo of ELEMENTS) { s.elementos[0].tipo = tipo; s.elementos[0].icone = 'sol'; assert.equal(validate(s).cenas[0].elementos[0].tipo, tipo); } for (const icone of ICONS) { s.elementos[0].tipo = 'icone'; s.elementos[0].icone = icone; assert.equal(validate(s).cenas[0].elementos[0].icone, icone); } for (const tipo of ACTIONS) { s.acoes[0].tipo = tipo; assert.equal(validate(s).cenas[0].acoes[0].tipo, tipo); } });
test('movimento com coordenada ausente preserva o eixo original', () => {
  const s = scene(); delete s.acoes[0].paraX;
  assert.equal(validate(s).cenas[0].acoes[0].paraX, 30);
});
test('aceita tipoDeCena do contrato da IA', () => {
  const result = validateVisualExperience({ tipoDeCena: 'sistema_biologico', cenas: [scene()] });
  assert.equal(result.tipoVisual, 'sistema_biologico');
});
test('fallback local transforma qualquer tema em cenas com movimento', () => {
  for (const topic of ['sistema digestivo', 'eclipse solar', 'mapa dos biomas', 'células']) {
    const result = createLocalFallback(topic);
    assert.equal(result.origem, 'local');
    assert.equal(result.fallback, false);
    assert.equal(result.cenas.length, 3);
    assert.ok(result.cenas.every(item => item.elementos.length >= 3 && item.acoes.some(action => action.tipo === 'mover')));
  }
});
