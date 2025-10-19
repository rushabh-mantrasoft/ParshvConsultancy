const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fsPromises = fs.promises;
const db = require('../config/db');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

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

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      const error = new Error('Unsupported resume file type.');
      error.code = 'UNSUPPORTED_FILE_TYPE';
      cb(error);
    }
  },
});

async function removeFileIfExists(filePath) {
  try {
    await fsPromises.unlink(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.warn('Failed to remove uploaded file', err);
    }
  }
}

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
router.post('/', (req, res) => {
  upload.single('resume')(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Resume file is too large (max 5 MB)' });
      }
      if (err.code === 'UNSUPPORTED_FILE_TYPE') {
        return res.status(400).json({ message: 'Only PDF or Word documents are accepted' });
      }
      console.error('Resume upload failed', err);
      return res.status(500).json({ error: 'File upload failed' });
    }

    const { candidate_name, email, phone } = req.body || {};
    const file = req.file;

    if (!candidate_name || !email || !phone || !file) {
      if (file) {
        await removeFileIfExists(file.path);
      }
      return res
        .status(400)
        .json({ message: 'Candidate name, email, phone and resume file are required' });
    }

    try {
      const [result] = await db.query(
        'INSERT INTO resumes (candidate_name, email, phone, resume_path, created_at) VALUES (?, ?, ?, ?, NOW())',
        [candidate_name.trim(), email.trim(), phone.trim(), path.basename(file.filename)]
      );

      res.status(201).json({
        id: result.insertId,
        candidate_name: candidate_name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        resume_path: path.basename(file.filename),
      });
    } catch (dbError) {
      console.error('Failed to store resume record', dbError);
      if (file) {
        await removeFileIfExists(file.path);
      }
      res.status(500).json({ error: 'Database error' });
    }
  });
});

module.exports = router;
