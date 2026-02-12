const express = require('express');
const cors = require('cors');
const http = require('http'); // Node's built-in HTTP module
const { WebSocketServer } = require('ws'); // The library your sister used

const authRoutes = require('./routes/auth');
const groupRoutes = require('./routes/groups');

const app = express();
const PORT = 3000;

// 1. Create the HTTP server (Express handles the requests)
const server = http.createServer(app);

// 2. Create the WebSocket Server attached to the HTTP server
const wss = new WebSocketServer({ server });

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);

// 3. Handle WebSocket Connections
wss.on('connection', (ws) => {
  console.log('⚡ A user connected via WebSocket!');

  // Handle incoming messages from the client
  ws.on('message', (data) => {
    // Data comes in as a "Buffer", so we convert it to a string
    const msg = String.fromCharCode(...data);
    console.log('received: %s', msg);

    // Send a reply back to THIS client
    ws.send(`I heard you say "${msg}"`);
    
    // Broadcast: Send this message to EVERYONE connected (e.g., for Group Chat)
    wss.clients.forEach((client) => {
      if (client.readyState === 1) { // 1 means OPEN
        client.send(`Broadcast: ${msg}`);
      }
    });
  });

  ws.send('Welcome to the StudyApp WebSocket Server!');
});

// IMPORTANT: server.listen (not app.listen)
server.listen(PORT, () => {
  console.log(`Server (HTTP + WebSocket) running at http://localhost:${PORT}`);
});