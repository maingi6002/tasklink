const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getOne, getAll, runSql } = require('../database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/submit', requireAuth, (req, res) => {
  const { plan, method } = req.body;
  if (!plan) return res.status(400).json({ error: 'Plan required' });
  const amounts = { beginner: 1, premium: 2, pro: 5 };
  const amount = amounts[plan];
  if (!amount) return res.status(400).json({ error: 'Invalid plan' });
  runSql("INSERT INTO payments (id, user_email, plan, method, amount, status) VALUES (?, ?, ?, ?, ?, 'pending')",
    [uuidv4(), req.session.userEmail, plan, method || '', amount]);
  res.json({ success: true, message: 'Payment recorded. Waiting for admin confirmation.' });
});

router.get('/status', requireAuth, (req, res) => {
  const payment = getOne("SELECT * FROM payments WHERE user_email = ? ORDER BY date DESC", [req.session.userEmail]);
  res.json(payment || { status: 'none' });
});

module.exports = router;
