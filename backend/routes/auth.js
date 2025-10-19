const express = require('express');
const router = express.Router();
const { signToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password';

// POST /api/auth/login
router.post(
  '/login',
  [
    body('username').isString().trim().notEmpty(),
    body('password').isString().trim().notEmpty(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Invalid input', errors: errors.array() });
    }
    const { username, password } = req.body || {};
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const token = signToken({ role: 'admin', username });
      return res.json({ token });
    }
    return res.status(401).json({ message: 'Invalid credentials' });
  }
);

module.exports = router;
