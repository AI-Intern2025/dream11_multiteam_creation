// Simple test to verify database connection and users
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testDatabaseConnection() {
  try {
    console.log('🔗 Testing database connection...');
    console.log('📍 Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    const client = await pool.connect();
    console.log('✅ Database connection successful!');
    
    // Test if users table exists and has data
    const result = await client.query('SELECT username, role FROM users');
    console.log('📊 Users in database:', result.rows);
    
    client.release();
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('💡 Make sure your DATABASE_URL is set in .env.local');
  } finally {
    pool.end();
  }
}

testDatabaseConnection();
