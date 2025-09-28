// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Admin = require('../models/Admin');
const Driver = require('../models/Driver');

const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
const jwtSecret = process.env.JWT_SECRET;
const jwtExpires = process.env.JWT_EXPIRES_IN || '7d';

// helper to sign token
function signToken(payload) {
  return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpires });
}

// Register user (basic)
router.post('/register', async (req, res) => {
  const { username, email, password, firstName, lastName, phoneNumber } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: 'Missing required fields' });
  try {
    const hashed = await bcrypt.hash(password, saltRounds);
    const user = new User({ username, email, passwordHash: hashed, firstName, lastName, phoneNumber });
    await user.save();
    const token = signToken({ id: user._id, role: 'User', username: user.username });
    res.status(201).json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login (for User/Admin/Driver)
router.post('/login', async (req, res) => {
  const { usernameOrEmail, password, role } = req.body;
  if (!usernameOrEmail || !password) return res.status(400).json({ error: 'Missing credentials' });

  try {
    let record = null;
    if (role === 'Admin') {
      record = await Admin.findOne({ $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }] });
    } else if (role === 'Driver') {
      record = await Driver.findOne({ $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }] });
    } else {
      record = await User.findOne({ $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }] });
    }
    if (!record) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, record.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken({ id: record._id, role: role || (record instanceof Admin ? 'Admin' : (record instanceof Driver ? 'Driver' : 'User')), username: record.username || record.name });
    res.json({ token, user: record });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
