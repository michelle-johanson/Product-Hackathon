const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const groupRoutes = require('./routes/groups');

const app = express();
const PORT = 3000;

app.use(cors({ origin: 'http://localhost:5173' })); // Allow Frontend
app.use(express.json());

// Wire up the routers
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});