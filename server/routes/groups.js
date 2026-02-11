const express = require('express');
const { nanoid } = require('nanoid');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// GET /api/groups - List user's groups
router.get('/', async (req, res) => {
  try {
    const groups = await prisma.group.findMany({
      where: {
        members: { some: { userId: req.user.id } },
      },
      include: {
        _count: { select: { members: true } } // Include member count for UI
      }
    });
    res.json(groups);
  } catch (err) {
    console.error('List groups error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/groups - Create new group
router.post('/', async (req, res) => {
  try {
    const { name, className, description } = req.body;
    if (!name || !className) return res.status(400).json({ error: 'Name and class name required' });

    const inviteCode = nanoid(8);
    const group = await prisma.group.create({
      data: {
        name,
        className,
        description,
        inviteCode,
        createdBy: req.user.id,
        members: { create: { userId: req.user.id } },
      },
    });
    res.status(201).json({ group });
  } catch (err) {
    console.error('Create group error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/groups/join - Join by code
router.post('/join', async (req, res) => {
  try {
    const { inviteCode } = req.body;
    if (!inviteCode) return res.status(400).json({ error: 'Invite code required' });

    const group = await prisma.group.findUnique({ where: { inviteCode } });
    if (!group) return res.status(404).json({ error: 'Invalid invite code' });

    const existing = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: group.id, userId: req.user.id } }
    });

    if (existing) return res.json({ group }); // Already joined, just return group

    await prisma.groupMember.create({
      data: { groupId: group.id, userId: req.user.id }
    });

    res.json({ group });
  } catch (err) {
    console.error('Join group error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/groups/:id - Get details
router.get('/:id', async (req, res) => {
  try {
    const groupId = parseInt(req.params.id);
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } }
        }
      }
    });

    if (!group) return res.status(404).json({ error: 'Group not found' });
    
    // Security check: must be a member to see details
    const isMember = group.members.some(m => m.user.id === req.user.id);
    if (!isMember) return res.status(403).json({ error: 'Not a member' });

    res.json({ group });
  } catch (err) {
    console.error('Get group error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/groups/:id/leave - Leave group (and delete if empty)
router.post('/:id/leave', async (req, res) => {
  try {
    const groupId = parseInt(req.params.id);
    
    // 1. Delete the membership
    await prisma.groupMember.deleteMany({
      where: {
        groupId: groupId,
        userId: req.user.id
      }
    });

    // 2. Check remaining members
    const remainingMembers = await prisma.groupMember.count({
      where: { groupId: groupId }
    });

    // 3. If 0 members, delete the group entirely
    if (remainingMembers === 0) {
      await prisma.group.delete({
        where: { id: groupId }
      });
      return res.json({ message: 'Left group. Group deleted as it is now empty.' });
    }

    res.json({ message: 'Left group successfully' });
  } catch (err) {
    console.error('Leave group error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;