const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Protect all group routes
router.use(authMiddleware);

// GET /api/groups - List my groups
router.get('/', async (req, res) => {
  try {
    const groups = await prisma.group.findMany({
      where: {
        members: { some: { userId: req.user.id } },
      },
      include: {
        _count: { select: { members: true } }
      }
    });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/groups - Create group
router.post('/', async (req, res) => {
  try {
    const { name, className } = req.body;
    // Simple random code (e.g. "x7z9q2")
    const inviteCode = Math.random().toString(36).substring(2, 8);

    const group = await prisma.group.create({
      data: {
        name,
        className,
        inviteCode,
        createdBy: req.user.id,
        members: { create: { userId: req.user.id } },
      },
    });
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/groups/join - Join by code
router.post('/join', async (req, res) => {
  try {
    const { inviteCode } = req.body;
    
    const group = await prisma.group.findUnique({ where: { inviteCode } });
    if (!group) return res.status(404).json({ error: 'Invalid invite code' });

    const existing = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: group.id, userId: req.user.id } }
    });

    if (existing) return res.status(400).json({ error: 'Already joined!' });

    await prisma.groupMember.create({
      data: { groupId: group.id, userId: req.user.id }
    });

    res.json({ message: 'Joined!', group });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;