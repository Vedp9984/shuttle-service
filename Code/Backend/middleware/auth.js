// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Driver = require('../models/Driver');

const secret = process.env.JWT_SECRET;

const authMiddleware = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing auth token' });

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, secret);
    // attach user-like object
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;
