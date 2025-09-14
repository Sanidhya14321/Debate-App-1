/**
 * @fileOverview Test script for Gemini AI integration
 * Run this to verify the Gemini AI service is working properly
 */

import geminiService from './services/geminiService.js';
import dotenv from 'dotenv';
dotenv.config();

async function testGeminiIntegration() {
  console.log('🧪 Testing Gemini AI Integration...\n');

  // Test 1: Check if service is available
  console.log('1. Service Availability Test:');
  console.log('   Is Available:', geminiService.isAvailable());
  console.log('   API Key configured:', process.env.GOOGLE_AI_API_KEY ? 'Yes' : 'No');
  console.log('   API Key (first 10 chars):', process.env.GOOGLE_AI_API_KEY?.substring(0, 10) + '...');
  
  // Debug: Check the actual service state
  console.log('   Service API Key:', geminiService.apiKey ? geminiService.apiKey.substring(0, 10) + '...' : 'Not set');
  console.log('   Service Initialized:', geminiService.isInitialized);
  console.log('');

  if (!geminiService.isAvailable()) {
    console.log('❌ Gemini service not available. Check API key configuration.');
    return;
  }

  // Test 2: Description Generation
  console.log('2. Description Generation Test:');
  try {
    const topic = "Should artificial intelligence be regulated by government?";
    console.log('   Topic:', topic);
    const description = await geminiService.generateDebateDescription(topic);
    console.log('   Generated Description:', description);
    console.log('   ✅ Description generation successful');
  } catch (error) {
    console.log('   ❌ Description generation failed:', error.message);
  }
  console.log('');

  // Test 3: Argument Analysis
  console.log('3. Argument Analysis Test:');
  try {
    const argument = "AI regulation is crucial because it prevents potential misuse and ensures ethical development. Studies show that unregulated AI can lead to bias and discrimination.";
    const topic = "Should artificial intelligence be regulated by government?";
    
    console.log('   Argument:', argument.substring(0, 50) + '...');
    const analysis = await geminiService.analyzeArgument(argument, topic);
    console.log('   Analysis Result:');
    console.log('     - Scores:', analysis.scores);
    console.log('     - Total:', analysis.total);
    console.log('     - Strengths:', analysis.analysis.strengths);
    console.log('     - Feedback:', analysis.analysis.feedback);
    console.log('   ✅ Argument analysis successful');
  } catch (error) {
    console.log('   ❌ Argument analysis failed:', error.message);
  }
  console.log('');

  // Test 4: Full Debate Analysis
  console.log('4. Debate Analysis Test:');
  try {
    const mockArguments = [
      { username: 'Alice', content: 'AI regulation is essential for preventing misuse and ensuring ethical development of artificial intelligence systems.' },
      { username: 'Bob', content: 'AI regulation would stifle innovation and prevent the beneficial advancement of technology that could solve many problems.' },
      { username: 'Alice', content: 'Regulation does not mean stopping innovation, it means ensuring responsible development with proper oversight.' }
    ];
    const topic = "Should artificial intelligence be regulated by government?";
    
    console.log('   Arguments count:', mockArguments.length);
    const debateAnalysis = await geminiService.analyzeDebate(mockArguments, topic);
    console.log('   Debate Analysis Result:');
    console.log('     - Winner:', debateAnalysis.winner);
    console.log('     - Analysis Source:', debateAnalysis.analysisSource);
    console.log('     - Participants:', Object.keys(debateAnalysis.results));
    
    for (const [participant, data] of Object.entries(debateAnalysis.results)) {
      console.log(`     - ${participant}: Total Score ${data.total}, Args: ${data.argumentCount}`);
    }
    console.log('   ✅ Debate analysis successful');
  } catch (error) {
    console.log('   ❌ Debate analysis failed:', error.message);
  }

  console.log('\n🎉 Gemini AI Integration test completed!');
}

// Run the test
testGeminiIntegration().catch(console.error);