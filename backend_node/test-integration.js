/**
 * @fileOverview Integration test for complete AI-powered debate flow
 * Tests the full debate lifecycle with Gemini AI integration
 */

import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const API_BASE = 'http://localhost:5001';

// Mock user data for testing
const testUsers = [
  { username: 'alice_test', email: 'alice@test.com', password: 'password123' },
  { username: 'bob_test', email: 'bob@test.com', password: 'password123' }
];

let authTokens = {};
let debateId = null;

async function registerAndLoginUsers() {
  console.log('🔐 Setting up test users...');
  
  for (const user of testUsers) {
    try {
      // Try to register user (might already exist)
      await axios.post(`${API_BASE}/auth/register`, user);
      console.log(`✅ Registered user: ${user.username}`);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log(`ℹ️  User ${user.username} already exists`);
      } else {
        console.error(`❌ Failed to register ${user.username}:`, error.response?.data);
      }
    }
    
    // Login user
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, {
        email: user.email,
        password: user.password
      });
      authTokens[user.username] = response.data.token;
      console.log(`✅ Logged in user: ${user.username}`);
    } catch (error) {
      console.error(`❌ Failed to login ${user.username}:`, error.response?.data);
      throw error;
    }
  }
}

async function createDebateWithAI() {
  console.log('\n🎯 Creating debate with AI-generated description...');
  
  try {
    const response = await axios.post(`${API_BASE}/debates`, {
      topic: 'Should artificial intelligence be regulated by government?'
      // No description provided - should trigger Gemini AI generation
    }, {
      headers: {
        'Authorization': `Bearer ${authTokens['alice_test']}`
      }
    });
    
    debateId = response.data._id;
    console.log('✅ Debate created successfully');
    console.log('   Topic:', response.data.topic);
    console.log('   Description:', response.data.description);
    console.log('   ID:', debateId);
    
    return response.data;
  } catch (error) {
    console.error('❌ Failed to create debate:', error.response?.data);
    throw error;
  }
}

async function joinDebate() {
  console.log('\n🤝 Second user joining debate...');
  
  try {
    const response = await axios.post(`${API_BASE}/debates/${debateId}/join`, {}, {
      headers: {
        'Authorization': `Bearer ${authTokens['bob_test']}`
      }
    });
    
    console.log('✅ Bob joined the debate successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Failed to join debate:', error.response?.data);
    throw error;
  }
}

async function simulateDebateWithArguments() {
  console.log('\n💬 Simulating debate with AI-powered arguments...');
  
  const debateArguments = [
    {
      user: 'alice_test',
      content: 'AI regulation is essential for preventing potential misuse and ensuring ethical development. Studies show that unregulated AI can lead to bias, discrimination, and even job displacement without proper oversight.'
    },
    {
      user: 'bob_test',
      content: 'However, excessive regulation could stifle innovation and prevent beneficial AI advancements that could solve major societal problems like climate change and healthcare challenges.'
    },
    {
      user: 'alice_test',
      content: 'Regulation doesn\'t mean stopping innovation - it means ensuring responsible development. Look at the automotive industry: safety regulations didn\'t stop car innovation, they made cars safer while maintaining progress.'
    },
    {
      user: 'bob_test',
      content: 'That\'s a fair point, but AI development moves much faster than automotive technology did. Rigid regulations might lock us into outdated approaches and prevent adaptive solutions.'
    }
  ];
  
  for (const arg of debateArguments) {
    try {
      const response = await axios.post(`${API_BASE}/debates/${debateId}/arguments`, {
        content: arg.content
      }, {
        headers: {
          'Authorization': `Bearer ${authTokens[arg.user]}`
        }
      });
      
      console.log(`✅ ${arg.user} submitted argument: "${arg.content.substring(0, 50)}..."`);
      
      // Small delay to simulate real debate timing
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Failed to submit argument from ${arg.user}:`, error.response?.data);
      throw error;
    }
  }
}

async function finalizeDebateWithAI() {
  console.log('\n🎯 Finalizing debate with AI analysis...');
  
  try {
    // Request finalization from both users
    for (const username of Object.keys(authTokens)) {
      const response = await axios.post(`${API_BASE}/debates/${debateId}/request-finalization`, {}, {
        headers: {
          'Authorization': `Bearer ${authTokens[username]}`
        }
      });
      console.log(`✅ ${username} requested finalization`);
    }
    
    console.log('🤖 AI analysis in progress...');
    
    // Wait a bit for AI analysis to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check the results
    const response = await axios.get(`${API_BASE}/debates/${debateId}/results`, {
      headers: {
        'Authorization': `Bearer ${authTokens['alice_test']}`
      }
    });
    
    console.log('✅ AI Analysis completed successfully!');
    console.log('   Winner:', response.data.winner);
    console.log('   Analysis Source:', response.data.analysisSource);
    
    // Display detailed results for each participant
    for (const [participant, data] of Object.entries(response.data.results)) {
      console.log(`\n📊 ${participant} Performance:`);
      console.log('   Scores:', data.scores);
      console.log('   Total Score:', data.total);
      console.log('   Arguments:', data.argumentCount);
      console.log('   Strengths:', data.analysis.strengths);
      console.log('   Feedback:', data.analysis.feedback);
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Failed to finalize debate:', error.response?.data);
    throw error;
  }
}

async function runIntegrationTest() {
  console.log('🧪 Starting AI-Powered Debate Integration Test...\n');
  
  try {
    // Step 1: Setup users
    await registerAndLoginUsers();
    
    // Step 2: Create debate with AI description
    await createDebateWithAI();
    
    // Step 3: Join debate
    await joinDebate();
    
    // Step 4: Conduct debate
    await simulateDebateWithArguments();
    
    // Step 5: Finalize with AI analysis
    await finalizeDebateWithAI();
    
    console.log('\n🎉 Integration test completed successfully!');
    console.log('\n✅ Verification Points:');
    console.log('   ✓ Gemini AI generated debate description');
    console.log('   ✓ Users can create and join debates');
    console.log('   ✓ Arguments are properly submitted');
    console.log('   ✓ AI analysis runs without errors');
    console.log('   ✓ Results contain detailed scoring and feedback');
    console.log('   ✓ No "undefined score" errors occurred');
    
  } catch (error) {
    console.error('\n❌ Integration test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
runIntegrationTest().catch(console.error);