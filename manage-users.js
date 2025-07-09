const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function promoteUserToAdmin(email) {
  try {
    const result = await pool.query(
      'UPDATE users SET role = $2 WHERE email = $1 RETURNING *',
      [email, 'admin']
    );
    
    if (result.rows.length > 0) {
      console.log(`✅ Successfully promoted ${email} to admin`);
      console.log('User details:', result.rows[0]);
    } else {
      console.log(`❌ User with email ${email} not found`);
      console.log('Make sure the user has signed in with Google at least once.');
    }
  } catch (error) {
    console.error('❌ Error promoting user:', error.message);
  } finally {
    await pool.end();
  }
}

async function listAllUsers() {
  try {
    const result = await pool.query(
      'SELECT id, email, role, name, created_at FROM users ORDER BY created_at DESC'
    );
    
    console.log('\n📋 All Users:');
    console.log('='.repeat(80));
    
    if (result.rows.length === 0) {
      console.log('No users found. Users will be created when they first sign in with Google.');
    } else {
      result.rows.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} (${user.role}) - ${user.name || 'No name'}`);
        console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('❌ Error fetching users:', error.message);
  } finally {
    await pool.end();
  }
}

// Command line usage
const command = process.argv[2];
const email = process.argv[3];

if (command === 'promote' && email) {
  promoteUserToAdmin(email);
} else if (command === 'list') {
  listAllUsers();
} else {
  console.log('🔧 User Management Script');
  console.log('');
  console.log('Usage:');
  console.log('  node manage-users.js list                    # List all users');
  console.log('  node manage-users.js promote user@gmail.com  # Promote user to admin');
  console.log('');
  console.log('Examples:');
  console.log('  node manage-users.js list');
  console.log('  node manage-users.js promote john.doe@gmail.com');
}
