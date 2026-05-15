const { getOne } = require('../database');

function requireAuth(req, res, next) {
  if (!req.session || !req.session.userEmail) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session || !req.session.userEmail) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const user = getOne('SELECT is_admin FROM users WHERE email = ?', [req.session.userEmail]);
  if (!user || !user.is_admin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

function requireEmployer(req, res, next) {
  if (!req.session || !req.session.userEmail) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin, requireEmployer };
