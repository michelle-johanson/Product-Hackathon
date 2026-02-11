const express = require('express');
const { nanoid } = require('nanoid');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// All group routes require authentication
router.use(authMiddleware);

// GET /api/groups (groups current user belongs to)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            userId: req.user.id,
          },
        },
      },
    });

    // Return the array directly so the frontend can do groups.map(...)
    res.json(groups);
  } catch (err) {
    console.error('List groups error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/groups — create a new group
router.post('/', async (req, res) => {
  try {
    const { name, className, description } = req.body;

    if (!name || !className) {
      return res.status(400).json({ error: 'Name and className are required' });
    }

    const inviteCode = nanoid(8);

    const group = await prisma.group.create({
      data: {
        name,
        className,
        description: description || null,
        inviteCode,
        createdBy: req.user.id,
        members: {
          create: { userId: req.user.id },
        },
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    res.status(201).json({ group });
  } catch (err) {
    console.error('Create group error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/groups/join — join a group via invite code
router.post('/join', async (req, res) => {
  try {
    const { inviteCode } = req.body;

    if (!inviteCode) {
      return res.status(400).json({ error: 'Invite code is required' });
    }

    const group = await prisma.group.findUnique({
      where: { inviteCode },
    });

    if (!group) {
      return res.status(404).json({ error: 'Invalid invite code' });
    }

    const existing = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: group.id, userId: req.user.id } },
    });

    if (existing) {
      return res.status(400).json({ error: 'You are already a member of this group' });
    }

    await prisma.groupMember.create({
      data: { groupId: group.id, userId: req.user.id },
    });

    const updatedGroup = await prisma.group.findUnique({
      where: { id: group.id },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    res.json({ group: updatedGroup });
  } catch (err) {
    console.error('Join group error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/groups/:id — get group details with members
router.get('/:id', async (req, res) => {
  try {
    const groupId = parseInt(req.params.id, 10);
    if (isNaN(groupId)) {
      return res.status(400).json({ error: 'Invalid group ID' });
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const isMember = group.members.some((m) => m.userId === req.user.id);
    if (!isMember) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    res.json({ group });
  } catch (err) {
    console.error('Get group error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/groups/:id/members/:userId — remove a member (creator only)
router.delete('/:id/members/:userId', async (req, res) => {
  try {
    const groupId = parseInt(req.params.id, 10);
    const targetUserId = parseInt(req.params.userId, 10);
    if (isNaN(groupId) || isNaN(targetUserId)) {
      return res.status(400).json({ error: 'Invalid group or user ID' });
    }

    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (group.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Only the group creator can remove members' });
    }

    if (targetUserId === group.createdBy) {
      return res.status(400).json({ error: 'Cannot remove the group creator' });
    }

    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: targetUserId } },
    });

    if (!membership) {
      return res.status(404).json({ error: 'Member not found in this group' });
    }

    await prisma.groupMember.delete({ where: { id: membership.id } });

    res.json({ message: 'Member removed successfully' });
  } catch (err) {
    console.error('Remove member error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
