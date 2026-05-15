const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const { initDb, getDb, getAll, getOne } = require('./database');

const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const taskRoutes = require('./routes/tasks');
const submissionRoutes = require('./routes/submissions');
const paymentRoutes = require('./routes/payments');
const withdrawalRoutes = require('./routes/withdrawals');
const adminRoutes = require('./routes/admin');
const employerRoutes = require('./routes/employer');
const profileRoutes = require('./routes/profile');
const surveyRoutes = require('./routes/survey');
const favoriteRoutes = require('./routes/favorites');
const applicationRoutes = require('./routes/applications');
const { requireAuth } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'tasklink-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/employer', employerRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/survey', surveyRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/applications', applicationRoutes);

// Dashboard data endpoint
app.get('/api/dashboard', requireAuth, (req, res) => {
  const email = req.session.userEmail;
  const user = getOne('SELECT plan, access_granted FROM users WHERE email = ?', [email]);
  const tasks = getAll("SELECT * FROM tasks WHERE active = 1");
  const subs = getAll("SELECT * FROM submissions WHERE user_email = ?", [email]);
  const withdrawals = getAll("SELECT * FROM withdrawals WHERE user_email = ? ORDER BY date DESC", [email]);
  const approved = subs.filter(s => s.status === 'approved');
  let totalEarned = 0;
  approved.forEach(s => { const t = tasks.find(x => x.id === s.task_id); if (t) totalEarned += t.pay || 0; });
  let totalWithdrawn = 0;
  withdrawals.forEach(w => { if (w.status === 'paid') totalWithdrawn += w.amount; });
  const balance = totalEarned - totalWithdrawn;
  const favJobIds = getAll('SELECT job_id FROM favorites WHERE user_email = ?', [email]).map(f => f.job_id);
  const applications = getAll("SELECT * FROM job_applications WHERE email = ? ORDER BY date DESC", [email]);
  res.json({ user, tasks, submissions: subs, withdrawals, totalEarned, balance, favJobIds, applications });
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..')));

// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

async function start() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`TaskLink server running at http://localhost:${PORT}`);
  });
}

start().catch(err => { console.error('Failed to start:', err); process.exit(1); });
