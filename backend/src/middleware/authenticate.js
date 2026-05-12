/**
 * Authenticate Middleware
 * Verifies JWT token and attaches admin info to request
 */

const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
        code: 'NO_TOKEN',
      });
    }

    const token = authHeader.slice(7); // Remove 'Bearer ' prefix
    const secret = process.env.JWT_SECRET || 'your_jwt_secret_key';

    // Verify token
    const decoded = jwt.verify(token, secret);
    
    // Attach admin info to request
    req.admin = decoded;
    next();
  } catch (error) {
    console.error('❌ Auth error:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        code: 'INVALID_TOKEN',
      });
    }

    res.status(401).json({
      success: false,
      message: 'Authentication failed',
      code: 'AUTH_FAILED',
    });
  }
};

module.exports = authenticate;
