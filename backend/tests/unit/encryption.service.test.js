import { describe, it, expect, beforeEach } from 'vitest';
import encryptionService from '../../src/services/encryption.service.js';

describe('EncryptionService', () => {
  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt text successfully', () => {
      const plaintext = 'sk-test123456789abcdef';
      
      const { encrypted, salt } = encryptionService.encrypt(plaintext);
      
      expect(encrypted).toBeDefined();
      expect(salt).toBeDefined();
      expect(encrypted).not.toBe(plaintext);
      
      const decrypted = encryptionService.decrypt(encrypted, salt);
      expect(decrypted).toBe(plaintext);
    });

    it('should produce different ciphertexts for same plaintext with different salts', () => {
      const plaintext = 'sk-test123456789abcdef';
      
      const result1 = encryptionService.encrypt(plaintext);
      const result2 = encryptionService.encrypt(plaintext);
      
      expect(result1.encrypted).not.toBe(result2.encrypted);
      expect(result1.salt).not.toBe(result2.salt);
    });

    it('should use provided salt when given', () => {
      const plaintext = 'sk-test123456789abcdef';
      const salt = encryptionService.generateSalt();
      
      const result1 = encryptionService.encrypt(plaintext, salt);
      const result2 = encryptionService.encrypt(plaintext, salt);
      
      expect(result1.salt).toBe(salt);
      expect(result2.salt).toBe(salt);
      // Different IVs should still produce different ciphertexts
      expect(result1.encrypted).not.toBe(result2.encrypted);
    });

    it('should handle empty strings', () => {
      const plaintext = '';
      
      const { encrypted, salt } = encryptionService.encrypt(plaintext);
      const decrypted = encryptionService.decrypt(encrypted, salt);
      
      expect(decrypted).toBe(plaintext);
    });

    it('should handle special characters and unicode', () => {
      const plaintext = 'API_KEY_🔐_!@#$%^&*()_+={}[]|\\:";\'<>?,./';
      
      const { encrypted, salt } = encryptionService.encrypt(plaintext);
      const decrypted = encryptionService.decrypt(encrypted, salt);
      
      expect(decrypted).toBe(plaintext);
    });

    it('should throw error when decrypting with wrong salt', () => {
      const plaintext = 'sk-test123456789abcdef';
      const { encrypted } = encryptionService.encrypt(plaintext);
      const wrongSalt = encryptionService.generateSalt();
      
      expect(() => {
        encryptionService.decrypt(encrypted, wrongSalt);
      }).toThrow('Decryption failed');
    });

    it('should throw error when decrypting tampered ciphertext', () => {
      const plaintext = 'sk-test123456789abcdef';
      const { encrypted, salt } = encryptionService.encrypt(plaintext);
      
      // Tamper with the ciphertext
      const tamperedCiphertext = encrypted.slice(0, -2) + 'ff';
      
      expect(() => {
        encryptionService.decrypt(tamperedCiphertext, salt);
      }).toThrow('Decryption failed');
    });
  });

  describe('generateSalt', () => {
    it('should generate unique salts', () => {
      const salt1 = encryptionService.generateSalt();
      const salt2 = encryptionService.generateSalt();
      
      expect(salt1).toBeDefined();
      expect(salt2).toBeDefined();
      expect(salt1).not.toBe(salt2);
    });

    it('should generate salts of correct length', () => {
      const salt = encryptionService.generateSalt();
      // 32 bytes = 64 hex characters
      expect(salt.length).toBe(64);
    });
  });

  describe('maskApiKey', () => {
    it('should mask API key correctly', () => {
      const apiKey = 'sk-test123456789abcdef';
      const masked = encryptionService.maskApiKey(apiKey);
      
      expect(masked).toBe('sk-...cdef');
    });

    it('should handle short API keys', () => {
      const apiKey = 'short';
      const masked = encryptionService.maskApiKey(apiKey);
      
      expect(masked).toBe('***');
    });

    it('should handle empty or null API keys', () => {
      expect(encryptionService.maskApiKey('')).toBe('***');
      expect(encryptionService.maskApiKey(null)).toBe('***');
      expect(encryptionService.maskApiKey(undefined)).toBe('***');
    });

    it('should mask different API key formats', () => {
      expect(encryptionService.maskApiKey('pk_live_abcdefghijklmnop')).toBe('pk_...mnop');
      expect(encryptionService.maskApiKey('key_1234567890')).toBe('key...7890');
    });
  });
});