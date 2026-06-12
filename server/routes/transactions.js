const router = require('express').Router();
const db = require('../db');

router.get('/', (req, res) => {
  const { lead_id, application_id, type } = req.query;
  let query = `SELECT t.*, l.first_name || ' ' || l.last_name as lead_name FROM transactions t LEFT JOIN leads l ON t.lead_id = l.id WHERE 1=1`;
  const params = [];
  if (lead_id) { query += ' AND t.lead_id = ?'; params.push(lead_id); }
  if (application_id) { query += ' AND t.application_id = ?'; params.push(application_id); }
  if (type) { query += ' AND t.type = ?'; params.push(type); }
  query += ' ORDER BY t.date DESC, t.created_at DESC';
  res.json(db.prepare(query).all(...params));
});

router.get('/:id', (req, res) => {
  const tx = db.prepare(`SELECT t.*, l.first_name || ' ' || l.last_name as lead_name FROM transactions t LEFT JOIN leads l ON t.lead_id = l.id WHERE t.id = ?`).get(req.params.id);
  if (!tx) return res.status(404).json({ error: 'Transaction not found' });
  res.json(tx);
});

router.post('/', (req, res) => {
  const { application_id, lead_id, type, amount, description, date } = req.body;
  if (!type || !amount) return res.status(400).json({ error: 'type and amount are required' });
  const result = db.prepare(`INSERT INTO transactions (application_id, lead_id, type, amount, description, date) VALUES (?,?,?,?,?,?)`).run(application_id || null, lead_id || null, type, amount, description || null, date || new Date().toISOString().slice(0, 10));
  res.status(201).json({ id: result.lastInsertRowid });
});

module.exports = router;
