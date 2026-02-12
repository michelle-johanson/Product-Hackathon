const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const router = express.Router();
const prisma = new PrismaClient();

// 1. KEEP THIS: The GET route to load notes
router.get('/:groupId', authMiddleware, async (req, res) => {
  try {
    const { groupId } = req.params;
    let note = await prisma.note.findUnique({
      where: { groupId: parseInt(groupId) }
    });
    if (!note) {
      note = await prisma.note.create({
        data: { groupId: parseInt(groupId), title: 'Shared Notes', content: '', lastEditedBy: req.user.id }
      });
    }
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// 2. ADD THIS: The POST route to save notes
router.post('/:groupId', authMiddleware, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { content } = req.body;
    const userId = req.user.id; // From authMiddleware

    const note = await prisma.note.upsert({
      where: { groupId: parseInt(groupId) },
      update: { content, lastEditedBy: userId },
      create: { groupId: parseInt(groupId), title: 'Shared Notes', content, lastEditedBy: userId }
    });
    res.json(note);
  } catch (err) {
    console.error("Save error:", err);
    res.status(500).json({ error: 'Failed to save note' });
  }
});

module.exports = router;