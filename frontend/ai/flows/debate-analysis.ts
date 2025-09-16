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
      argumentText: z.string().describe('The argument text from this debater.'),
      content: z.string().optional().describe('Alternative field name for argument text.'),
      timestamp: z.string().optional().describe('When the argument was made.'),
      userId: z.string().optional().describe('User ID of the debater.')
    })
  ).min(2).describe('List of arguments made by participants, in order.'),
  topic: z.string().optional().describe('The debate topic for context.')
});
export type DebateAnalysisInput = z.infer<typeof DebateAnalysisInputSchema>;

const DebateAnalysisOutputSchema = z.object({
  winner: z.string().describe('Username of the winner.'),
  results: z.record(
    z.object({
      scores: z.object({
        sentiment: z.object({ score: z.number(), rating: z.string() }),
        clarity: z.object({ score: z.number(), rating: z.string() }),
        vocab_richness: z.object({ score: z.number(), rating: z.string() }),
        avg_word_len: z.object({ score: z.number(), rating: z.string() }),
        coherence: z.number().optional(),
        evidence: z.number().optional(),
        logic: z.number().optional(),
        persuasiveness: z.number().optional()
      }),
      total: z.number(),
      argumentCount: z.number(),
      averageLength: z.number(),
      analysis: z.object({
        strengths: z.array(z.string()),
        weaknesses: z.array(z.string()),
        feedback: z.string()
      })
    })
  ),
  analysisSource: z.enum(['ml', 'ai', 'enhanced_local', 'fallback']).optional(),
  finalizedAt: z.date().optional()
});
export type DebateAnalysisOutput = z.infer<typeof DebateAnalysisOutputSchema>;

// ----------- Enhanced Analysis Functions -----------

const calculateCoherence = (text: string): number => {
  const flowWords = ['because', 'therefore', 'however', 'furthermore', 'additionally', 'consequently'];
  const flowCount = flowWords.filter(word => text.toLowerCase().includes(word)).length;
  
  let score = 60 + (flowCount * 5);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  if (sentences.length > 2) score += 10;
  
  return Math.min(100, Math.max(30, score));
};

const calculateEvidence = (text: string): number => {
  const evidenceWords = ['study', 'research', 'data', 'statistics', 'evidence', 'survey', 'report'];
  const evidenceCount = evidenceWords.filter(word => text.toLowerCase().includes(word)).length;
  
  let score = 50 + (evidenceCount * 10);
  if (/\d+%|\d+\.\d+%/.test(text)) score += 15;
  if (/according to|studies show|research indicates/.test(text.toLowerCase())) score += 20;
  
  return Math.min(100, Math.max(20, score));
};

const calculateLogic = (text: string): number => {
  const logicalWords = ['if', 'then', 'because', 'since', 'given that', 'assuming'];
  const logicalCount = logicalWords.filter(word => text.toLowerCase().includes(word)).length;
  
  let score = 55 + (logicalCount * 8);
  if (/however|although|despite|while/.test(text.toLowerCase())) score += 15;
  
  return Math.min(100, Math.max(25, score));
};

const calculatePersuasiveness = (text: string, topic?: string): number => {
  const persuasiveWords = ['should', 'must', 'important', 'crucial', 'essential', 'urgent'];
  const persuasiveCount = persuasiveWords.filter(word => text.toLowerCase().includes(word)).length;
  
  let score = 50 + (persuasiveCount * 7);
  if (/significant|critical|vital|devastating|beneficial/.test(text.toLowerCase())) score += 10;
  if (topic && text.toLowerCase().includes(topic.toLowerCase().split(' ')[0])) score += 15;
  
  return Math.min(100, Math.max(30, score));
};

const generateStrengths = (coherence: number, evidence: number, logic: number, persuasiveness: number): string[] => {
  const strengths = [];
  if (coherence >= 70) strengths.push("Clear and coherent arguments");
  if (evidence >= 70) strengths.push("Strong supporting evidence");
  if (logic >= 70) strengths.push("Sound logical reasoning");
  if (persuasiveness >= 70) strengths.push("Compelling and persuasive");
  
  if (strengths.length === 0) strengths.push("Shows engagement in the debate");
  return strengths;
};

const generateWeaknesses = (coherence: number, evidence: number, logic: number, persuasiveness: number): string[] => {
  const weaknesses = [];
  if (coherence < 60) weaknesses.push("Could improve logical flow between points");
  if (evidence < 60) weaknesses.push("Would benefit from more supporting evidence");
  if (logic < 60) weaknesses.push("Logical reasoning could be strengthened");
  if (persuasiveness < 60) weaknesses.push("Arguments could be more compelling");
  
  return weaknesses;
};

const generateFeedback = (score: number): string => {
  if (score >= 85) return "Excellent argumentation with strong logical structure and evidence";
  if (score >= 70) return "Good arguments with room for minor improvements";
  if (score >= 55) return "Decent arguments that could benefit from better structure or evidence";
  return "Arguments need significant improvement in logic, evidence, or structure";
};

const analyzeUserArguments = (userArgs: any[], topic?: string) => {
  const argTexts = userArgs.map(arg => arg.argumentText || arg.content || '').join(' ');
  
  const coherenceScore = calculateCoherence(argTexts);
  const evidenceScore = calculateEvidence(argTexts);
  const logicScore = calculateLogic(argTexts);
  const persuasivenessScore = calculatePersuasiveness(argTexts, topic);
  
  const total = Math.round((coherenceScore + evidenceScore + logicScore + persuasivenessScore) / 4);
  
  return {
    scores: {
      sentiment: { score: persuasivenessScore, rating: rateScore(persuasivenessScore) },
      clarity: { score: coherenceScore, rating: rateScore(coherenceScore) },
      vocab_richness: { score: evidenceScore, rating: rateScore(evidenceScore) },
      avg_word_len: { score: logicScore, rating: rateScore(logicScore) },
      coherence: coherenceScore,
      evidence: evidenceScore,
      logic: logicScore,
      persuasiveness: persuasivenessScore
    },
    total,
    argumentCount: userArgs.length,
    averageLength: Math.round(argTexts.length / userArgs.length) || 0,
    analysis: {
      strengths: generateStrengths(coherenceScore, evidenceScore, logicScore, persuasivenessScore),
      weaknesses: generateWeaknesses(coherenceScore, evidenceScore, logicScore, persuasivenessScore),
      feedback: generateFeedback(total)
    }
  };
};

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

const debateAnalysisFlow = ai.defineFlow(
  'debateAnalysisFlow',
  async (input: DebateAnalysisInput): Promise<DebateAnalysisOutput> => {
    // Normalize input arguments
    const normalizedArgs = input.arguments.map(arg => ({
      username: arg.username,
      argumentText: arg.argumentText || arg.content || '',
      content: arg.content || arg.argumentText || '',
      timestamp: arg.timestamp,
      userId: arg.userId
    }));

    // --- Step 1: ML API ---
    try {
      const mlResult = await withTimeout(
        fetch(`${process.env.DEBATE_ML_URL}/finalize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ arguments: normalizedArgs, topic: input.topic }),
        }),
        5000
      );
      if (mlResult.ok) {
        const result = await mlResult.json();
        console.log('✅ ML evaluation');
        return {
          ...result,
          analysisSource: 'ml' as const,
          finalizedAt: new Date()
        };
      }
      console.warn('⚠️ ML evaluation failed');
    } catch (err) {
      console.warn('⚠️ ML service unavailable:', err);
    }

    // --- Step 2: AI Fallback ---
    try {
      const argsString = normalizedArgs
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
        return {
          ...response.output,
          analysisSource: 'ai' as const,
          finalizedAt: new Date()
        };
      }
    } catch (err) {
      console.error('❌ AI evaluation failed:', err);
    }

    // --- Step 3: Enhanced Local Analysis ---
    console.log('📊 Using enhanced local analysis');
    const usernames = [...new Set(normalizedArgs.map(arg => arg.username))];
    const results: Record<string, any> = {};

    for (const username of usernames) {
      const userArgs = normalizedArgs.filter(arg => arg.username === username);
      results[username] = analyzeUserArguments(userArgs, input.topic);
    }

    // Determine winner
    const winner = Object.entries(results).reduce((prev, current) => 
      current[1].total > prev[1].total ? current : prev
    )[0];

    return {
      winner,
      results,
      analysisSource: 'enhanced_local' as const,
      finalizedAt: new Date()
    };
  }
);

export async function analyzeDebate(input: DebateAnalysisInput) {
  return debateAnalysisFlow(input);
}

// Export for backend Node.js usage
export async function analyzeDebateForBackend(argumentsArray: any[], topic?: string) {
  // Convert backend format to our expected format
  const normalizedInput: DebateAnalysisInput = {
    arguments: argumentsArray.map(arg => ({
      username: arg.username,
      argumentText: arg.content || arg.argumentText || '',
      content: arg.content,
      timestamp: arg.timestamp,
      userId: arg.userId
    })),
    topic
  };

  const result = await analyzeDebate(normalizedInput);
  
  // Convert result to backend expected format
  return {
    results: result.results,
    winner: result.winner,
    analysisSource: result.analysisSource || 'enhanced_local',
    finalizedAt: result.finalizedAt || new Date()
  };
}
