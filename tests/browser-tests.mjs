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
  assert(!e.playing && e.animations.every(a => a.playState === 'paused'), 'não deve animar'); await wait(60); assert(e.index === 0, 'não deve avançar'); e.seek(1); assert(e.index === 1 && stage.textContent.includes('Condensação'), 'avanço manual'); e.destroy();
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
  submit('Como o sangue circula?'); submit('Como o sangue circula?'); assert(calls.length === 1, 'duplicação');
  submit('Compare mitose e meiose.'); assert(calls.length === 2 && calls[0].options.signal.aborted, 'cancelamento da anterior');
  calls[1].resolve(Response.json({ experiencia: fixtureFor('Compare mitose e meiose.') })); await wait(80);
  calls[0].resolve(Response.json({ experiencia: fixtureFor('ciclo da água') })); await wait(80);
  assert(d.querySelector('#visualizer-experience-title').textContent === 'Compare mitose e meiose.', 'resposta obsoleta'); assert(!form.querySelector('[type=submit]').disabled, 'envio liberado');
});
await test('falha da IA informa erro, não inventa animação e permite tentar novamente', async () => {
  const errors = [], originalConsoleError = w.console.error;
  w.console.error = (...args) => errors.push(args);
  w.fetch = async () => Response.json({ codigo: 'API_NOT_CONFIGURED' }, { status: 503 }); submit('Como funciona a atmosfera?'); await wait(60);
  w.console.error = originalConsoleError;
  assert(errors[0][1].codigo === 'API_NOT_CONFIGURED' && errors[0][1].status === 503, 'diagnóstico no console'); assert(d.querySelector('#visualizer-feedback').textContent.includes('chave da IA não está configurada'), 'motivo visível'); assert(!d.querySelector('#visualizer-canvas svg'), 'sem animação genérica'); assert(d.querySelector('#visualizer-experience').hidden, 'nenhum resultado falso'); assert(!form.querySelector('[type=submit]').disabled, 'nova tentativa');
});
await test('configuração NVIDIA inválida e timeout oferecem nova tentativa', async () => {
  const originalConsoleError = w.console.error;
  w.console.error = () => {};
  try {
    for (const codigo of ['NVIDIA_MODEL_CONFIGURATION_ERROR', 'API_TIMEOUT']) {
      w.fetch = async () => Response.json({ codigo, mensagem: 'Falha segura simulada.' }, { status: codigo === 'API_TIMEOUT' ? 504 : 503 });
      submit('Explique as fases da Lua'); await wait(60);
      assert(!d.querySelector('#visualizer-canvas svg'), 'sem fallback SVG');
      assert(d.querySelector('#visualizer-feedback').textContent.includes('experiências revisadas'), codigo);
      assert(!form.querySelector('[type=submit]').disabled, 'nova tentativa liberada');
      if (codigo === 'NVIDIA_MODEL_CONFIGURATION_ERROR') assert(d.querySelector('#visualizer-feedback').textContent.includes('NVIDIA_MODEL'), 'indica qual variável corrigir');
    }
  } finally { w.console.error = originalConsoleError; }
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
    assert(d.querySelector('#visualizer-source').textContent === 'Experiência revisada', q);
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
  assert(d.querySelector('#visualizer-source').textContent === 'Experiência revisada', 'resposta antiga descartada');
  assert(d.querySelector('#visualizer-canvas svg:not(.engine-scene)'), 'template preservado');
  assert(!form.querySelector('[type=submit]').disabled, 'formulário liberado');
});
await test('seis tipos genéricos, cenas, controles e rótulos SVG', async () => {
  w.fetch = async (_url, options) => Response.json({ experiencia: fixtureFor(JSON.parse(options.body).pergunta) });
  for (const q of ['Como ocorre uma reação química?', 'Como o sangue circula pelo corpo?', 'Compare mitose e meiose.', 'Quais são as camadas da atmosfera?', 'órbita', 'Revolução Francesa']) {
    submit(q); await wait(40); assert(d.querySelector('.engine-scene'), q); assert(d.querySelector('#visualizer-play').disabled, 'autoplay'); d.querySelector('#visualizer-pause').click(); assert(d.querySelector('#visualizer-pause').disabled, 'pausa'); d.querySelector('#visualizer-next').click(); assert(d.querySelector('#visualizer-step-label').textContent.startsWith('Etapa 2 de '), 'próxima'); d.querySelector('#visualizer-previous').click(); assert(d.querySelector('#visualizer-step-label').textContent.startsWith('Etapa 1 de '), 'anterior');
  }
});
await test('cena rica tem fundo, elementos grandes, rótulos separados e legenda para celular', async () => {
  submit('Como o sangue circula pelo corpo?'); await wait(60);
  const canvas = d.querySelector('#visualizer-canvas');
  assert(canvas.querySelectorAll('[data-element-id]').length >= 5, 'elementos visuais');
  assert(canvas.querySelector('[data-setting="laboratorio"]'), 'fundo contextual');
  assert(canvas.querySelectorAll('.engine-mobile-legend li').length === 3, 'legenda nativa');
  const labels = [...canvas.querySelectorAll('.engine-label-surface')].map(node => node.getBBox());
  for (let i = 0; i < labels.length; i++) for (let j = i + 1; j < labels.length; j++) {
    const a = labels[i], b = labels[j];
    assert(!(a.x < b.x+b.width && a.x+a.width > b.x && a.y < b.y+b.height && a.y+a.height > b.y), 'rótulos sobrepostos');
  }
  const symbols = [...canvas.querySelectorAll('[data-element-id] g[transform^="scale"]')];
  assert(symbols.length >= 3 && symbols.every(node => Number(node.getAttribute('transform').slice(6,-1)) > 2.5), 'ícones ampliados');
});
await test('seis experiências revisadas: controles, fontes, enquadramento e troca de tema', async () => {
  let calls = 0; w.fetch = async () => { calls++; throw Error('Não deve usar API'); };
  for (const q of ['ciclo da água', 'Como acontece um eclipse solar?', 'Como funciona uma IA?', 'terremotos', 'fotossíntese', 'Brasil colonial']) {
    submit(q); await wait(60);
    const canvas = d.querySelector('#visualizer-canvas');
    assert(canvas.querySelector('svg'), q);
    assert(d.querySelector('#visualizer-source').textContent === 'Experiência revisada', q);
    assert(d.querySelectorAll('#visualizer-references a').length >= 1, 'referências');
    assert(d.querySelector('#visualizer-simplifications').textContent.length > 20, 'simplificações');
    const firstRoot = canvas.querySelector('svg');
    d.querySelector('#visualizer-pause').click();
    const animations = canvas.getAnimations({ subtree: true });
    const times = animations.map(a => a.currentTime);
    await wait(50);
    assert(animations.every((a, i) => a.currentTime === times[i]), 'pausa visual');
    d.querySelector('#visualizer-next').click();
    assert(d.querySelector('#visualizer-step-label').textContent.startsWith('Etapa 2'), 'avanço');
    d.querySelector('#visualizer-previous').click();
    assert(canvas.querySelector('svg') === firstRoot, 'cache de cena');
    const speed = d.querySelector('#visualizer-speed'); speed.value = '2'; speed.dispatchEvent(new w.Event('change'));
    d.querySelector('#visualizer-play').click(); await wait(90);
    d.querySelector('#visualizer-pause').click();
    assert(d.querySelector('#visualizer-play').disabled === false, 'retomada e pausa');
    d.querySelector('#visualizer-restart').click();
    assert(d.querySelector('#visualizer-step-label').textContent.startsWith('Etapa 1') && d.querySelector('#visualizer-play').disabled, 'reinício reproduz');
    const rect = canvas.getBoundingClientRect();
    assert(rect.width <= w.innerWidth, 'palco cabe na tela');
    assert(d.documentElement.scrollWidth <= w.innerWidth, 'sem rolagem horizontal');
  }
  assert(calls === 0, 'todas locais');
});
await test('ambiguidade solicita esclarecimento e não reproduz assunto presumido', async () => {
  let calls = 0; w.fetch = async () => { calls++; return Response.json({ esclarecimento: 'Você quer uma rede de computadores ou neural?' }); };
  submit('Explique um eclipse'); await wait(30);
  assert(d.querySelector('#visualizer-feedback').textContent.includes('solar'), 'pergunta solar ou lunar');
  assert(!d.querySelector('#visualizer-canvas svg') && calls === 0, 'sem presunção');
  submit('Quero entender redes'); await wait(30);
  assert(d.querySelector('#visualizer-feedback').textContent.includes('computadores'), 'esclarecimento da API');
  assert(!d.querySelector('#visualizer-canvas svg'), 'não cria cena genérica');
});
await test('troca durante preparação mantém sugestões disponíveis e distingue espera de reprodução', async () => {
  let signal; w.fetch = (_, options) => { signal = options.signal; return new Promise(() => {}); };
  submit('Como funciona a circulação?'); await wait(20);
  assert(!d.querySelector('#visualizer-loading').hidden, 'carregando');
  const button = d.querySelector('[data-visualizer-suggestion*="eclipse"]');
  assert(!button.disabled, 'sugestão disponível'); button.click(); await wait(30);
  assert(signal.aborted && d.querySelector('#visualizer-loading').hidden, 'cancelamento');
  assert(d.querySelector('#visualizer-experience-title').textContent.includes('eclipse'), 'novo assunto');
});
results.textContent += `\n\n${lines.filter(l => l.startsWith('PASSOU')).length}/${lines.length} verificações passaram.`;
