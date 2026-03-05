# Migration Summary: API Proxy to Database-Backed Routes

## Overview

The OpenMic application has been successfully migrated from proxying requests to a remote backend API to using direct database connections. All routes now interact with the MariaDB database directly.

## Changes Made

### 1. **Auth Routes** (`app/api/`)

#### `/api/login/route.ts` ✅

- **Before**: Proxied requests to remote API (`${openmicApiBase}/api/login`)
- **After**: Direct database query using `getUserByEmail()` from `lib/data.ts`
- **Key Changes**:
  - Validates credentials against database
  - Returns user data directly
  - Includes TODO for password hashing with bcrypt

#### `/api/signup/route.ts` ✅

- **Before**: Proxied requests to remote API
- **After**: Creates new user directly in database using `createUser()`
- **Key Changes**:
  - Checks for existing user to prevent duplicates
  - Creates new user record in database
  - Includes TODO for password hashing

#### `/api/logout/route.ts` ✅

- **Before**: Proxied requests to remote API
- **After**: Simple logout that clears auth cookie
- **Key Changes**:
  - Clears auth cookie
  - Includes TODO for proper session invalidation

#### `/api/refresh/route.ts` ✅

- **Before**: Proxied requests to remote API
- **After**: Simple token refresh endpoint
- **Key Changes**:
  - Placeholder implementation
  - Includes TODO for JWT/session token validation

### 2. **New Endpoints**

#### `/api/users/[id]/route.ts` ✅ (NEW)

- **Purpose**: GET endpoint to fetch individual user by ID
- **Returns**: User data without password field
- **Used by**: `useUser` hook

### 3. **Updated Hooks**

#### `hooks/useUser.ts` ✅

- **Changed User Type**:
  - Old: `user_id, first_name, last_name, email, primary_social_media_alias, user_type, role`
  - New: `id, first_name, last_name, email`

- **Key Changes**:
  - Changed from remote API to local `/api/users/[id]` endpoint
  - Added `loading` and `error` state
  - Improved error handling

### 4. **Component Updates**

#### `components/PerformanceCardContainer.tsx` ✅

- **Removed**: `primary_social_media_alias` field (no longer in database)
- **Added**: Display of `last_name` and `email` fields
- Now displays: `{first_name} {last_name}` and email

### 5. **Database Functions** (`lib/data.ts`)

All database access functions are already in place:

- ✅ `getUserByEmail(email: string)`
- ✅ `getUserById(userId: number)`
- ✅ `createUser(userData: any)`
- ✅ `getEventById(), getEvents(), createEvent()`
- ✅ `getPerformancesByEventId(), getPerformanceById(), createPerformance(), updatePerformance(), deletePerformance()`

### 6. **Test Page** ✅ (NEW)

- **Location**: `app/api-test/page.tsx`
- **Purpose**: Interactive testing of auth endpoints
- **Features**:
  - Test signup with custom email/password/name
  - Test login with credentials
  - Test logout
  - Real-time API responses display

## Environment Variables Required

Add these to your `.env.local` file:

```
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
DB_PORT=3306
DB_CONNECTION_LIMIT=10
```

## ⚠️ Important TODOs for Production

### Security

1. **Password Hashing** (HIGH PRIORITY)
   - Install bcrypt: `npm install bcrypt`
   - Update `/api/login/route.ts` to use password hashing
   - Update `/api/signup/route.ts` to hash passwords before storing

2. **Session/Token Management** (HIGH PRIORITY)
   - Implement JWT tokens or proper session management
   - Update `/api/refresh/route.ts` to validate tokens
   - Update `/api/logout/route.ts` to invalidate sessions

3. **HTTPS Only**
   - Set secure cookie flags in production
   - Use `HttpOnly` cookies to prevent XSS attacks

### Code Quality

- Add input validation and sanitization
- Add rate limiting to prevent brute force attacks
- Add comprehensive error logging
- Add request/response logging for debugging

### Testing

- Add unit tests for all routes
- Add integration tests for auth flow
- Add database migration tests

## Build Status

✅ **Build Successful** (No TypeScript errors)

```
Route (app)                              Size     First Load JS
├ ✓ /api/events
├ ✓ /api/login
├ ✓ /api/logout
├ ✓ /api/signup
├ ✓ /api/refresh
├ ✓ /api/users/[id]
├ ✓ /api/performances
└ ✓ /api/performances/[id]
```

## Testing Instructions

1. **Start the development server:**

   ```bash
   npm run dev
   ```

2. **Visit the test page:**

   ```
   http://localhost:3000/api-test
   ```

3. **Test the endpoints:**
   - Enter email and password
   - Click "Test Signup" to create a new user
   - Click "Test Login" to authenticate
   - Click "Test Logout" to clear session

## Files Modified

- ✅ `app/api/login/route.ts`
- ✅ `app/api/signup/route.ts`
- ✅ `app/api/logout/route.ts`
- ✅ `app/api/refresh/route.ts`
- ✅ `app/api/users/[id]/route.ts` (NEW)
- ✅ `hooks/useUser.ts`
- ✅ `components/PerformanceCardContainer.tsx`
- ✅ `app/api-test/page.tsx` (NEW)

## Next Steps

1. **Implement password hashing** (bcrypt)
2. **Set up proper session/JWT management**
3. **Add database schema validation**
4. **Implement rate limiting**
5. **Add comprehensive logging**
6. **Set up automated tests**
7. **Deploy to staging for testing**

## Notes

- The Global Context (`context/useGlobalContext.tsx`) already handles authentication state properly
- All routes use the existing MariaDB connection pool
- Database schema should include: users, events, performances tables
- Password fields are excluded from API responses for security
