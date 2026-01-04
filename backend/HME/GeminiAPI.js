// backend/HME/GeminiAPI.js

class GeminiAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.modelName = 'gemini-1.5-flash';
    this.baseURL =
      `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent`;
  }

  async generateResponse(query) {
    if (!this.apiKey) {
      throw new Error('Gemini API key not provided');
    }

    const url = `${this.baseURL}?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: query }] }]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(
        `Gemini API error ${response.status}: ${err.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text
      ?? (() => { throw new Error('Unexpected Gemini response format'); })();
  }
}

export default GeminiAPI;
