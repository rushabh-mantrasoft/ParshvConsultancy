const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// GET /api/resumes - list all resumes
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM resumes ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/resumes - upload a resume
// Expects multipart/form-data with fields: candidate_name, email, phone, resume (file)
router.post('/', upload.single('resume'), async (req, res) => {
  const { candidate_name, email, phone } = req.body;
  const file = req.file;
  if (!candidate_name || !email || !phone || !file) {
    return res.status(400).json({ message: 'Candidate name, email, phone and resume file are required' });
  }
  try {
    const [result] = await db.query(
      'INSERT INTO resumes (candidate_name, email, phone, resume_path, created_at) VALUES (?, ?, ?, ?, NOW())',
      [candidate_name, email, phone, file.filename]
    );
    res.status(201).json({ id: result.insertId, candidate_name, email, phone, resume_path: file.filename });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;