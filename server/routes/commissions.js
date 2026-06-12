const router = require('express').Router();
const db = require('../db');

router.get('/summary', (req, res) => {
  let where = '';
  const params = [];
  if (req.user.role === 'agent') { where = 'WHERE c.agent_id = ?'; params.push(req.user.id); }
  const row = db.prepare(`SELECT SUM(amount) as total, SUM(CASE WHEN status='pending' THEN amount ELSE 0 END) as pending, SUM(CASE WHEN status='paid' THEN amount ELSE 0 END) as paid FROM commissions c ${where}`).get(...params);
  res.json(row);
});

router.get('/', (req, res) => {
  let query = `SELECT c.*, u.name as agent_name, a.amount as application_amount, a.status as application_status, l.first_name || ' ' || l.last_name as lead_name, p.name as product_name FROM commissions c LEFT JOIN users u ON c.agent_id = u.id LEFT JOIN applications a ON c.application_id = a.id LEFT JOIN leads l ON a.lead_id = l.id LEFT JOIN products p ON a.product_id = p.id WHERE 1=1`;
  const params = [];
  if (req.user.role === 'agent') { query += ' AND c.agent_id = ?'; params.push(req.user.id); }
  query += ' ORDER BY c.created_at DESC';
  res.json(db.prepare(query).all(...params));
});

module.exports = router;
