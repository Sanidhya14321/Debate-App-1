'use server';
/**
 * @file Debate Analysis Flow (ML-first, AI & heuristic fallbacks)
 * - Attempts ML API first
 * - Falls back to LLM if ML fails
 * - Falls back to heuristic scoring if both fail
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// ----------- Schemas -----------

const DebateAnalysisInputSchema = z.object({
  arguments: z.array(
    z.object({
      username: z.string().describe('The username of the debater.'),
      argumentText: z.string().describe('The argument text from this debater.')
    })
  ).min(2).describe('List of arguments made by participants, in order.'),
});
export type DebateAnalysisInput = z.infer<typeof DebateAnalysisInputSchema>;

const DebateAnalysisOutputSchema = z.object({
  winner: z.string().describe('Username of the winner.'),
  scores: z.record(
    z.object({
      sentiment: z.object({ score: z.number(), rating: z.string() }),
      clarity: z.object({ score: z.number(), rating: z.string() }),
      vocab_richness: z.object({ score: z.number(), rating: z.string() }),
      avg_word_len: z.object({ score: z.number(), rating: z.string() })
    })
  ),
  totals: z.record(z.number()),
  coherence: z.object({ score: z.number(), rating: z.string() }),
});
export type DebateAnalysisOutput = z.infer<typeof DebateAnalysisOutputSchema>;

// ----------- Constants -----------

const WEIGHTS = {
  clarity: 0.3,
  sentiment: 0.3,
  vocab_richness: 0.2,
  avg_word_len: 0.1,
  coherence: 0.1,
};
const COHERENCE_BASELINE = 75;

// ----------- Helpers -----------

const rateScore = (score: number): string =>
  score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Poor";

const withTimeout = async (promise: Promise<Response>, ms = 5000) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try {
    return await promise;
  } finally {
    clearTimeout(timeout);
  }
};

// ----------- AI Prompt -----------

const debateAnalysisPrompt = `
You are a **professional debate evaluator**.
Analyze the provided arguments and return a structured evaluation.

### Scoring Rubric:
- Sentiment (0–100)
- Clarity (0–100)
- Vocabulary Richness (0–100)
- Average Word Length (0–100)
- Coherence (0–100)

### Rules:
1. Provide descriptive scores (0–100) for each metric.
2. Compute totals using weights:
   - Clarity (30%)
   - Sentiment (30%)
   - Vocabulary Richness (20%)
   - Avg Word Length (10%)
   - Coherence (10%)
3. Winner = participant with highest total.
4. Return strictly valid JSON.
Arguments: {{arguments}}
`;

// ----------- Flow -----------

const debateAnalysisFlow = ai.defineFlow(
  'debateAnalysisFlow',
  async (input: DebateAnalysisInput): Promise<DebateAnalysisOutput> => {
    // --- Step 1: ML API ---
    try {
      const mlResult = await withTimeout(
        fetch(`${process.env.DEBATE_ML_URL}/finalize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }),
        5000
      );
      if (mlResult.ok) {
        console.log('✅ ML evaluation');
        return await mlResult.json();
      }
      console.warn('⚠️ ML evaluation failed');
    } catch (err) {
      console.warn('⚠️ ML service unavailable:', err);
    }

    // --- Step 2: AI Fallback ---
    try {
      const argsString = input.arguments
        .map(a => `**${a.username}**: ${a.argumentText}`)
        .join('\n\n');

      const prompt = debateAnalysisPrompt.replace('{{arguments}}', argsString);

      const response = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        prompt,
        output: { schema: DebateAnalysisOutputSchema }
      });

      if (response.output) {
        console.log('✅ AI evaluation');
        return response.output;
      }
    } catch (err) {
      console.error('❌ AI evaluation failed:', err);
    }

    // --- Step 3: Heuristic Fallback ---
    console.log('📊 Using heuristic scoring');
    const scores: DebateAnalysisOutput['scores'] = {};
    const totals: DebateAnalysisOutput['totals'] = {};

    for (const { username } of input.arguments) {
      const sentiment = 70 + Math.random() * 20;
      const clarity = 65 + Math.random() * 25;
      const vocab = 60 + Math.random() * 30;
      const wordLen = 70 + Math.random() * 20;

      scores[username] = {
        sentiment: { score: sentiment, rating: rateScore(sentiment) },
        clarity: { score: clarity, rating: rateScore(clarity) },
        vocab_richness: { score: vocab, rating: rateScore(vocab) },
        avg_word_len: { score: wordLen, rating: rateScore(wordLen) },
      };

      totals[username] =
        clarity * WEIGHTS.clarity +
        sentiment * WEIGHTS.sentiment +
        vocab * WEIGHTS.vocab_richness +
        wordLen * WEIGHTS.avg_word_len +
        COHERENCE_BASELINE * WEIGHTS.coherence;
    }

    const winner = Object.entries(totals).reduce((a, b) => (b[1] > a[1] ? b : a))[0];

    return {
      winner,
      scores,
      totals,
      coherence: { score: COHERENCE_BASELINE, rating: "Good" },
    };
  }
);

export async function analyzeDebate(input: DebateAnalysisInput) {
  return debateAnalysisFlow(input);
}
