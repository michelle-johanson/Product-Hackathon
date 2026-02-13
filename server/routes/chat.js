const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Initialize Google Generative AI
let model;
let apiKeyValid = false;
try {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GOOGLE_GEMINI_API_KEY is not set in .env');
  } else {
    console.log('Google Gemini API Key loaded');
    const genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    apiKeyValid = true;
  }
} catch (err) {
  console.error('Error initializing Google Generative AI:', err.message);
}

// Demo response generator (for when API is unavailable)
function generateDemoResponse(question) {
  return {
    answer: 'Demo Mode: The AI chatbot is not connected. Please add a valid GOOGLE_GEMINI_API_KEY to your .env file to enable real responses.',
    sources: ['Demo Mode'],
    isDemoMode: true
  };
}

// Max characters of context to send to the model
const MAX_CONTEXT_LENGTH = 30000;

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

    // Fetch ALL group notes
    const note = await prisma.note.findFirst({
      where: { groupId: parseInt(groupId) }
    });

    // Fetch ALL group files with their extracted text content
    const files = await prisma.file.findMany({
      where: { groupId: parseInt(groupId) },
      select: { name: true, content: true, type: true }
    });

    // Build context from all available materials
    let context = '';
    let sources = [];
    let totalLength = 0;

    // Add notes content
    if (note?.content && note.content.trim()) {
      const noteText = note.content.substring(0, 5000);
      context += `[Source: Group Notes]\n${noteText}\n\n`;
      sources.push('Group Notes');
      totalLength += noteText.length;
    }

    // Add all file contents, distributing space evenly
    const filesWithContent = files.filter(f => f.content && f.content.trim());
    if (filesWithContent.length > 0) {
      const remainingSpace = MAX_CONTEXT_LENGTH - totalLength;
      const perFileLimit = Math.floor(remainingSpace / filesWithContent.length);

      for (const file of filesWithContent) {
        const fileText = file.content.substring(0, Math.max(perFileLimit, 1000));
        context += `[Source: ${file.name}]\n${fileText}\n\n`;
        sources.push(file.name);
        totalLength += fileText.length;
        if (totalLength >= MAX_CONTEXT_LENGTH) break;
      }
    }

    // Build the full prompt with system instructions
    const systemPrompt = `You are "Jerry the Driver", a helpful and friendly AI study assistant for a collaborative study group app called Struggle Bus.
Your job is to help students understand their class materials by answering questions based on the provided context.

Rules:
- Answer questions using the provided class materials (notes and files) as your primary source.
- If the materials contain relevant information, reference which source it came from.
- If the materials don't cover the question, say so and provide a general answer based on your knowledge.
- Keep answers clear, concise, and student-friendly.
- Use markdown formatting for readability (headers, bullet points, code blocks, etc.).

`;

    let fullPrompt;
    if (context.trim()) {
      fullPrompt = systemPrompt + `Here are the group's class materials:\n\n${context}\n\nStudent question: ${question}`;
    } else {
      fullPrompt = systemPrompt + `No class materials have been uploaded to this group yet.\n\nStudent question: ${question}`;
    }

    // Call Google Gemini API with fallback to demo mode
    let aiResponse;
    let demoMode = false;

    try {
      if (model && apiKeyValid) {
        const result = await model.generateContent(fullPrompt);
        aiResponse = result.response.text();
      } else {
        throw new Error('Model not initialized');
      }
    } catch (apiErr) {
      console.warn('Gemini API unavailable, falling back to demo mode:', apiErr.message);
      demoMode = true;
      const demoData = generateDemoResponse(question);
      aiResponse = demoData.answer;
      sources = demoData.sources;
    }

    return res.json({
      answer: aiResponse,
      sources: sources.length > 0 ? sources : ['General Knowledge'],
      sourceCount: sources.length,
      demoMode: demoMode
    });

  } catch (err) {
    console.error('Error in chat route:', err);
    return res.status(500).json({
      error: 'Failed to process question',
      details: err.message
    });
  }
});

module.exports = router;
