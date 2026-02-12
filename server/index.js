const express = require('express');
const cors = require('cors');
const http = require('http'); // Node's built-in HTTP module
const { WebSocketServer } = require('ws'); // The library your sister used
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const authRoutes = require('./routes/auth');
const groupRoutes = require('./routes/groups');
const messageRoutes = require('./routes/messages');

const app = express();
const prisma = new PrismaClient();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// 1. Create the HTTP server (Express handles the requests)
const server = http.createServer(app);

// 2. Create the WebSocket Server attached to the HTTP server
const wss = new WebSocketServer({ server });

// Data structures for WebSocket group management
const userConnections = new Map(); // WebSocket → {userId, userName, groupIds}
const groupRooms = new Map(); // groupId → Set<WebSocket>

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api', messageRoutes);

// Helper function to verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// Helper function to get user name from DB
async function getUserName(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true }
    });
    return user?.name || 'Unknown User';
  } catch (err) {
    console.error('Error fetching user name:', err);
    return 'Unknown User';
  }
}

// Helper function to check if user is group member
async function isGroupMember(userId, groupId) {
  try {
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: groupId,
          userId: userId
        }
      }
    });
    return !!membership;
  } catch (err) {
    console.error('Error checking group membership:', err);
    return false;
  }
}

// 3. Handle WebSocket Connections
wss.on('connection', (ws, req) => {
  console.log('⚡ A user connected via WebSocket!');

  // Extract JWT token from query params
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get('token');

  // Verify token
  if (!token) {
    console.warn('⚠️ WebSocket connection attempt without token');
    ws.send(JSON.stringify({ type: 'error', message: 'Authentication required' }));
    ws.close();
    return;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    console.warn('⚠️ WebSocket connection attempt with invalid token');
    ws.send(JSON.stringify({ type: 'error', message: 'Invalid token' }));
    ws.close();
    return;
  }

  // Store user connection info
  const userId = decoded.id;
  const userConnection = { userId, userName: decoded.name || 'Unknown', groupIds: new Set() };
  userConnections.set(ws, userConnection);

  console.log(`✅ User ${userId} (${decoded.name}) authenticated via WebSocket`);

  // Handle incoming messages from the client
  ws.on('message', async (data) => {
    try {
      // Parse JSON message
      const msg = JSON.parse(data.toString());
      console.log(`📩 Message from user ${userId}:`, msg);

      // Handle different message types
      if (msg.type === 'message') {
        // User sending a message to a group
        const { groupId, content } = msg;

        if (!groupId || !content || typeof content !== 'string' || content.trim() === '') {
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
          return;
        }

        // Check if user is a member of this group
        const isMember = await isGroupMember(userId, groupId);
        if (!isMember) {
          ws.send(JSON.stringify({ type: 'error', message: 'Not a member of this group' }));
          return;
        }

        // Save message to database
        const savedMessage = await prisma.message.create({
          data: {
            groupId: groupId,
            userId: userId,
            content: content.trim()
          }
        });

        // Ensure group room exists and add this user
        if (!groupRooms.has(groupId)) {
          groupRooms.set(groupId, new Set());
        }
        groupRooms.get(groupId).add(ws);
        userConnection.groupIds.add(groupId);

        // Broadcast message to all users in this group
        const groupRoom = groupRooms.get(groupId);
        const broadcastMsg = {
          type: 'message',
          id: savedMessage.id,
          groupId: groupId,
          userId: userId,
          userName: userConnection.userName,
          content: savedMessage.content,
          createdAt: savedMessage.createdAt.toISOString()
        };

        groupRoom.forEach((client) => {
          if (client.readyState === 1) { // 1 means OPEN
            client.send(JSON.stringify(broadcastMsg));
          }
        });
      } else if (msg.type === 'join_group') {
        // User joining a group chat room
        const { groupId } = msg;

        if (!groupId) {
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid group ID' }));
          return;
        }

        // Check if user is a member of this group
        const isMember = await isGroupMember(userId, groupId);
        if (!isMember) {
          ws.send(JSON.stringify({ type: 'error', message: 'Not a member of this group' }));
          return;
        }

        // Add to group room
        if (!groupRooms.has(groupId)) {
          groupRooms.set(groupId, new Set());
        }
        groupRooms.get(groupId).add(ws);
        userConnection.groupIds.add(groupId);

        console.log(`✅ User ${userId} joined group ${groupId} chat room`);
      }
    } catch (err) {
      console.error('Error processing WebSocket message:', err);
      ws.send(JSON.stringify({ type: 'error', message: 'Message processing error' }));
    }
  });

  // Clean up when user disconnects
  ws.on('close', () => {
    console.log(`❌ User ${userId} disconnected`);

    // Remove from all group rooms
    const userConnection = userConnections.get(ws);
    if (userConnection) {
      userConnection.groupIds.forEach((groupId) => {
        const groupRoom = groupRooms.get(groupId);
        if (groupRoom) {
          groupRoom.delete(ws);
          if (groupRoom.size === 0) {
            groupRooms.delete(groupId);
          }
        }
      });
    }

    // Remove user connection
    userConnections.delete(ws);
  });

  // Send welcome message
  ws.send(JSON.stringify({ type: 'connected', message: 'Welcome to StudyApp Chat!' }));
});

// IMPORTANT: server.listen (not app.listen)
server.listen(PORT, () => {
  console.log(`Server (HTTP + WebSocket) running at http://localhost:${PORT}`);
});