const router = require('express').Router();
const db = require('../db');

router.get('/', (req, res) => {
  const { lead_id } = req.query;
  let query = `SELECT a.*, u.name as agent_name, l.first_name || ' ' || l.last_name as lead_name FROM activities a LEFT JOIN users u ON a.agent_id = u.id LEFT JOIN leads l ON a.lead_id = l.id WHERE 1=1`;
  const params = [];
  if (lead_id) { query += ' AND a.lead_id = ?'; params.push(lead_id); }
  query += ' ORDER BY a.created_at DESC';
  res.json(db.prepare(query).all(...params));
});

router.post('/', (req, res) => {
  const { lead_id, type, description } = req.body;
  const agent_id = req.user.id;
  const result = db.prepare(`INSERT INTO activities (lead_id, agent_id, type, description) VALUES (?,?,?,?)`).run(lead_id, agent_id, type, description||null);
  res.json({ id: result.lastInsertRowid });
});

module.exports = router;
