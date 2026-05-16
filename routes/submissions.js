const express = require('express');
const { getOne, getAll, runSql } = require('../database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/my', requireAuth, (req, res) => {
  const subs = getAll("SELECT * FROM submissions WHERE user_email = ?", [req.session.userEmail]);
  const tasks = getAll("SELECT * FROM tasks");
  const result = subs.map(s => {
    const task = tasks.find(t => t.id === s.task_id) || null;
    return { ...s, taskTitle: task ? task.title : 'Unknown', taskPay: task ? task.pay : 0 };
  });
  res.json(result);
});

router.get('/all', (req, res) => {
  const subs = getAll("SELECT * FROM submissions");
  const tasks = getAll("SELECT * FROM tasks");
  const result = subs.map(s => {
    const task = tasks.find(t => t.id === s.task_id) || null;
    return { ...s, taskTitle: task ? task.title : 'Unknown', taskPay: task ? task.pay : 0 };
  });
  res.json(result);
});

module.exports = router;
