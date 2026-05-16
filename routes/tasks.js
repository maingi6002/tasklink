const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getOne, getAll, runSql } = require('../database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(getAll("SELECT * FROM tasks WHERE active = 1"));
});

router.get('/:id', (req, res) => {
  const task = getOne('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

router.post('/start', requireAuth, (req, res) => {
  const { taskId } = req.body;
  if (!taskId) return res.status(400).json({ error: 'Task ID required' });
  const task = getOne('SELECT * FROM tasks WHERE id = ?', [taskId]);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  const existing = getOne("SELECT * FROM submissions WHERE task_id = ? AND user_email = ? AND status = 'in_progress'", [taskId, req.session.userEmail]);
  if (existing) return res.json({ message: 'Already in progress', shortDesc: task.short_desc || task.desc });
  runSql("INSERT INTO submissions (id, task_id, user_email, status) VALUES (?, ?, ?, 'in_progress')", [uuidv4(), taskId, req.session.userEmail]);
  res.json({ success: true, shortDesc: task.short_desc || task.desc, message: 'Task started!' });
});

router.post('/submit', requireAuth, (req, res) => {
  const { taskId, workNote } = req.body;
  if (!taskId || !workNote) return res.status(400).json({ error: 'Task ID and work note required' });
  const sub = getOne("SELECT * FROM submissions WHERE task_id = ? AND user_email = ? AND status = 'in_progress'", [taskId, req.session.userEmail]);
  if (!sub) return res.status(400).json({ error: 'No task in progress' });
  runSql("UPDATE submissions SET status = 'pending', work_note = ?, date = datetime('now') WHERE id = ?", [workNote, sub.id]);
  res.json({ success: true, message: 'Work submitted! Pending admin review.' });
});

router.post('/apply-complex', requireAuth, (req, res) => {
  const { taskId } = req.body;
  if (!taskId) return res.status(400).json({ error: 'Task ID required' });
  const user = getOne('SELECT email, plan, access_granted FROM users WHERE email = ?', [req.session.userEmail]);
  if (!user.access_granted) return res.status(403).json({ error: 'Subscribe first!' });
  if (user.plan !== 'premium' && user.plan !== 'pro') return res.status(403).json({ error: 'Premium or Pro plan required.' });
  const existing = getOne("SELECT * FROM submissions WHERE task_id = ? AND user_email = ? AND status = 'applied'", [taskId, req.session.userEmail]);
  if (existing) return res.status(409).json({ error: 'Already applied' });
  runSql("INSERT INTO submissions (id, task_id, user_email, status) VALUES (?, ?, ?, 'applied')", [uuidv4(), taskId, req.session.userEmail]);
  res.json({ success: true, message: 'Application submitted! Admin will review.' });
});

module.exports = router;
