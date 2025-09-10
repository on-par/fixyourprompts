-- Migration: Create user_api_keys table for storing encrypted API keys
-- Created: 2025-09-10
-- Description: Store user-provided API keys for OpenAI, Anthropic, and OpenRouter

CREATE TABLE IF NOT EXISTS user_api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    provider TEXT NOT NULL CHECK(provider IN ('openai', 'anthropic', 'openrouter')),
    encrypted_key TEXT NOT NULL,
    key_salt TEXT NOT NULL,
    masked_key TEXT NOT NULL,
    is_valid BOOLEAN DEFAULT 0,
    last_validated_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, provider)
);

-- Index for fast lookups by user_id
CREATE INDEX IF NOT EXISTS idx_user_api_keys_user_id 
ON user_api_keys(user_id);

-- Composite index for user_id and provider
CREATE INDEX IF NOT EXISTS idx_user_api_keys_user_provider 
ON user_api_keys(user_id, provider);

-- Trigger to update updated_at on row changes
CREATE TRIGGER IF NOT EXISTS update_user_api_keys_updated_at
AFTER UPDATE ON user_api_keys
FOR EACH ROW
BEGIN
    UPDATE user_api_keys 
    SET updated_at = CURRENT_TIMESTAMP 
    WHERE id = NEW.id;
END;