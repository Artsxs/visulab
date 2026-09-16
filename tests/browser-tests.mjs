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
  const e = new AnimationEngine(stage); e.load(validateVisualExperience(fixtureFor('ciclo da água'))); assert(e.playing, 'início automático'); e.tick(e.lastTime + 120); e.pause(); const elapsed = e.elapsed; assert(elapsed >= 120, 'relógio ativo'); await wait(80); assert(e.elapsed === elapsed, 'pausa exata'); e.setSpeed(2); e.play(); e.tick(e.lastTime + 100); e.pause(); assert(e.elapsed >= elapsed + 200, 'velocidade 2x'); e.restart(); assert(e.index === 0 && e.playing, 'reinício'); e.destroy(); assert(!e.playing && !stage.children.length, 'limpeza');
});
await test('todos os ícones e ações são construídos localmente', () => {
  for (const icone of ICONS) { const n = createVisualElement({ tipo: 'icone', icone, x: 50, y: 50, largura: 10, altura: 10, cor: 'azul', rotulo: icone }); assert(n.position.querySelector('path, circle, text'), icone); }
  const r = validateVisualExperience(fixtureFor('água')); r.cenas[0].acoes = ACTIONS.map(tipo => ({ alvo: 'principal', tipo, duracaoMs: 1000, atrasoMs: 0, paraX: 30, paraY: 30 })); const e = new AnimationEngine(stage); e.load(r); assert(e.animations.length === ACTIONS.length, 'todas as ações'); e.destroy();
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
await test('falha da IA exibe fallback animado e permite tentar novamente', async () => {
  const errors = [], originalConsoleError = w.console.error;
  w.console.error = (...args) => errors.push(args);
  w.fetch = async () => Response.json({ codigo: 'API_NOT_CONFIGURED' }, { status: 503 }); submit('Como funciona a atmosfera?'); await wait(60);
  w.console.error = originalConsoleError;
  assert(errors[0][1].codigo === 'API_NOT_CONFIGURED' && errors[0][1].status === 503, 'diagnóstico no console'); assert(d.querySelector('#visualizer-feedback').textContent.includes('chave da IA não está configurada'), 'motivo visível'); assert(d.querySelector('.engine-scene'), 'fallback SVG'); assert(d.querySelector('#visualizer-source').textContent === 'Animação local', 'origem local'); assert(!form.querySelector('[type=submit]').disabled, 'nova tentativa');
});
await test('sinônimos dos três temas usam animação premium sem chamar IA', async () => {
  let calls = 0;
  w.fetch = async () => { calls++; throw Error('Premium não deve chamar a IA'); };
  const cases = [
    ['Como acontecem os terremotos?', 'plates'], ['placas tectônicas', 'plates'], ['abalos sísmicos', 'plates'],
    ['fotossíntese', 'photosynthesis'], ['como a planta produz alimento', 'photosynthesis'], ['planta, luz, gás carbônico', 'photosynthesis'],
    ['Brasil colonial', 'timeline'], ['período colonial', 'timeline'], ['capitanias hereditárias', 'timeline'],
  ];
  for (const [q, template] of cases) {
    submit(q); await wait(30);
    assert(d.querySelector('#visualizer-source').textContent === 'Animação premium', q);
    assert(d.querySelector(`#visualizer-canvas .visual-scene--${template}`), 'template manual correspondente');
    assert(!d.querySelector('#visualizer-feedback').textContent, 'sem aviso de erro');
    assert(d.querySelector('#visualizer-ai-notice').hidden, 'sem atribuição à IA');
    d.querySelector('#visualizer-next').click();
    assert(d.querySelector('#visualizer-step-label').textContent.startsWith('Etapa 2'), 'template possui etapas');
  }
  assert(calls === 0, 'premium independe da rede');
});
await test('template premium cancela IA pendente e não é substituído pela resposta antiga', async () => {
  let resolve, signal;
  w.fetch = (_url, options) => { signal = options.signal; return new Promise(r => { resolve = r; }); };
  submit('Explique as fases da Lua');
  submit('placas tectônicas');
  assert(signal.aborted, 'cancelamento da IA');
  resolve(Response.json({ experiencia: fixtureFor('órbita') })); await wait(60);
  assert(d.querySelector('#visualizer-source').textContent === 'Animação premium', 'resposta antiga descartada');
  assert(d.querySelector('#visualizer-canvas svg:not(.engine-scene)'), 'template preservado');
  assert(!form.querySelector('[type=submit]').disabled, 'formulário liberado');
});
await test('seis tipos genéricos, cenas, controles e rótulos SVG', async () => {
  w.fetch = async (_url, options) => Response.json({ experiencia: fixtureFor(JSON.parse(options.body).pergunta) });
  for (const q of ['Como funciona o ciclo da água?', 'Como o sangue circula pelo corpo?', 'Compare mitose e meiose.', 'Quais são as camadas da atmosfera?', 'órbita', 'Revolução Francesa']) {
    submit(q); await wait(40); assert(d.querySelector('.engine-scene'), q); assert(d.querySelector('#visualizer-play').disabled, 'autoplay'); d.querySelector('#visualizer-pause').click(); assert(d.querySelector('#visualizer-pause').disabled, 'pausa'); d.querySelector('#visualizer-next').click(); assert(d.querySelector('#visualizer-step-label').textContent.startsWith('Etapa 2 de '), 'próxima'); d.querySelector('#visualizer-previous').click(); assert(d.querySelector('#visualizer-step-label').textContent.startsWith('Etapa 1 de '), 'anterior');
  }
});
await test('cena rica tem fundo, elementos grandes, rótulos separados e legenda para celular', async () => {
  submit('ciclo da água'); await wait(60);
  const canvas = d.querySelector('#visualizer-canvas');
  assert(canvas.querySelectorAll('[data-element-id]').length >= 5, 'elementos visuais');
  assert(canvas.querySelector('[data-setting="natureza"]'), 'fundo contextual');
  assert(canvas.querySelectorAll('.engine-mobile-legend li').length === 3, 'legenda nativa');
  const labels = [...canvas.querySelectorAll('.engine-label-surface')].map(node => node.getBBox());
  for (let i = 0; i < labels.length; i++) for (let j = i + 1; j < labels.length; j++) {
    const a = labels[i], b = labels[j];
    assert(!(a.x < b.x+b.width && a.x+a.width > b.x && a.y < b.y+b.height && a.y+a.height > b.y), 'rótulos sobrepostos');
  }
  const symbols = [...canvas.querySelectorAll('[data-element-id] g[transform^="scale"]')];
  assert(symbols.length >= 3 && symbols.every(node => Number(node.getAttribute('transform').slice(6,-1)) > 2.5), 'ícones ampliados');
});
results.textContent += `\n\n${lines.filter(l => l.startsWith('PASSOU')).length}/${lines.length} verificações passaram.`;
