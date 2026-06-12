require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'fintech-secret-key';

app.use(cors());
app.use(express.json());

// JWT auth middleware
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    req.user = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Mount routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/leads', authMiddleware, require('./routes/leads'));
app.use('/api/users', authMiddleware, require('./routes/users'));
app.use('/api/teams', authMiddleware, require('./routes/teams'));
app.use('/api/products', authMiddleware, require('./routes/products'));
app.use('/api/applications', authMiddleware, require('./routes/applications'));
app.use('/api/transactions', authMiddleware, require('./routes/transactions'));
app.use('/api/dashboard', authMiddleware, require('./routes/dashboard'));
app.use('/api/commissions', authMiddleware, require('./routes/commissions'));
app.use('/api/activities', authMiddleware, require('./routes/activities'));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
