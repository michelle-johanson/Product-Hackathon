const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Initialize Google Generative AI with better error handling
let model;
let apiKeyValid = false;
try {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ GOOGLE_GEMINI_API_KEY is not set in .env');
  } else {
    console.log('✅ Google Gemini API Key loaded');
    const genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    apiKeyValid = true;
  }
} catch (err) {
  console.error('❌ Error initializing Google Generative AI:', err.message);
}

// Demo response generator (for when API is unavailable)
function generateDemoResponse(question, noteContent, fileContents) {
  const relevantContent = [];

  // Find relevant content
  if (noteContent && noteContent.toLowerCase().includes(question.toLowerCase().split(' ')[0])) {
    relevantContent.push('Group Notes');
  }
  fileContents.forEach(f => {
    if (f.content.toLowerCase().includes(question.toLowerCase().split(' ')[0])) {
      relevantContent.push(`File: ${f.name}`);
    }
  });

  // Generate contextual demo response
  const demoResponses = {
    'what': 'Based on the class materials provided, this is a comprehensive answer synthesizing information from your notes and uploaded files. The AI uses your learning context to provide specific, relevant information tailored to your coursework.',
    'how': 'The process involves several key steps outlined in your class materials. Your notes and files contain detailed explanations that the AI integrates to provide you with a complete understanding of the topic.',
    'why': 'Understanding the reasoning behind concepts is crucial. According to your class materials, this happens because of the fundamental principles taught in your course.',
    'when': 'The timing and context are important here. As referenced in your notes, this typically occurs during specific circumstances relevant to your studies.',
    'which': 'There are several options to consider based on your materials. Each option has distinct characteristics explained in your uploaded resources.',
    'default': 'Based on your class notes and materials, here\'s a detailed explanation: The concepts you\'re asking about are thoroughly covered in your uploaded files. This response synthesizes that information with relevant context from your course.'
  };

  const firstWord = question.split(' ')[0].toLowerCase();
  const response = demoResponses[firstWord] || demoResponses['default'];

  return {
    answer: response,
    sources: relevantContent.length > 0 ? relevantContent : ['General Knowledge'],
    isDemoMode: true
  };
}

// Helper: Search for relevant content using simple keyword matching
function findRelevantContent(question, noteContent, fileContents) {
  const questionWords = question.toLowerCase().split(/\s+/).filter(w => w.length > 3);

  let results = [];

  // Search in notes
  if (noteContent) {
    const noteMatches = questionWords.filter(word => noteContent.toLowerCase().includes(word)).length;
    if (noteMatches > 0) {
      results.push({
        type: 'note',
        content: noteContent,
        relevanceScore: noteMatches,
        source: 'Group Notes'
      });
    }
  }

  // Search in files
  fileContents.forEach(file => {
    const fileMatches = questionWords.filter(word => file.content.toLowerCase().includes(word)).length;
    if (fileMatches > 0) {
      results.push({
        type: 'file',
        content: file.content,
        relevanceScore: fileMatches,
        source: `File: ${file.name}`
      });
    }
  });

  // Sort by relevance and limit to top 3 to stay under token limits
  results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  return results.slice(0, 3);
}

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { question, groupId } = req.body;

    if (!question || !groupId) {
      return res.status(400).json({ error: 'Question and groupId are required' });
    }

    // Check if user is a member of the group
    const isMember = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: parseInt(groupId), userId: req.user.id } }
    });

    if (!isMember) {
      return res.status(403).json({ error: 'Not a member of this group' });
    }

    // Fetch group notes
    const note = await prisma.note.findFirst({
      where: { groupId: parseInt(groupId) }
    });

    // Fetch group files
    const files = await prisma.file.findMany({
      where: { groupId: parseInt(groupId) },
      select: { name: true, content: true }
    });

    // Find relevant content
    const relevantContent = findRelevantContent(
      question,
      note?.content || '',
      files
    );

    // Build context for AI
    let context = 'Use the following class materials to answer the question:\n\n';
    let sources = [];

    relevantContent.forEach((item) => {
      sources.push(item.source);
      context += `[Source: ${item.source}]\n`;
      context += item.content.substring(0, 1500) + '\n\n'; // Limit each source to 1500 chars
    });

    if (relevantContent.length === 0) {
      context += 'Note: No specific materials found matching this question, answering based on general knowledge.\n\n';
    }

    context += `Question: ${question}`;

    // Call Google Gemini API with fallback to demo mode
    let aiResponse;
    let demoMode = false;

    try {
      if (model && apiKeyValid) {
        const result = await model.generateContent(context);
        aiResponse = result.response.text();
        console.log('✅ Using real Gemini API response');
      } else {
        throw new Error('Model not initialized');
      }
    } catch (apiErr) {
      console.warn('⚠️ Gemini API unavailable, falling back to demo mode:', apiErr.message);
      demoMode = true;

      // Generate demo response
      const demoData = generateDemoResponse(question, note?.content || '', files);
      aiResponse = demoData.answer;
      sources = demoData.sources;
      console.log('✅ Using demo mode response');
    }

    return res.json({
      answer: aiResponse,
      sources: sources.length > 0 ? sources : ['General Knowledge'],
      sourceCount: sources.length,
      demoMode: demoMode
    });

  } catch (err) {
    console.error('❌ Error in chat route:', err);
    return res.status(500).json({
      error: 'Failed to process question',
      details: err.message
    });
  }
});

module.exports = router;