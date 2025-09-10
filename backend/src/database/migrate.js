import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('fixyourprompts.db', { verbose: console.log });

// Create migrations table
db.exec(`
  CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL UNIQUE,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Get applied migrations
const getAppliedMigrations = () => {
  const rows = db.prepare('SELECT filename FROM migrations').all();
  return new Set(rows.map(row => row.filename));
};

// Run migrations
const runMigrations = () => {
  const migrationsDir = path.join(__dirname, 'migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    console.log('No migrations directory found');
    return;
  }

  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  const appliedMigrations = getAppliedMigrations();

  for (const file of migrationFiles) {
    if (!appliedMigrations.has(file)) {
      console.log(`Applying migration: ${file}`);
      
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');
      
      try {
        db.exec(sql);
        db.prepare('INSERT INTO migrations (filename) VALUES (?)').run(file);
        console.log(`✓ Migration ${file} applied successfully`);
      } catch (error) {
        console.error(`✗ Failed to apply migration ${file}:`, error);
        process.exit(1);
      }
    } else {
      console.log(`⊙ Migration ${file} already applied`);
    }
  }
};

runMigrations();
db.close();
console.log('All migrations completed successfully.');