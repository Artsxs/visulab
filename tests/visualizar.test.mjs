import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';

import { validateVisualExperience, TYPES, SPECIALS } from '../js/visual-validator.mjs';
import { RESPONSE_SCHEMA } from '../js/visual-schema.mjs';

const originalFetch = globalThis.fetch;
const originalEnvironment = Object.fromEntries(
  ['VISULAB_API_KEY', 'NVIDIA_API_KEY', 'NVIDIA_MODEL'].map(name => [name, process.env[name]]),
);
let moduleVersion = 0;
let visualizar;
const loadFunction = async () => (
  await import(`../netlify/functions/visualizar.mjs?test=${moduleVersion += 1}`)
).default;

beforeEach(async () => {
  for (const name of Object.keys(originalEnvironment)) delete process.env[name];
  globalThis.fetch = () => { throw new Error('Requisição externa não simulada pelo teste.'); };
  visualizar = await loadFunction();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const [name, value] of Object.entries(originalEnvironment)) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});

const makeRequest = (body, options = {}) => {
  const method = options.method || 'POST';
  const hasBody = method !== 'GET' && method !== 'HEAD';
  return new Request('http://localhost/.netlify/functions/visualizar', {
    method,
    headers: options.headers || { 'Content-Type': 'application/json' },
    body: hasBody ? (options.rawBody ?? JSON.stringify(body)) : undefined,
  });
};

const validExperience = {
  disciplina: 'ciencias',
  titulo: 'Ciclo da água',
  resumo: 'A água circula continuamente entre a superfície e a atmosfera.',
  tipoDeCena: 'ciclo',
  cenas: [
    { titulo: 'Evaporação', explicacao: 'A água recebe energia e evapora.', duracaoMs: 3000, elementos: [{ id: 'agua', tipo: 'particula', rotulo: 'Água', x: 30, y: 70, largura: 5, altura: 5, cor: 'azul' }], acoes: [{ alvo: 'agua', tipo: 'mover', paraX: 50, paraY: 20, duracaoMs: 2000, atrasoMs: 100 }] },
    { titulo: 'Condensação', explicacao: 'O vapor esfria e forma nuvens.', duracaoMs: 3000, elementos: [{ id: 'nuvem', tipo: 'icone', icone: 'nuvem', rotulo: 'Nuvem', x: 50, y: 30, largura: 10, altura: 10, cor: 'claro' }], acoes: [{ alvo: 'nuvem', tipo: 'pulsar', duracaoMs: 1800, atrasoMs: 100 }] },
  ],
  conclusao: 'A água circula continuamente.',
  curiosidade: 'A mesma água pode percorrer esse ciclo muitas vezes.',
};

const geminiSuccess = (experience = validExperience) =>
  Response.json({
    candidates: [{ content: { parts: [{ text: JSON.stringify(experience) }] } }],
  });
const nvidiaSuccess = (experience = validExperience) => Response.json({
  choices: [{ message: { role: 'assistant', content: JSON.stringify(experience) } }],
});
const invalidExperienceTexts = [
  ['JSON malformado', '{"titulo":"Resposta incompleta"'],
  ['cenas vazias', JSON.stringify({ ...validExperience, cenas: [] })],
  ['cenas sem ações', JSON.stringify({
    ...validExperience,
    cenas: validExperience.cenas.map(scene => ({ ...scene, acoes: [] })),
  })],
];
const geminiTextResponse = (text) => Response.json({
  candidates: [{ content: { parts: [{ text }] } }],
});

const useSuccessfulGemini = (assertRequest) => {
  process.env.VISULAB_API_KEY = 'chave-ficticia-de-teste';
  globalThis.fetch = async (url, options) => {
    assertRequest?.(url, options);
    return geminiSuccess();
  };
};

const assertSecurityHeaders = (response) => {
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('content-type'), 'application/json; charset=utf-8');
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('x-visulab-function'), 'visualizar');
  assert.equal(response.headers.has('access-control-allow-origin'), false);
};

test('aceita somente POST e informa o método permitido', async () => {
  const response = await visualizar(makeRequest(null, { method: 'GET' }));
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('allow'), 'POST');
  assertSecurityHeaders(response);
});

test('exige application/json, mas aceita o parâmetro charset', async () => {
  const invalid = await visualizar(makeRequest(
    { pergunta: 'Como chove?' },
    { headers: { 'Content-Type': 'application/jsonp' } },
  ));
  assert.equal(invalid.status, 415);
  assert.equal((await invalid.json()).codigo, 'UNSUPPORTED_MEDIA_TYPE');

  delete process.env.VISULAB_API_KEY;
  delete process.env.NVIDIA_API_KEY;
  const valid = await visualizar(makeRequest(
    { pergunta: 'Como chove?' },
    { headers: { 'Content-Type': 'Application/JSON; charset=utf-8' } },
  ));
  assert.equal(valid.status, 503);
  assert.equal((await valid.json()).codigo, 'API_NOT_CONFIGURED');
});

test('rejeita JSON inválido e perguntas vazias', async () => {
  const invalidJson = await visualizar(makeRequest(null, { rawBody: '{"pergunta":' }));
  assert.equal(invalidJson.status, 400);
  assert.equal((await invalidJson.json()).codigo, 'INVALID_JSON');

  const empty = await visualizar(makeRequest({ pergunta: '   ' }));
  assert.equal(empty.status, 400);
  assert.equal((await empty.json()).codigo, 'INVALID_QUESTION');
});

test('aceita 250 caracteres e rejeita 251 antes de chamar a API', async () => {
  let calls = 0;
  useSuccessfulGemini(() => { calls += 1; });

  const accepted = await visualizar(makeRequest({ pergunta: 'a'.repeat(250) }));
  assert.equal(accepted.status, 200);
  assert.equal(calls, 1);

  const rejected = await visualizar(makeRequest({ pergunta: 'a'.repeat(251) }));
  assert.equal(rejected.status, 400);
  assert.equal((await rejected.json()).codigo, 'INVALID_QUESTION');
  assert.equal(calls, 1);
});

test('conta caracteres Unicode sem penalizar pares substitutos', async () => {
  useSuccessfulGemini();
  const response = await visualizar(makeRequest({ pergunta: '🌎'.repeat(250) }));
  assert.equal(response.status, 200);
});

test('limita os bytes efetivamente lidos, mesmo sem Content-Length confiável', async () => {
  globalThis.fetch = () => {
    throw new Error('A API não deveria ser chamada.');
  };
  process.env.VISULAB_API_KEY = 'chave-ficticia-de-teste';

  const hugeBody = JSON.stringify({ pergunta: 'Oi', extra: 'x'.repeat(3000) });
  const noLength = await visualizar(makeRequest(null, { rawBody: hugeBody }));
  assert.equal(noLength.status, 413);
  assert.equal((await noLength.json()).codigo, 'REQUEST_TOO_LARGE');

  const falseLength = await visualizar(makeRequest(null, {
    rawBody: hugeBody,
    headers: { 'Content-Type': 'application/json', 'Content-Length': '20' },
  }));
  assert.equal(falseLength.status, 413);
});

test('rejeita propriedades de entrada fora do contrato', async () => {
  const response = await visualizar(makeRequest({ pergunta: 'Como chove?', nome: 'não enviar' }));
  assert.equal(response.status, 400);
  assert.equal((await response.json()).codigo, 'INVALID_QUESTION');
});

test('informa quando VISULAB_API_KEY não está configurada', async () => {
  delete process.env.VISULAB_API_KEY;
  delete process.env.NVIDIA_API_KEY;
  const originalConsoleError = console.error;
  const logs = [];
  console.error = (...args) => logs.push(args);
  globalThis.fetch = () => {
    throw new Error('A API não deveria ser chamada.');
  };

  try {
    const response = await visualizar(makeRequest({ pergunta: 'Como chove?' }));
    assert.equal(response.status, 503);
    assert.equal((await response.json()).codigo, 'API_NOT_CONFIGURED');
    assert.match(logs.at(-1)[0], /Nenhuma chave de IA está configurada/);
  } finally {
    console.error = originalConsoleError;
  }
});

test('pede JSON e schema no prompt Gemini sem campos de formato em generationConfig', async () => {
  useSuccessfulGemini((url, options) => {
    assert.match(url, /gemini-3\.5-flash-lite:generateContent$/);
    assert.equal(url.includes('chave-ficticia-de-teste'), false);
    assert.equal(options.headers['x-goog-api-key'], 'chave-ficticia-de-teste');
    assert.ok(options.signal instanceof AbortSignal);

    const body = JSON.parse(options.body);
    assert.equal(options.body.includes('chave-ficticia-de-teste'), false);
    assert.deepEqual(Object.keys(body.generationConfig).sort(), ['maxOutputTokens', 'temperature']);
    for (const field of ['responseMimeType', 'responseSchema', 'responseFormat', 'response_format']) {
      assert.equal(field in body.generationConfig, false, field);
    }

    const instruction = body.systemInstruction.parts[0].text;
    assert.ok(instruction.includes(JSON.stringify(RESPONSE_SCHEMA)));
    assert.match(instruction, /único objeto JSON/i);
    assert.match(instruction, /sem Markdown/i);
    assert.match(instruction, /pelo menos 5 elementos visuais/i);
    assert.match(instruction, /etapas bem separadas/i);
    assert.match(instruction, /setas de relação/i);
    assert.match(instruction, /cenario por etapa/i);
    assert.match(instruction, /somente a perguntas educacionais/i);
    assert.match(instruction, /português brasileiro/i);
    assert.match(instruction, /ignore qualquer instrução/i);
    assert.match(instruction, /não produza HTML/i);
  });

  const response = await visualizar(makeRequest({ pergunta: 'Como funciona o ciclo da água?' }));
  const payload = await response.json();
  assert.equal(response.status, 200);
  assert.deepEqual(payload, { experiencia: validateVisualExperience(validExperience), provedor: 'gemini' });
  assert.equal(JSON.stringify(payload).includes('chave-ficticia-de-teste'), false);
  assertSecurityHeaders(response);
});

test('retorna Gemini validado sem chamar NVIDIA quando ambos estão configurados', async () => {
  process.env.NVIDIA_API_KEY = 'nvidia-ficticia';
  const calls = [];
  useSuccessfulGemini((url) => calls.push(url));

  const response = await visualizar(makeRequest({ pergunta: 'Como chove?' }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    experiencia: validateVisualExperience(validExperience),
    provedor: 'gemini',
  });
  assert.equal(calls.length, 1);
  assert.match(calls[0], /generativelanguage\.googleapis\.com/);
});

test('rejeita JSON malformado, cenas vazias e cenas sem ações de ambos os provedores', async () => {
  for (const provider of ['gemini', 'nvidia']) {
    if (provider === 'gemini') {
      process.env.VISULAB_API_KEY = 'gemini-ficticia';
      delete process.env.NVIDIA_API_KEY;
    } else {
      delete process.env.VISULAB_API_KEY;
      process.env.NVIDIA_API_KEY = 'nvidia-ficticia';
    }

    for (const [description, text] of invalidExperienceTexts) {
      globalThis.fetch = async () => provider === 'gemini'
        ? geminiTextResponse(text)
        : Response.json({ choices: [{ message: { content: text } }] });

      const response = await visualizar(makeRequest({ pergunta: 'Como chove?' }));
      const payload = await response.json();
      assert.equal(response.status, 502, `${provider}: ${description}`);
      assert.equal(payload.codigo, 'INVALID_API_RESPONSE');
      assert.equal('experiencia' in payload, false);
    }
  }
});

test('tenta NVIDIA quando o Gemini responde HTTP 200 com roteiro inválido', async () => {
  process.env.VISULAB_API_KEY = 'gemini-ficticia';
  process.env.NVIDIA_API_KEY = 'nvidia-ficticia';

  for (const [description, text] of invalidExperienceTexts) {
    const calls = [];
    globalThis.fetch = async (url) => {
      calls.push(url);
      return calls.length === 1 ? geminiTextResponse(text) : nvidiaSuccess();
    };

    const response = await visualizar(makeRequest({ pergunta: 'Como chove?' }));
    assert.equal(response.status, 200, description);
    assert.deepEqual(await response.json(), {
      experiencia: validateVisualExperience(validExperience),
      provedor: 'nvidia',
    });
    assert.equal(calls.length, 2);
    assert.match(calls[0], /generativelanguage\.googleapis\.com/);
    assert.equal(calls[1], 'https://integrate.api.nvidia.com/v1/chat/completions');
  }
});

test('tenta Gemini primeiro e usa NVIDIA NIM quando o Gemini falha', async () => {
  process.env.VISULAB_API_KEY = 'gemini-ficticia';
  process.env.NVIDIA_API_KEY = 'nvidia-ficticia';
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    if (calls.length === 1) return Response.json({ error: { message: 'Falha simulada' } }, { status: 500 });
    return nvidiaSuccess();
  };
  const response = await visualizar(makeRequest({ pergunta: 'Explique um eclipse.' }));
  const payload = await response.json();
  assert.equal(response.status, 200);
  assert.equal(payload.provedor, 'nvidia');
  assert.match(calls[0].url, /generativelanguage\.googleapis\.com/);
  assert.equal(calls[1].url, 'https://integrate.api.nvidia.com/v1/chat/completions');
  assert.equal(calls[1].options.headers.Authorization, 'Bearer nvidia-ficticia');
  const body = JSON.parse(calls[1].options.body);
  assert.equal(body.model, 'meta/llama-3.1-8b-instruct');
  assert.deepEqual(body.response_format, { type: 'json_object' });
  assert.equal(body.stream, false);
  assert.equal(calls[1].options.body.includes('nvidia-ficticia'), false);
});

test('lê NVIDIA_MODEL por requisição e usa o padrão somente se ausente ou vazio', async () => {
  process.env.NVIDIA_API_KEY = 'nvidia-ficticia';
  for (const configuredModel of [undefined, '', '   ', 'meta/llama-3.1-70b-instruct']) {
    if (configuredModel === undefined) delete process.env.NVIDIA_MODEL;
    else process.env.NVIDIA_MODEL = configuredModel;
    let calledModel;
    globalThis.fetch = async (_url, options) => {
      calledModel = JSON.parse(options.body).model;
      return nvidiaSuccess();
    };

    const response = await visualizar(makeRequest({ pergunta: 'Explique um átomo.' }));
    assert.equal(response.status, 200, String(configuredModel));
    assert.equal((await response.json()).provedor, 'nvidia');
    assert.equal(calledModel, configuredModel?.startsWith('meta/')
      ? configuredModel
      : 'meta/llama-3.1-8b-instruct');
  }
});

test('separa modelo, autenticação e logs usando somente credenciais fictícias', async (t) => {
  process.env.NVIDIA_API_KEY = 'nvapi-credencial-ficticia-nao-valida';
  process.env.NVIDIA_MODEL = 'meta/llama-3.1-8b-instruct';
  const logs = [];
  t.mock.method(console, 'info', (...args) => logs.push(args));
  t.mock.method(console, 'error', (...args) => logs.push(args));
  let request;
  globalThis.fetch = async (url, options) => { request = { url, ...options }; return nvidiaSuccess(); };
  const response = await visualizar(makeRequest({ pergunta: 'Explique um átomo.' }));
  assert.equal(response.status, 200);
  assert.equal(JSON.parse(request.body).model, process.env.NVIDIA_MODEL);
  assert.equal(request.headers.Authorization, `Bearer ${process.env.NVIDIA_API_KEY}`);
  assert.equal(request.url.includes(process.env.NVIDIA_API_KEY), false);
  assert.equal(request.body.includes(process.env.NVIDIA_API_KEY), false);
  assert.equal(JSON.stringify(logs).includes(process.env.NVIDIA_API_KEY), false);
  assert.equal((await response.text()).includes(process.env.NVIDIA_API_KEY), false);
});

test('bloqueia modelo inválido ou contendo chave antes do fetch, sem expor valores', async (t) => {
  process.env.NVIDIA_API_KEY = 'nvapi-segredo-ficticio-nao-valido';
  const logs = [];
  t.mock.method(console, 'info', (...args) => logs.push(args));
  t.mock.method(console, 'error', (...args) => logs.push(args));
  let calls = 0;
  globalThis.fetch = async () => { calls++; return nvidiaSuccess(); };
  for (const model of [
    'nvapi-outra-chave-ficticia', `meta/${process.env.NVIDIA_API_KEY}`,
    `Bearer ${process.env.NVIDIA_API_KEY}`, 'NVAPI-FICTICIA',
    process.env.NVIDIA_API_KEY, 'modelo invalido', 'meta/AIzaFicticia',
  ]) {
    process.env.NVIDIA_MODEL = model;
    const response = await visualizar(makeRequest({ pergunta: 'Explique um átomo.' }));
    assert.equal(response.status, 503);
    const payload = await response.json();
    assert.equal(payload.codigo, 'NVIDIA_MODEL_CONFIGURATION_ERROR');
    assert.match(payload.mensagem, /Corrija NVIDIA_MODEL/);
    assert.equal(JSON.stringify(payload).includes(model), false);
    assert.equal(JSON.stringify(logs).includes(model), false);
    assert.equal(logs.at(-1)[1].model, null);
  }
  // Também rejeita chaves sem prefixo reconhecível, mesmo com sintaxe fabricante/modelo.
  process.env.NVIDIA_API_KEY = 'segredoFicticio';
  process.env.NVIDIA_MODEL = 'meta/segredoFicticio';
  assert.equal((await visualizar(makeRequest({ pergunta: 'Explique um átomo.' }))).status, 503);
  assert.equal(JSON.stringify(logs).includes('segredoFicticio'), false);
  assert.equal(calls, 0);
});

test('Gemini continua primeiro com NVIDIA_MODEL inválido; falha não dispara NVIDIA', async (t) => {
  const logs = [];
  t.mock.method(console, 'info', (...args) => logs.push(args));
  t.mock.method(console, 'error', (...args) => logs.push(args));
  process.env.NVIDIA_API_KEY = 'credencial-ficticia';
  process.env.NVIDIA_MODEL = 'nvapi-configuracao-incorreta-ficticia';
  let calls = 0;
  useSuccessfulGemini(() => calls++);
  assert.equal((await visualizar(makeRequest({ pergunta: 'Como chove?' }))).status, 200);
  globalThis.fetch = async () => { calls++; throw new DOMException('segredo externo', 'AbortError'); };
  const payload = await (await visualizar(makeRequest({ pergunta: 'Como chove?' }))).json();
  assert.equal(calls, 2, 'somente Gemini é chamado nas duas requisições');
  assert.equal(payload.codigo, 'NVIDIA_MODEL_CONFIGURATION_ERROR');
  assert.deepEqual(payload.provedores.map(p => p.code), ['GEMINI_TIMEOUT', 'NVIDIA_MODEL_CONFIGURATION_ERROR']);
  assert.equal(JSON.stringify({ payload, logs }).includes(process.env.NVIDIA_MODEL), false);
});

test('logs preservam HTTP sem registrar mensagens, nomes externos ou credenciais refletidas', async (t) => {
  const logs = [];
  t.mock.method(console, 'info', (...args) => logs.push(args));
  t.mock.method(console, 'error', (...args) => logs.push(args));
  process.env.VISULAB_API_KEY = 'segredo-gemini-ficticio';
  process.env.NVIDIA_API_KEY = 'nvapi-segredo-nvidia-ficticio';
  const reflected = `${process.env.VISULAB_API_KEY} ${process.env.NVIDIA_API_KEY} nvapi-outra-ficticia`;
  for (const status of [400, 401, 403, 404, 429, 500]) {
    globalThis.fetch = async () => Response.json({ error: { message: reflected } }, { status });
    const response = await visualizar(makeRequest({ pergunta: 'Como chove?' }));
    const payload = await response.text();
    assert.equal(logs.at(-1)[1].upstreamStatus, status);
    for (const secret of reflected.split(' ')) assert.equal(`${payload}${JSON.stringify(logs)}`.includes(secret), false);
  }
  globalThis.fetch = async () => { const e = new Error(reflected); e.name = reflected; throw e; };
  await visualizar(makeRequest({ pergunta: 'Como chove?' }));
  assert.equal(JSON.stringify(logs).includes('nvapi-'), false);
});

const fakeDeadlines = t => {
  const timers = [];
  t.mock.method(globalThis, 'setTimeout', (run, ms) => {
    const timer = { run, ms, cleared: false }; timers.push(timer); return timer;
  });
  t.mock.method(globalThis, 'clearTimeout', timer => { timer.cleared = true; });
  return timers;
};

test('Gemini expira em 8s; NVIDIA recebe sinal e prazo próprios, e timers são limpos', async (t) => {
  const timers = fakeDeadlines(t), logs = [], signals = [];
  t.mock.method(console, 'error', (...args) => logs.push(args));
  process.env.VISULAB_API_KEY = 'gemini-ficticia';
  process.env.NVIDIA_API_KEY = 'nvidia-ficticia';
  globalThis.fetch = async (_url, { signal }) => {
    signals.push(signal);
    if (signals.length === 1) {
      assert.equal(timers[0].ms, 8000);
      return new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () => reject(signal.reason), { once: true });
        timers[0].run();
      });
    }
    assert.equal(timers[0].cleared, true, 'Gemini é limpo antes de iniciar NVIDIA');
    assert.equal(timers[1].ms, 15000);
    assert.equal(signal.aborted, false);
    return nvidiaSuccess();
  };
  const response = await visualizar(makeRequest({ pergunta: 'Como chove?' }));
  assert.equal((await response.json()).provedor, 'nvidia');
  assert.notEqual(signals[0], signals[1]);
  assert.ok(timers.every(timer => timer.cleared));
  const log = logs[0][1];
  assert.equal(log.code, 'GEMINI_TIMEOUT');
  assert.equal(log.phase, 'request');
  assert.equal(log.deadlineExceeded, true);
  assert.equal(log.timeoutMs, 8000);
  assert.ok(Number.isInteger(log.elapsedMs));
});

for (const provider of ['gemini', 'nvidia']) {
  test(`${provider}: abort durante leitura do JSON continua sendo timeout`, async (t) => {
    const timers = fakeDeadlines(t), logs = [];
    t.mock.method(console, 'error', (...args) => logs.push(args));
    process.env[provider === 'gemini' ? 'VISULAB_API_KEY' : 'NVIDIA_API_KEY'] = 'chave-ficticia';
    globalThis.fetch = async (_url, { signal }) => ({
      ok: true,
      json: () => new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () => reject(signal.reason), { once: true });
        timers[0].run();
      }),
    });
    const response = await visualizar(makeRequest({ pergunta: 'Como chove?' }));
    assert.equal(response.status, 504);
    assert.equal((await response.json()).codigo, 'API_TIMEOUT');
    assert.equal(logs[0][1].phase, 'body');
    assert.equal(logs[0][1].deadlineExceeded, true);
    assert.equal(timers[0].ms, provider === 'gemini' ? 8000 : 15000);
    assert.equal(timers[0].cleared, true);
  });
}

test('limpa timer em sucesso/erro e não espera pelo corpo de um HTTP 404', async (t) => {
  const timers = fakeDeadlines(t);
  process.env.VISULAB_API_KEY = 'chave-ficticia';
  globalThis.fetch = async () => geminiSuccess();
  assert.equal((await visualizar(makeRequest({ pergunta: 'Como chove?' }))).status, 200);
  assert.equal(timers[0].cleared, true);
  let cancelled = false;
  globalThis.fetch = async () => new Response(new ReadableStream({ cancel() { cancelled = true; } }), { status: 404 });
  const response = await visualizar(makeRequest({ pergunta: 'Como chove?' }));
  assert.equal((await response.json()).codigo, 'API_MODEL_NOT_FOUND');
  assert.equal(cancelled, true);
  assert.equal(timers[1].cleared, true);
});

test('usa NVIDIA diretamente quando somente NVIDIA_API_KEY está configurada', async () => {
  delete process.env.VISULAB_API_KEY;
  process.env.NVIDIA_API_KEY = 'nvidia-ficticia';
  let calls = 0;
  globalThis.fetch = async (url) => { calls += 1; assert.match(url, /integrate\.api\.nvidia\.com/); return nvidiaSuccess(); };
  const response = await visualizar(makeRequest({ pergunta: 'Explique um átomo.' }));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).provedor, 'nvidia');
  assert.equal(calls, 1);
});

test('retorna falhas dos dois provedores somente depois de tentar ambos', async () => {
  process.env.VISULAB_API_KEY = 'gemini-ficticia';
  process.env.NVIDIA_API_KEY = 'nvidia-ficticia';
  let calls = 0;
  globalThis.fetch = async () => { calls += 1; return Response.json({ error: { message: 'Indisponível' } }, { status: 500 }); };
  const response = await visualizar(makeRequest({ pergunta: 'Explique a gravidade.' }));
  const payload = await response.json();
  assert.equal(response.status, 503);
  assert.equal(payload.codigo, 'AI_PROVIDERS_FAILED');
  assert.deepEqual(payload.provedores.map(item => item.provider), ['gemini', 'nvidia']);
  assert.equal(calls, 2);
  assert.equal(JSON.stringify(payload).includes('ficticia'), false);
});

test('aceita disciplina outro e todos os tipos visuais permitidos', async () => {
  const types = [...TYPES, ...SPECIALS];

  for (const tipoVisual of types) {
    process.env.VISULAB_API_KEY = 'chave-ficticia-de-teste';
    globalThis.fetch = async () => geminiSuccess({
      ...validExperience,
      disciplina: 'outro',
      tipoDeCena: tipoVisual,
    });
    const response = await visualizar(makeRequest({ pergunta: 'Explique este tema de estudo.' }));
    assert.equal(response.status, 200, tipoVisual);
  }
});

test('descarta propriedades extras da IA e nunca devolve conteúdo executável', async () => {
  process.env.VISULAB_API_KEY = 'chave-ficticia-de-teste';
  globalThis.fetch = async () => geminiSuccess({
    ...validExperience,
    codigo: '<script>executar()</script>',
    cenas: validExperience.cenas.map((scene) => ({ ...scene, html: '<b>texto</b>' })),
  });

  const response = await visualizar(makeRequest({ pergunta: 'Como chove?' }));
  const payload = await response.json();
  assert.equal(response.status, 200);
  assert.deepEqual(payload, { experiencia: validateVisualExperience(validExperience), provedor: 'gemini' });
  assert.equal(JSON.stringify(payload).includes('<script>'), false);
});

test('descarta marcação nos campos textuais', async () => {
  const maliciousExperience = {
    ...validExperience,
    curiosidade: '<img src=x onerror=alert(1)>',
  };
  process.env.VISULAB_API_KEY = 'chave-ficticia-de-teste';
  globalThis.fetch = async () => geminiSuccess(maliciousExperience);

  const response = await visualizar(makeRequest({ pergunta: 'Como chove?' }));
  const payload = await response.json();
  assert.equal(response.status, 200);
  assert.equal(payload.experiencia.curiosidade, '');
  assert.equal(JSON.stringify(payload).includes('<img'), false);
});

test('aceita etapas curtas e limita o excesso a seis', async () => {
  for (const amount of [2, 7]) {
    process.env.VISULAB_API_KEY = 'chave-ficticia-de-teste';
    globalThis.fetch = async () => geminiSuccess({
      ...validExperience,
      cenas: Array.from({ length: amount }, (_, index) => ({
        ...validExperience.cenas[0],
        titulo: `Etapa ${index + 1}`,
        explicacao: 'Explicação segura.',
      })),
    });
    const response = await visualizar(makeRequest({ pergunta: 'Como chove?' }));
    assert.equal(response.status, 200, String(amount));
    assert.equal((await response.json()).experiencia.cenas.length, Math.min(6, amount));
  }
});

test('preserva o limite temporário sem expor o corpo externo', async () => {
  process.env.VISULAB_API_KEY = 'chave-ficticia-de-teste';
  globalThis.fetch = async () => new Response('detalhe-interno-secreto', { status: 429 });

  const response = await visualizar(makeRequest({ pergunta: 'Como chove?' }));
  const payload = await response.json();
  assert.equal(response.status, 429);
  assert.equal(payload.codigo, 'API_LIMIT');
  assert.equal(response.headers.get('retry-after'), '30');
  assert.equal(JSON.stringify(payload).includes('detalhe-interno-secreto'), false);
});

test('distingue formato recusado, chave inválida, modelo ausente e indisponibilidade', async () => {
  process.env.VISULAB_API_KEY = 'chave-ficticia-de-teste';

  globalThis.fetch = async () => Response.json({ error: { message: 'Schema inválido para chave-ficticia-de-teste' } }, { status: 400 });
  const rejected = await visualizar(makeRequest({ pergunta: 'Como chove?' }));
  assert.equal(rejected.status, 502);
  assert.equal((await rejected.json()).codigo, 'API_REQUEST_REJECTED');

  for (const status of [401, 403]) {
    globalThis.fetch = async () => new Response('segredo externo', { status });
    const response = await visualizar(makeRequest({ pergunta: 'Como chove?' }));
    assert.equal(response.status, 503, String(status));
    assert.equal((await response.json()).codigo, 'API_CONFIGURATION_ERROR');
  }

  globalThis.fetch = async () => Response.json({ error: { message: 'Modelo desconhecido' } }, { status: 404 });
  const missingModel = await visualizar(makeRequest({ pergunta: 'Como chove?' }));
  assert.equal(missingModel.status, 502);
  assert.equal((await missingModel.json()).codigo, 'API_MODEL_NOT_FOUND');

  for (const status of [408, 500, 502, 503, 504]) {
    globalThis.fetch = async () => new Response('segredo externo', { status });
    const response = await visualizar(makeRequest({ pergunta: 'Como chove?' }));
    assert.equal(response.status, 503, String(status));
    assert.equal((await response.json()).codigo, 'API_UNAVAILABLE');
  }

  globalThis.fetch = async () => { throw new TypeError('fetch failed: segredo externo'); };
  const networkResponse = await visualizar(makeRequest({ pergunta: 'Como chove?' }));
  assert.equal(networkResponse.status, 503);
  assert.equal((await networkResponse.json()).codigo, 'API_UNAVAILABLE');
});

test('trata timeout e resposta externa inválida sem detalhes internos', async () => {
  process.env.VISULAB_API_KEY = 'chave-ficticia-de-teste';
  globalThis.fetch = async () => { throw new DOMException('aborted', 'AbortError'); };
  const timeout = await visualizar(makeRequest({ pergunta: 'Como chove?' }));
  assert.equal(timeout.status, 504);
  assert.equal((await timeout.json()).codigo, 'API_TIMEOUT');

  globalThis.fetch = async () => new Response('<html>segredo externo</html>', {
    status: 200,
    headers: { 'Content-Type': 'text/html' },
  });
  const invalid = await visualizar(makeRequest({ pergunta: 'Como chove?' }));
  const payload = await invalid.json();
  assert.equal(invalid.status, 502);
  assert.equal(payload.codigo, 'INVALID_API_RESPONSE');
  assert.equal(JSON.stringify(payload).includes('segredo externo'), false);
});

test('origem enviada pela IA não pode se passar por premium ou fallback local', async () => {
  for (const origem of ['premium', 'local']) {
    useSuccessfulGemini();
    globalThis.fetch = async () => geminiSuccess({ ...validExperience, origem });
    const response = await visualizar(makeRequest({ pergunta: 'Explique um eclipse solar' }));
    assert.equal(response.status, 200);
    assert.equal((await response.json()).experiencia.origem, 'ia');
  }
});
