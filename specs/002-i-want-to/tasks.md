# Implementation Tasks: User-Provided API Keys for AI Providers

**Feature**: Enable users to provide their own API keys for OpenAI, Anthropic, and OpenRouter  
**Approach**: Simple, straight-forward implementation with ~5 tasks per phase

## Phase 1: Backend Foundation (Database & Encryption)

### T001: Create database schema for API keys
**File**: `backend/src/database/migrations/001_user_api_keys.sql`
- Create user_api_keys table with fields from data-model.md
- Add indexes for user_id and (user_id, provider)
- Add CHECK constraint for provider enum
- Run migration to update SQLite database

### T002: Implement encryption service [P]
**File**: `backend/src/services/encryption.service.js`
- Implement AES-256-GCM encryption/decryption functions
- Use crypto module with PBKDF2 for key derivation
- Generate unique salts per key
- Add methods: encrypt(plaintext, salt), decrypt(ciphertext, salt)
- Include unit tests for encryption/decryption

### T003: Create API key validation service [P]
**File**: `backend/src/services/api-key-validator.service.js`
- Implement validateOpenAI(key) - GET to /v1/models
- Implement validateAnthropic(key) - GET to /v1/messages with max_tokens=1
- Implement validateOpenRouter(key) - GET to /api/v1/auth/key
- Return { valid: boolean, message: string }
- Mock external API calls in tests

### T004: Implement API key data access layer [P]
**File**: `backend/src/models/api-key.model.js`
- CRUD operations using better-sqlite3
- Methods: create, findByUserAndProvider, update, delete, listByUser
- Integrate encryption service for key storage
- Never return decrypted keys in responses

### T005: Write contract tests for API endpoints [P]
**File**: `backend/tests/contract/api-keys.test.js`
- Test POST /api/keys (store new key)
- Test GET /api/keys (list user keys)
- Test PUT /api/keys/:provider (update key)
- Test DELETE /api/keys/:provider (remove key)
- Test POST /api/keys/validate (validate key)
- All tests should fail initially (TDD)

## Phase 2: Backend API Implementation

### T006: Implement store API key endpoint
**File**: `backend/src/routes/api-keys.routes.js`
- POST /api/keys handler
- Validate request body (provider, key)
- Call validation service
- Encrypt and store if valid
- Return 201 with metadata (masked key)

### T007: Implement list API keys endpoint
**File**: `backend/src/routes/api-keys.routes.js`
- GET /api/keys handler
- Fetch user's keys from database
- Return metadata only (provider, masked key, dates)
- Never expose actual key values

### T008: Implement update API key endpoint
**File**: `backend/src/routes/api-keys.routes.js`
- PUT /api/keys/:provider handler
- Validate new key
- Replace existing key if valid
- Return updated metadata

### T009: Implement delete API key endpoint
**File**: `backend/src/routes/api-keys.routes.js`
- DELETE /api/keys/:provider handler
- Remove key from database
- Return 204 No Content

### T010: Implement validate API key endpoint
**File**: `backend/src/routes/api-keys.routes.js`
- POST /api/keys/validate handler
- Rate limiting (max 10 requests per minute)
- Call appropriate validation service
- Return validation result without storing

## Phase 3: Frontend Components

### T011: Create API key settings component [P]
**File**: `frontend/src/components/ApiKeySettings/ApiKeySettings.tsx`
- Form with provider dropdown and key input
- Save, update, and delete functionality
- Show masked keys for configured providers
- Display validation errors clearly

### T012: Create provider selection dropdown [P]
**File**: `frontend/src/components/ProviderSelector/ProviderSelector.tsx`
- Dropdown showing only configured providers
- Default to first available provider
- Update global state on selection
- Disable if no keys configured

### T013: Create API key service client [P]
**File**: `frontend/src/services/apiKeys.service.ts`
- HTTP client for backend API endpoints
- Methods matching backend routes
- Handle authentication headers
- Error handling and retry logic

### T014: Add React Context for API keys state [P]
**File**: `frontend/src/contexts/ApiKeysContext.tsx`
- Global state for selected provider
- Available providers list
- Refresh keys on changes
- Provide hooks for components

### T015: Write frontend component tests [P]
**File**: `frontend/tests/unit/components/ApiKeySettings.test.tsx`
- Test form validation
- Test provider switching
- Test error display
- Test masked key display

## Phase 4: Integration & Polish

### T016: Integrate API keys with prompt flow
**File**: `frontend/src/services/prompt.service.ts`
- Modify prompt service to use selected provider
- Pass API key from context to backend
- Handle provider-specific response formats
- Show clear errors if no key configured

### T017: Add API key settings to main UI
**File**: `frontend/src/components/Header/Header.tsx`
- Add settings icon/button to header
- Modal or drawer for API key settings
- Visual indicator for configured providers

### T018: Create E2E tests for complete flow [P]
**File**: `frontend/tests/e2e/api-keys.spec.ts`
- Test adding keys for each provider
- Test switching between providers
- Test prompt improvement with user keys
- Test error scenarios (invalid keys, expired keys)

### T019: Add environment configuration
**Files**: `backend/.env.example`, `frontend/.env.example`
- Add ENCRYPTION_KEY to backend env
- Document required environment variables
- Update README with setup instructions

### T020: Performance and security audit
**Files**: Various
- Verify encryption implementation
- Check for key exposure in logs/errors
- Validate rate limiting works
- Ensure <500ms validation target met

## Execution Examples

### Sequential Execution
```bash
# Phase 1 - Backend Foundation
task T001  # Database first
task T002  # Then encryption
task T003  # Then validation
task T004  # Then data access
task T005  # Then contract tests

# Phase 2 - Must be sequential (same files)
task T006 T007 T008 T009 T010  # One at a time
```

### Parallel Execution
```bash
# Phase 1 - Independent services can run in parallel
task T002 T003 T004 T005  # All marked [P] can run together

# Phase 3 - Frontend components in parallel
task T011 T012 T013 T014 T015  # All independent files
```

## Dependencies

### Must Complete Before Starting
- T001 → T004 (database needed for data access)
- T002 → T004 (encryption needed for model)
- T005 → T006-T010 (tests before implementation)
- T006-T010 → T011-T015 (backend before frontend)
- T014 → T016 (context before integration)

### Can Run in Parallel [P]
- T002, T003, T005 (independent services/tests)
- T011, T012, T013, T014, T015 (separate frontend files)
- T018 (E2E tests independent)

## Success Criteria
- [ ] All contract tests pass
- [ ] API keys encrypted in database
- [ ] Provider switching works in UI
- [ ] Validation completes <500ms
- [ ] E2E tests pass for all providers
- [ ] No keys exposed in logs/responses

## Notes
- Keep implementation simple per user request
- Focus on MVP functionality only
- No demo/trial tier complexity
- Direct provider integration (no abstraction layers)
- Prioritize security and user experience