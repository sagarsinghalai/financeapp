const router = require('express').Router();
const db = require('../db');

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM products ORDER BY created_at DESC').all());
});

router.get('/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

router.post('/', (req, res) => {
  if (req.user.role === 'agent') return res.status(403).json({ error: 'Forbidden' });
  const { name, type, description, min_amount, max_amount, interest_rate, tenure_months, coverage_amount, premium, requirements, status } = req.body;
  const result = db.prepare(`INSERT INTO products (name, type, description, min_amount, max_amount, interest_rate, tenure_months, coverage_amount, premium, requirements, status) VALUES (?,?,?,?,?,?,?,?,?,?,?)`).run(name, type, description, min_amount||null, max_amount||null, interest_rate||null, tenure_months||null, coverage_amount||null, premium||null, requirements, status||'active');
  res.json({ id: result.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  if (req.user.role === 'agent') return res.status(403).json({ error: 'Forbidden' });
  const { name, type, description, min_amount, max_amount, interest_rate, tenure_months, coverage_amount, premium, requirements, status } = req.body;
  db.prepare(`UPDATE products SET name=?, type=?, description=?, min_amount=?, max_amount=?, interest_rate=?, tenure_months=?, coverage_amount=?, premium=?, requirements=?, status=? WHERE id=?`).run(name, type, description, min_amount||null, max_amount||null, interest_rate||null, tenure_months||null, coverage_amount||null, premium||null, requirements, status, req.params.id);
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
