import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const SALT_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const PBKDF2_ITERATIONS = 100000;
const KEY_LENGTH = 32;

class EncryptionService {
  constructor() {
    this.encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-for-development-only';
    if (!process.env.ENCRYPTION_KEY && process.env.NODE_ENV === 'production') {
      throw new Error('ENCRYPTION_KEY must be set in production environment');
    }
  }

  /**
   * Derives a key from the master key and salt using PBKDF2
   * @param {Buffer} salt - The salt for key derivation
   * @returns {Buffer} The derived key
   */
  deriveKey(salt) {
    return crypto.pbkdf2Sync(this.encryptionKey, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha256');
  }

  /**
   * Encrypts plaintext using AES-256-GCM
   * @param {string} plaintext - The text to encrypt
   * @param {string} salt - Optional salt (will be generated if not provided)
   * @returns {object} Object containing encrypted data and salt
   */
  encrypt(plaintext, salt = null) {
    try {
      // Generate or use provided salt
      const saltBuffer = salt 
        ? Buffer.from(salt, 'hex') 
        : crypto.randomBytes(SALT_LENGTH);
      
      // Derive key from salt
      const key = this.deriveKey(saltBuffer);
      
      // Generate random IV
      const iv = crypto.randomBytes(IV_LENGTH);
      
      // Create cipher
      const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
      
      // Encrypt the plaintext
      const encrypted = Buffer.concat([
        cipher.update(plaintext, 'utf8'),
        cipher.final()
      ]);
      
      // Get the authentication tag
      const authTag = cipher.getAuthTag();
      
      // Combine IV, authTag, and encrypted data
      const combined = Buffer.concat([iv, authTag, encrypted]);
      
      return {
        encrypted: combined.toString('hex'),
        salt: saltBuffer.toString('hex')
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypts ciphertext using AES-256-GCM
   * @param {string} ciphertext - The hex-encoded encrypted data
   * @param {string} salt - The hex-encoded salt used for encryption
   * @returns {string} The decrypted plaintext
   */
  decrypt(ciphertext, salt) {
    try {
      // Convert from hex strings to buffers
      const saltBuffer = Buffer.from(salt, 'hex');
      const combined = Buffer.from(ciphertext, 'hex');
      
      // Extract IV, authTag, and encrypted data
      const iv = combined.slice(0, IV_LENGTH);
      const authTag = combined.slice(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
      const encrypted = combined.slice(IV_LENGTH + TAG_LENGTH);
      
      // Derive key from salt
      const key = this.deriveKey(saltBuffer);
      
      // Create decipher
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(authTag);
      
      // Decrypt the data
      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
      ]);
      
      return decrypted.toString('utf8');
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Generates a unique salt
   * @returns {string} Hex-encoded salt
   */
  generateSalt() {
    return crypto.randomBytes(SALT_LENGTH).toString('hex');
  }

  /**
   * Creates a masked version of an API key for display
   * @param {string} apiKey - The API key to mask
   * @returns {string} Masked API key
   */
  maskApiKey(apiKey) {
    if (!apiKey || apiKey.length < 8) {
      return '***';
    }
    const visibleStart = 3;
    const visibleEnd = 4;
    const start = apiKey.substring(0, visibleStart);
    const end = apiKey.substring(apiKey.length - visibleEnd);
    return `${start}...${end}`;
  }
}

export default new EncryptionService();