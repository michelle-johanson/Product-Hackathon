const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from public
app.use(express.static(path.join(__dirname, 'public')));

// Example API endpoint
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Product-Hackathon API' });
});

// Fallback to index.html for SPA-friendly routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
