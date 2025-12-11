# Discovery Search Deep Analysis

## Current Endpoint Usage

### 1. Simple Username Search (e.g., "dltheobald")
**Endpoint Used:** `GET https://api.modash.io/v1/instagram/users?query=dltheobald&limit=50`
- **Function:** `listUsers()` in `src/lib/services/modash.ts:210-215`
- **Called via:** `/api/discovery/search` route when `shouldUseListUsers = true`
- **Status:** ✅ **CORRECT** - This matches Modash API documentation

### 2. Complex Search with Filters
**Endpoint Used:** `POST https://api.modash.io/v1/instagram/search`
- **Function:** `searchDiscovery()` in `src/lib/services/modash.ts:218-223`
- **Called via:** `/api/discovery/search` route when filters are applied or List Users fails
- **Status:** ✅ **CORRECT** - This matches Modash API documentation (`POST /instagram/search`)

## Issues Found

### 1. React Error #310: "Rendered more hooks than during the previous render"
**Location:** `src/app/staff/discovery/page.tsx:2194-2200`

**Problem:**
```typescript
useEffect(() => {
  if ((searchResults.length > 0 || searchQuery.trim()) && !isSearching) {
    handleSearch()
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [selectedPlatform])
```

**Issue:** `handleSearch` is called inside `useEffect` but not in the dependency array. This can cause hooks to be called conditionally, leading to React Error #310.

**Fix:** Add `handleSearch` to dependencies OR wrap it in `useCallback`.

### 2. 404 Errors on API Routes
**Endpoints:**
- `/api/discovery/profile` - Returns 404
- `/api/auth/current-user` - Returns 404

**Analysis:**
- Both routes exist and are properly exported
- `/api/discovery/profile/route.ts` exports `POST` handler ✅
- `/api/auth/current-user/route.ts` exports `GET` handler ✅

**Possible Causes:**
1. Middleware blocking the requests (but we just fixed CSRF)
2. Route not being found (Next.js routing issue)
3. Request method mismatch (POST vs GET)

**Fix Needed:** Check server logs to see if requests are reaching the routes.

### 3. Instagram Image Loading Errors
**Error:** `net::ERR_NAME_NOT_RESOLVED` for `instagram.fhel3-1.fna.fbcdn.net`
- **Cause:** CORS or network blocking from Instagram's CDN
- **Impact:** Profile pictures fail to load
- **Fix:** Add proxy or use Modash-provided profile pictures instead

### 4. Discovery Search Not Working
**Current Flow:**
1. User searches for "dltheobald" on Instagram
2. Frontend calls `/api/discovery/search` with `{ platform: 'instagram', searchQuery: 'dltheobald' }`
3. Backend checks: `shouldUseListUsers = true` (simple search, no filters, not YouTube)
4. Backend calls `listUsers('instagram', { query: 'dltheobald', limit: 50 })`
5. This calls: `GET https://api.modash.io/v1/instagram/users?query=dltheobald&limit=50`

**If List Users API fails:**
- Falls back to `searchDiscovery()` which calls `POST /instagram/search`
- Maps `searchQuery` to `filters.relevance = ['dltheobald']`

**Potential Issues:**
1. Modash API key might be invalid or expired
2. Rate limiting from Modash API
3. The `relevance` field might not work for exact username matches
4. Network/CORS issues (though we fixed middleware)

## Recommended Fixes

### Fix 1: React Hooks Error
```typescript
// In src/app/staff/discovery/page.tsx
const handleSearch = useCallback(async () => {
  // ... existing code
}, [selectedPlatform, searchQuery, currentFilters, isSearching])

useEffect(() => {
  if ((searchResults.length > 0 || searchQuery.trim()) && !isSearching) {
    handleSearch()
  }
}, [selectedPlatform, handleSearch, searchResults.length, searchQuery, isSearching])
```

### Fix 2: Verify API Endpoints Match Documentation
According to Modash docs: `POST https://api.modash.io/v1/instagram/search`

**Current Implementation:**
```typescript
// src/lib/services/modash.ts:222
return modashApiPost(`/${platform}/search`, filterBody)
// This becomes: POST https://api.modash.io/v1/instagram/search ✅ CORRECT
```

**List Users API:**
```typescript
// src/lib/services/modash.ts:214
return modashApiRequest(`/${platform}/users`, params)
// This becomes: GET https://api.modash.io/v1/instagram/users?query=... ✅ CORRECT
```

### Fix 3: Add Better Error Handling
Add logging to see what Modash API returns:
- Check server logs for Modash API responses
- Add error details to frontend error messages
- Verify API key is valid

### Fix 4: Check 404 Routes
- Verify routes are accessible (check Next.js routing)
- Check middleware isn't blocking them
- Add logging to see if requests reach the routes

## Next Steps

1. **Fix React hooks error** - Wrap `handleSearch` in `useCallback`
2. **Add server-side logging** - Check what Modash API actually returns
3. **Verify API key** - Ensure `MODASH_API_KEY` is set correctly
4. **Test endpoints directly** - Use Postman/curl to test Modash API
5. **Check server logs** - See detailed error messages from Modash API

## Verification Checklist

- [ ] Modash API key is valid and not expired
- [ ] Rate limits not exceeded
- [ ] API endpoints match documentation
- [ ] React hooks are called consistently
- [ ] Middleware allows same-origin requests (✅ Fixed)
- [ ] Routes are properly exported
- [ ] Server logs show actual Modash API responses

