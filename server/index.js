const express = require('express');
const cors = require('cors');
const http = require('http');
const { WebSocketServer } = require('ws');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const path = require('path');
const authRoutes = require('./routes/auth');
const groupRoutes = require('./routes/groups');
const messageRoutes = require('./routes/messages');
const noteRoutes = require('./routes/notes');
const fileRoutes = require('./routes/files');

const app = express();
const prisma = new PrismaClient();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const userConnections = new Map();
const groupRooms = new Map();

app.use(cors({ 
  origin: [
    'https://michelle-johanson.github.io', // Your live website
    'http://localhost:5173'               // Keep this so you can still work locally
  ],
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api', messageRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/files', fileRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

function verifyToken(token) {
  try { return jwt.verify(token, JWT_SECRET); } catch (err) { return null; }
}

async function isGroupMember(userId, groupId) {
  try {
    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: parseInt(groupId), userId: userId } }
    });
    return !!membership;
  } catch (err) { return false; }
}

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get('token');

  if (!token) { ws.close(); return; }
  const decoded = verifyToken(token);
  if (!decoded) { ws.close(); return; }

  const userId = decoded.id;
  const userConnection = { userId, userName: decoded.name || 'Unknown', groupIds: new Set() };
  userConnections.set(ws, userConnection);

  ws.on('message', async (data) => {
    try {
      const msg = JSON.parse(data.toString());

      // Existing Chat Message Logic
      if (msg.type === 'message') {
        const { groupId, content } = msg;
        const savedMessage = await prisma.message.create({
          data: { groupId: parseInt(groupId), userId, content: content.trim() }
        });

        const groupRoom = groupRooms.get(parseInt(groupId));
        if (groupRoom) {
          groupRoom.forEach(client => {
            if (client.readyState === 1) {
              client.send(JSON.stringify({
                type: 'message',
                id: savedMessage.id,
                groupId: parseInt(groupId),
                userId,
                userName: userConnection.userName,
                content: savedMessage.content,
                createdAt: savedMessage.createdAt.toISOString()
              }));
            }
          });
        }
      } 
      // NEW: Shared Notes Logic
      else if (msg.type === 'note_update') {
        const { groupId, content } = msg;
        
        // 1. Persist to DB immediately
        const existing = await prisma.note.findFirst({ where: { groupId: parseInt(groupId) } });
        if (existing) {
          await prisma.note.update({ where: { id: existing.id }, data: { content, lastEditedBy: userId } });
        } else {
          await prisma.note.create({ data: { groupId: parseInt(groupId), title: 'Shared Notes', content, lastEditedBy: userId } });
        }

        // 2. Broadcast to other members in the room
        const groupRoom = groupRooms.get(parseInt(groupId));
        if (groupRoom) {
          groupRoom.forEach(client => {
            if (client !== ws && client.readyState === 1) {
              client.send(JSON.stringify({
                type: 'note_update',
                groupId: parseInt(groupId),
                content: content
              }));
            }
          });
        }
      }
      else if (msg.type === 'join_group') {
        const { groupId } = msg;
        if (!groupRooms.has(parseInt(groupId))) groupRooms.set(parseInt(groupId), new Set());
        groupRooms.get(parseInt(groupId)).add(ws);
        userConnection.groupIds.add(parseInt(groupId));
      }
    } catch (err) { console.error('WS Error:', err); }
  });

  ws.on('close', () => {
    userConnection.groupIds.forEach(groupId => groupRooms.get(groupId)?.delete(ws));
    userConnections.delete(ws);
  });
});

server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));