# Data Model: User API Keys

## Entities

### UserApiKey
Primary entity for storing encrypted API keys per user and provider.

**Fields**:
- `id`: INTEGER PRIMARY KEY - Unique identifier
- `user_id`: TEXT NOT NULL - User identifier (from auth system)
- `provider`: TEXT - Provider name ('openai', 'anthropic', 'openrouter')
- `encrypted_key`: TEXT NOT NULL - AES-256-GCM encrypted API key
- `key_salt`: TEXT NOT NULL - Unique salt for this key's encryption
- `is_active`: BOOLEAN DEFAULT true - Whether key is currently active
- `validated_at`: TIMESTAMP - Last successful validation time
- `created_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

**Constraints**:
- UNIQUE(user_id, provider) - One key per provider per user
- CHECK(provider IN ('openai', 'anthropic', 'openrouter'))

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `(user_id, provider)` for fast lookups
- INDEX on `user_id` for listing user's keys

## State Transitions

### API Key Lifecycle
```
[Not Configured] → [Pending Validation] → [Active]
                         ↓                    ↓
                    [Invalid]            [Updated]
                                             ↓
                                        [Deleted]
```

**States**:
- **Not Configured**: No key exists for provider
- **Pending Validation**: Key entered, validation in progress
- **Active**: Key validated and ready for use
- **Invalid**: Validation failed, needs update
- **Updated**: Existing key replaced with new one
- **Deleted**: Key removed from system

## Validation Rules

### UserApiKey Validation
1. **provider**: Must be one of: 'openai', 'anthropic', 'openrouter'
2. **encrypted_key**: 
   - Must be non-empty after encryption
   - Original key must match provider's format before encryption
3. **key_salt**: 
   - Must be unique per key
   - Minimum 32 bytes (64 hex chars)
4. **user_id**: 
   - Must exist in authentication system
   - Cannot be empty

### Business Rules
1. **One Active Key Per Provider**: User can only have one active key per provider
2. **Validation Required**: Keys must be validated before becoming active
3. **Secure Storage**: All keys must be encrypted before storage
4. **No Key Sharing**: Keys are user-specific, no sharing between users
5. **Update Replaces**: Updating a key replaces the existing one (no history)

## Relationships

### User → UserApiKey
- One-to-Many: One user can have multiple API keys (max one per provider)
- Cascade delete: If user is deleted, all their API keys are deleted

### Provider Configuration
Static configuration per provider (not stored in DB):
```javascript
{
  openai: {
    name: "OpenAI",
    validationEndpoint: "https://api.openai.com/v1/models",
    keyPrefix: "sk-"
  },
  anthropic: {
    name: "Anthropic", 
    validationEndpoint: "https://api.anthropic.com/v1/messages",
    keyPrefix: "sk-ant-"
  },
  openrouter: {
    name: "OpenRouter",
    validationEndpoint: "https://openrouter.ai/api/v1/auth/key",
    keyPrefix: "sk-or-"
  }
}
```

## Security Considerations

### Encryption Details
- **Algorithm**: AES-256-GCM
- **Key Derivation**: PBKDF2 from master key + user_id
- **Salt**: Unique 32-byte random salt per key
- **IV**: Random 16-byte IV per encryption operation
- **Auth Tag**: GCM provides built-in authentication

### Access Control
- Users can only access their own keys
- Keys are never returned in API responses (only metadata)
- Decryption only happens server-side for API calls
- Frontend shows masked version (last 4 chars only)

## Migration Support
- Initial version - no migrations needed
- Future: Add `version` field for key format changes
- Future: Add `last_used_at` for usage tracking