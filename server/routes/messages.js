const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Middleware: Verify user is a member of the group
const checkGroupMembership = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: parseInt(groupId),
          userId: userId
        }
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this group' });
    }

    next();
  } catch (err) {
    console.error('Error checking group membership:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/groups/:groupId/messages - Fetch message history
router.get('/groups/:groupId/messages', authMiddleware, checkGroupMembership, async (req, res) => {
  try {
    const { groupId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    // Verify group exists
    const group = await prisma.group.findUnique({
      where: { id: parseInt(groupId) }
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Fetch messages with user details
    const messages = await prisma.message.findMany({
      where: { groupId: parseInt(groupId) },
      include: {
        user: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
      skip: offset
    });

    // Format response with userName for frontend
    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      groupId: msg.groupId,
      userId: msg.userId,
      userName: msg.user.name,
      content: msg.content,
      createdAt: msg.createdAt.toISOString()
    }));

    res.json(formattedMessages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/groups/:groupId/messages - Save a message
router.post('/groups/:groupId/messages', authMiddleware, checkGroupMembership, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // Validate content
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return res.status(400).json({ error: 'Message content is required and cannot be empty' });
    }

    // Verify group exists
    const group = await prisma.group.findUnique({
      where: { id: parseInt(groupId) }
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        groupId: parseInt(groupId),
        userId: userId,
        content: content.trim()
      },
      include: {
        user: {
          select: { id: true, name: true }
        }
      }
    });

    // Format response
    const formattedMessage = {
      id: message.id,
      groupId: message.groupId,
      userId: message.userId,
      userName: message.user.name,
      content: message.content,
      createdAt: message.createdAt.toISOString()
    };

    res.status(201).json(formattedMessage);
  } catch (err) {
    console.error('Error creating message:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
