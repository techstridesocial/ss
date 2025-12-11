# 🚀 MODASH FLOW IMPROVEMENT PLAN

## 📋 EXECUTIVE SUMMARY

This plan addresses 5 critical issues identified in the Modash data flow analysis, prioritized by impact and implementation complexity. Each improvement includes detailed implementation steps, code changes, and testing strategies.

---

## 🎯 PRIORITY MATRIX

| Priority | Issue | Impact | Effort | Timeline |
|----------|-------|--------|--------|----------|
| **P0** | #4: Username Search Performance | High | Low | 2-4 hours |
| **P1** | #5: Platform Mismatch Detection | Medium | Low | 2-3 hours |
| **P2** | #2: Cache Invalidation | Medium | Low | 2-3 hours |
| **P3** | #3: Rate Limiting Retry | Medium | Medium | 4-6 hours |
| **P4** | #1: Large Notes JSON Field | High | High | 1-2 days |

---

## 🔥 PRIORITY 0: Username Search Performance

### Problem
- Username lookup requires an additional API call (500-1500ms overhead)
- Happens when userId is not stored after first fetch
- Impacts every user who hasn't had analytics refreshed recently

### Root Cause
- After fetching via username search, we don't always persist the userId
- Legacy code might not save userId to platform-specific structure

### Solution
**Guarantee userId is ALWAYS stored after any successful fetch**

### Implementation Steps

#### Step 1: Enhance Sync Logic to Always Store userId
**File:** `src/app/api/roster/[id]/refresh-analytics/route.ts`

**Changes:**
```typescript
// Ensure userId is ALWAYS saved after successful fetch
// Even if fetched via username lookup

// Add this check at the end of the route handler
if (modashUserId && !existingPlatformsData[platform]?.userId) {
  console.log(`✅ First-time userId storage for platform ${platform}`)
  // userId will be saved in the platforms structure below
}

// Ensure platforms[platform].userId is ALWAYS set
const updatedPlatformData = {
  ...(existingPlatformsData[platform] || {}),
  userId: modashUserId, // ← ALWAYS set this, even if fetched via username
  username,
  // ... rest of fields
}
```

#### Step 2: Ensure Username Lookup Saves userId
**File:** `src/app/api/discovery/profile/route.ts`

**Check:** After username search succeeds and userId is extracted, ensure it's returned in response for storage.

**Verification:**
- Response should ALWAYS include `userId` field when successful
- Client code should save this userId (already handled in syncAnalyticsToServer)

#### Step 3: Add Validation in Hook
**File:** `src/components/staff/roster/useRosterInfluencerAnalytics.ts`

**Add check after successful fetch:**
```typescript
// After successful Modash fetch via username
if (modashData.success && modashData.data) {
  // Ensure userId is present
  if (!modashData.data.userId) {
    console.warn('⚠️ Modash response missing userId - cannot optimize future fetches')
  }
  
  // Continue with existing sync logic (which should save userId)
  await syncAnalyticsToServer(modashData.data)
}
```

#### Step 4: Migration Script (One-time)
**File:** `scripts/migrate-username-to-userid.js` (NEW)

**Purpose:** Find influencers with username but no userId, attempt to fetch and save userId

```javascript
// Script to migrate existing influencers
// 1. Find all influencers with platforms but missing modash_data.platforms[platform].userId
// 2. Use existing username from influencer_platforms table
// 3. Fetch userId via Modash API (username search)
// 4. Save userId to notes.modash_data.platforms[platform].userId
// 5. Rate limit: 1 request per 2 seconds to avoid quota issues
```

### Testing
- ✅ Verify userId is saved after username fetch
- ✅ Verify subsequent fetches use userId (no username search)
- ✅ Verify migration script runs successfully
- ✅ Test with influencer that has username but no userId

### Expected Impact
- **Performance:** Eliminate username search on 80%+ of subsequent fetches
- **API Calls:** Reduce Modash API calls by ~50% for roster analytics
- **User Experience:** Faster analytics panel opening (200-500ms vs 500-1500ms)

---

## 🔥 PRIORITY 1: Platform Mismatch Detection

### Problem
- Legacy `modash_data.userId` might be for wrong platform
- Can cause 404 errors when fetching analytics for different platform
- Platform-specific userId structure exists but not always used

### Root Cause
- Backwards compatibility code checks legacy fields first
- Platform validation not strict enough

### Solution
**Enforce platform-specific userId structure, deprecate legacy fields**

### Implementation Steps

#### Step 1: Update userId Extraction Logic
**File:** `src/components/staff/roster/useRosterInfluencerAnalytics.ts` (lines 170-191)

**Current Code:**
```typescript
// Checks legacy userId first, then platform-specific
const legacyUserId = notesObject.modash_data?.userId || notesObject.modash_data?.modash_user_id
```

**New Code:**
```typescript
// ALWAYS use platform-specific userId first
// Only fall back to legacy if platform matches
let modashUserId: string | null = null

if (notesObject) {
  const normalizedPlatform = selectedPlatform?.toLowerCase() || 'instagram'
  const storedPlatforms = notesObject.modash_data?.platforms
  
  // PRIORITY 1: Platform-specific userId (ALWAYS correct)
  if (storedPlatforms?.[normalizedPlatform]?.userId) {
    modashUserId = storedPlatforms[normalizedPlatform].userId
    console.log(`✅ Using platform-specific userId for ${normalizedPlatform}`)
  }
  // PRIORITY 2: Legacy userId (only if platform matches)
  else {
    const legacyUserId = notesObject.modash_data?.userId || notesObject.modash_data?.modash_user_id
    const legacyPlatform = (notesObject.modash_data?.platform || '').toLowerCase()
    
    // Only use legacy if platform matches OR no platform specified (assume instagram)
    if (legacyUserId && (!legacyPlatform || legacyPlatform === normalizedPlatform || normalizedPlatform === 'instagram')) {
      modashUserId = legacyUserId
      console.log(`⚠️ Using legacy userId (consider migrating to platform-specific structure)`)
      
      // OPTIONAL: Auto-migrate legacy userId to platform-specific structure
      // This would require saving back to notes - could be done in sync step
    }
  }
}
```

#### Step 2: Add Platform Validation in API Route
**File:** `src/app/api/discovery/profile/route.ts`

**Add validation:**
```typescript
// If userId provided, validate it's for the correct platform
// (Modash userIds are platform-specific)
if (actualUserId && platform) {
  // Note: We can't actually validate userId format per platform
  // But we should log if platform doesn't match expected format hints
  console.log(`🔍 Validating userId ${actualUserId} for platform ${normalizedPlatform}`)
}
```

#### Step 3: Auto-Migration on Save
**File:** `src/app/api/roster/[id]/refresh-analytics/route.ts`

**Add migration logic:**
```typescript
// When saving analytics, migrate legacy userId to platform-specific structure
const existingModashData = (existingNotes.modash_data ?? {}) as Record<string, any>

// If we have legacy userId but not platform-specific, migrate it
if (existingModashData.userId && !existingPlatformsData[platform]?.userId) {
  console.log(`🔄 Migrating legacy userId to platform-specific structure for ${platform}`)
  // This will happen automatically when we set platforms[platform].userId below
}
```

### Testing
- ✅ Test with influencer having legacy userId for Instagram, switch to TikTok
- ✅ Verify platform-specific userId takes precedence
- ✅ Verify legacy userId still works for same platform
- ✅ Verify migration happens automatically on save

### Expected Impact
- **Reliability:** Eliminate 404 errors from platform mismatches
- **Data Quality:** Ensure userId is always for correct platform
- **Backwards Compatibility:** Still support legacy structure during migration

---

## 🔥 PRIORITY 2: Cache Invalidation (Configurable TTL)

### Problem
- 12-hour TTL is hardcoded
- Too long for some use cases (real-time analytics)
- Too short for others (stable influencers)

### Root Cause
- Single constant `ANALYTICS_CACHE_TTL_MS` used everywhere
- No way to override per use case

### Solution
**Make TTL configurable with sensible defaults and environment-based overrides**

### Implementation Steps

#### Step 1: Create Configurable Cache TTL System
**File:** `src/constants/analytics.ts` (UPDATE)

**New Code:**
```typescript
// Base cache TTL configuration
export const ANALYTICS_CACHE_TTL_MS = 1000 * 60 * 60 * 12 // 12 hours (default)

// Configurable TTL by use case
export const ANALYTICS_CACHE_TTL = {
  // Environment override (e.g., MODASH_CACHE_TTL_HOURS=6)
  base: parseInt(process.env.MODASH_CACHE_TTL_HOURS || '12', 10) * 60 * 60 * 1000,
  
  // Per-use-case overrides
  roster: parseInt(process.env.MODASH_CACHE_TTL_ROSTER_HOURS || process.env.MODASH_CACHE_TTL_HOURS || '12', 10) * 60 * 60 * 1000,
  discovery: parseInt(process.env.MODASH_CACHE_TTL_DISCOVERY_HOURS || '1', 10) * 60 * 60 * 1000, // 1 hour for discovery
  bulkRefresh: parseInt(process.env.MODASH_CACHE_TTL_BULK_HOURS || '24', 10) * 60 * 60 * 1000, // 24 hours for bulk
  
  // Platform-specific (optional)
  instagram: parseInt(process.env.MODASH_CACHE_TTL_INSTAGRAM_HOURS || '12', 10) * 60 * 60 * 1000,
  tiktok: parseInt(process.env.MODASH_CACHE_TTL_TIKTOK_HOURS || '12', 10) * 60 * 60 * 1000,
  youtube: parseInt(process.env.MODASH_CACHE_TTL_YOUTUBE_HOURS || '12', 10) * 60 * 60 * 1000,
}

// Backwards compatibility
export const ANALYTICS_CACHE_TTL_MS = ANALYTICS_CACHE_TTL.roster
```

#### Step 2: Update Cache Check Functions
**File:** `src/components/staff/roster/useRosterInfluencerAnalytics.ts`

**Update:**
```typescript
import { ANALYTICS_CACHE_TTL } from '@/constants/analytics'

function getCachedAnalyticsEntry(notes: any, platform: string) {
  // ... existing code ...
  
  // Use platform-specific TTL if available, otherwise use roster default
  const ttl = ANALYTICS_CACHE_TTL[platform.toLowerCase() as keyof typeof ANALYTICS_CACHE_TTL] 
    || ANALYTICS_CACHE_TTL.roster
  
  if (Date.now() - lastRefreshedTime > ttl) return null
  
  // ... rest of function
}
```

**File:** `src/app/staff/roster/page.tsx`

**Update:**
```typescript
import { ANALYTICS_CACHE_TTL } from '@/constants/analytics'

function getAnalyticsProgress(influencer: StaffInfluencer) {
  // ... existing code ...
  
  // Use roster TTL (could also be platform-specific)
  const ttl = ANALYTICS_CACHE_TTL.roster
  
  if (Date.now() - lastRefreshedTime <= ttl) {
    return count + 1
  }
  
  // ... rest of function
}
```

#### Step 3: Add UI Indicator for Cache Age
**File:** `src/app/staff/roster/page.tsx`

**Enhance progress badge to show cache age:**
```typescript
// Show cache age in tooltip
const cacheAge = lastRefreshedTime 
  ? Math.floor((Date.now() - lastRefreshedTime) / (1000 * 60 * 60)) 
  : null

title={`Analytics synced for ${progressLabel} platform(s)${
  cacheAge !== null ? ` (refreshed ${cacheAge}h ago)` : ''
}`}
```

### Testing
- ✅ Test with different environment variable values
- ✅ Verify TTL respects environment overrides
- ✅ Verify backwards compatibility (defaults to 12 hours)
- ✅ Test platform-specific TTL overrides

### Expected Impact
- **Flexibility:** Adjust cache TTL based on needs
- **Performance:** Can reduce TTL for real-time analytics needs
- **API Quota:** Can increase TTL for stable influencers to save credits

---

## 🔥 PRIORITY 3: Rate Limiting Retry Logic

### Problem
- When Modash API returns 429 (rate limit), we stop immediately
- No automatic retry after rate limit period expires
- User must manually retry

### Root Cause
- Explicit early return on 429 error
- No retry mechanism with exponential backoff

### Solution
**Implement smart retry logic with exponential backoff and rate limit header detection**

### Implementation Steps

#### Step 1: Create Retry Utility
**File:** `src/lib/utils/modash-retry.ts` (NEW)

```typescript
interface RetryOptions {
  maxRetries?: number
  initialDelay?: number
  maxDelay?: number
  backoffMultiplier?: number
  retryableStatuses?: number[]
}

interface RetryResult<T> {
  success: boolean
  data?: T
  error?: Error
  retriesUsed: number
  waitTime?: number // If rate limited, time to wait
}

export async function retryModashRequest<T>(
  requestFn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const {
    maxRetries = 3,
    initialDelay = 1000, // 1 second
    maxDelay = 60000, // 60 seconds
    backoffMultiplier = 2,
    retryableStatuses = [429, 500, 502, 503, 504]
  } = options

  let lastError: Error | null = null
  let delay = initialDelay

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await requestFn()
      return {
        success: true,
        data: result,
        retriesUsed: attempt
      }
    } catch (error: any) {
      lastError = error
      
      // Extract status code from error message or error object
      const statusCode = extractStatusCode(error)
      
      // Check if this is a rate limit error
      if (statusCode === 429) {
        // Try to extract Retry-After header from error if available
        const retryAfter = extractRetryAfter(error)
        const waitTime = retryAfter || delay
        
        if (attempt < maxRetries) {
          console.log(`⏳ Rate limited (429). Waiting ${waitTime}ms before retry ${attempt + 1}/${maxRetries}`)
          await sleep(waitTime)
          delay = Math.min(delay * backoffMultiplier, maxDelay)
          continue
        } else {
          return {
            success: false,
            error: new Error(`Rate limit exceeded after ${maxRetries} retries. Please try again later.`),
            retriesUsed: attempt,
            waitTime
          }
        }
      }
      
      // Check if error is retryable
      if (statusCode && retryableStatuses.includes(statusCode) && attempt < maxRetries) {
        console.log(`🔄 Retryable error (${statusCode}). Retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`)
        await sleep(delay)
        delay = Math.min(delay * backoffMultiplier, maxDelay)
        continue
      }
      
      // Non-retryable error or max retries reached
      return {
        success: false,
        error,
        retriesUsed: attempt
      }
    }
  }

  return {
    success: false,
    error: lastError || new Error('Max retries exceeded'),
    retriesUsed: maxRetries
  }
}

function extractStatusCode(error: any): number | null {
  if (error?.status) return error.status
  if (error?.response?.status) return error.response.status
  const match = error?.message?.match(/\((\d+)\)/)
  return match ? parseInt(match[1], 10) : null
}

function extractRetryAfter(error: any): number | null {
  // Try to extract from error object if available
  if (error?.retryAfter) return error.retryAfter * 1000 // Convert seconds to ms
  if (error?.response?.headers?.['retry-after']) {
    return parseInt(error.response.headers['retry-after'], 10) * 1000
  }
  return null
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
```

#### Step 2: Update Modash Service to Support Retry
**File:** `src/lib/services/modash.ts`

**Enhance error handling:**
```typescript
// Add Retry-After header extraction
async function modashApiRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
  // ... existing fetch code ...
  
  if (!res.ok) {
    const err = await res.text()
    const retryAfter = res.headers.get('retry-after')
    
    const error: any = new Error(`Modash API error (${res.status}): ${err}`)
    error.status = res.status
    if (retryAfter) {
      error.retryAfter = parseInt(retryAfter, 10)
    }
    
    // ... existing error handling ...
    throw error
  }
  
  // ... rest of function
}
```

#### Step 3: Update Hook to Use Retry Logic
**File:** `src/components/staff/roster/useRosterInfluencerAnalytics.ts`

**Wrap Modash API calls with retry:**
```typescript
import { retryModashRequest } from '@/lib/utils/modash-retry'

// In fetchCompleteData function:
if (modashUserId) {
  const modashResponse = await retryModashRequest(
    async () => {
      const response = await fetch('/api/discovery/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: modashUserId,
          platform: selectedPlatform
        })
      })
      
      if (!response.ok) {
        const error: any = new Error(`API error: ${response.status}`)
        error.status = response.status
        const retryAfter = response.headers.get('retry-after')
        if (retryAfter) {
          error.retryAfter = parseInt(retryAfter, 10)
        }
        throw error
      }
      
      return response
    },
    {
      maxRetries: 3,
      initialDelay: 2000, // 2 seconds
      maxDelay: 60000, // 60 seconds
      retryableStatuses: [429, 500, 502, 503, 504]
    }
  )
  
  if (!modashResponse.success) {
    // Handle error (rate limit or other)
    if (modashResponse.waitTime) {
      setError(`Rate limit exceeded. Please wait ${Math.ceil(modashResponse.waitTime / 1000)} seconds before trying again.`)
    } else {
      setError(modashResponse.error?.message || 'Failed to fetch analytics')
    }
    // ... fallback logic
    return
  }
  
  // Continue with successful response
  const modashData = await modashResponse.data.json()
  // ... rest of logic
}
```

#### Step 4: Add User Feedback
**File:** `src/components/staff/roster/useRosterInfluencerAnalytics.ts`

**Show retry progress:**
```typescript
const [retryInfo, setRetryInfo] = useState<{ attempts: number; waiting?: number } | null>(null)

// In retry callback (if we implement callback version):
setRetryInfo({ attempts: attempt + 1, waiting: waitTime })
```

### Testing
- ✅ Test with simulated 429 errors
- ✅ Verify retry after wait time
- ✅ Verify exponential backoff works
- ✅ Test max retries reached scenario
- ✅ Verify Retry-After header is respected

### Expected Impact
- **Resilience:** Automatic recovery from transient rate limits
- **User Experience:** Fewer manual retries needed
- **API Efficiency:** Better utilization of rate limit windows

---

## 🔥 PRIORITY 4: Large Notes JSON Field

### Problem
- Full Modash payloads stored in `influencer.notes` JSON field
- Can grow to 50KB+ per influencer
- Slow JSON parsing, increased database storage
- Already optimized endpoint excludes notes, but still loaded when needed

### Root Cause
- All Modash data stored in notes for easy access
- No separation between "metadata" and "full payload"

### Solution
**Use `modash_profile_cache` table for rich data, keep only lightweight references in notes**

### Implementation Steps

#### Step 1: Design Hybrid Storage Strategy

**New Structure:**
- **`influencers.notes.modash_data.platforms[platform]`** → Keep only:
  - `userId` (required for fast lookup)
  - `last_refreshed` (for cache validation)
  - `cache_reference` (optional: link to modash_profile_cache.id)
  - Core metrics: `followers`, `engagementRate`, `avgViews` (for quick display)

- **`modash_profile_cache` table** → Store:
  - Full profile payload
  - Audience data
  - Posts arrays
  - All rich analytics

#### Step 2: Update Cache Reference Structure
**File:** `src/app/api/roster/[id]/refresh-analytics/route.ts`

**Changes:**
```typescript
// After fetching Modash data and caching it:
const cacheResult = await cacheModashProfile(
  influencerPlatformId, // Need to get this from influencer_platforms
  modashUserId,
  platform
)

// Update notes with lightweight reference
const updatedPlatformData = {
  userId: modashUserId,
  username,
  followers,
  engagementRate,
  avgViews,
  last_refreshed: nowIso,
  refreshed_by: userId,
  // NEW: Reference to rich cache
  cache_id: cacheResult?.cacheId || null, // If cacheModashProfile returns ID
  // REMOVED: cached_payload (no longer store full payload in notes)
}
```

#### Step 3: Update Hook to Fetch from Cache Table
**File:** `src/components/staff/roster/useRosterInfluencerAnalytics.ts`

**New fetch logic:**
```typescript
// Check if we have cache_id reference
const cacheId = platformsData[platformKey]?.cache_id

if (cacheId) {
  // Fetch from modash_profile_cache table via API
  const cacheResponse = await fetch(`/api/modash/cache/${cacheId}`)
  if (cacheResponse.ok) {
    const cachedData = await cacheResponse.json()
    // Use cached rich data
    setDetailData({
      ...cachedData,
      // Merge with influencer metadata
      id: influencer.id,
      // ...
    })
    return
  }
}

// Fallback to existing logic (fetch from Modash API)
```

#### Step 4: Create Cache Lookup API Route
**File:** `src/app/api/modash/cache/[id]/route.ts` (NEW)

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const cacheId = id
  
  // Fetch from modash_profile_cache + modash_audience_cache
  const cacheData = await getCachedProfileByCacheId(cacheId)
  
  if (!cacheData) {
    return NextResponse.json({ error: 'Cache not found' }, { status: 404 })
  }
  
  // Transform to same format as Modash API response
  return NextResponse.json({
    success: true,
    data: transformCacheToModashFormat(cacheData)
  })
}
```

#### Step 5: Migration Strategy
**File:** `scripts/migrate-notes-to-cache.ts` (NEW)

**Purpose:** One-time migration of existing full payloads in notes to cache table

```typescript
// 1. Find all influencers with modash_data.cached_payload
// 2. For each payload:
//    a. Extract influencer_platform_id from influencer_platforms table
//    b. Call cacheModashProfile() to store in cache table
//    c. Update notes to include cache_id reference
//    d. Remove cached_payload from notes
// 3. Process in batches to avoid memory issues
// 4. Rate limit to 1 per 2 seconds
```

### Testing
- ✅ Verify lightweight notes structure works
- ✅ Verify cache lookup API works
- ✅ Verify fallback to Modash API if cache missing
- ✅ Test migration script on staging data
- ✅ Verify performance improvement (smaller notes = faster parsing)

### Expected Impact
- **Performance:** 80-90% reduction in notes JSON size
- **Database:** Reduced storage requirements
- **Speed:** Faster JSON parsing (50KB → 2-3KB per influencer)
- **Scalability:** Better performance as influencer count grows

---

## 📊 IMPLEMENTATION TIMELINE

### Week 1: Quick Wins (P0-P1)
- ✅ Day 1-2: Implement Priority 0 (Username Search Performance)
- ✅ Day 2-3: Implement Priority 1 (Platform Mismatch Detection)
- ✅ Day 3-4: Testing and bug fixes

### Week 2: Configuration & Resilience (P2-P3)
- ✅ Day 1-2: Implement Priority 2 (Configurable TTL)
- ✅ Day 3-4: Implement Priority 3 (Rate Limiting Retry)
- ✅ Day 5: Testing and integration

### Week 3: Architecture Improvement (P4)
- ✅ Day 1-3: Design and implement Priority 4 (Large Notes JSON)
- ✅ Day 4-5: Migration script and testing
- ✅ Day 5: Production deployment with monitoring

---

## 🧪 TESTING STRATEGY

### Unit Tests
- Test userId extraction logic (legacy vs platform-specific)
- Test retry logic with various error scenarios
- Test TTL configuration overrides

### Integration Tests
- Test full flow: fetch → cache → retrieve
- Test migration script on staging data
- Test rate limit retry with mocked 429 responses

### Performance Tests
- Measure notes JSON size before/after migration
- Measure analytics fetch time improvements
- Measure API call reduction

### User Acceptance Tests
- Verify analytics panel opens faster
- Verify no data loss during migration
- Verify backwards compatibility

---

## 📈 SUCCESS METRICS

### Performance Metrics
- **Target:** 50% reduction in analytics fetch time (avg)
- **Target:** 80% reduction in username search API calls
- **Target:** 90% reduction in notes JSON size

### Reliability Metrics
- **Target:** 99%+ success rate for analytics fetches
- **Target:** Zero data loss during migration
- **Target:** <1% rate limit errors (with retry)

### User Experience Metrics
- **Target:** <500ms analytics panel open time (p95)
- **Target:** Zero manual retries needed for rate limits

---

## 🚨 RISK MITIGATION

### Risk 1: Migration Data Loss
**Mitigation:**
- Run migration on staging first
- Create database backup before migration
- Implement rollback script
- Test with subset of data first

### Risk 2: Breaking Changes
**Mitigation:**
- Maintain backwards compatibility during transition
- Feature flag for new cache lookup system
- Gradual rollout (percentage of users)

### Risk 3: Performance Regression
**Mitigation:**
- Performance benchmarks before/after
- Monitor API call patterns
- Canary deployment with monitoring

---

## 📝 NEXT STEPS

1. **Review and Approve Plan** ✅
2. **Set up Feature Branch:** `feature/modash-flow-improvements`
3. **Start with Priority 0:** Username Search Performance
4. **Daily Progress Updates:** Track implementation status
5. **Testing:** Comprehensive testing at each priority level
6. **Documentation:** Update docs with new behavior
7. **Deployment:** Staged rollout with monitoring

---

**Plan Created:** 2025-01-15
**Estimated Total Effort:** 8-12 days
**Expected Completion:** Week 3
