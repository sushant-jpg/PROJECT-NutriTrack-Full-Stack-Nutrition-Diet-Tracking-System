// Non-destructive setup for fresh databases and the empty legacy NutriTrack schema.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function setup() {
  const database = process.env.DB_NAME || 'nutritrack';
  if (database !== 'nutritrack') throw new Error('This setup script is restricted to the nutritrack database.');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1', port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || ''
  });
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    for (const sql of schema.split(';').map((part) => part.trim()).filter(Boolean)) await connection.query(sql);

    const [columns] = await connection.query(
      'SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ?', [database]
    );
    const has = (table, column) => columns.some((item) => item.TABLE_NAME === table && item.COLUMN_NAME === column);
    const mealId = columns.find((item) => item.TABLE_NAME === 'meals' && item.COLUMN_NAME === 'id');
    const [[mealCount]] = await connection.query('SELECT COUNT(*) AS total FROM meals');
    if (mealCount.total > 0 && (mealId.DATA_TYPE !== 'bigint' || !has('meals', 'occurred_at'))) {
      throw new Error('Legacy meals contain data. Preserve their IDs and establish actual occurrence times before migration; no meals were modified.');
    }
    if (mealId.DATA_TYPE !== 'bigint') {
      await connection.query('ALTER TABLE meals MODIFY id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT');
    }
    if (!has('meals', 'occurred_at')) await connection.query('ALTER TABLE meals ADD occurred_at DATETIME NOT NULL');
    for (const table of ['users', 'meals']) {
      if (!has(table, 'updated_at')) {
        await connection.query(`ALTER TABLE ${table} ADD updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
      }
    }
    await connection.query('ALTER TABLE users ALTER joined SET DEFAULT (CURRENT_DATE)');
    await connection.query('ALTER TABLE meals MODIFY unit VARCHAR(40) NOT NULL');
    const [indexes] = await connection.query(
      'SELECT TABLE_NAME, INDEX_NAME FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = ?', [database]
    );
    const wanted = [
      ['users', 'idx_users_status', 'status'], ['users', 'idx_users_created_at', 'created_at'],
      ['meals', 'idx_meals_user_occurred', 'user_id, occurred_at'],
      ['meals', 'idx_meals_occurred_at', 'occurred_at'], ['meals', 'idx_meals_type', 'meal_type']
    ];
    for (const [table, name, fields] of wanted) {
      if (!indexes.some((item) => item.TABLE_NAME === table && item.INDEX_NAME === name)) {
        await connection.query(`CREATE INDEX ${name} ON ${table} (${fields})`);
      }
    }
    console.log('NutriTrack schema is ready. No tables or existing records were deleted.');
  } finally { await connection.end(); }
}

setup().catch((error) => { console.error(error.message); process.exitCode = 1; });
