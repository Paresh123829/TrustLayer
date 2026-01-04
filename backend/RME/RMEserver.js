// backend/RME/RMEserver.js
// Restricted Monitoring Engine – Server-side semantic filter

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pipeline, cos_sim } from '@xenova/transformers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SIMILARITY_THRESHOLD = 0.65;

/**
 * RME Server Class
 */
class RMEServer {
  constructor() {
    this.extractor = null;
    this.restrictedEmbeddings = [];
    this.restrictedPatterns = [];
    this.isReady = false;
  }

  /**
   * Initialize RME
   */
  async init() {
    try {
      console.log('🔄 Initializing RME...');
      this.extractor = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2'
      );

      const jsonPath = path.join(__dirname, '../json_files/reply.json');
      this.restrictedPatterns = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

      const embeddings = await this.extractor(this.restrictedPatterns, {
        pooling: 'mean',
        normalize: true
      });

      this.restrictedEmbeddings = embeddings.tolist();
      this.isReady = true;

      console.log(`✅ RME ready (${this.restrictedPatterns.length} patterns loaded)`);
    } catch (err) {
      console.error('❌ RME initialization failed:', err);
      this.isReady = false;
      throw err;
    }
  }

  /**
   * Semantic restriction check
   */
  async _isRestricted(query) {
    if (!this.isReady || !query || !this.extractor) return false;

    const output = await this.extractor([query], {
      pooling: 'mean',
      normalize: true
    });

    const queryEmb = output.tolist()[0];
    let maxSimilarity = 0;

    for (const emb of this.restrictedEmbeddings) {
      const sim = cos_sim(queryEmb, emb);
      maxSimilarity = Math.max(maxSimilarity, sim);
      if (sim >= SIMILARITY_THRESHOLD) break;
    }

    return maxSimilarity >= SIMILARITY_THRESHOLD;
  }

  /**
   * Check query - public method
   */
  async checkQuery(query) {
    if (!this.isReady) {
      return {
        restricted: false,
        message: 'RME not ready yet'
      };
    }

    try {
      const restricted = await this._isRestricted(query);
      return {
        restricted,
        message: restricted
          ? 'This query was blocked by RME for safety reasons.'
          : 'Query approved'
      };
    } catch (err) {
      console.error('[RME] Check query failed:', err);
      return {
        restricted: false,
        message: 'RME check failed'
      };
    }
  }
}

// Express app for standalone RME server (optional)
const app = express();
const PORT = process.env.RME_PORT || 5002;

app.use(express.json());

let rmeInstance = null;

/**
 * Health check
 */
app.get('/api/rme/health', (_req, res) => {
  res.json({ ready: rmeInstance?.isReady || false });
});

/**
 * Check query endpoint
 * POST /api/rme/check
 * Body: { query: string }
 */
app.post('/api/rme/check', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Invalid query' });
    }

    if (!rmeInstance || !rmeInstance.isReady) {
      return res.status(503).json({ error: 'RME not ready' });
    }

    const result = await rmeInstance.checkQuery(query);

    res.json({
      query,
      restricted: result.restricted,
      message: result.message,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('[RME] Check failed:', err);
    res.status(500).json({ error: 'RME check failed' });
  }
});

/**
 * Start standalone RME server
 */
export async function startRMEServer() {
  rmeInstance = new RMEServer();
  await rmeInstance.init();
  app.listen(PORT, () => {
    console.log(`🚫 RME Server running on port ${PORT}`);
  });
}

export default RMEServer;
