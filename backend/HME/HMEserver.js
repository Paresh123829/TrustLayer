// backend/HME/HMEserver.js
// Hallucination Monitoring Engine – HTTP Server Layer

import express from 'express';
import bodyParser from 'body-parser';

import geminiGenerator from './gemini-generator.js';
import aiEvaluator from './ai-evaluator.js';

const app = express();
const PORT = process.env.HME_PORT || 5001;

app.use(bodyParser.json());

/**
 * Health check
 */
app.get('/api/hme/health', (_req, res) => {
  res.json({ status: 'HME running', ready: aiEvaluator.isReady });
});

/**
 * Generate + Evaluate AI response
 * POST /api/hme/generate-evaluate
 * Body: { query: string, samples?: number }
 */
app.post('/api/hme/generate-evaluate', async (req, res) => {
  try {
    const { query, samples = 3 } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing query' });
    }

    // 1. Generate multiple responses (Gemini)
    const responses = await geminiGenerator.generateMultipleResponses(
      query,
      samples
    );

    // 2. Evaluate responses (HME evaluator)
    const evaluation = await aiEvaluator.evaluateResponse(responses);

    return res.status(200).json({
      query,
      responses,
      evaluation
    });
  } catch (error) {
    console.error('[HME] Processing failed:', error.message);

    return res.status(500).json({
      error: 'HME generation or evaluation failed'
    });
  }
});

/**
 * Evaluate externally generated response
 * POST /api/hme/evaluate
 * Body: { response: string | string[] }
 */
app.post('/api/hme/evaluate', async (req, res) => {
  try {
    const { response } = req.body;

    if (!response) {
      return res.status(400).json({ error: 'No response provided' });
    }

    const evaluation = await aiEvaluator.evaluateResponse(response);

    return res.status(200).json(evaluation);
  } catch (error) {
    console.error('[HME] Evaluation failed:', error.message);

    return res.status(500).json({
      error: 'Evaluation failed'
    });
  }
});

/**
 * Start server
 */
export function startHMEServer() {
  app.listen(PORT, () => {
    console.log(`✅ HME Server running on port ${PORT}`);
  });
}

