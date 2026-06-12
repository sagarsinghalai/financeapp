const router = require('express').Router();
const db = require('../db');

router.get('/', (req, res) => {
  const { status, agent_id, lead_id } = req.query;
  let query = `SELECT a.*, l.first_name || ' ' || l.last_name as lead_name, p.name as product_name, p.type as product_type, u.name as agent_name FROM applications a LEFT JOIN leads l ON a.lead_id = l.id LEFT JOIN products p ON a.product_id = p.id LEFT JOIN users u ON a.agent_id = u.id WHERE 1=1`;
  const params = [];
  if (req.user.role === 'agent') { query += ' AND a.agent_id = ?'; params.push(req.user.id); }
  if (status) { query += ' AND a.status = ?'; params.push(status); }
  if (agent_id) { query += ' AND a.agent_id = ?'; params.push(agent_id); }
  if (lead_id) { query += ' AND a.lead_id = ?'; params.push(lead_id); }
  query += ' ORDER BY a.created_at DESC';
  res.json(db.prepare(query).all(...params));
});

router.get('/:id', (req, res) => {
  const app = db.prepare(`SELECT a.*, l.first_name || ' ' || l.last_name as lead_name, l.email as lead_email, l.phone as lead_phone, p.name as product_name, p.type as product_type, p.interest_rate, u.name as agent_name FROM applications a LEFT JOIN leads l ON a.lead_id = l.id LEFT JOIN products p ON a.product_id = p.id LEFT JOIN users u ON a.agent_id = u.id WHERE a.id = ?`).get(req.params.id);
  if (!app) return res.status(404).json({ error: 'Application not found' });
  res.json(app);
});

router.post('/', (req, res) => {
  const { lead_id, product_id, amount, notes } = req.body;
  const agent_id = req.user.id;
  const result = db.prepare(`INSERT INTO applications (lead_id, product_id, agent_id, amount, notes) VALUES (?,?,?,?,?)`).run(lead_id, product_id, agent_id, amount||null, notes||null);
  res.json({ id: result.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const { status, notes, amount } = req.body;
  db.prepare(`UPDATE applications SET status=?, notes=?, amount=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(status, notes||null, amount||null, req.params.id);
  res.json({ success: true });
});

module.exports = router;
