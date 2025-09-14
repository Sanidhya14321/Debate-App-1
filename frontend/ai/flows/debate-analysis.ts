'use server';
/**
 * @fileOverview Stable & fallback-enabled Genkit flow for analyzing debates.
 *
 * Uses ML models when available, otherwise falls back to LLM-based flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// ----------- Input & Output Schemas -----------

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
      sentiment: z.object({
        score: z.number().describe('Sentiment score (0–100).'),
        rating: z.string().describe('Descriptive rating.')
      }),
      clarity: z.object({
        score: z.number().describe('Clarity score (0–100).'),
        rating: z.string().describe('Descriptive rating.')
      }),
      vocab_richness: z.object({
        score: z.number().describe('Vocabulary richness score (0–100).'),
        rating: z.string().describe('Descriptive rating.')
      }),
      avg_word_len: z.object({
        score: z.number().describe('Average word length normalized to (0–100).'),
        rating: z.string().describe('Descriptive rating.')
      })
    })
  ).describe('Per-participant average scores.'),
  totals: z.record(z.number()).describe('Final weighted scores per participant.'),
  coherence: z.object({
    score: z.number().describe('Semantic coherence between participants (0–100).'),
    rating: z.string().describe('Descriptive rating.')
  })
});
export type DebateAnalysisOutput = z.infer<typeof DebateAnalysisOutputSchema>;

// ----------- AI Fallback Prompt -----------

const debateAnalysisPrompt = `
You are a **professional debate evaluator**.
Analyze the provided arguments and return a structured evaluation.

### Scoring Rubric:
- **Sentiment**: Tone and positivity vs negativity (0–100).
- **Clarity**: Readability, filler words, structure (0–100).
- **Vocabulary Richness**: Diversity of vocabulary used (0–100).
- **Average Word Length**: Proxy for complexity of language (0–100).
- **Coherence**: Semantic similarity between debaters (0–100).

### Rules:
1. Assign descriptive scores (0–100) for each metric, per participant.
2. Compute **weighted totals**:
   - Clarity (30%)
   - Sentiment (30%)
   - Vocabulary Richness (20%)
   - Avg Word Length (10%)
   - Coherence (10%)
3. The participant with the highest weighted score is the **winner**.
4. Strictly return JSON in the required schema — no extra commentary.

Arguments: {{arguments}}
`;

// ----------- Flow with ML Fallback -----------

const debateAnalysisFlow = ai.defineFlow(
  'debateAnalysisFlow',
  async (input: DebateAnalysisInput) => {
    try {
      // Try ML-based evaluation first (your Python service)
      const mlResult = await fetch(`${process.env.DEBATE_ML_URL}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ arguments: input.arguments }),
        // Note: fetch doesn't support timeout directly in Node.js, would need AbortController
      });

      if (mlResult.ok) {
        const data = await mlResult.json();
        console.log('✅ ML evaluation successful');
        return data as DebateAnalysisOutput;
      }

      console.warn('⚠️ ML evaluation failed, falling back to AI flow...');
    } catch (err) {
      console.warn('⚠️ ML service unavailable, falling back to AI flow...', err);
    }

    // 🔄 Step 2: AI fallback with Genkit
    try {
      console.log('🤖 Attempting AI analysis with Genkit...');
      
      const argumentsString = input.arguments
        .map(arg => `**${arg.username}**: ${arg.argumentText}`)
        .join('\n\n');
      
      const promptText = debateAnalysisPrompt.replace('{{arguments}}', argumentsString);
      
      const response = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        prompt: promptText,
        output: {
          schema: DebateAnalysisOutputSchema
        }
      });

      if (response.output) {
        console.log('✅ AI analysis successful');
        return {
          ...response.output,
          analysisSource: 'ai'
        };
      }
    } catch (aiError) {
      console.error('❌ AI analysis failed:', aiError);
    }

    // 🔄 Step 3: Basic fallback scoring
    console.log('📊 Using basic fallback scoring');
    
    // Generate participant scores in the expected format
    const participantScores: Record<string, any> = {};
    const totals: Record<string, number> = {};
    
    input.arguments.forEach((arg, index) => {
      const sentimentScore = 70 + Math.random() * 20; // 70-90
      const clarityScore = 65 + Math.random() * 25;   // 65-90
      const vocabScore = 60 + Math.random() * 30;     // 60-90
      const wordLenScore = 70 + Math.random() * 20;   // 70-90
      
      // Calculate weighted total (matching expected weights)
      const weightedTotal = (clarityScore * 0.3) + (sentimentScore * 0.3) + 
                           (vocabScore * 0.2) + (wordLenScore * 0.1) + 
                           (75 * 0.1); // coherence baseline
      
      participantScores[arg.username] = {
        sentiment: {
          score: sentimentScore,
          rating: sentimentScore >= 80 ? "Excellent" : sentimentScore >= 60 ? "Good" : "Poor"
        },
        clarity: {
          score: clarityScore,
          rating: clarityScore >= 80 ? "Excellent" : clarityScore >= 60 ? "Good" : "Poor"
        },
        vocab_richness: {
          score: vocabScore,
          rating: vocabScore >= 80 ? "Excellent" : vocabScore >= 60 ? "Good" : "Poor"
        },
        avg_word_len: {
          score: wordLenScore,
          rating: wordLenScore >= 80 ? "Excellent" : wordLenScore >= 60 ? "Good" : "Poor"
        }
      };
      
      totals[arg.username] = weightedTotal;
    });

    // Determine winner
    const winner = Object.entries(totals).reduce((prev, current) => 
      current[1] > prev[1] ? current : prev
    )[0];

    return {
      winner,
      scores: participantScores,
      totals,
      coherence: {
        score: 75 + Math.random() * 15, // 75-90
        rating: "Good"
      },
      analysisSource: 'fallback'
    };
  }
);

export async function analyzeDebate(input: DebateAnalysisInput): Promise<DebateAnalysisOutput> {
  return debateAnalysisFlow(input);
}