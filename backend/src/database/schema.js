
import Database from 'better-sqlite3';

const db = new Database('fixyourprompts.db', { verbose: console.log });

const createPromptSessionTable = `
  CREATE TABLE IF NOT EXISTS PromptSession (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    original_prompt TEXT NOT NULL CHECK(length(original_prompt) <= 4096),
    refined_prompt TEXT NOT NULL,
    analysis_summary TEXT
  );
`;

db.exec(createPromptSessionTable);

console.log('Database schema initialized.');
db.close();
