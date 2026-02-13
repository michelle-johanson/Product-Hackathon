// Test script to check your Google Gemini API key and list available models
// Run this with: node test-gemini-key.js
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Replace this with your actual API key from .env
const API_KEY = 'AIzaSyD0vRnukwP1kWacsW_AE5Sez4UI9ABdwO8';

console.log('🔍 Testing Google Gemini API Key...\n');
console.log('API Key (first 10 chars):', API_KEY.substring(0, 10) + '...\n');

const genAI = new GoogleGenerativeAI(API_KEY);

async function testAPI() {
  try {
    console.log('📋 Attempting to list available models...\n');
    
    // Try to list models
    const models = await genAI.listModels();
    
    console.log('✅ SUCCESS! Your API key is valid.\n');
    console.log('Available models:');
    console.log('─'.repeat(60));
    
    for await (const model of models) {
      console.log(`\n📦 Model: ${model.name}`);
      console.log(`   Display Name: ${model.displayName}`);
      console.log(`   Description: ${model.description}`);
      
      if (model.supportedGenerationMethods) {
        console.log(`   Supported Methods: ${model.supportedGenerationMethods.join(', ')}`);
      }
    }
    
    console.log('\n' + '─'.repeat(60));
    console.log('\n💡 Try using one of the model names above in your chat.js file!');
    console.log('   Example: model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });\n');
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('\nFull error:', error);
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure your API key is correct');
    console.log('2. Verify the key is from https://aistudio.google.com/app/apikey');
    console.log('3. Check if you need to accept Terms of Service in Google AI Studio');
    console.log('4. Try creating a new API key\n');
  }
}

// Also try a simple generation test
async function testGeneration() {
  console.log('\n\n🧪 Testing content generation...\n');
  
  try {
    // Try the most common model names
    const modelNames = [
      'gemini-1.5-flash',
      'gemini-pro',
      'models/gemini-1.5-flash',
      'models/gemini-pro'
    ];
    
    for (const modelName of modelNames) {
      try {
        console.log(`Trying model: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say "Hello"');
        const response = await result.response;
        const text = response.text();
        
        console.log(`✅ SUCCESS with ${modelName}!`);
        console.log(`   Response: ${text}\n`);
        
        console.log(`\n🎉 USE THIS MODEL IN YOUR CHAT.JS:`);
        console.log(`   model = genAI.getGenerativeModel({ model: '${modelName}' });\n`);
        return; // Stop after first success
        
      } catch (err) {
        console.log(`❌ ${modelName} failed: ${err.message}\n`);
      }
    }
    
    console.log('❌ None of the common models worked. Check the model list above.\n');
    
  } catch (error) {
    console.error('❌ Generation test failed:', error.message);
  }
}

// Run the tests
async function runAllTests() {
  await testAPI();
  await testGeneration();
}

runAllTests();