/**
 * @fileOverview Firebase Genkit configuration for AI-powered debate analysis.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    // Configure Google AI for fallback analysis
    googleAI({
      apiKey: process.env.GOOGLE_AI_API_KEY,
    }),
  ],
  // Default model for inference
  model: 'googleai/gemini-2.5-flash',
});
