const { Pool } = require('pg');

// Конфігурація підключення до PostgreSQL
const pgConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'checkers_game',
  password: process.env.DB_PASSWORD || '12345678',
  port: parseInt(process.env.DB_PORT || '5432'),
};

async function clearDatabase() {
  const pool = new Pool(pgConfig);

  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    
    console.log('Truncating games table...');
    await client.query('TRUNCATE TABLE games CASCADE');
    
    console.log('Truncating players table...');
    await client.query('TRUNCATE TABLE players CASCADE');
    
    console.log('Database cleared successfully');
    client.release();
  } catch (err) {
    console.error('Error clearing database:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

clearDatabase()
  .then(() => {
    console.log('Database clearing completed');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Database clearing failed:', err);
    process.exit(1);
  }); 