const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Конфігурація підключення до PostgreSQL
const pgConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  password: process.env.DB_PASSWORD || '12345678',
  port: parseInt(process.env.DB_PORT || '5432'),
};

async function initializeDatabase() {
  const mainPool = new Pool({
    ...pgConfig,
    // Підключаємось спочатку до стандартної бази postgres, щоб створити нову базу
    database: 'postgres',
  });

  try {
    // Перевіряємо чи існує база даних checkers_game
    const dbCheckResult = await mainPool.query(
      "SELECT 1 FROM pg_database WHERE datname = 'checkers_game'"
    );

    // Якщо база даних не існує, створюємо її
    if (dbCheckResult.rows.length === 0) {
      console.log('Creating database checkers_game...');
      await mainPool.query('CREATE DATABASE checkers_game');
      console.log('Database created successfully');
    } else {
      console.log('Database checkers_game already exists');
    }
  } catch (err) {
    console.error('Error checking/creating database:', err);
    process.exit(1);
  } finally {
    await mainPool.end();
  }

  // Підключаємося до створеної бази даних для створення таблиць
  const dbPool = new Pool({
    ...pgConfig,
    database: 'checkers_game',
  });

  try {
    // Зчитуємо SQL файл для створення таблиць
    const sqlFilePath = path.join(__dirname, '../src/models/database.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('Creating tables...');
    await dbPool.query(sqlScript);
    console.log('Tables created successfully');
  } catch (err) {
    console.error('Error creating tables:', err);
    if (err.message.includes('already exists')) {
      console.log('Tables might already exist. This is not a critical error.');
    } else {
      process.exit(1);
    }
  } finally {
    await dbPool.end();
  }
}

initializeDatabase()
  .then(() => {
    console.log('Database initialization completed');
  })
  .catch((err) => {
    console.error('Database initialization failed:', err);
    process.exit(1);
  }); 