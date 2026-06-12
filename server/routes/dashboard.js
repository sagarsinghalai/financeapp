const router = require('express').Router();
const db = require('../db');

router.get('/stats', (req, res) => {
  const total_leads = db.prepare('SELECT COUNT(*) as count FROM leads').get().count;
  const new_leads_this_month = db.prepare(`SELECT COUNT(*) as count FROM leads WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')`).get().count;
  const closed_won = db.prepare(`SELECT COUNT(*) as count FROM leads WHERE status = 'closed_won'`).get().count;
  const conversion_rate = total_leads > 0 ? parseFloat(((closed_won / total_leads) * 100).toFixed(1)) : 0;
  const active_agents = db.prepare(`SELECT COUNT(*) as count FROM users WHERE role = 'agent' AND status = 'active'`).get().count;

  // Monthly revenue: last 6 months from disbursement transactions
  const monthlyRows = db.prepare(`
    SELECT strftime('%Y-%m', date) as ym, SUM(amount) as revenue
    FROM transactions
    WHERE type = 'disbursement' AND date >= date('now', '-6 months')
    GROUP BY ym ORDER BY ym ASC
  `).all();

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthly_revenue = monthlyRows.map(r => ({
    month: monthNames[parseInt(r.ym.split('-')[1]) - 1],
    revenue: r.revenue || 0
  }));

  // Leads by product interest
  const creditCards = db.prepare(`SELECT COUNT(*) as c FROM leads WHERE product_interest = 'credit_card'`).get().c;
  const loans = db.prepare(`SELECT COUNT(*) as c FROM leads WHERE product_interest = 'loan'`).get().c;
  const insurance = db.prepare(`SELECT COUNT(*) as c FROM leads WHERE product_interest = 'insurance'`).get().c;
  const leads_by_product = [
    { name: 'Credit Cards', value: creditCards },
    { name: 'Loans', value: loans },
    { name: 'Insurance', value: insurance }
  ];

  // Top agents
  const top_agents = db.prepare(`
    SELECT u.name,
      COUNT(CASE WHEN l.status = 'closed_won' THEN 1 END) as leads_closed,
      COALESCE(SUM(CASE WHEN t.type = 'disbursement' THEN t.amount ELSE 0 END), 0) as revenue,
      ROUND(COUNT(CASE WHEN l.status = 'closed_won' THEN 1 END) * 100.0 / MAX(COUNT(l.id), 1), 1) as conversion_pct
    FROM users u
    LEFT JOIN leads l ON l.assigned_to = u.id
    LEFT JOIN transactions t ON t.lead_id = l.id
    WHERE u.role = 'agent'
    GROUP BY u.id
    ORDER BY leads_closed DESC, revenue DESC
    LIMIT 5
  `).all();

  // Recent activities
  const recent_activities = db.prepare(`
    SELECT a.*, u.name as agent_name, l.first_name || ' ' || l.last_name as lead_name
    FROM activities a
    LEFT JOIN users u ON a.agent_id = u.id
    LEFT JOIN leads l ON a.lead_id = l.id
    ORDER BY a.created_at DESC
    LIMIT 10
  `).all();

  res.json({
    total_leads,
    new_leads_this_month,
    conversion_rate,
    active_agents,
    monthly_revenue,
    leads_by_product,
    top_agents,
    recent_activities
  });
});

module.exports = router;
