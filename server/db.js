const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new Database(path.join(__dirname, 'fintech.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      manager_id INTEGER,
      territory TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'agent',
      team_id INTEGER,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (team_id) REFERENCES teams(id)
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      min_amount REAL,
      max_amount REAL,
      interest_rate REAL,
      tenure_months INTEGER,
      coverage_amount REAL,
      premium REAL,
      requirements TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      income REAL,
      employment_type TEXT,
      credit_score_range TEXT,
      source TEXT,
      product_interest TEXT,
      status TEXT DEFAULT 'new',
      assigned_to INTEGER,
      team_id INTEGER,
      score INTEGER DEFAULT 50,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assigned_to) REFERENCES users(id),
      FOREIGN KEY (team_id) REFERENCES teams(id)
    );

    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      agent_id INTEGER NOT NULL,
      amount REAL,
      status TEXT DEFAULT 'submitted',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES leads(id),
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (agent_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER,
      lead_id INTEGER,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (application_id) REFERENCES applications(id),
      FOREIGN KEY (lead_id) REFERENCES leads(id)
    );

    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER NOT NULL,
      agent_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES leads(id),
      FOREIGN KEY (agent_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS commissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id INTEGER NOT NULL,
      application_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      rate REAL NOT NULL DEFAULT 0,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (agent_id) REFERENCES users(id),
      FOREIGN KEY (application_id) REFERENCES applications(id)
    );
  `);

  try {
    const userCount = db.prepare('SELECT COUNT(*) as cnt FROM users').get();
    if (userCount.cnt > 0) return;
  } catch (e) {
    return;
  }

  const adminHash = bcrypt.hashSync('admin123', 10);
  const managerHash = bcrypt.hashSync('manager123', 10);
  const agentHash = bcrypt.hashSync('agent123', 10);

  db.prepare('INSERT INTO teams (name, territory) VALUES (?,?)').run('Team Alpha', 'North');
  db.prepare('INSERT INTO teams (name, territory) VALUES (?,?)').run('Team Beta', 'South');

  db.prepare('INSERT INTO users (name, email, password_hash, role, team_id) VALUES (?,?,?,?,?)').run('Admin User', 'admin@fintech.com', adminHash, 'admin', null);
  db.prepare('INSERT INTO users (name, email, password_hash, role, team_id) VALUES (?,?,?,?,?)').run('Sarah Johnson', 'manager@fintech.com', managerHash, 'manager', 1);
  db.prepare('INSERT INTO users (name, email, password_hash, role, team_id) VALUES (?,?,?,?,?)').run('Mike Davis', 'agent@fintech.com', agentHash, 'agent', 1);
  db.prepare('INSERT INTO users (name, email, password_hash, role, team_id) VALUES (?,?,?,?,?)').run('Priya Singh', 'agent2@fintech.com', agentHash, 'agent', 1);
  db.prepare('INSERT INTO users (name, email, password_hash, role, team_id) VALUES (?,?,?,?,?)').run('Rahul Mehta', 'agent3@fintech.com', agentHash, 'agent', 2);

  db.prepare('UPDATE teams SET manager_id = 2 WHERE id = 1').run();
  db.prepare('UPDATE teams SET manager_id = 2 WHERE id = 2').run();

  const insertProduct = db.prepare('INSERT INTO products (name, type, description, min_amount, max_amount, interest_rate, tenure_months, coverage_amount, premium, requirements, status) VALUES (?,?,?,?,?,?,?,?,?,?,?)');
  insertProduct.run('PlatinumCard', 'credit_card', 'Premium platinum credit card with exclusive rewards', 50000, 500000, 15.99, null, null, null, 'Income > 50000, Credit Score > 750', 'active');
  insertProduct.run('GoldCard', 'credit_card', 'Gold credit card with travel benefits', 25000, 200000, 18.99, null, null, null, 'Income > 30000, Credit Score > 700', 'active');
  insertProduct.run('HomeLoan', 'loan', 'Affordable home loans at competitive rates', 1000000, 10000000, 8.5, 240, null, null, 'Income > 25000, Employment 2+ years', 'active');
  insertProduct.run('PersonalLoan', 'loan', 'Quick personal loans for any need', 100000, 2000000, 12.5, 60, null, null, 'Income > 20000, Credit Score > 650', 'active');
  insertProduct.run('LifeShield Insurance', 'insurance', 'Comprehensive life insurance coverage', null, null, null, null, 5000000, 5000, 'Age 18-60, Medical clearance', 'active');

  const insertLead = db.prepare('INSERT INTO leads (first_name, last_name, email, phone, city, state, income, employment_type, credit_score_range, source, product_interest, status, assigned_to, team_id, score, notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
  insertLead.run('Amit', 'Patel', 'amit@gmail.com', '9876543210', 'Mumbai', 'Maharashtra', 85000, 'salaried', '750+', 'website', 'credit_card', 'new', 3, 1, 90, 'Interested in platinum card');
  insertLead.run('Sunita', 'Reddy', 'sunita@gmail.com', '9876543211', 'Chennai', 'Tamil Nadu', 60000, 'salaried', '650-750', 'referral', 'loan', 'contacted', 4, 1, 70, 'Needs home loan info');
  insertLead.run('Vikram', 'Singh', 'vikram@gmail.com', '9876543212', 'Delhi', 'Delhi', 120000, 'self_employed', '750+', 'campaign', 'loan', 'qualified', 3, 1, 95, 'High value prospect');
  insertLead.run('Meena', 'Nair', 'meena@gmail.com', '9876543213', 'Kochi', 'Kerala', 45000, 'salaried', '500-650', 'website', 'insurance', 'proposal', 5, 2, 60, 'Interested in life insurance');
  insertLead.run('Rajesh', 'Kumar', 'rajesh@gmail.com', '9876543214', 'Bengaluru', 'Karnataka', 95000, 'salaried', '750+', 'referral', 'credit_card', 'negotiation', 3, 1, 90, 'Excellent credit history');
  insertLead.run('Ananya', 'Joshi', 'ananya@gmail.com', '9876543215', 'Pune', 'Maharashtra', 75000, 'salaried', '650-750', 'social', 'loan', 'closed_won', 4, 1, 70, 'Loan disbursed successfully');
  insertLead.run('Karthik', 'Menon', 'karthik@gmail.com', '9876543216', 'Hyderabad', 'Telangana', 55000, 'salaried', '650-750', 'website', 'insurance', 'closed_won', 5, 2, 70, 'Policy issued');
  insertLead.run('Deepa', 'Verma', 'deepa@gmail.com', '9876543217', 'Jaipur', 'Rajasthan', 40000, 'salaried', '300-500', 'campaign', 'credit_card', 'closed_lost', 3, 1, 30, 'Did not meet eligibility');
  insertLead.run('Suresh', 'Iyer', 'suresh@gmail.com', '9876543218', 'Mumbai', 'Maharashtra', 150000, 'self_employed', '750+', 'referral', 'loan', 'new', 4, 1, 95, 'HNI customer');
  insertLead.run('Kavitha', 'Pillai', 'kavitha@gmail.com', '9876543219', 'Trivandrum', 'Kerala', 65000, 'salaried', '750+', 'website', 'insurance', 'contacted', 5, 2, 90, 'Follow up scheduled');
  insertLead.run('Nikhil', 'Shah', 'nikhil@gmail.com', '9876543220', 'Ahmedabad', 'Gujarat', 90000, 'salaried', '750+', 'social', 'credit_card', 'qualified', 3, 1, 90, 'Verified documents');
  insertLead.run('Pooja', 'Mehta', 'pooja@gmail.com', '9876543221', 'Surat', 'Gujarat', 70000, 'salaried', '650-750', 'referral', 'loan', 'proposal', 4, 1, 80, 'Proposal under review');
  insertLead.run('Arun', 'Krishnan', 'arun@gmail.com', '9876543222', 'Chennai', 'Tamil Nadu', 110000, 'salaried', '750+', 'website', 'loan', 'negotiation', 5, 2, 90, 'High income salaried');
  insertLead.run('Lalitha', 'Rao', 'lalitha@gmail.com', '9876543223', 'Vizag', 'Andhra Pradesh', 48000, 'salaried', '500-650', 'campaign', 'insurance', 'new', 3, 1, 50, 'New lead from website');
  insertLead.run('Manish', 'Tiwari', 'manish@gmail.com', '9876543224', 'Bhopal', 'Madhya Pradesh', 55000, 'salaried', '650-750', 'social', 'credit_card', 'contacted', 4, 1, 70, 'Called once, will follow up');
  insertLead.run('Rekha', 'Pandey', 'rekha@gmail.com', '9876543225', 'Lucknow', 'Uttar Pradesh', 52000, 'salaried', '500-650', 'website', 'loan', 'closed_won', 5, 2, 50, 'Personal loan approved');
  insertLead.run('Sanjay', 'Mishra', 'sanjay@gmail.com', '9876543226', 'Patna', 'Bihar', 38000, 'salaried', '300-500', 'referral', 'insurance', 'closed_lost', 3, 1, 30, 'Low income, not eligible');
  insertLead.run('Geeta', 'Bhat', 'geeta@gmail.com', '9876543227', 'Mangalore', 'Karnataka', 62000, 'salaried', '650-750', 'campaign', 'credit_card', 'qualified', 4, 1, 70, 'Pre-approved offer sent');
  insertLead.run('Prakash', 'Nanda', 'prakash@gmail.com', '9876543228', 'Bhubaneswar', 'Odisha', 72000, 'self_employed', '750+', 'website', 'loan', 'proposal', 5, 2, 85, 'Business loan discussion');
  insertLead.run('Divya', 'Chatterjee', 'divya@gmail.com', '9876543229', 'Kolkata', 'West Bengal', 80000, 'salaried', '750+', 'social', 'insurance', 'negotiation', 3, 1, 90, 'Keen on family plan');

  const insertApp = db.prepare('INSERT INTO applications (lead_id, product_id, agent_id, amount, status, notes) VALUES (?,?,?,?,?,?)');
  insertApp.run(6, 3, 4, 1500000, 'disbursed', 'Home loan disbursed');
  insertApp.run(7, 5, 5, null, 'approved', 'Insurance policy approved');
  insertApp.run(5, 1, 3, 300000, 'submitted', 'Platinum card application');
  insertApp.run(3, 3, 3, 5000000, 'under_review', 'Large home loan under review');
  insertApp.run(12, 4, 4, 800000, 'submitted', 'Personal loan application');
  insertApp.run(13, 3, 5, 3000000, 'approved', 'Home loan approved');
  insertApp.run(16, 4, 5, 600000, 'disbursed', 'Personal loan disbursed');
  insertApp.run(19, 4, 5, 1200000, 'under_review', 'Business loan under review');
  insertApp.run(11, 1, 3, 200000, 'submitted', 'Platinum card');
  insertApp.run(18, 2, 4, 150000, 'submitted', 'Gold card application');

  const insertTx = db.prepare('INSERT INTO transactions (application_id, lead_id, type, amount, description, date) VALUES (?,?,?,?,?,?)');
  insertTx.run(1, 6, 'disbursement', 1500000, 'Home Loan disbursed', '2025-12-01');
  insertTx.run(7, 16, 'disbursement', 600000, 'Personal Loan disbursed', '2025-12-05');
  insertTx.run(1, 6, 'payment', 18500, 'EMI payment - Jan', '2026-01-05');
  insertTx.run(1, 6, 'payment', 18500, 'EMI payment - Feb', '2026-02-05');
  insertTx.run(7, 16, 'payment', 14200, 'EMI payment - Jan', '2026-01-10');
  insertTx.run(2, 7, 'premium', 5000, 'Annual premium paid', '2026-01-15');
  insertTx.run(3, 5, 'disbursement', 300000, 'Credit card limit approved', '2026-01-20');
  insertTx.run(6, 13, 'disbursement', 3000000, 'Home Loan approved', '2026-02-10');
  insertTx.run(null, 5, 'commission', 15000, 'Agent commission - Platinum card', '2026-01-20');
  insertTx.run(null, 6, 'commission', 22500, 'Agent commission - Home Loan', '2025-12-01');
  insertTx.run(null, 7, 'commission', 8400, 'Agent commission - Insurance', '2026-01-15');
  insertTx.run(null, 16, 'commission', 9000, 'Agent commission - Personal Loan', '2025-12-05');
  insertTx.run(null, 13, 'commission', 18000, 'Agent commission - Home Loan', '2026-02-10');
  insertTx.run(1, 6, 'payment', 18500, 'EMI payment - Mar', '2026-03-05');
  insertTx.run(7, 16, 'payment', 14200, 'EMI payment - Feb', '2026-02-10');
  insertTx.run(null, 12, 'disbursement', 800000, 'Personal loan disbursement pending', '2026-03-01');
  insertTx.run(null, 3, 'disbursement', 5000000, 'Home loan review', '2026-02-01');
  insertTx.run(2, 7, 'premium', 5000, 'Premium - Feb', '2026-02-15');
  insertTx.run(null, 9, 'disbursement', 2000000, 'HNI loan disbursement', '2026-04-01');
  insertTx.run(null, 19, 'disbursement', 1200000, 'Business loan', '2026-04-10');

  const insertAct = db.prepare('INSERT INTO activities (lead_id, agent_id, type, description, created_at) VALUES (?,?,?,?,?)');
  insertAct.run(1, 3, 'call', 'Initial call - interested in Platinum Card', '2026-01-02 10:00:00');
  insertAct.run(2, 4, 'email', 'Sent loan details and eligibility criteria', '2026-01-03 11:30:00');
  insertAct.run(3, 3, 'meeting', 'In-person meeting, discussed home loan options', '2026-01-04 14:00:00');
  insertAct.run(4, 5, 'call', 'Explained insurance benefits and premium structure', '2026-01-05 09:00:00');
  insertAct.run(5, 3, 'call', 'Discussed card features and credit limit options', '2026-01-06 15:00:00');
  insertAct.run(6, 4, 'note', 'Documents submitted - waiting for bank approval', '2026-01-07 16:00:00');
  insertAct.run(7, 5, 'meeting', 'Policy signing meeting completed successfully', '2026-01-08 11:00:00');
  insertAct.run(9, 4, 'call', 'Initial inquiry - HNI customer, very promising', '2026-01-09 10:00:00');
  insertAct.run(10, 5, 'email', 'Sent insurance brochure and premium calculator', '2026-01-10 14:00:00');
  insertAct.run(11, 3, 'call', 'Customer very interested, scheduling branch visit', '2026-01-11 11:00:00');
  insertAct.run(12, 4, 'meeting', 'Loan application discussion, needs 800K personal loan', '2026-01-12 15:00:00');
  insertAct.run(13, 5, 'call', 'Reviewed loan terms, customer agreed to proceed', '2026-01-13 10:00:00');
  insertAct.run(3, 3, 'email', 'Sent application form and document checklist', '2026-01-14 09:00:00');
  insertAct.run(5, 3, 'note', 'Credit check passed - proceeding with application', '2026-01-15 17:00:00');
  insertAct.run(19, 5, 'meeting', 'Visited client office for business loan discussion', '2026-01-16 14:00:00');
  insertAct.run(20, 3, 'call', 'Follow up on insurance quote, customer interested', '2026-01-17 11:00:00');
  insertAct.run(14, 3, 'email', 'Sent insurance policy comparison document', '2026-01-18 10:00:00');
  insertAct.run(15, 4, 'call', 'Customer requested lower EMI option for loan', '2026-01-19 09:00:00');
  insertAct.run(1, 3, 'note', 'KYC documents collected - PAN, Aadhaar, salary slips', '2026-01-20 16:00:00');
  insertAct.run(2, 4, 'meeting', 'Branch visit - verification and document check complete', '2026-01-21 14:00:00');

  const insertComm = db.prepare('INSERT INTO commissions (agent_id, application_id, amount, rate, status) VALUES (?,?,?,?,?)');
  insertComm.run(4, 1, 22500, 1.5, 'paid');
  insertComm.run(5, 2, 8400, 7.0, 'paid');
  insertComm.run(3, 3, 15000, 5.0, 'pending');
  insertComm.run(3, 4, 37500, 0.75, 'pending');
  insertComm.run(5, 7, 9000, 1.5, 'paid');
}

initDB();

module.exports = db;
