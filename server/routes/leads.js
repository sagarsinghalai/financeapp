const router = require('express').Router();
const db = require('../db');

function calculateScore({ income, credit_score_range, employment_type, source }) {
  let score = 0;
  if (income > 100000) score += 30;
  else if (income >= 50000) score += 20;
  else score += 10;

  if (credit_score_range === '750+' || credit_score_range === '750-800' || credit_score_range === '800+') score += 40;
  else if (credit_score_range === '650-750' || credit_score_range === '700-750') score += 30;
  else if (credit_score_range === '500-650' || credit_score_range === '600-650' || credit_score_range === '650-700') score += 20;
  else score += 10;

  if (employment_type === 'salaried') score += 20;
  else if (employment_type === 'self_employed') score += 15;
  else score += 10;

  if (source === 'referral') score += 10;

  return Math.min(100, Math.max(0, score));
}

router.get('/', (req, res) => {
  const { status, product_interest, assigned_to, search } = req.query;
  let query = `SELECT l.*, u.name as agent_name FROM leads l LEFT JOIN users u ON l.assigned_to = u.id WHERE 1=1`;
  const params = [];
  if (req.user.role === 'agent') { query += ' AND l.assigned_to = ?'; params.push(req.user.id); }
  if (status) { query += ' AND l.status = ?'; params.push(status); }
  if (product_interest) { query += ' AND l.product_interest = ?'; params.push(product_interest); }
  if (assigned_to) { query += ' AND l.assigned_to = ?'; params.push(assigned_to); }
  if (search) { query += ' AND (l.first_name LIKE ? OR l.last_name LIKE ? OR l.email LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  query += ' ORDER BY l.created_at DESC';
  res.json(db.prepare(query).all(...params));
});

router.get('/kanban', (req, res) => {
  const statuses = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
  const result = {};
  for (const s of statuses) {
    let query = `SELECT l.*, u.name as agent_name FROM leads l LEFT JOIN users u ON l.assigned_to = u.id WHERE l.status = ?`;
    const params = [s];
    if (req.user.role === 'agent') { query += ' AND l.assigned_to = ?'; params.push(req.user.id); }
    query += ' ORDER BY l.score DESC';
    result[s] = db.prepare(query).all(...params);
  }
  res.json(result);
});

router.get('/:id', (req, res) => {
  const lead = db.prepare(`SELECT l.*, u.name as agent_name FROM leads l LEFT JOIN users u ON l.assigned_to = u.id WHERE l.id = ?`).get(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  const activities = db.prepare(`SELECT a.*, u.name as agent_name FROM activities a LEFT JOIN users u ON a.agent_id = u.id WHERE a.lead_id = ? ORDER BY a.created_at DESC`).all(req.params.id);
  const applications = db.prepare(`SELECT a.*, p.name as product_name, p.type as product_type FROM applications a LEFT JOIN products p ON a.product_id = p.id WHERE a.lead_id = ?`).all(req.params.id);
  res.json({ ...lead, activities, applications });
});

router.post('/', (req, res) => {
  const { first_name, last_name, email, phone, address, city, state, income, employment_type, credit_score_range, source, product_interest, assigned_to, notes } = req.body;
  const score = calculateScore({ income: Number(income) || 0, credit_score_range, employment_type, source });
  const agent = assigned_to || req.user.id;
  const agentRow = db.prepare('SELECT team_id FROM users WHERE id = ?').get(agent);
  const result = db.prepare(`INSERT INTO leads (first_name, last_name, email, phone, address, city, state, income, employment_type, credit_score_range, source, product_interest, assigned_to, team_id, score, notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(first_name, last_name, email, phone, address, city, state, income, employment_type, credit_score_range, source, product_interest, agent, agentRow?.team_id, score, notes);
  res.json({ id: result.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const { first_name, last_name, email, phone, address, city, state, income, employment_type, credit_score_range, source, product_interest, status, assigned_to, notes } = req.body;
  const score = calculateScore({ income: Number(income) || 0, credit_score_range, employment_type, source });
  db.prepare(`UPDATE leads SET first_name=?, last_name=?, email=?, phone=?, address=?, city=?, state=?, income=?, employment_type=?, credit_score_range=?, source=?, product_interest=?, status=?, assigned_to=?, score=?, notes=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(first_name, last_name, email, phone, address, city, state, income, employment_type, credit_score_range, source, product_interest, status, assigned_to, score, notes, req.params.id);
  res.json({ success: true });
});

router.patch('/:id/status', (req, res) => {
  db.prepare(`UPDATE leads SET status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(req.body.status, req.params.id);
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  db.prepare('DELETE FROM leads WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
