/**
 * @fileOverview ML-First Debate Analysis Service
 * 
 * This service integrates with the frontend ML judge flow,
 * providing ML-first analysis with AI and heuristic fallbacks.
 */

import axios from 'axios';

class MLAnalysisService {
  constructor() {
    this.mlApiUrl = process.env.ML_API_URL || 'https://sanidhya14321-debate-app-ml.hf.space';
    this.frontendUrl = process.env.FRONTEND_URL || 'https://debate-app-1.vercel.app';
  }

  /**
   * Analyze debate using ML-first approach
   */
  async analyzeDebate(argumentsArray, topic) {
    console.log('🔬 Starting ML-first debate analysis...');
    
    // Transform arguments to match the ML judge schema
    const transformedInput = {
      arguments: argumentsArray.map(arg => ({
        username: arg.username,
        argumentText: arg.content
      }))
    };

    // Step 1: Try ML API directly
    try {
      console.log('🤖 Attempting ML API analysis...');
      const mlResponse = await this.callMLAPI(transformedInput);
      if (mlResponse) {
        console.log('✅ ML analysis successful');
        return this.transformMLResponse(mlResponse, argumentsArray, topic);
      }
    } catch (error) {
      console.warn('⚠️ ML API failed:', error.message);
    }

    // Step 2: Try Gemini AI analysis
    try {
      console.log('🧠 Attempting Gemini AI analysis...');
      const aiResponse = await this.callGeminiAnalysis(transformedInput);
      if (aiResponse) {
        console.log('✅ Gemini AI analysis successful');
        return this.transformAIResponse(aiResponse, argumentsArray, topic);
      }
    } catch (error) {
      console.warn('⚠️ Gemini AI failed:', error.message);
    }

    // Step 3: Fallback to heuristic analysis
    console.log('📊 Using heuristic fallback analysis...');
    return this.performHeuristicAnalysis(argumentsArray, topic);
  }

  /**
   * Call the ML API directly
   */
  async callMLAPI(input) {
    const response = await axios.post(`${this.mlApiUrl}/finalize`, input, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200) {
      return response.data;
    }
    
    throw new Error(`ML API returned status ${response.status}`);
  }

  /**
   * Call Gemini AI for analysis
   */
  async callGeminiAnalysis(input) {
    // This would call our Gemini service directly
    const { default: geminiService } = await import('./geminiService.js');
    
    if (!geminiService.isAvailable()) {
      throw new Error('Gemini service not available');
    }

    // Transform input for Gemini
    const argumentsArray = input.arguments.map(arg => ({
      username: arg.username,
      content: arg.argumentText
    }));

    return await geminiService.analyzeDebate(argumentsArray, 'Debate Topic');
  }

  /**
   * Transform ML API response to our expected format
   */
  transformMLResponse(mlResponse, originalArgs, topic) {
    const usernames = [...new Set(originalArgs.map(arg => arg.username))];
    const results = {};

    // Transform ML scores to our format
    for (const username of usernames) {
      const userScore = mlResponse.scores?.[username] || mlResponse.totals?.[username];
      
      results[username] = {
        scores: {
          coherence: mlResponse.scores?.[username]?.clarity?.score || 75,
          evidence: mlResponse.scores?.[username]?.sentiment?.score || 70,
          logic: mlResponse.scores?.[username]?.vocab_richness?.score || 65,
          persuasiveness: mlResponse.scores?.[username]?.avg_word_len?.score || 70
        },
        total: mlResponse.totals?.[username] || 70,
        argumentCount: originalArgs.filter(arg => arg.username === username).length,
        averageLength: this.calculateAverageLength(originalArgs, username),
        analysis: {
          strengths: this.generateStrengths(mlResponse.scores?.[username]),
          weaknesses: this.generateWeaknesses(mlResponse.scores?.[username]),
          feedback: `ML-powered analysis for ${username}`
        }
      };
    }

    return {
      results,
      winner: mlResponse.winner || usernames[0],
      analysisSource: 'ml',
      finalizedAt: new Date(),
      topic
    };
  }

  /**
   * Transform AI response to our expected format
   */
  transformAIResponse(aiResponse, originalArgs, topic) {
    const usernames = [...new Set(originalArgs.map(arg => arg.username))];
    const results = {};

    for (const username of usernames) {
      const userResult = aiResponse.results?.[username];
      
      results[username] = {
        scores: userResult?.scores || {
          coherence: 75,
          evidence: 70,
          logic: 65,
          persuasiveness: 70
        },
        total: userResult?.total || 70,
        argumentCount: originalArgs.filter(arg => arg.username === username).length,
        averageLength: this.calculateAverageLength(originalArgs, username),
        analysis: userResult?.analysis || {
          strengths: ['AI-powered analysis'],
          weaknesses: ['Could improve engagement'],
          feedback: `AI analysis for ${username}`
        }
      };
    }

    return {
      results,
      winner: aiResponse.winner || usernames[0],
      analysisSource: 'ai',
      finalizedAt: new Date(),
      topic
    };
  }

  /**
   * Perform heuristic analysis as final fallback
   */
  performHeuristicAnalysis(argumentsArray, topic) {
    console.log('📊 Performing heuristic analysis...');
    
    const usernames = [...new Set(argumentsArray.map(arg => arg.username))];
    const results = {};

    for (const username of usernames) {
      const userArgs = argumentsArray.filter(arg => arg.username === username);
      const totalLength = userArgs.reduce((sum, arg) => sum + (arg.content?.length || 0), 0);
      const argCount = userArgs.length;
      
      // Heuristic scoring based on participation and engagement
      const coherence = Math.min(100, 60 + argCount * 10 + Math.random() * 20);
      const evidence = Math.min(100, 50 + (totalLength / 100) + Math.random() * 25);
      const logic = Math.min(100, 55 + argCount * 8 + Math.random() * 20);
      const persuasiveness = Math.min(100, 50 + (totalLength / 80) + Math.random() * 30);
      
      const total = Math.round((coherence + evidence + logic + persuasiveness) / 4);
      
      results[username] = {
        scores: {
          coherence: Math.round(coherence),
          evidence: Math.round(evidence), 
          logic: Math.round(logic),
          persuasiveness: Math.round(persuasiveness)
        },
        total,
        argumentCount: argCount,
        averageLength: Math.round(totalLength / argCount) || 0,
        analysis: {
          strengths: this.generateHeuristicStrengths(coherence, evidence, logic, persuasiveness),
          weaknesses: this.generateHeuristicWeaknesses(coherence, evidence, logic, persuasiveness),
          feedback: this.generateHeuristicFeedback(total)
        }
      };
    }

    // Determine winner
    const winner = Object.entries(results).reduce((prev, current) => 
      current[1].total > prev[1].total ? current : prev
    )[0];

    return {
      results,
      winner,
      analysisSource: 'heuristic',
      finalizedAt: new Date(),
      topic
    };
  }

  /**
   * Helper methods
   */
  calculateAverageLength(args, username) {
    const userArgs = args.filter(arg => arg.username === username);
    const totalLength = userArgs.reduce((sum, arg) => sum + (arg.content?.length || 0), 0);
    return Math.round(totalLength / userArgs.length) || 0;
  }

  generateStrengths(scores) {
    const strengths = [];
    if (scores?.clarity?.score >= 80) strengths.push("Excellent clarity in arguments");
    if (scores?.sentiment?.score >= 80) strengths.push("Strong emotional appeal");
    if (scores?.vocab_richness?.score >= 80) strengths.push("Rich vocabulary usage");
    return strengths.length ? strengths : ["Active participation in debate"];
  }

  generateWeaknesses(scores) {
    const weaknesses = [];
    if (scores?.clarity?.score < 60) weaknesses.push("Could improve argument clarity");
    if (scores?.sentiment?.score < 60) weaknesses.push("Could strengthen emotional connection");
    return weaknesses.length ? weaknesses : ["Minor areas for improvement"];
  }

  generateHeuristicStrengths(coherence, evidence, logic, persuasiveness) {
    const strengths = [];
    if (coherence >= 75) strengths.push("Well-structured arguments");
    if (evidence >= 75) strengths.push("Good use of supporting evidence");
    if (logic >= 75) strengths.push("Strong logical reasoning");
    if (persuasiveness >= 75) strengths.push("Compelling presentation");
    return strengths.length ? strengths : ["Active engagement"];
  }

  generateHeuristicWeaknesses(coherence, evidence, logic, persuasiveness) {
    const weaknesses = [];
    if (coherence < 60) weaknesses.push("Could improve argument structure");
    if (evidence < 60) weaknesses.push("Would benefit from more evidence");
    if (logic < 60) weaknesses.push("Logical flow could be stronger");
    return weaknesses.length ? weaknesses : ["Room for minor improvements"];
  }

  generateHeuristicFeedback(score) {
    if (score >= 85) return "Excellent performance with strong arguments";
    if (score >= 70) return "Good debate performance with solid points";
    if (score >= 55) return "Decent arguments with room for improvement";
    return "Consider strengthening argument structure and evidence";
  }
}

// Export singleton instance
const mlAnalysisService = new MLAnalysisService();
export default mlAnalysisService;