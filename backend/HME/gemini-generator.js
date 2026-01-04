// backend/HME/gemini-generator.js

import GeminiAPI from './GeminiAPI.js';

class GeminiResponseGenerator {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    this.gemini = new GeminiAPI(apiKey);
  }

  /**
   * Generate a single Gemini response
   * @param {string} query
   * @returns {Promise<string>}
   */
  async generateResponse(query) {
    if (!query || typeof query !== 'string') {
      throw new Error('Invalid query provided to Gemini generator');
    }

    try {
      return await this.gemini.generateResponse(query);
    } catch (error) {
      console.error('[HME] Gemini generation failed:', error.message);
      throw error;
    }
  }

  /**
   * Generate multiple responses for confidence evaluation
   * @param {string} query
   * @param {number} count
   * @returns {Promise<string[]>}
   */
  async generateMultipleResponses(query, count = 3) {
    const responses = [];

    for (let i = 0; i < count; i++) {
      try {
        const response = await this.generateResponse(query);
        responses.push(response);
      } catch (err) {
        // Fallback: reuse first successful response
        if (responses.length > 0) {
          responses.push(responses[0]);
        } else {
          throw err;
        }
      }
    }

    return responses;
  }
}

export default new GeminiResponseGenerator();
