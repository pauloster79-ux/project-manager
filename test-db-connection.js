// Simple test script to verify database connection
const { Client } = require('pg');

// Try the Transaction Pooler connection string (corrected hostname)
const DATABASE_URL = 'postgresql://postgres.whyzabaxiqaqffezmrzh:2%21nXxiC%21%3F68Jn7T@aws-1-eu-west-2.pooler.supabase.com:6543/postgres';

console.log('Testing database connection...');
console.log('Connection string:', DATABASE_URL.replace(/:[^:@]*@/, ':***@')); // Hide password

const client = new Client({ connectionString: DATABASE_URL });

client.connect()
  .then(() => {
    console.log('✅ Database connection successful!');
    return client.query('SELECT version()');
  })
  .then((result) => {
    console.log('✅ Database version:', result.rows[0].version);
    return client.end();
  })
  .then(() => {
    console.log('✅ Connection closed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  });
