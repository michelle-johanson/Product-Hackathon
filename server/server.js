const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // New: For scrambling passwords
const { PrismaClient } = require('@prisma/client'); // New: Database connection

const app = express();
const prisma = new PrismaClient(); // Connect to the DB
const PORT = 3000;
const SECRET_KEY = "my_super_secret_hand_stamp_ink";

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// 1. SIGN UP (Create a new User)
app.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Scramble the password (Security 101)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save to Database
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: hashedPassword, // Note: We save the hash, not the password
      },
    });

    // Create the Hand Stamp immediately so they don't have to log in again
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY);
    
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong signing up" });
  }
});

// 2. LOGIN (Check credentials)
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user in the database
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Compare the password they typed with the scrambled one in the DB
    const valid = await bcrypt.compare(password, user.passwordHash);

    if (valid) {
      // Give them the Hand Stamp
      const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY);
      res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// 3. CHECK "ME" (Verify Stamp)
app.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    // Optional: Double check if user still exists in DB
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    
    if (user) {
      res.json({ user: { id: user.id, name: user.name, email: user.email } });
    } else {
      res.status(401).json({ error: "User not found" });
    }
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// 4. CREATE GROUP
app.post('/groups', async (req, res) => {
  const { name, className } = req.body;
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const userId = decoded.id;

    // Simple random code generator for the invite (e.g., "x7z9q2")
    const inviteCode = Math.random().toString(36).substring(2, 8);

    const group = await prisma.group.create({
      data: {
        name,
        className,
        inviteCode,
        createdBy: userId,
        members: {
          create: { userId: userId } // Add creator as the first member
        }
      }
    });

    res.json(group);
  } catch (err) {
    console.error("Group creation error:", err);
    res.status(500).json({ error: "Failed to create group" });
  }
});

// 5. GET MY GROUPS
app.get('/groups', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const userId = decoded.id;

    // Find all groups where this user is a member
    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        _count: {
          select: { members: true } // Also tell me how many people are in the group
        }
      }
    });

    res.json(groups);
  } catch (err) {
    console.error("Get groups error:", err);
    res.status(500).json({ error: "Failed to fetch groups" });
  }
});

// 6. JOIN GROUP BY CODE
app.post('/groups/join', async (req, res) => {
  const { inviteCode } = req.body;
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const userId = decoded.id;

    // 1. Find the group
    const group = await prisma.group.findUnique({ where: { inviteCode } });
    
    if (!group) {
      return res.status(404).json({ error: "Invalid Invite Code" });
    }

    // 2. Check if user is already in the group
    // (Prisma requires a unique identifier for the composite key)
    const existingMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: group.id,
          userId: userId
        }
      }
    });

    if (existingMember) {
      return res.status(400).json({ error: "You are already in this group!" });
    }

    // 3. Add the user to the group
    await prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId: userId
      }
    });

    res.json({ message: "Joined successfully!", group });
  } catch (err) {
    console.error("Join error:", err);
    res.status(500).json({ error: "Failed to join group" });
  }
});


app.listen(PORT, () => {
  console.log(`Bouncer is ready and connected to DB at http://localhost:${PORT}`);
});