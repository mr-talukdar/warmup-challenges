import { GoogleGenAI } from '@google/genai';

/**
 * ==========================================
 * GEN AI CAPABILITY: Client Initialization
 * ==========================================
 * We instantiate the official GoogleGenAI client using `@google/genai`.
 * This client serves as the entry point for all Gemini API communications, 
 * leveraging the `GEMINI_API_KEY` defined in environment variables.
 */
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('Warning: GEMINI_API_KEY is not defined in the environment.');
}

export const ai = new GoogleGenAI({
  apiKey: apiKey || '',
});

