/**
 * @fileOverview Gemini AI Service for real-time debate analysis
 * 
 * This service provides debate analysis using Google's Gemini AI API
 * with proper error handling and fallback mechanisms.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.isInitialized = false;
    // Don't initialize immediately, wait for first use
  }

  get apiKey() {
    return process.env.GOOGLE_AI_API_KEY;
  }

  initializeService() {
    if (this.isInitialized) return; // Already initialized

    try {
      if (!this.apiKey) {
        console.warn('⚠️ Gemini API key not configured. AI analysis will be limited.');
        return;
      }

      if (this.apiKey === 'your_gemini_api_key_here') {
        console.warn('⚠️ Please replace the placeholder Gemini API key with your actual key.');
        return;
      }

      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      this.isInitialized = true;
      console.log('✅ Gemini AI service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Gemini AI service:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Analyze individual argument using Gemini AI
   */
  async analyzeArgument(argumentText, debateTopic) {
    if (!this.isAvailable()) {
      throw new Error('Gemini AI service not initialized');
    }

    const prompt = `
    You are a professional debate evaluator. Analyze the following argument in the context of the debate topic and provide detailed scores.

    DEBATE TOPIC: "${debateTopic}"
    
    ARGUMENT TO ANALYZE: "${argumentText}"

    Please evaluate this argument on the following criteria and provide scores from 0-100:

    1. COHERENCE (0-100): How well-structured and logical is the argument?
    2. EVIDENCE (0-100): How well does the argument use facts, data, or examples?
    3. LOGIC (0-100): How sound is the reasoning and logical flow?
    4. PERSUASIVENESS (0-100): How compelling and convincing is the argument?
    5. TOPIC_RELEVANCE (0-100): How relevant is the argument to the debate topic?

    Also provide:
    - 2-3 key strengths of the argument
    - 2-3 areas for improvement
    - Brief feedback (1-2 sentences)
    - Overall rating (Excellent/Good/Fair/Poor)

    Respond in the following JSON format:
    {
      "scores": {
        "coherence": <number>,
        "evidence": <number>,
        "logic": <number>,
        "persuasiveness": <number>,
        "topicRelevance": <number>
      },
      "total": <number>,
      "analysis": {
        "strengths": ["strength1", "strength2"],
        "weaknesses": ["weakness1", "weakness2"],
        "feedback": "brief feedback",
        "rating": "Excellent/Good/Fair/Poor"
      }
    }
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from Gemini');
      }

      const analysis = JSON.parse(jsonMatch[0]);
      
      // Validate and sanitize the response
      return this.validateAnalysis(analysis);
    } catch (error) {
      console.error('❌ Gemini argument analysis failed:', error);
      throw error;
    }
  }

  /**
   * Analyze complete debate with all arguments
   */
  async analyzeDebate(argumentsArray, debateTopic) {
    if (!this.isAvailable()) {
      throw new Error('Gemini AI service not initialized');
    }

    // Group arguments by participant
    const participantArguments = {};
    argumentsArray.forEach(arg => {
      if (!participantArguments[arg.username]) {
        participantArguments[arg.username] = [];
      }
      participantArguments[arg.username].push(arg.content);
    });

    const participants = Object.keys(participantArguments);
    const formattedArguments = participants.map(participant => {
      return `**${participant}:**\n${participantArguments[participant].join('\n\n')}`;
    }).join('\n\n---\n\n');

    const prompt = `
    You are a professional debate judge. Analyze this debate and determine the winner based on argument quality.

    DEBATE TOPIC: "${debateTopic}"
    
    PARTICIPANTS AND THEIR ARGUMENTS:
    ${formattedArguments}

    For each participant, evaluate their overall performance on:
    1. COHERENCE (0-100): Overall logical structure and flow
    2. EVIDENCE (0-100): Use of facts, data, examples
    3. LOGIC (0-100): Sound reasoning and logical connections
    4. PERSUASIVENESS (0-100): Compelling and convincing presentation
    5. TOPIC_RELEVANCE (0-100): Relevance to the debate topic

    Also provide for each participant:
    - Argument count
    - Average argument length
    - Key strengths (2-3 points)
    - Areas for improvement (2-3 points)
    - Overall feedback

    Determine the winner based on overall performance.

    Respond in the following JSON format:
    {
      "results": {
        "participant1_name": {
          "scores": {
            "coherence": <number>,
            "evidence": <number>,
            "logic": <number>,
            "persuasiveness": <number>
          },
          "total": <number>,
          "argumentCount": <number>,
          "averageLength": <number>,
          "analysis": {
            "strengths": ["strength1", "strength2"],
            "weaknesses": ["weakness1", "weakness2"],
            "feedback": "detailed feedback"
          }
        },
        "participant2_name": { ... }
      },
      "winner": "participant_name",
      "analysisSource": "ai",
      "finalizedAt": "${new Date().toISOString()}"
    }
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from Gemini');
      }

      const analysis = JSON.parse(jsonMatch[0]);
      
      // Validate and sanitize the response
      return this.validateDebateAnalysis(analysis, participants);
    } catch (error) {
      console.error('❌ Gemini debate analysis failed:', error);
      throw error;
    }
  }

  /**
   * Generate debate description using Gemini AI
   */
  async generateDebateDescription(topic) {
    if (!this.isAvailable()) {
      throw new Error('Gemini AI service not initialized');
    }

    const prompt = `
    Generate a compelling and informative description for a debate with the following topic:

    TOPIC: "${topic}"

    The description should:
    - Be 2-3 sentences long
    - Explain what the debate is about
    - Highlight key aspects or perspectives to consider
    - Be engaging and informative
    - Maintain neutrality

    Respond with just the description text, no additional formatting.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const description = response.text().trim();
      
      // Clean up the response
      return description.replace(/^["']|["']$/g, ''); // Remove quotes if present
    } catch (error) {
      console.error('❌ Gemini description generation failed:', error);
      throw error;
    }
  }

  /**
   * Validate and sanitize analysis response
   */
  validateAnalysis(analysis) {
    const validated = {
      scores: {
        coherence: Math.min(100, Math.max(0, analysis.scores?.coherence || 50)),
        evidence: Math.min(100, Math.max(0, analysis.scores?.evidence || 50)),
        logic: Math.min(100, Math.max(0, analysis.scores?.logic || 50)),
        persuasiveness: Math.min(100, Math.max(0, analysis.scores?.persuasiveness || 50))
      },
      total: 0,
      analysis: {
        strengths: Array.isArray(analysis.analysis?.strengths) ? 
          analysis.analysis.strengths.slice(0, 3) : ['Good argument structure'],
        weaknesses: Array.isArray(analysis.analysis?.weaknesses) ? 
          analysis.analysis.weaknesses.slice(0, 3) : ['Could improve evidence'],
        feedback: analysis.analysis?.feedback || 'Solid argument with room for improvement'
      }
    };

    // Calculate total score
    const scores = Object.values(validated.scores);
    validated.total = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

    return validated;
  }

  /**
   * Validate and sanitize debate analysis response
   */
  validateDebateAnalysis(analysis, expectedParticipants) {
    const validated = {
      results: {},
      winner: analysis.winner || expectedParticipants[0],
      analysisSource: 'ai',
      finalizedAt: new Date()
    };

    // Validate each participant's results
    expectedParticipants.forEach(participant => {
      const participantData = analysis.results?.[participant];
      
      validated.results[participant] = {
        scores: {
          coherence: Math.min(100, Math.max(0, participantData?.scores?.coherence || 50)),
          evidence: Math.min(100, Math.max(0, participantData?.scores?.evidence || 50)),
          logic: Math.min(100, Math.max(0, participantData?.scores?.logic || 50)),
          persuasiveness: Math.min(100, Math.max(0, participantData?.scores?.persuasiveness || 50))
        },
        total: 0,
        argumentCount: participantData?.argumentCount || 1,
        averageLength: participantData?.averageLength || 100,
        analysis: {
          strengths: Array.isArray(participantData?.analysis?.strengths) ? 
            participantData.analysis.strengths.slice(0, 3) : ['Active participation'],
          weaknesses: Array.isArray(participantData?.analysis?.weaknesses) ? 
            participantData.analysis.weaknesses.slice(0, 3) : ['Could improve clarity'],
          feedback: participantData?.analysis?.feedback || 'Good debate performance'
        }
      };

      // Calculate total score
      const scores = Object.values(validated.results[participant].scores);
      validated.results[participant].total = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    });

    return validated;
  }

  /**
   * Check if service is available
   */
  isAvailable() {
    if (!this.isInitialized) {
      this.initializeService();
    }
    return this.isInitialized;
  }
}

// Export singleton instance
// Export singleton instance
const geminiServiceInstance = new GeminiService();
export default geminiServiceInstance;