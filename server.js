const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const client_dist = path.join(__dirname, 'client', 'dist');
const public_dir = path.join(__dirname, 'public');

// Serve static files: prefer React build (client/dist), else legacy public/
if (fs.existsSync(client_dist)) {
  app.use(express.static(client_dist));
} else {
  app.use(express.static(public_dir));
}

// Example API endpoint
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Product-Hackathon API' });
});

// Fallback to index.html for SPA-friendly routing
app.get('*', (req, res) => {
  const index_path = fs.existsSync(client_dist)
    ? path.join(client_dist, 'index.html')
    : path.join(public_dir, 'index.html');
  res.sendFile(index_path);
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
