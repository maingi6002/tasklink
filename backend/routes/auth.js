const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getOne, getAll, runSql } = require('../database');

const router = express.Router();

router.post('/register', (req, res) => {
  const { name, email, phone, country, continent, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required.' });
  const em = email.toLowerCase().trim();
  const existing = getOne('SELECT id FROM users WHERE email = ?', [em]);
  if (existing) return res.status(409).json({ error: 'Email already registered.' });
  const hash = bcrypt.hashSync(password, 10);
  runSql('INSERT INTO users (id, email, name, phone, country, continent, password) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [uuidv4(), em, name, phone || '', country || 'Kenya', continent || 'Africa', hash]);
  res.json({ success: true, message: 'Account created. Please sign in.' });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });
  const em = email.toLowerCase().trim();
  const user = getOne('SELECT * FROM users WHERE email = ?', [em]);
  if (!user) return res.status(401).json({ error: 'Invalid email or password.' });
  if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid email or password.' });
  req.session.userEmail = em;
  req.session.userName = user.name;
  req.session.isAdmin = !!user.is_admin;
  res.json({ success: true, user: { email: em, name: user.name, isAdmin: !!user.is_admin } });
});

router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required.' });
  const em = email.toLowerCase().trim();
  const user = getOne('SELECT * FROM users WHERE email = ?', [em]);
  if (!user) return res.status(404).json({ error: 'No account found with that email.' });
  res.json({ success: true, message: 'Demo mode: use the forgot-password page to reset.' });
});

router.get('/me', (req, res) => {
  if (!req.session || !req.session.userEmail) return res.status(401).json({ error: 'Not logged in' });
  const user = getOne('SELECT email, name, phone, country, continent, is_admin, plan, access_granted, joined FROM users WHERE email = ?', [req.session.userEmail]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

module.exports = router;
