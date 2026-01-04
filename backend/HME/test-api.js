// backend/HME/test-gemini.js
import geminiGenerator from './gemini-generator.js';

const result = await geminiGenerator.generateResponse('Hello');
console.log(result);
