const { Sequelize } = require('sequelize');
const path = require('path');

// Load .env relative to THIS file's location (works in both local dev & Vercel serverless)
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') }); // fallback for Vercel root

require('pg'); // Explicitly require pg so Vercel's bundler includes it

let sequelize;

if (process.env.DATABASE_URL) {
  console.log('📡 Using DATABASE_URL (PostgreSQL)...');
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false,
  });
} else {
  console.warn('⚠️ DATABASE_URL not found — using local MySQL config.');
  sequelize = new Sequelize(
    process.env.DB_NAME || 'portfolio_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      dialect: process.env.DB_DIALECT || 'mysql',
      logging: false,
    }
  );
}

sequelize.authenticate()
  .then(() => console.log(`✅ Database connected (${process.env.DATABASE_URL ? 'PostgreSQL/Supabase' : 'Local MySQL'})`))
  .catch((err) => console.error('❌ Database connection error:', err.message));

module.exports = sequelize;
