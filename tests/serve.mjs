// Servidor de desenvolvimento restrito ao computador local, sem dependências.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, extname, sep } from 'node:path';
import visualizar from '../netlify/functions/visualizar.mjs';
import { fixtureFor } from './fixtures.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const fixtures = process.argv.includes('--fixtures');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png' };
createServer(async (req, res) => {
  try {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    if (pathname === '/.netlify/functions/visualizar') {
      const chunks = []; for await (const chunk of req) chunks.push(chunk);
      const body = Buffer.concat(chunks).toString();
      let response;
      if (fixtures) response = Response.json({ experiencia: fixtureFor(JSON.parse(body).pergunta) });
      else response = await visualizar(new Request('http://localhost' + pathname, { method: req.method, headers: req.headers, ...(req.method !== 'GET' ? { body } : {}) }));
      res.writeHead(response.status, Object.fromEntries(response.headers)); res.end(await response.text()); return;
    }
    const file = resolve(root, '.' + decodeURIComponent(pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root.endsWith(sep) ? root : root + sep) || pathname.includes('/.')) { res.writeHead(403); res.end(); return; }
    const content = await readFile(file);
    res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'text/plain', 'Cache-Control': 'no-store' }); res.end(content);
  } catch { res.writeHead(404); res.end('Não encontrado'); }
}).listen(8765, '127.0.0.1', () => console.log(`VisuLab em http://localhost:8765 — ${fixtures ? 'roteiros simulados' : 'função real'}`));
