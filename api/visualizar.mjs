import visualizar from '../netlify/functions/visualizar.mjs';

// A implementação compartilhada usa a API Web (Request/Response), enquanto o
// runtime Node da Vercel entrega req/res. O adaptador mantém o contrato público
// /api/visualizar sem expor nenhuma variável de ambiente ao cliente.
export default async function handler(req, res) {
  if (req instanceof Request || typeof req?.headers?.get === 'function') {
    return visualizar(req);
  }

  const chunks = [];
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    for await (const chunk of req) chunks.push(chunk);
  }

  const request = new Request(`https://${req.headers.host || 'localhost'}${req.url || '/api/visualizar'}`, {
    method: req.method,
    headers: req.headers,
    body: chunks.length ? Buffer.concat(chunks.map(chunk => Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))) : undefined,
  });
  const response = await visualizar(request);

  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.end(await response.text());
}
