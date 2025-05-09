const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL database');
    client.release();
  } catch (error) {
    console.error('Database connection error:', error.message);
  }
};

// Run test connection on startup
testConnection();

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect()
};

