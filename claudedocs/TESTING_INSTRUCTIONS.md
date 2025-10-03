# Manual Testing Instructions: Second User Blocking

## Test Environment Setup

The development environment is ready at:
- Frontend: http://localhost:5173
- Backend: http://localhost:8787
- Database: Reset with zero users

## Test Scenario: Verify Second User Blocking

### Expected Behavior
1. **First user** (any Google account) → Should be allowed and become admin
2. **Second user** (different Google account) → Should be **BLOCKED** with error message

### Step-by-Step Testing

#### Step 1: First User Login (Should Succeed)
1. Navigate to http://localhost:5173
2. Click "Sign in with Google"
3. Complete Google OAuth with **first account**
4. Expected: Redirect to `/dashboard` with admin role
5. Verify: Check backend logs show "First user registration - creating admin account"

#### Step 2: Logout First User
1. Click logout button in dashboard
2. Verify: Redirected to login page

#### Step 3: Second User Login (Should Be Blocked)
1. Click "Sign in with Google" again
2. Complete Google OAuth with **different account** (second account)
3. **Expected Result**:
   - Should be redirected to `/?error=access_denied&message=...`
   - Error message should indicate email not allowed
   - Should **NOT** reach dashboard
   - Should **NOT** create user in database

#### Step 4: Verify Backend Logs
Check the backend terminal output for:
```
❌ Failed to create user: {...}
📋 Parsed error JSON: {...}
🚫 Email validation failed: Email not in allowed list
🔀 User creation failed, redirecting to login with error
```

#### Step 5: Verify Database State
```bash
# Check users table - should only have 1 user (first user)
wrangler d1 execute store-database-preview --env local --command="SELECT email, role FROM users;"

# Expected: Only first user's email with 'admin' role
```

### Success Criteria
- ✅ First user becomes admin and accesses dashboard
- ✅ Second user is blocked with clear error message
- ✅ Second user is NOT created in database
- ✅ Error message is user-friendly (no stack traces)
- ✅ Backend logs show proper email validation failure
- ✅ User is redirected to login page with error parameter

### Code Flow Verification

The blocking happens in `frontend/src/handlers/auth.tsx:148-198`:

1. User completes OAuth → receives tokens
2. Backend checks if user exists (`/api/users?filterEmail=...`)
3. If user doesn't exist:
   - Check if this is first user (user count = 0)
   - If NOT first user → POST to `/api/users`
   - Backend validates email against `allowed_emails` table
   - **CRITICAL**: If email not allowed → returns 403 error
   - Frontend catches 403 → redirects with error message
4. Session cookie is **ONLY** created if user validation succeeds

### Known Good Flow (First User)
```
OAuth success → User lookup (not found) → Check user count (0)
→ Create user via /api/users → Backend sees first user → Creates admin
→ Frontend creates session → Redirect to dashboard
```

### Known Good Flow (Second User - Blocked)
```
OAuth success → User lookup (not found) → Check user count (1)
→ Create user via /api/users → Backend checks allowed_emails
→ Email NOT in list → Return 403 error → Frontend catches error
→ Redirect to login with error message → NO session created
```

## Alternative: Automated Test with Mock OAuth

If you want to test without manual Google OAuth, you can:

1. Create a test endpoint that bypasses OAuth
2. Use Playwright to call it with different email addresses
3. Verify the blocking behavior programmatically

However, the full OAuth flow with real Google accounts is the most reliable test.
