const express = require('express');
const router = express.Router();
const { signToken } = require('../middleware/auth');

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password';

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = signToken({ role: 'admin', username });
    return res.json({ token });
  }
  return res.status(401).json({ message: 'Invalid credentials' });
});

module.exports = router;

