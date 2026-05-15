const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getOne, getAll, runSql } = require('../database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/request', requireAuth, (req, res) => {
  const { amount, method, account } = req.body;
  if (!amount || !method || !account) return res.status(400).json({ error: 'Amount, method, and account required.' });
  if (amount < 10) return res.status(400).json({ error: 'Minimum withdrawal is $10.' });
  runSql("INSERT INTO withdrawals (id, user_email, amount, method, account, status) VALUES (?, ?, ?, ?, ?, 'pending')",
    [uuidv4(), req.session.userEmail, parseFloat(amount), method, account]);
  res.json({ success: true, message: 'Withdrawal request submitted.' });
});

router.get('/my', requireAuth, (req, res) => {
  res.json(getAll("SELECT * FROM withdrawals WHERE user_email = ? ORDER BY date DESC", [req.session.userEmail]));
});

router.get('/all', (req, res) => {
  res.json(getAll("SELECT * FROM withdrawals ORDER BY date DESC"));
});

module.exports = router;
