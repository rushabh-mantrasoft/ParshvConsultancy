const express = require('express');
const router = express.Router();
const db = require('../config/db');

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// POST /api/contact - store a contact message
router.post('/', async (req, res) => {
  const { name, email, phone, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email, and message are required' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
  }

  if (message.length > 2000) {
    return res.status(400).json({ message: 'Message is too long (max 2000 characters)' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO contact_messages (name, email, phone, message, created_at) VALUES (?, ?, ?, ?, NOW())',
      [name.trim(), email.trim(), phone ? phone.trim() : null, message.trim()]
    );

    res.status(201).json({
      id: result.insertId,
      name: name.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : null,
      message: message.trim(),
    });
  } catch (err) {
    console.error('Failed to store contact message', err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
