const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getOne, getAll, runSql } = require('../database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/apply', requireAuth, (req, res) => {
  const { jobId, jobTitle, name, email, phone, message } = req.body;
  if (!jobId || !name || !email || !message) return res.status(400).json({ error: 'Name, email, and message required.' });
  const job = getOne('SELECT id, employer_email FROM employer_jobs WHERE id = ?', [jobId]);
  if (!job) return res.status(404).json({ error: 'Job not found.' });
  runSql('INSERT INTO job_applications (id, job_id, job_title, employer_email, name, email, phone, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [uuidv4(), jobId, jobTitle || '', job.employer_email, name, email, phone || '', message]);
  res.json({ success: true, message: 'Application submitted!' });
});

router.get('/my', requireAuth, (req, res) => {
  res.json(getAll("SELECT * FROM job_applications WHERE email = ? ORDER BY date DESC", [req.session.userEmail]));
});

module.exports = router;
