import Database from 'better-sqlite3';
import encryptionService from '../services/encryption.service.js';

class ApiKeyModel {
  constructor() {
    this.db = new Database('fixyourprompts.db');
  }

  /**
   * Creates a new API key entry for a user
   * @param {Object} keyData - The key data to store
   * @param {string} keyData.userId - The user ID
   * @param {string} keyData.provider - The provider name
   * @param {string} keyData.apiKey - The plain text API key
   * @param {boolean} keyData.isValid - Whether the key is valid
   * @returns {Object} The created key record (without decrypted key)
   */
  create(keyData) {
    const { userId, provider, apiKey, isValid = false } = keyData;

    // Generate salt and encrypt the key
    const salt = encryptionService.generateSalt();
    const { encrypted } = encryptionService.encrypt(apiKey, salt);
    const maskedKey = encryptionService.maskApiKey(apiKey);

    const stmt = this.db.prepare(`
      INSERT INTO user_api_keys (
        user_id, provider, encrypted_key, key_salt, masked_key, is_valid, last_validated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const lastValidatedAt = isValid ? new Date().toISOString() : null;
    
    try {
      const result = stmt.run(
        userId,
        provider.toLowerCase(),
        encrypted,
        salt,
        maskedKey,
        isValid ? 1 : 0,
        lastValidatedAt
      );

      return this.findById(result.lastInsertRowid);
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error(`API key for provider ${provider} already exists for this user`);
      }
      throw error;
    }
  }

  /**
   * Finds an API key by user ID and provider
   * @param {string} userId - The user ID
   * @param {string} provider - The provider name
   * @returns {Object|null} The key record (without decrypted key)
   */
  findByUserAndProvider(userId, provider) {
    const stmt = this.db.prepare(`
      SELECT 
        id, user_id, provider, masked_key, is_valid, 
        last_validated_at, created_at, updated_at
      FROM user_api_keys
      WHERE user_id = ? AND provider = ?
    `);

    const row = stmt.get(userId, provider.toLowerCase());
    return row ? this.formatKeyRecord(row) : null;
  }

  /**
   * Finds an API key by ID
   * @param {number} id - The key ID
   * @returns {Object|null} The key record (without decrypted key)
   */
  findById(id) {
    const stmt = this.db.prepare(`
      SELECT 
        id, user_id, provider, masked_key, is_valid, 
        last_validated_at, created_at, updated_at
      FROM user_api_keys
      WHERE id = ?
    `);

    const row = stmt.get(id);
    return row ? this.formatKeyRecord(row) : null;
  }

  /**
   * Gets the decrypted API key for a user and provider
   * @param {string} userId - The user ID
   * @param {string} provider - The provider name
   * @returns {string|null} The decrypted API key or null if not found
   */
  getDecryptedKey(userId, provider) {
    const stmt = this.db.prepare(`
      SELECT encrypted_key, key_salt
      FROM user_api_keys
      WHERE user_id = ? AND provider = ?
    `);

    const row = stmt.get(userId, provider.toLowerCase());
    
    if (!row) {
      return null;
    }

    try {
      return encryptionService.decrypt(row.encrypted_key, row.key_salt);
    } catch (error) {
      console.error('Failed to decrypt API key:', error);
      return null;
    }
  }

  /**
   * Updates an existing API key
   * @param {string} userId - The user ID
   * @param {string} provider - The provider name
   * @param {Object} updates - The updates to apply
   * @param {string} updates.apiKey - New API key (will be encrypted)
   * @param {boolean} updates.isValid - Whether the key is valid
   * @returns {Object|null} The updated key record (without decrypted key)
   */
  update(userId, provider, updates) {
    const existing = this.findByUserAndProvider(userId, provider);
    
    if (!existing) {
      return null;
    }

    const fieldsToUpdate = [];
    const values = [];

    if (updates.apiKey !== undefined) {
      const salt = encryptionService.generateSalt();
      const { encrypted } = encryptionService.encrypt(updates.apiKey, salt);
      const maskedKey = encryptionService.maskApiKey(updates.apiKey);
      
      fieldsToUpdate.push('encrypted_key = ?', 'key_salt = ?', 'masked_key = ?');
      values.push(encrypted, salt, maskedKey);
    }

    if (updates.isValid !== undefined) {
      fieldsToUpdate.push('is_valid = ?');
      values.push(updates.isValid ? 1 : 0);
      
      if (updates.isValid) {
        fieldsToUpdate.push('last_validated_at = ?');
        values.push(new Date().toISOString());
      }
    }

    if (fieldsToUpdate.length === 0) {
      return existing;
    }

    fieldsToUpdate.push('updated_at = CURRENT_TIMESTAMP');
    values.push(userId, provider.toLowerCase());

    const sql = `
      UPDATE user_api_keys
      SET ${fieldsToUpdate.join(', ')}
      WHERE user_id = ? AND provider = ?
    `;

    const stmt = this.db.prepare(sql);
    stmt.run(...values);

    return this.findByUserAndProvider(userId, provider);
  }

  /**
   * Deletes an API key
   * @param {string} userId - The user ID
   * @param {string} provider - The provider name
   * @returns {boolean} True if deleted, false if not found
   */
  delete(userId, provider) {
    const stmt = this.db.prepare(`
      DELETE FROM user_api_keys
      WHERE user_id = ? AND provider = ?
    `);

    const result = stmt.run(userId, provider.toLowerCase());
    return result.changes > 0;
  }

  /**
   * Lists all API keys for a user
   * @param {string} userId - The user ID
   * @returns {Array} Array of key records (without decrypted keys)
   */
  listByUser(userId) {
    const stmt = this.db.prepare(`
      SELECT 
        id, user_id, provider, masked_key, is_valid, 
        last_validated_at, created_at, updated_at
      FROM user_api_keys
      WHERE user_id = ?
      ORDER BY provider
    `);

    const rows = stmt.all(userId);
    return rows.map(row => this.formatKeyRecord(row));
  }

  /**
   * Updates the validation status of a key
   * @param {string} userId - The user ID
   * @param {string} provider - The provider name
   * @param {boolean} isValid - Whether the key is valid
   * @returns {Object|null} The updated key record
   */
  updateValidationStatus(userId, provider, isValid) {
    return this.update(userId, provider, { isValid });
  }

  /**
   * Formats a database row into a clean key record
   * @param {Object} row - The database row
   * @returns {Object} The formatted key record
   */
  formatKeyRecord(row) {
    return {
      id: row.id,
      userId: row.user_id,
      provider: row.provider,
      maskedKey: row.masked_key,
      isValid: Boolean(row.is_valid),
      lastValidatedAt: row.last_validated_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  /**
   * Closes the database connection
   */
  close() {
    this.db.close();
  }
}

export default new ApiKeyModel();