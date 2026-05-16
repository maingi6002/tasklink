const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getOne, getAll, runSql } = require('../database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const profile = getOne('SELECT * FROM profiles WHERE user_email = ?', [req.session.userEmail]);
  res.json(profile || { name: '', phone: '', bio: '', skills: '', experience: '', education: '', resume: '' });
});

router.post('/save', requireAuth, (req, res) => {
  const { name, phone, bio, skills, experience, education, resume } = req.body;
  const existing = getOne('SELECT id FROM profiles WHERE user_email = ?', [req.session.userEmail]);
  if (existing) {
    runSql("UPDATE profiles SET name=?, phone=?, bio=?, skills=?, experience=?, education=?, resume=?, updated=datetime('now') WHERE user_email=?",
      [name || '', phone || '', bio || '', skills || '', experience || '', education || '', resume || '', req.session.userEmail]);
  } else {
    runSql("INSERT INTO profiles (id, user_email, name, phone, bio, skills, experience, education, resume) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [uuidv4(), req.session.userEmail, name || '', phone || '', bio || '', skills || '', experience || '', education || '', resume || '']);
  }
  res.json({ success: true, message: 'Profile saved!' });
});

module.exports = router;
