// Test script to debug results issue
import mongoose from 'mongoose';
import Debate from './models/Debate.js';
import Result from './models/Result.js';

const MONGODB_URI = "mongodb+srv://vatssanidhya14321:U8YETFoSofvonwcu@cluster0.me96py1.mongodb.net/debate-app?retryWrites=true&w=majority";

async function testResults() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find any completed debates
    const completedDebates = await Debate.find({ 
      status: 'completed' 
    }).limit(5);
    
    console.log(`Found ${completedDebates.length} completed debates`);
    
    for (const debate of completedDebates) {
      console.log(`\n📋 Debate ${debate._id}:`);
      console.log(`  Status: ${debate.status}`);
      console.log(`  Has result: ${!!debate.result}`);
      
      if (debate.result) {
        console.log(`  Result structure keys: ${Object.keys(debate.result)}`);
        console.log(`  Winner: ${debate.result.winner}`);
        console.log(`  Has results field: ${!!debate.result.results}`);
        if (debate.result.results) {
          console.log(`  Participants: ${Object.keys(debate.result.results)}`);
        }
      }
      
      // Check Result collection
      const resultDoc = await Result.findOne({ debateId: debate._id.toString() });
      console.log(`  Result doc exists: ${!!resultDoc}`);
      if (resultDoc) {
        console.log(`  Result doc keys: ${Object.keys(resultDoc.toObject())}`);
        console.log(`  Result doc has results field: ${!!resultDoc.results}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

testResults();