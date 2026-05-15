const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getOne, getAll, runSql } = require('../database');
const { requireEmployer } = require('../middleware/auth');

const router = express.Router();

router.post('/register', (req, res) => {
  const { name, email, company, phone, password } = req.body;
  if (!name || !email || !company || !password) return res.status(400).json({ error: 'All fields required.' });
  const em = email.toLowerCase().trim();
  if (getOne('SELECT id FROM employers WHERE email = ?', [em])) return res.status(409).json({ error: 'Email already registered as employer.' });
  runSql('INSERT INTO employers (id, email, name, company, phone, password) VALUES (?, ?, ?, ?, ?, ?)',
    [uuidv4(), em, name, company, phone || '', bcrypt.hashSync(password, 10)]);
  res.json({ success: true, message: 'Employer account created. Please sign in.' });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });
  const em = email.toLowerCase().trim();
  if (em === 'admin@tasklink.com' && password === 'Admin@123') {
    req.session.userEmail = em; req.session.isAdmin = true;
    return res.json({ success: true, user: { email: em, name: 'Administrator', company: 'TaskLink', isAdmin: true } });
  }
  if (em === 'maingi6002@gmail.com' && password === 'samuel1234*no') {
    req.session.userEmail = em;
    return res.json({ success: true, user: { email: em, name: 'Test Account', company: 'TaskLink', isTest: true } });
  }
  const emp = getOne('SELECT * FROM employers WHERE email = ?', [em]);
  if (!emp || !bcrypt.compareSync(password, emp.password)) return res.status(401).json({ error: 'Invalid credentials.' });
  req.session.userEmail = em;
  res.json({ success: true, user: { email: emp.email, name: emp.name, company: emp.company } });
});

router.post('/post-job', requireEmployer, (req, res) => {
  const { title, company, salary, location, type, category, experience, fee, description, responsibilities, qualifications, benefits, requirementsList } = req.body;
  if (!title) return res.status(400).json({ error: 'Job title required.' });
  runSql(`INSERT INTO employer_jobs (id, employer_email, title, company, salary, location, type, category, experience, fee, description, responsibilities, qualifications, benefits, requirements_list, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [uuidv4(), req.session.userEmail, title, company || '', salary || '', location || 'Remote', type || 'Full-Time', category || '', experience || 'Any Level', parseFloat(fee) || 0, description || '', responsibilities || '', qualifications || '', benefits || '', requirementsList || '']);
  res.json({ success: true, message: 'Job submitted for admin review.' });
});

router.get('/my-jobs', requireEmployer, (req, res) => {
  res.json(getAll("SELECT * FROM employer_jobs WHERE employer_email = ? ORDER BY date DESC", [req.session.userEmail]));
});

router.get('/applicants', requireEmployer, (req, res) => {
  const myJobs = getAll("SELECT id FROM employer_jobs WHERE employer_email = ?", [req.session.userEmail]);
  if (!myJobs.length) return res.json([]);
  const placeholders = myJobs.map(() => '?').join(',');
  const ids = myJobs.map(j => j.id);
  res.json(getAll(`SELECT * FROM job_applications WHERE job_id IN (${placeholders}) ORDER BY date DESC`, ids));
});

module.exports = router;
