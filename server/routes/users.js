const router = require('express').Router();
const db = require('../db');
const bcrypt = require('bcryptjs');

router.get('/', (req, res) => {
  const users = db.prepare(`SELECT u.id, u.name, u.email, u.role, u.status, u.created_at, u.team_id, t.name as team_name FROM users u LEFT JOIN teams t ON u.team_id = t.id ORDER BY u.created_at DESC`).all();
  res.json(users);
});

router.post('/', (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { name, email, password, role, team_id } = req.body;
  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare(`INSERT INTO users (name, email, password_hash, role, team_id) VALUES (?,?,?,?,?)`).run(name, email, hash, role, team_id || null);
  res.json({ id: result.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { name, email, role, team_id, status } = req.body;
  db.prepare(`UPDATE users SET name=?, email=?, role=?, team_id=?, status=? WHERE id=?`).run(name, email, role, team_id || null, status, req.params.id);
  res.json({ success: true });
});

router.get('/:id', (req, res) => {
  const user = db.prepare(`SELECT u.id, u.name, u.email, u.role, u.status, u.created_at, u.team_id, t.name as team_name FROM users u LEFT JOIN teams t ON u.team_id = t.id WHERE u.id = ?`).get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

router.patch('/:id/status', (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  db.prepare(`UPDATE users SET status=? WHERE id=?`).run(req.body.status, req.params.id);
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
