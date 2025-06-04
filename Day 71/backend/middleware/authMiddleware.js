const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET ;

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token missing' });
  }

  jwt.verify(token, secret, (err, user) => {
     if (err) {
      console.log("JWT verification error:", err.message); // 
      return res.status(403).json({ message: 'Invalid token' });
    }

    req.userId = user.userId; // Add user ID to the request object
    next();
  });
};

module.exports = authenticateToken;
