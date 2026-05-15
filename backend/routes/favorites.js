const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getOne, getAll, runSql } = require('../database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  res.json(getAll('SELECT job_id FROM favorites WHERE user_email = ?', [req.session.userEmail]).map(f => f.job_id));
});

router.post('/toggle', requireAuth, (req, res) => {
  const { jobId } = req.body;
  if (!jobId) return res.status(400).json({ error: 'Job ID required' });
  const existing = getOne('SELECT id FROM favorites WHERE user_email = ? AND job_id = ?', [req.session.userEmail, String(jobId)]);
  if (existing) {
    runSql('DELETE FROM favorites WHERE id = ?', [existing.id]);
    res.json({ favorited: false });
  } else {
    runSql('INSERT INTO favorites (id, user_email, job_id) VALUES (?, ?, ?)', [uuidv4(), req.session.userEmail, String(jobId)]);
    res.json({ favorited: true });
  }
});

module.exports = router;
