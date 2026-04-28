const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('pg'); // Explicitly require pg so Vercel's bundler includes it for Sequelize

let sequelize;



if (process.env.DATABASE_URL) {
  console.log('📡 Using DATABASE_URL for Sequelize...');
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
  if (process.env.VERCEL) {
    console.warn('⚠️ WARNING: DATABASE_URL is missing in Vercel environment! Falling back to local MySQL (which will fail).');
  }
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT || 'mysql',
      logging: false,
    }
  );
}


sequelize.authenticate()
  .then(() => console.log(`✅ ${process.env.DATABASE_URL ? 'Cloud PostgreSQL' : 'Local ' + (process.env.DB_DIALECT || 'MySQL')} connected successfully.`))
  .catch((err) => console.error('❌ Database connection error:', err));

module.exports = sequelize;
