const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'ai_synthetic_data',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

const initDatabase = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS datasets (
        id SERIAL PRIMARY KEY,
        category VARCHAR(100) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        record_count INTEGER DEFAULT 0,
        schema_config JSONB DEFAULT '{}',
        data JSONB DEFAULT '[]',
        status VARCHAR(50) DEFAULT 'ready',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS generations (
        id SERIAL PRIMARY KEY,
        dataset_id INTEGER REFERENCES datasets(id) ON DELETE CASCADE,
        category VARCHAR(100) NOT NULL,
        prompt TEXT NOT NULL,
        result JSONB DEFAULT '{}',
        model VARCHAR(100),
        tokens_used INTEGER DEFAULT 0,
        duration_ms INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_datasets_category ON datasets(category);
      CREATE INDEX IF NOT EXISTS idx_generations_category ON generations(category);
      CREATE INDEX IF NOT EXISTS idx_generations_dataset_id ON generations(dataset_id);
    `);
    console.log('Database tables initialized successfully');
  } finally {
    client.release();
  }
};

module.exports = { pool, initDatabase };
