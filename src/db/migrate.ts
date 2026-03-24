import fs from 'fs';
import path from 'path';
import { Client } from 'pg';
import 'dotenv/config';

async function migrate() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();
    console.log('Connected to database');

    const sql = fs.readFileSync(
      path.join(__dirname, '../../migrations/001_init.sql'),
      'utf-8'
    );

    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');

    console.log('Migration applied successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();