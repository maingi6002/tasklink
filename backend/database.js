const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(__dirname, 'tasklink.db');
let db = null;

function getDb() {
  if (!db) throw new Error('Database not initialized.');
  return db;
}

async function initDb() {
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }
  db.run('PRAGMA journal_mode=WAL');
  initTables();
  seedData();
  saveDb();
  return db;
}

function saveDb() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function initTables() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, phone TEXT DEFAULT '', country TEXT DEFAULT 'Kenya', continent TEXT DEFAULT 'Africa', password TEXT NOT NULL, is_admin INTEGER DEFAULT 0, is_test INTEGER DEFAULT 0, plan TEXT DEFAULT 'free', access_granted INTEGER DEFAULT 0, joined TEXT DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS employers (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, company TEXT NOT NULL, phone TEXT DEFAULT '', password TEXT NOT NULL, joined TEXT DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS surveys (id TEXT PRIMARY KEY, user_email TEXT NOT NULL, skills TEXT DEFAULT '', experience TEXT DEFAULT '', job_type TEXT DEFAULT '', availability TEXT DEFAULT '', goals TEXT DEFAULT '', completed TEXT DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS profiles (id TEXT PRIMARY KEY, user_email TEXT UNIQUE NOT NULL, name TEXT DEFAULT '', phone TEXT DEFAULT '', bio TEXT DEFAULT '', skills TEXT DEFAULT '', experience TEXT DEFAULT '', education TEXT DEFAULT '', resume TEXT DEFAULT '', updated TEXT DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, title TEXT NOT NULL, type TEXT DEFAULT 'beginner', desc TEXT DEFAULT '', short_desc TEXT DEFAULT '', full_desc TEXT DEFAULT '', pay REAL DEFAULT 0, active INTEGER DEFAULT 1, category TEXT DEFAULT '', company TEXT DEFAULT '', location TEXT DEFAULT 'Remote', created TEXT DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS submissions (id TEXT PRIMARY KEY, task_id TEXT NOT NULL, user_email TEXT NOT NULL, status TEXT DEFAULT 'pending', work_note TEXT DEFAULT '', date TEXT DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS payments (id TEXT PRIMARY KEY, user_email TEXT NOT NULL, plan TEXT NOT NULL, method TEXT DEFAULT '', amount REAL DEFAULT 0, status TEXT DEFAULT 'pending', otp TEXT DEFAULT '', otp_verified INTEGER DEFAULT 0, date TEXT DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS withdrawals (id TEXT PRIMARY KEY, user_email TEXT NOT NULL, amount REAL DEFAULT 0, method TEXT DEFAULT '', account TEXT DEFAULT '', status TEXT DEFAULT 'pending', date TEXT DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS employer_jobs (id TEXT PRIMARY KEY, employer_email TEXT NOT NULL, title TEXT NOT NULL, company TEXT DEFAULT '', salary TEXT DEFAULT '', location TEXT DEFAULT 'Remote', type TEXT DEFAULT 'Full-Time', category TEXT DEFAULT '', experience TEXT DEFAULT 'Any Level', fee REAL DEFAULT 0, description TEXT DEFAULT '', responsibilities TEXT DEFAULT '', qualifications TEXT DEFAULT '', benefits TEXT DEFAULT '', requirements_list TEXT DEFAULT '', status TEXT DEFAULT 'pending', date TEXT DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS job_applications (id TEXT PRIMARY KEY, job_id TEXT NOT NULL, job_title TEXT DEFAULT '', employer_email TEXT DEFAULT '', name TEXT DEFAULT '', email TEXT DEFAULT '', phone TEXT DEFAULT '', message TEXT DEFAULT '', date TEXT DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS favorites (id TEXT PRIMARY KEY, user_email TEXT NOT NULL, job_id TEXT NOT NULL, date TEXT DEFAULT (datetime('now')))`
  ];
  tables.forEach(t => db.run(t));
}

function seedData() {
  // Admin account
  const adminRows = db.exec("SELECT id FROM users WHERE email = 'admin@tasklink.com'");
  if (!adminRows.length || !adminRows[0].values.length) {
    const hash = bcrypt.hashSync('Admin@123', 10);
    db.run("INSERT INTO users (id, email, name, password, is_admin, access_granted, plan) VALUES (?, ?, ?, ?, 1, 1, 'pro')",
      [uuidv4(), 'admin@tasklink.com', 'Administrator', hash]);
  }
  // Test account
  const testRows = db.exec("SELECT id FROM users WHERE email = 'maingi6002@gmail.com'");
  if (!testRows.length || !testRows[0].values.length) {
    const hash = bcrypt.hashSync('samuel1234*no', 10);
    db.run("INSERT INTO users (id, email, name, password, is_test, access_granted, plan) VALUES (?, ?, ?, ?, 1, 1, 'pro')",
      [uuidv4(), 'maingi6002@gmail.com', 'Test User', hash]);
  }
  // Seed tasks
  const taskRows = db.exec("SELECT COUNT(*) as c FROM tasks");
  const count = taskRows.length && taskRows[0].values.length ? taskRows[0].values[0][0] : 0;
  if (count === 0) {
    const tasks = [
      ['Review App UI — SnapTask', 'beginner', 'Review the SnapTask app UI and provide feedback.', 'Review the SnapTask app UI.', 'Full description for SnapTask review.', 0.75, 'Software Development'],
      ['Transcribe Audio Clip (2 min)', 'beginner', 'Transcribe a 2-minute audio clip.', 'Transcribe a 2-minute audio clip.', 'Full transcription instructions.', 0.50, 'Writing'],
      ['Categorize Product Photos (50 items)', 'beginner', 'Categorize 50 product photos.', 'Categorize 50 product photos.', 'Full categorization instructions.', 1.00, 'Data & Analytics'],
      ['Data Entry — Receipts (20 items)', 'beginner', 'Enter data from 20 receipts.', 'Enter data from 20 receipts.', 'Full data entry instructions.', 1.25, 'Data & Analytics'],
      ['Survey: Customer Satisfaction', 'beginner', 'Complete a customer satisfaction survey.', 'Complete a survey.', 'Full survey instructions.', 0.55, 'Customer Service']
    ];
    const stmt = db.prepare("INSERT INTO tasks (id, title, type, desc, short_desc, full_desc, pay, active, category) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)");
    tasks.forEach(t => stmt.run([uuidv4(), ...t]));
    stmt.free();
  }
}

// Helper: query one row as object
function getOne(sql, params) {
  const stmt = db.prepare(sql);
  if (params) stmt.bind(params);
  const cols = stmt.getColumnNames();
  if (stmt.step()) {
    const row = stmt.get();
    stmt.free();
    const obj = {};
    cols.forEach((c, i) => { obj[c] = row[i]; });
    return obj;
  }
  stmt.free();
  return null;
}

// Helper: query all rows as array of objects
function getAll(sql, params) {
  const stmt = db.prepare(sql);
  if (params) stmt.bind(params);
  const cols = stmt.getColumnNames();
  const result = [];
  while (stmt.step()) {
    const row = stmt.get();
    const obj = {};
    cols.forEach((c, i) => { obj[c] = row[i]; });
    result.push(obj);
  }
  stmt.free();
  return result;
}

// Helper: run a statement
function runSql(sql, params) {
  db.run(sql, params);
  saveDb();
}

module.exports = { initDb, getDb, saveDb, getOne, getAll, runSql };
