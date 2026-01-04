// backend/HME/ai-evaluator.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pipeline, cos_sim } from '@xenova/transformers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AIResponseEvaluator {
  constructor() {
    this.extractor = null;
    this.riskyEmbeddings = [];

    this.riskThreshold = 0.7;
    this.confidenceThreshold = 0.6;
    this.credibilityThreshold = 0.5;

    this.absolutePatterns = [];
    this.citationPatterns = [];
    this.isReady = false;
  }

  async init() {
    try {
      // Load embedding model
      this.extractor = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2'
      );

      // Load risky replies
      const replyPath = path.join(__dirname, '../json_files/reply.json');
      const riskyResponses = JSON.parse(fs.readFileSync(replyPath, 'utf-8'));

      const riskyOutputs = await this.extractor(riskyResponses, {
        pooling: 'mean',
        normalize: true
      });

      this.riskyEmbeddings = riskyOutputs.tolist();

      // Load hallucination patterns
      const patternsPath = path.join(
        __dirname,
        '../json_files/hallucination_patterns.json'
      );

      if (fs.existsSync(patternsPath)) {
        const patterns = JSON.parse(fs.readFileSync(patternsPath, 'utf-8'));
        this.absolutePatterns = patterns.absolutePatterns || [];
        this.citationPatterns = patterns.citationPatterns || [];
      }

      this.isReady = true;
      console.log('[HME] AI Response Evaluator initialized');
    } catch (err) {
      console.error('[HME] Evaluator initialization failed:', err);
      this.isReady = false;
    }
  }

  async estimateConfidence(responses) {
    if (!this.isReady || responses.length < 2) return 0.5;

    const embeddings = await this.extractor(responses, {
      pooling: 'mean',
      normalize: true
    });

    const vectors = embeddings.tolist();
    let similarity = 0;
    let count = 0;

    for (let i = 0; i < vectors.length; i++) {
      for (let j = i + 1; j < vectors.length; j++) {
        similarity += cos_sim(vectors[i], vectors[j]);
        count++;
      }
    }

    return count ? similarity / count : 0.5;
  }

  async detectRisk(text) {
    if (!this.isReady || !this.riskyEmbeddings.length) return 0;

    const output = await this.extractor([text], {
      pooling: 'mean',
      normalize: true
    });

    const embedding = output.tolist()[0];
    let maxSimilarity = 0;

    for (const risky of this.riskyEmbeddings) {
      const sim = cos_sim(embedding, risky);
      maxSimilarity = Math.max(maxSimilarity, sim);
      if (sim >= this.riskThreshold) break;
    }

    return maxSimilarity;
  }

  checkCredibility(text) {
    let score = 1;
    const lower = text.toLowerCase();

    this.absolutePatterns.forEach(p => {
      if (lower.includes(p.toLowerCase())) score -= 0.3;
    });

    this.citationPatterns.forEach(p => {
      if (lower.includes(p.toLowerCase())) score -= 0.2;
    });

    if (
      (lower.includes('medical') || lower.includes('financial')) &&
      (lower.includes('guaranteed') || lower.includes('always'))
    ) {
      score -= 0.4;
    }

    return Math.max(0, score);
  }

  async evaluateResponse(responses) {
    if (!Array.isArray(responses)) responses = [responses];

    const trimmed = responses.map(r =>
      typeof r === 'string' && r.length > 2000
        ? r.slice(0, 2000)
        : r
    );

    const main = trimmed[0];

    const [confidence, risk] = await Promise.all([
      this.estimateConfidence(trimmed),
      this.detectRisk(main)
    ]);

    const credibility = this.checkCredibility(main);
    const decision = this.makeDecision({ confidence, risk, credibility });

    return {
      scores: { confidence, risk, credibility },
      decision
    };
  }

  makeDecision({ confidence, risk, credibility }) {
    if (risk >= this.riskThreshold) {
      return { action: 'block', message: 'Unsafe content detected' };
    }

    if (credibility < this.credibilityThreshold) {
      return { action: 'warn', message: 'Low credibility detected' };
    }

    if (confidence < this.confidenceThreshold) {
      return { action: 'warn', message: 'Low response consistency' };
    }

    return { action: 'allow', message: 'Response approved' };
  }
}

const aiEvaluator = new AIResponseEvaluator();
await aiEvaluator.init();

export default aiEvaluator;
