# Quickstart: User API Keys Feature

## Prerequisites
- Node.js 18+ installed
- Frontend dev server running (`cd frontend && npm run dev`)
- Backend server running (`cd backend && npm run dev`)
- Valid API keys from OpenAI, Anthropic, or OpenRouter

## Quick Test Flow

### 1. Start the Application
```bash
# Terminal 1 - Frontend
cd frontend
npm install
npm run dev

# Terminal 2 - Backend  
cd backend
npm install
npm run dev
```

### 2. Configure Your First API Key

1. Open browser to http://localhost:5173
2. Look for the API Key Settings (gear icon or settings menu)
3. You'll see a form with:
   - Provider dropdown (OpenAI, Anthropic, OpenRouter)
   - API Key input field
   - Save button

### 3. Add an OpenAI Key
1. Select "OpenAI" from the provider dropdown
2. Enter your OpenAI API key (starts with `sk-`)
3. Click "Save"
4. You should see:
   - Success message: "API key validated and saved"
   - Masked key display: `****-****-****-[last4]`

### 4. Test Prompt Improvement
1. Go to the main prompt input area
2. Enter a test prompt: "write a story about a cat"
3. Notice the provider selector showing "OpenAI" (your configured provider)
4. Click "Improve Prompt"
5. The system should use your API key to process the request
6. You'll be billed directly by OpenAI

### 5. Switch Providers
1. Return to API Key Settings
2. Select "Anthropic" from dropdown
3. Enter your Anthropic API key (starts with `sk-ant-`)
4. Click "Save"
5. Return to prompt area
6. Provider selector now shows both OpenAI and Anthropic
7. Select Anthropic and test another prompt

### 6. Update an Existing Key
1. In API Key Settings, select "OpenAI" 
2. Enter a new OpenAI key
3. Click "Save"
4. Previous key is replaced (no history kept)

### 7. Remove a Key
1. In API Key Settings, select a configured provider
2. Click "Remove Key" button
3. Confirm deletion
4. Provider no longer appears in selector

## Validation Testing

### Test Invalid Key
1. Select any provider
2. Enter an invalid key: "invalid-key-123"
3. Click "Save"
4. Should see error: "Invalid API key for [Provider]"

### Test Key Format Validation
- OpenAI: Must start with `sk-`
- Anthropic: Must start with `sk-ant-`
- OpenRouter: Must start with `sk-or-`

### Test Rate Limiting
1. Rapidly attempt to validate keys 10+ times
2. Should see: "Rate limit exceeded. Please wait before trying again."

## Error Scenarios

### No API Key Configured
1. Clear all API keys
2. Try to improve a prompt
3. Should see: "Please configure an API key before using this feature"

### Expired/Revoked Key
1. Configure a valid key
2. Revoke it from provider's dashboard
3. Try to use the feature
4. Should see: "API key is invalid or expired. Please update your key."

### Provider Service Down
1. Configure a valid key
2. If provider is down, should see: "Unable to connect to [Provider]. Please try again later."

## Security Verification

### Check Key Masking
1. After saving a key, check that:
   - Full key never appears in UI
   - Only last 4 characters visible
   - Network tab doesn't show raw key in responses

### Check Encryption
1. Check backend database directly:
   ```bash
   sqlite3 backend/fixyourprompts.db
   SELECT * FROM user_api_keys;
   ```
2. Verify `encrypted_key` column contains encrypted data, not raw keys

## Performance Check
1. Time the key validation process
2. Should complete in under 500ms
3. Provider switching should be instant (<100ms)

## Complete Test Checklist

- [ ] Can add API key for each provider
- [ ] Can switch between providers via dropdown
- [ ] Invalid keys are rejected with clear error
- [ ] Can update existing keys
- [ ] Can remove keys
- [ ] No access without configured key
- [ ] Keys are masked in UI
- [ ] Keys are encrypted in database
- [ ] Rate limiting works
- [ ] Error messages are helpful
- [ ] Performance meets targets

## Troubleshooting

**"Cannot connect to backend"**
- Ensure backend is running on correct port
- Check CORS settings

**"Invalid API key" for valid key**
- Check key hasn't been revoked
- Ensure correct provider selected
- Verify key format matches provider

**"Rate limit exceeded"**
- Wait 60 seconds before retrying
- Check if provider has additional limits

## Next Steps
After successful testing:
1. Configure your preferred provider
2. Start using improved prompts with your own billing
3. Monitor usage in provider's dashboard