const jwt = require('jsonwebtoken');
require('dotenv').config();

function verifyToken(req, res, next) {
  // Get token from header
  const token = req.headers['authorization'];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided' 
    });
  }
  
  // Remove 'Bearer ' prefix if present
  const tokenValue = token.startsWith('Bearer ') ? token.slice(7) : token;
  
  // Verify token
  jwt.verify(tokenValue, process.env.JWT_SECRET, function(err, decoded) {
    if (err) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    
    // Save user info to request
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  });
}

module.exports = { verifyToken };