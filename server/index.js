const express = require('express');
const cors = require('cors');
const path = require('path');
// Load .env from server directory (works locally and on Vercel)
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { sequelize } = require('./models');


const authRoutes = require('./routes/authRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true, // In production, it's safer to reflect the origin or use a specific domain
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/portfolio', portfolioRoutes);

app.get('/', (req, res) => {
    res.json({ 
      status: 'running',
      message: 'Portfolio Builder API is running!',
      frontend: 'http://localhost:5173',
      endpoints: {
        auth: '/api/auth',
        portfolio: '/api/portfolio'
      }
    });
});


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Temporary Database Sync Endpoint (USE ONLY ONCE TO INITIALIZE VERCEL DB)
app.get('/api/sync-db', async (req, res) => {
  try {
    await sequelize.sync({ alter: true });
    res.json({ status: 'success', message: 'Database synchronized successfully' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});



// Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Global Error:", err);
  res.status(500).json({ 
    error: "Internal Server Error", 
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
  });
});

// Support Vercel startup (conditional listen)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  // Tables are already created by init_db.js — just verify connection then start
  sequelize.authenticate()
    .then(() => {
      console.log('✅ Database connection verified.');
      app.listen(PORT, () => console.log(`🚀 Server is running on: http://localhost:${PORT}`));
    })
    .catch((err) => console.error('❌ Database connection error:', err));
}


// Export for Vercel Functions
module.exports = app;