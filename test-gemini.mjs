import { GoogleGenAI } from '@google/genai';

console.log('API Key:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

try {
  console.log('Sending request to Gemini...');
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: 'Hello, respond with a single word.',
  });
  console.log('Response:', response.text);
} catch (error) {
  console.error('Error occurred:', error);
}
