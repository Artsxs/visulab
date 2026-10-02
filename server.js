import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import visualizar from './api/visualizar.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

// Parse raw body for function requests to preserve exact bytes and format
app.use(express.raw({ type: '*/*', limit: '2mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Adapter to forward requests to the visualizar Netlify Function handler
const handleVisualizar = async (req, res) => {
  try {
    const rawBody = req.body && Buffer.isBuffer(req.body)
      ? req.body.toString('utf-8')
      : (typeof req.body === 'string' ? req.body : (req.body ? JSON.stringify(req.body) : undefined));

    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers.host || `localhost:${PORT}`;
    const url = `${protocol}://${host}${req.originalUrl || req.url}`;

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          for (const v of value) headers.append(key, v);
        } else {
          headers.set(key, value);
        }
      }
    }

    const standardRequest = new Request(url, {
      method: req.method,
      headers,
      ...(req.method !== 'GET' && req.method !== 'HEAD' ? { body: rawBody } : {}),
    });

    const response = await visualizar(standardRequest);

    res.status(response.status);
    for (const [key, value] of response.headers.entries()) {
      res.setHeader(key, value);
    }

    const text = await response.text();
    res.send(text);
  } catch (error) {
    console.error('Erro na função visualizar:', error);
    res.status(500).json({
      codigo: 'INTERNAL_ERROR',
      mensagem: 'Erro interno ao processar a solicitação.',
    });
  }
};

app.all('/.netlify/functions/visualizar', handleVisualizar);
app.all('/api/visualizar', handleVisualizar);

// Serve static assets from project root
app.use(express.static(__dirname, {
  extensions: ['html'],
  index: 'index.html',
}));

// Fallback to index.html for navigation routes
app.get('*', (req, res, next) => {
  if (req.method === 'GET' && !req.path.includes('.')) {
    res.sendFile(resolve(__dirname, 'index.html'));
  } else {
    next();
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`VisuLab em http://0.0.0.0:${PORT}`);
});
