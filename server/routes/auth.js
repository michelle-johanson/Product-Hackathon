const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

const SECRET_KEY = process.env.JWT_SECRET || "my_super_secret_hand_stamp_ink";

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
    });

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY);
    
    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY);
    
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true },
    });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/auth/me - Update user profile
router.patch('/me', authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;

    // Check if email is already taken by another user
    if (email && email !== req.user.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, email },
      select: { id: true, name: true, email: true }
    });

    res.json({ user: updatedUser });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/auth/me - Delete account with full cleanup
router.delete('/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Find all groups where user is a member
    const memberships = await prisma.groupMember.findMany({
      where: { userId },
      select: { groupId: true }
    });

    const groupIds = memberships.map(m => m.groupId);

    // 2. Remove user from all groups
    await prisma.groupMember.deleteMany({
      where: { userId }
    });

    // 3. For each group, check if it's now empty and delete if so
    for (const groupId of groupIds) {
      const remainingCount = await prisma.groupMember.count({
        where: { groupId }
      });

      if (remainingCount === 0) {
        // Delete all upvotes related to questions/answers in this group
        const questions = await prisma.question.findMany({
          where: { groupId },
          select: { id: true }
        });
        const questionIds = questions.map(q => q.id);

        await prisma.upvote.deleteMany({
          where: {
            votableType: 'question',
            votableId: { in: questionIds }
          }
        });

        // Delete all answers for questions in this group (and their upvotes)
        const answers = await prisma.answer.findMany({
          where: { questionId: { in: questionIds } },
          select: { id: true }
        });
        const answerIds = answers.map(a => a.id);

        await prisma.upvote.deleteMany({
          where: {
            votableType: 'answer',
            votableId: { in: answerIds }
          }
        });

        await prisma.answer.deleteMany({
          where: { questionId: { in: questionIds } }
        });

        // Delete all questions for this group
        await prisma.question.deleteMany({ where: { groupId } });

        // Delete all notes for this group
        await prisma.note.deleteMany({ where: { groupId } });

        // Delete all messages for this group
        await prisma.message.deleteMany({ where: { groupId } });

        // Delete the group itself
        await prisma.group.delete({ where: { id: groupId } });
      }
    }

    // 4. Update notes edited by this user to null or delete them
    // For now, we'll set lastEditedBy to the first remaining user in each group
    const notesEditedByUser = await prisma.note.findMany({
      where: { lastEditedBy: userId },
      include: {
        group: {
          include: {
            members: {
              take: 1,
              where: { userId: { not: userId } }
            }
          }
        }
      }
    });

    for (const note of notesEditedByUser) {
      if (note.group.members.length > 0) {
        // Transfer ownership to another member
        await prisma.note.update({
          where: { id: note.id },
          data: { lastEditedBy: note.group.members[0].userId }
        });
      }
      // If no other members, the group will be deleted above
    }

    // 5. Handle groups created by this user (transfer ownership or leave orphaned)
    const createdGroups = await prisma.group.findMany({
      where: { createdBy: userId },
      include: {
        members: {
          take: 1,
          where: { userId: { not: userId } }
        }
      }
    });

    for (const group of createdGroups) {
      if (group.members.length > 0) {
        // Transfer ownership to another member
        await prisma.group.update({
          where: { id: group.id },
          data: { createdBy: group.members[0].userId }
        });
      }
    }

    // 6. Set userId to null for questions and answers (they can be anonymous)
    await prisma.question.updateMany({
      where: { userId },
      data: { userId: null, isAnonymous: true }
    });

    await prisma.answer.updateMany({
      where: { userId },
      data: { userId: null }
    });

    // 7. Delete all messages authored by this user
    await prisma.message.deleteMany({
      where: { userId }
    });

    // 8. Delete all upvotes by this user (has cascade in schema)
    await prisma.upvote.deleteMany({
      where: { userId }
    });

    // 9. Finally, delete the user
    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Error deleting account:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;