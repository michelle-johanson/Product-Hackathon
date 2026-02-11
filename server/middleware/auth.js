const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // 1. Check for the Authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    // Return 401 so the frontend knows to stop waiting and show the Login screen
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  // 2. Extract the token
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. Malformed token.' });
  }

  try {
    // 3. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.userId, email: decoded.email };
    
    // 4. CRITICAL: Allow the request to proceed
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token.' });
  }
};