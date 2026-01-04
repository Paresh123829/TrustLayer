// backend/HME/evaluator-integration.js

import express from 'express';
import aiEvaluator from './ai-evaluator.js';

const router = express.Router();

/**
 * POST /api/hme/evaluate
 * Body: { response: string | string[] }
 */
router.post('/evaluate', async (req, res) => {
  try {
    const { response } = req.body;

    if (!response || (Array.isArray(response) && response.length === 0)) {
      return res.status(400).json({
        error: 'No AI response provided for evaluation'
      });
    }

    const result = await aiEvaluator.evaluateResponse(response);

    return res.status(200).json(result);
  } catch (err) {
    console.error('[HME] Evaluation failed:', err);

    return res.status(500).json({
      error: 'AI response evaluation failed'
    });
  }
});

export default router;
