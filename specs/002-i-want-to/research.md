# Research: User-Provided API Keys Implementation

## Executive Summary
Research findings for implementing user-provided API keys for OpenAI, Anthropic, and OpenRouter with a focus on simplicity and security.

## Key Technical Decisions

### 1. Encryption Strategy
**Decision**: AES-256-GCM encryption with per-user salts
**Rationale**: 
- Industry standard for sensitive data
- GCM mode provides authentication + encryption
- Per-user salts prevent rainbow table attacks
**Alternatives considered**:
- Client-side only storage: Rejected - poor UX, users must re-enter keys
- HSM/Vault services: Rejected - overkill for MVP, adds complexity

### 2. API Key Validation
**Decision**: Validate on entry with minimal test API call
**Rationale**:
- Immediate feedback to users
- Prevents storing invalid keys
- Each provider has different validation endpoints
**Implementation**:
- OpenAI: GET /v1/models (minimal cost)
- Anthropic: GET /v1/messages with max_tokens=1
- OpenRouter: GET /api/v1/auth/key

### 3. Database Schema
**Decision**: Single table with provider enum
**Rationale**: Simple, normalized, easy to query
**Schema**:
```sql
user_api_keys (
  id INTEGER PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider TEXT CHECK(provider IN ('openai', 'anthropic', 'openrouter')),
  encrypted_key TEXT NOT NULL,
  key_salt TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  validated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, provider)
)
```

### 4. Frontend State Management
**Decision**: React Context for provider selection
**Rationale**: 
- Simple state sharing across components
- No need for Redux/Zustand for this feature
- Easy provider switching via dropdown

### 5. API Design
**Decision**: RESTful endpoints with standard patterns
**Rationale**: Consistent with existing backend patterns
**Endpoints**:
- POST /api/keys - Store new key
- GET /api/keys - List user's keys (without values)
- PUT /api/keys/:provider - Update existing key
- DELETE /api/keys/:provider - Remove key
- POST /api/keys/validate - Test key validity

### 6. Security Considerations
**Decision**: Multiple layers of protection
**Implementation**:
- Keys never logged or exposed in errors
- Encryption key derived from environment variable
- Keys masked in frontend (show last 4 chars only)
- Rate limiting on validation endpoint
- HTTPS only in production

### 7. Provider Integration
**Decision**: Unified interface with provider-specific adapters
**Rationale**: Easy to add new providers later
**Pattern**:
```typescript
interface AIProvider {
  validateKey(key: string): Promise<boolean>
  makeRequest(key: string, prompt: string): Promise<Response>
}
```

## Resolved Clarifications

All NEEDS CLARIFICATION items from spec have been resolved:
1. **Storage**: AES-256-GCM in SQLite ✅
2. **Invalid keys**: Clear error messages, manual update ✅
3. **Multiple keys**: One per provider, dropdown selection ✅
4. **Demo access**: None - API key required ✅

## Performance Considerations
- Key validation: <500ms target (parallel validation possible)
- Encryption/decryption: <10ms overhead
- Database queries: Indexed on user_id, provider

## Migration Path
- No existing system to migrate from
- Future: Could add key rotation, usage tracking

## Dependencies Required
**Backend**:
- crypto (built-in Node.js) - for AES-256-GCM
- openai, @anthropic-ai/sdk, openrouter packages for validation

**Frontend**:
- No new dependencies - use existing React/Vite setup

## Next Steps
Ready for Phase 1: Design & Contracts generation