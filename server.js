import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

/* =======================
   ENV SETUP
======================= */

dotenv.config();

/* =======================
   ESM __dirname FIX
======================= */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* =======================
   CORE ENGINES (ESM)
======================= */

import ResponseGenerator from './backend/HME/ResponseGenerator.js';
import GeminiAPI from './backend/HME/GeminiAPI.js';
import RMEServer from './backend/RME/RMEserver.js';
import { startHMEServer } from './backend/HME/HMEserver.js';

/* =======================
   APP INIT
======================= */

const app = express();
const PORT = process.env.PORT || 3000;

/* =======================
   ENGINE INIT
======================= */

const responseGenerator = ResponseGenerator;

const geminiAPI = process.env.GEMINI_API_KEY
  ? new GeminiAPI(process.env.GEMINI_API_KEY)
  : null;

const rme = new RMEServer();

let enginesReady = false;

/* =======================
   MIDDLEWARE
======================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use('/api', (_req, res, next) => {
  if (!enginesReady) {
    return res.status(503).json({ error: 'System initializing, try again shortly' });
  }
  next();
});

/* =======================
   STATIC FRONTEND
======================= */

app.use(express.static(path.join(__dirname, 'frontend', 'dist')));

/* =======================
   HEALTH CHECK
======================= */

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    rmeReady: rme.isReady,
    hmeReady: true,
    geminiAvailable: !!geminiAPI,
    timestamp: new Date().toISOString()
  });
});

/* =======================
   CHAT ENDPOINT
======================= */

app.post('/api/chat', async (req, res) => {
  const start = Date.now();

  try {
    const { message, filtersEnabled = true } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Invalid message' });
    }

    if (filtersEnabled && rme.isReady) {
      const rmeResult = await rme.checkQuery(message);
      if (rmeResult.restricted) {
        return res.status(403).json({
          blocked: true,
          source: 'RME',
          message: rmeResult.message
        });
      }
    }

    let content = '';
    let source = 'rule-based';

    if (geminiAPI) {
      try {
        content = await geminiAPI.generateResponse(message);
        source = 'gemini';
      } catch {
        content = responseGenerator.generateResponse(message);
      }
    } else {
      content = responseGenerator.generateResponse(message);
    }

    if (!content) throw new Error('Empty response generated');

    res.json({
      id: Date.now().toString(),
      role: 'assistant',
      content,
      source,
      metrics: { processingTime: Date.now() - start },
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* =======================
   SPA FALLBACK
======================= */

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
});

/* =======================
   BOOTSTRAP
======================= */

(async () => {
  console.log('🔄 Initializing engines...');
  await rme.init();

  // HME runs as its OWN server
  startHMEServer();

  enginesReady = true;

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔒 RME: ${rme.isReady ? 'READY' : 'FAIL'}`);
    console.log(`🔍 HME: READY (separate service)`);
  });
})();
