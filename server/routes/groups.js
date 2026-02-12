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

// This tells the backend how to handle requests for a specific group ID
router.get('/:id', async (req, res) => {
  try {
    const group = await prisma.group.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true } 
            }
          }
        }
      }
    });

    if (!group) return res.status(404).json({ error: 'Group not found' });
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch group details' });
  }
});

// POST /api/groups/:groupId/leave - Leave group & cleanup if empty
router.post('/:groupId/leave', async (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId);
    const userId = req.user.id;

    // 1. Check if user is actually a member
    const member = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } }
    });

    if (!member) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    // 2. Remove the member
    await prisma.groupMember.delete({
      where: { groupId_userId: { groupId, userId } }
    });

    // 3. Check if group is empty and delete if so
    const remainingCount = await prisma.groupMember.count({ where: { groupId } });
    if (remainingCount === 0) {
      await prisma.group.delete({ where: { id: groupId } });
    }

    res.json({ message: 'Successfully left the group' });
  } catch (err) {
    console.error('Error leaving group:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/groups/:groupId - Update group details
router.patch('/:groupId', async (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId);
    const { name, className } = req.body;
    const userId = req.user.id;

    // Check if user is a member
    const member = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } }
    });

    if (!member) return res.status(403).json({ error: 'You are not a member of this group' });

    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: { name, className }
    });

    res.json(updatedGroup);
  } catch (err) {
    console.error('Error updating group:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;