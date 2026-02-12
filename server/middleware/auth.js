const jwt = require('jsonwebtoken');

// Matches the secret in your auth routes
const SECRET_KEY = process.env.JWT_SECRET || "my_super_secret_hand_stamp_ink";

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. Malformed token.' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    // Attach the user info to the request so routes can use it
    req.user = decoded; 
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};