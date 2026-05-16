const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getOne, getAll, runSql } = require('../database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/submit', requireAuth, (req, res) => {
  const { skills, experience, jobType, availability, goals } = req.body;
  if (!skills || !experience) return res.status(400).json({ error: 'Skills and experience required.' });
  const existing = getOne('SELECT id FROM surveys WHERE user_email = ?', [req.session.userEmail]);
  if (existing) {
    runSql("UPDATE surveys SET skills=?, experience=?, job_type=?, availability=?, goals=?, completed=datetime('now') WHERE user_email=?",
      [skills, experience, jobType || '', availability || '', goals || '', req.session.userEmail]);
  } else {
    runSql("INSERT INTO surveys (id, user_email, skills, experience, job_type, availability, goals) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [uuidv4(), req.session.userEmail, skills, experience, jobType || '', availability || '', goals || '']);
  }
  res.json({ success: true, message: 'Survey completed!' });
});

router.get('/status', requireAuth, (req, res) => {
  const survey = getOne('SELECT id FROM surveys WHERE user_email = ?', [req.session.userEmail]);
  res.json({ completed: !!survey });
});

module.exports = router;
