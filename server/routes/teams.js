const router = require('express').Router();
const db = require('../db');

router.get('/', (req, res) => {
  const teams = db.prepare(`SELECT t.*, u.name as manager_name, COUNT(m.id) as member_count FROM teams t LEFT JOIN users u ON t.manager_id = u.id LEFT JOIN users m ON m.team_id = t.id GROUP BY t.id`).all();
  res.json(teams);
});

router.get('/:id', (req, res) => {
  const team = db.prepare(`SELECT t.*, u.name as manager_name FROM teams t LEFT JOIN users u ON t.manager_id = u.id WHERE t.id = ?`).get(req.params.id);
  if (!team) return res.status(404).json({ error: 'Team not found' });
  res.json(team);
});

router.get('/:id/members', (req, res) => {
  const members = db.prepare(`SELECT id, name, email, role, status FROM users WHERE team_id = ?`).all(req.params.id);
  res.json(members);
});

router.post('/', (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { name, manager_id, territory } = req.body;
  const result = db.prepare(`INSERT INTO teams (name, manager_id, territory) VALUES (?,?,?)`).run(name, manager_id || null, territory);
  res.json({ id: result.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { name, manager_id, territory } = req.body;
  db.prepare(`UPDATE teams SET name=?, manager_id=?, territory=? WHERE id=?`).run(name, manager_id || null, territory, req.params.id);
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  db.prepare('DELETE FROM teams WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
