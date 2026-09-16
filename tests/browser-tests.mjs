import { AnimationEngine } from '../js/animation-engine.mjs';
import { validateVisualExperience, ICONS, ACTIONS } from '../js/visual-validator.mjs';
import { fixtureFor } from './fixtures.mjs';
import { createVisualElement } from '../js/visual-elements.mjs';
const results = document.querySelector('#results'), lines = [];
const assert = (v, message) => { if (!v) throw Error(message); };
const wait = ms => new Promise(r => setTimeout(r, ms));
const test = async (name, run) => { try { await run(); lines.push(`PASSOU: ${name}`); } catch (e) { lines.push(`FALHOU: ${name}: ${e.message}`); } results.textContent = lines.join('\n'); };
const stage = document.querySelector('#stage');
await test('movimento reduzido: cenas estáticas e avanço manual', async () => {
  const e = new AnimationEngine(stage, { reducedMotion: true }); e.load(validateVisualExperience(fixtureFor('ciclo da água')));
  assert(!e.playing && !e.animations.length, 'não deve animar'); await wait(60); assert(e.index === 0, 'não deve avançar'); e.seek(1); assert(e.index === 1 && stage.textContent.includes('Condensação'), 'avanço manual'); e.destroy();
});
await test('pausa, retomada, velocidade, reinício e cancelamento', async () => {
  const e = new AnimationEngine(stage); e.load(validateVisualExperience(fixtureFor('ciclo da água'))); await wait(120); e.pause(); const elapsed = e.elapsed; assert(elapsed > 0, 'início automático'); await wait(80); assert(e.elapsed === elapsed, 'pausa exata'); e.setSpeed(2); e.play(); await wait(100); e.pause(); assert(e.elapsed > elapsed + 100, 'velocidade 2x'); e.restart(); assert(e.index === 0 && e.playing, 'reinício'); e.destroy(); assert(!e.playing && !stage.children.length, 'limpeza');
});
await test('todos os ícones e ações são construídos localmente', () => {
  for (const icone of ICONS) { const n = createVisualElement({ tipo: 'icone', icone, x: 50, y: 50, largura: 10, altura: 10, cor: 'azul', rotulo: icone }); assert(n.position.querySelector('path, circle, text'), icone); }
  const r = validateVisualExperience(fixtureFor('água')); r.cenas[0].acoes = ACTIONS.map(tipo => ({ alvo: 'principal', tipo, duracaoMs: 1000, atrasoMs: 0, paraX: 30, paraY: 30 })); const e = new AnimationEngine(stage); e.load(r); assert(e.animations.length === 10, 'nove ações e transição'); e.destroy();
});
const iframe = document.querySelector('iframe');
if (iframe.contentDocument.readyState !== 'complete') await new Promise(r => iframe.addEventListener('load', r, { once: true }));
const w = iframe.contentWindow, d = iframe.contentDocument;
const form = d.querySelector('#visualizer-form'), input = d.querySelector('#visualizer-question');
const submit = q => { input.value = q; input.dispatchEvent(new w.Event('input')); form.dispatchEvent(new w.Event('submit', { cancelable: true })); };
await test('digitação não chama API; envio duplicado é bloqueado; resposta antiga não substitui a nova', async () => {
  const calls = [];
  w.fetch = (url, options) => new Promise(resolve => { calls.push({ url, options, resolve }); });
  input.value = 'ciclo da água'; input.dispatchEvent(new w.Event('input')); assert(calls.length === 0, 'requisição durante digitação');
  submit('ciclo da água'); submit('ciclo da água'); assert(calls.length === 1, 'duplicação');
  submit('Compare mitose e meiose.'); assert(calls.length === 2 && calls[0].options.signal.aborted, 'cancelamento da anterior');
  calls[1].resolve(Response.json({ experiencia: fixtureFor('Compare mitose e meiose.') })); await wait(80);
  calls[0].resolve(Response.json({ experiencia: fixtureFor('ciclo da água') })); await wait(80);
  assert(d.querySelector('#visualizer-experience-title').textContent === 'Compare mitose e meiose.', 'resposta obsoleta'); assert(!form.querySelector('[type=submit]').disabled, 'envio liberado');
});
await test('falha amigável limpa o palco e permite tentar novamente', async () => {
  w.fetch = async () => Response.json({ codigo: 'API_NOT_CONFIGURED' }, { status: 503 }); submit('Como funciona a atmosfera?'); await wait(60);
  assert(d.querySelector('#visualizer-feedback').textContent.includes('Tente novamente'), 'mensagem'); assert(!d.querySelector('#visualizer-canvas').children.length, 'palco limpo'); assert(!form.querySelector('[type=submit]').disabled, 'nova tentativa');
});
await test('três experiências especiais preservadas sem rede', async () => {
  w.fetch = () => { throw Error('não deveria chamar rede'); };
  for (const q of ['Como aconteceram as placas tectônicas?', 'Como acontecem os terremotos?', 'Como funciona a fotossíntese?', 'Explique o Brasil Colonial.']) { submit(q); await wait(380); assert(d.querySelector('#visualizer-source').textContent === 'Experiência pronta', q); assert(d.querySelector('#visualizer-canvas svg'), 'SVG especial'); }
});
await test('seis tipos genéricos, cenas, controles e rótulos SVG', async () => {
  w.fetch = async (_url, options) => Response.json({ experiencia: fixtureFor(JSON.parse(options.body).pergunta) });
  for (const q of ['Como funciona o ciclo da água?', 'Como o sangue circula pelo corpo?', 'Compare mitose e meiose.', 'Quais são as camadas da atmosfera?', 'órbita', 'Revolução Francesa']) {
    submit(q); await wait(40); assert(d.querySelector('.engine-scene'), q); assert(d.querySelector('#visualizer-play').disabled, 'autoplay'); d.querySelector('#visualizer-pause').click(); assert(d.querySelector('#visualizer-pause').disabled, 'pausa'); d.querySelector('#visualizer-next').click(); assert(d.querySelector('#visualizer-step-label').textContent.startsWith('Etapa 2 de '), 'próxima'); d.querySelector('#visualizer-previous').click(); assert(d.querySelector('#visualizer-step-label').textContent.startsWith('Etapa 1 de '), 'anterior');
  }
});
results.textContent += `\n\n${lines.filter(l => l.startsWith('PASSOU')).length}/${lines.length} verificações passaram.`;
