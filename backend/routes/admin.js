const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getOne, getAll, runSql } = require('../database');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', requireAdmin, (req, res) => {
  const userCount = getOne('SELECT COUNT(*) as c FROM users').c;
  const taskCount = getOne('SELECT COUNT(*) as c FROM tasks WHERE active = 1').c;
  const pendingSubs = getOne("SELECT COUNT(*) as c FROM submissions WHERE status = 'pending'").c;
  const approvedSubs = getOne("SELECT COUNT(*) as c FROM submissions WHERE status = 'approved'").c;
  const pendingPays = getOne("SELECT COUNT(*) as c FROM payments WHERE status = 'pending'").c;
  const pendingWithdrawals = getOne("SELECT COUNT(*) as c FROM withdrawals WHERE status = 'pending'").c;
  const pendingEmpJobs = getOne("SELECT COUNT(*) as c FROM employer_jobs WHERE status = 'pending'").c;
  const empCount = getOne('SELECT COUNT(*) as c FROM employers').c;
  res.json({ userCount, taskCount, pendingSubs, approvedSubs, pendingPays, pendingWithdrawals, pendingEmpJobs, empCount });
});

router.get('/users', requireAdmin, (req, res) => {
  res.json(getAll("SELECT email, name, phone, country, continent, plan, access_granted, joined FROM users"));
});

router.post('/submissions/approve', requireAdmin, (req, res) => {
  const { submissionId } = req.body;
  if (!submissionId) return res.status(400).json({ error: 'Submission ID required' });
  runSql("UPDATE submissions SET status = 'approved' WHERE id = ?", [submissionId]);
  res.json({ success: true });
});

router.post('/submissions/reject', requireAdmin, (req, res) => {
  const { submissionId } = req.body;
  if (!submissionId) return res.status(400).json({ error: 'Submission ID required' });
  runSql("UPDATE submissions SET status = 'rejected' WHERE id = ?", [submissionId]);
  res.json({ success: true });
});

router.post('/payments/confirm', requireAdmin, (req, res) => {
  const { paymentId } = req.body;
  if (!paymentId) return res.status(400).json({ error: 'Payment ID required' });
  const payment = getOne('SELECT * FROM payments WHERE id = ?', [paymentId]);
  if (!payment) return res.status(404).json({ error: 'Payment not found' });
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  runSql("UPDATE payments SET status = 'otp_sent', otp = ? WHERE id = ?", [otp, paymentId]);
  res.json({ success: true, message: 'OTP generated.', otp });
});

router.post('/payments/verify-otp', requireAdmin, (req, res) => {
  const { paymentId } = req.body;
  if (!paymentId) return res.status(400).json({ error: 'Payment ID required' });
  const payment = getOne('SELECT * FROM payments WHERE id = ?', [paymentId]);
  if (!payment) return res.status(404).json({ error: 'Payment not found' });
  runSql("UPDATE payments SET status = 'verified', otp_verified = 1 WHERE id = ?", [paymentId]);
  runSql("UPDATE users SET access_granted = 1, plan = ? WHERE email = ?", [payment.plan, payment.user_email]);
  res.json({ success: true, message: 'Payment verified. Access granted.' });
});

router.post('/withdrawals/pay', requireAdmin, (req, res) => {
  const { withdrawalId } = req.body;
  if (!withdrawalId) return res.status(400).json({ error: 'Withdrawal ID required' });
  runSql("UPDATE withdrawals SET status = 'paid' WHERE id = ?", [withdrawalId]);
  res.json({ success: true });
});

router.post('/withdrawals/reject', requireAdmin, (req, res) => {
  const { withdrawalId } = req.body;
  if (!withdrawalId) return res.status(400).json({ error: 'Withdrawal ID required' });
  runSql("UPDATE withdrawals SET status = 'rejected' WHERE id = ?", [withdrawalId]);
  res.json({ success: true });
});

router.post('/tasks', requireAdmin, (req, res) => {
  const { title, type, desc, shortDesc, fullDesc, pay, category } = req.body;
  if (!title || pay === undefined) return res.status(400).json({ error: 'Title and pay required' });
  runSql('INSERT INTO tasks (id, title, type, desc, short_desc, full_desc, pay, active, category) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)',
    [uuidv4(), title, type || 'beginner', desc || '', shortDesc || '', fullDesc || '', parseFloat(pay), category || '']);
  res.json({ success: true, message: 'Task created.' });
});

router.put('/tasks/:id', requireAdmin, (req, res) => {
  const { title, type, desc, shortDesc, fullDesc, pay, active, category } = req.body;
  runSql('UPDATE tasks SET title=?, type=?, desc=?, short_desc=?, full_desc=?, pay=?, active=?, category=? WHERE id=?',
    [title, type, desc, shortDesc, fullDesc, parseFloat(pay), active, category, req.params.id]);
  res.json({ success: true });
});

router.delete('/tasks/:id', requireAdmin, (req, res) => {
  runSql("UPDATE tasks SET active = 0 WHERE id = ?", [req.params.id]);
  res.json({ success: true });
});

router.post('/employer-jobs/approve', requireAdmin, (req, res) => {
  const { jobId } = req.body;
  if (!jobId) return res.status(400).json({ error: 'Job ID required' });
  runSql("UPDATE employer_jobs SET status = 'approved' WHERE id = ?", [jobId]);
  res.json({ success: true });
});

router.post('/employer-jobs/reject', requireAdmin, (req, res) => {
  const { jobId } = req.body;
  if (!jobId) return res.status(400).json({ error: 'Job ID required' });
  runSql("UPDATE employer_jobs SET status = 'rejected' WHERE id = ?", [jobId]);
  res.json({ success: true });
});

module.exports = router;
