const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireAuth } = require('../middleware/auth');

// GET /api/jobs - list all jobs
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM jobs ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/jobs/:id - get job by id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM jobs WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/jobs - create a new job
router.post('/', requireAuth, async (req, res) => {
  const { title, description, location, salary } = req.body;
  if (!title || !description || !location) {
    return res.status(400).json({ message: 'Title, description and location are required' });
  }
  try {
    const [result] = await db.query(
      'INSERT INTO jobs (title, description, location, salary, created_at) VALUES (?, ?, ?, ?, NOW())',
      [title, description, location, salary || null]
    );
    res.status(201).json({ id: result.insertId, title, description, location, salary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT /api/jobs/:id - update a job
router.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { title, description, location, salary } = req.body;
  if (!title || !description || !location) {
    return res.status(400).json({ message: 'Title, description and location are required' });
  }
  try {
    const [result] = await db.query(
      'UPDATE jobs SET title = ?, description = ?, location = ?, salary = ? WHERE id = ? LIMIT 1',
      [title, description, location, salary || null, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json({ id: Number(id), title, description, location, salary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE /api/jobs/:id - delete a job
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM jobs WHERE id = ? LIMIT 1', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json({ message: 'Job deleted', id: Number(id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
