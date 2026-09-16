import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

import { validateVisualExperience, TYPES, SPECIALS } from '../js/visual-validator.mjs';
import visualizar from '../netlify/functions/visualizar.mjs';

const originalFetch = globalThis.fetch;
const originalVisuLabKey = process.env.VISULAB_API_KEY;
const originalNvidiaKey = process.env.NVIDIA_API_KEY;

afterEach(() => {
  globalThis.fetch = originalFetch;

  if (originalVisuLabKey === undefined) delete process.env.VISULAB_API_KEY;
  else process.env.VISULAB_API_KEY = originalVisuLabKey;
  if (originalNvidiaKey === undefined) delete process.env.NVIDIA_API_KEY;
  else process.env.NVIDIA_API_KEY = originalNvidiaKey;

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

test('usa modelo, header e schema estruturado solicitados sem expor a chave', async () => {
  useSuccessfulGemini((url, options) => {
    assert.match(url, /gemini-3\.5-flash-lite:generateContent$/);
    assert.equal(url.includes('chave-ficticia-de-teste'), false);
    assert.equal(options.headers['x-goog-api-key'], 'chave-ficticia-de-teste');
    assert.ok(options.signal instanceof AbortSignal);

    const body = JSON.parse(options.body);
    assert.equal(options.body.includes('chave-ficticia-de-teste'), false);
    assert.equal(body.generationConfig.responseFormat.text.mimeType, 'application/json');
    assert.deepEqual(body.generationConfig.responseFormat.text.schema.properties.disciplina.enum, [
      'ciencias', 'historia', 'geografia', 'outro',
    ]);
    assert.deepEqual(body.generationConfig.responseFormat.text.schema.properties.tipoDeCena.enum, TYPES);
    assert.ok(body.generationConfig.responseFormat.text.schema.required.includes('tipoDeCena'));
    assert.ok(body.generationConfig.responseFormat.text.schema.required.includes('curiosidade'));
    assert.ok(body.generationConfig.responseFormat.text.schema.properties.cenas.items.required.includes('explicacao'));

    const instruction = body.systemInstruction.parts[0].text;
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
  assert.equal(body.model, 'moonshotai/kimi-k3');
  assert.deepEqual(body.response_format, { type: 'json_object' });
  assert.equal(body.stream, false);
  assert.equal(calls[1].options.body.includes('nvidia-ficticia'), false);
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
