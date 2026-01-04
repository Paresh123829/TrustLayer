// backend/HME/response-generator.js
// Lightweight deterministic response generator (backend testing / fallback)

class ResponseGenerator {
  constructor() {
    this.responses = {
      safe: [
        "I can help you with that. Here's some information about ",
        "That's an interesting question. Let me explain ",
        "Based on current knowledge, ",
        "Here's what I know about ",
        "I'd be happy to help you understand "
      ],
      educational: [
        "This is a complex topic that involves ",
        "From an educational perspective, ",
        "Research shows that ",
        "According to scientific studies, ",
        "The general consensus is that "
      ]
    };
  }

  generateResponse(query) {
    if (!query || typeof query !== 'string') {
      throw new Error('Invalid query');
    }

    const q = query.toLowerCase();

    if (q.includes('hi') || q.includes('hello') || q.includes('hey')) {
      return "Hello! I'm here to help. What would you like to know?";
    }

    if (q.includes('cookie')) {
      return "Chocolate chip cookies are made by mixing flour, sugar, butter, eggs, and chocolate chips, then baking at 375°F until golden brown.";
    }

    if (q.includes('pizza')) {
      return "Pizza is made using dough, tomato sauce, cheese, and toppings, baked at high temperature until crisp.";
    }

    if (q.includes('photosynthesis')) {
      return "Photosynthesis is the process by which plants convert sunlight into chemical energy using carbon dioxide and water.";
    }

    if (q.includes('blockchain')) {
      return "Blockchain is a decentralized ledger technology that records transactions across multiple computers securely.";
    }

    if (q.includes('gravity')) {
      return "Gravity is a fundamental force that attracts objects with mass toward each other.";
    }

    const prefix =
      this.responses.safe[
        Math.floor(Math.random() * this.responses.safe.length)
      ];

    return `${prefix}${query}.`;
  }

  generateMultipleResponses(query, count = 3) {
    const responses = [];
    for (let i = 0; i < count; i++) {
      responses.push(this.generateResponse(query));
    }
    return responses;
  }
}

export default new ResponseGenerator();
