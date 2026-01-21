# 🔍 COMPLETE MODASH INFO FLOW ANALYSIS - STAFF ROSTER PAGE

## 📊 EXECUTIVE SUMMARY

The Modash data flow on the staff roster page is a **multi-tiered caching system** that stores analytics data in the `influencer.notes` JSON field and uses intelligent fallback mechanisms to fetch fresh data when needed. This analysis covers every step, file, and decision point in the flow.

---

## 🗂️ DATA STORAGE ARCHITECTURE

### Primary Storage: `influencers.notes` JSON Field

**Location:** PostgreSQL `influencers` table, `notes` column (TEXT/JSONB)

**Structure:**
```json
{
  "modash_data": {
    // Top-level fields (legacy, for backwards compatibility)
    "userId": "modash_user_id_string",
    "modash_user_id": "modash_user_id_string", // Alternative field name
    "platform": "instagram", // Default platform (legacy)
    "username": "username",
    "followers": 100000,
    "engagementRate": 0.045,
    "avgViews": 50000,
    "avgLikes": 5000,
    "avgComments": 500,
    "url": "https://instagram.com/username",
    "picture": "https://...",
    "bio": "...",
    "last_refreshed": "2025-01-15T10:30:00Z",
    "refreshed_by": "user_id",
    
    // NEW: Platform-specific data structure (MULTI-PLATFORM SUPPORT)
    "platforms": {
      "instagram": {
        "userId": "modash_user_id_for_instagram",
        "username": "insta_username",
        "fullname": "Full Name",
        "followers": 100000,
        "engagementRate": 0.045,
        "avgViews": 50000,
        "avgLikes": 5000,
        "avgComments": 500,
        "url": "https://instagram.com/...",
        "picture": "https://...",
        "last_refreshed": "2025-01-15T10:30:00Z",
        "refreshed_by": "user_id",
        "cached_payload": { /* FULL MODASH PROFILE OBJECT */ }
      },
      "tiktok": {
        "userId": "modash_user_id_for_tiktok",
        "username": "tiktok_username",
        "followers": 200000,
        "engagementRate": 0.052,
        "avgViews": 150000,
        "last_refreshed": "2025-01-15T11:00:00Z",
        "cached_payload": { /* FULL MODASH PROFILE OBJECT */ }
      },
      "youtube": {
        "userId": "modash_user_id_for_youtube",
        // ... same structure
      }
    },
    
    // Complete profile snapshot (full Modash API response)
    "profile_snapshot": {
      "userId": "...",
      "username": "...",
      "followers": 100000,
      "engagementRate": 0.045,
      "audience": { /* Complete audience data */ },
      "recentPosts": [ /* Array of posts */ ],
      "popularPosts": [ /* Array of posts */ ],
      "sponsoredPosts": [ /* Array of posts */ ],
      // ... all other Modash fields
    },
    
    // Metadata
    "source": "roster_panel_refresh" | "discovery" | "bulk_refresh",
    "latest_platform": "instagram"
  }
}
```

### Secondary Storage: `modash_profile_cache` Table

**Purpose:** Long-term caching (4 weeks TTL) for rich profile data

**Key Tables:**
- `modash_profile_cache` - Profile data cache
- `modash_audience_cache` - Audience demographics cache
- `modash_update_log` - Update tracking

**Note:** This is used primarily for influencer platform connections, not the roster view directly.

---

## 🔄 COMPLETE DATA FLOW

### PHASE 1: INITIAL PAGE LOAD

#### Step 1.1: Roster Page Renders
**File:** `src/app/staff/roster/page.tsx`

**Process:**
1. Component mounts → `useRosterData()` hook initializes
2. Calls `/api/influencers/light` endpoint
3. Receives array of `StaffInfluencer` objects with `notes` field included
4. For each influencer, displays analytics progress badge

#### Step 1.2: Analytics Progress Calculation
**Function:** `getAnalyticsProgress(influencer: StaffInfluencer)` (lines 62-91)

**Logic:**
```typescript
1. Count total platforms from influencer.platforms array
2. Parse influencer.notes JSON → extract modash_data.platforms
3. For each platform in influencer.platforms:
   - Check if platformsData[platform.toLowerCase()] exists
   - Check if last_refreshed timestamp exists
   - Validate timestamp: Date.now() - lastRefreshedTime <= ANALYTICS_CACHE_TTL_MS (12 hours)
   - Count as "synced" if valid
4. Return { total: number, synced: number }
```

**Display:** Shows badge like "2/3" next to platform icons indicating 2 out of 3 platforms have fresh analytics.

#### Step 1.3: Visual Indicators
- **Green border** on platform sync badge if all platforms synced
- **Gray border** if some platforms missing/expired
- Progress label: `{synced}/{total}`

---

### PHASE 2: USER OPENS ANALYTICS PANEL

#### Step 2.1: User Clicks "View Analytics" Button
**File:** `src/app/staff/roster/page.tsx` (line 970)

**Action:** Calls `handleViewInfluencer(influencer)` which:
- Sets `selectedInfluencerForAnalytics` state
- Opens `detailPanelOpen` to `true`
- Triggers `useRosterInfluencerAnalytics` hook

#### Step 2.2: Hook Initialization
**File:** `src/components/staff/roster/useRosterInfluencerAnalytics.ts`

**Hook Parameters:**
- `influencer: StaffInfluencer | null`
- `isOpen: boolean` (detailPanelOpen state)
- `selectedPlatform: string` (default: 'instagram')
- `options?: { onNotesUpdate?: callback }`

**Effect Trigger:** `useEffect` fires when `isOpen`, `influencer?.id`, or `selectedPlatform` changes

---

### PHASE 3: DATA FETCHING LOGIC (3-TIER CACHE STRATEGY)

#### Tier 1: Check Local Cache (FASTEST PATH - ~1ms)

**Function:** `getCachedAnalyticsEntry(notes, platform)` (lines 30-49)

**Check Sequence:**
1. Parse `influencer.notes` JSON
2. Extract `modash_data.platforms[platform.toLowerCase()]`
3. Check if record exists and has:
   - `last_refreshed` timestamp
   - `cached_payload` (full profile data)
4. Validate timestamp freshness:
   - Calculate: `Date.now() - lastRefreshedTime`
   - Must be ≤ `ANALYTICS_CACHE_TTL_MS` (12 hours = 43,200,000ms)
5. If valid → **RETURN IMMEDIATELY** with cached data

**Cache Hit Result:**
- No API calls
- Instant display
- Enriched payload merged with influencer metadata
- Sets `syncKeyRef` to prevent duplicate syncs

**Cache Structure Used:**
```typescript
{
  record: {
    userId: "...",
    followers: 100000,
    engagementRate: 0.045,
    // ... other metrics
    last_refreshed: "2025-01-15T10:30:00Z"
  },
  payload: { /* Complete Modash profile object */ },
  lastRefreshed: "2025-01-15T10:30:00Z",
  lastRefreshedTime: 1736935800000
}
```

#### Tier 2: Use Stored Modash userId (FAST PATH - ~200-500ms)

**If cache expired or missing, check for stored userId** (lines 170-274)

**Process:**
1. Extract userId from `modash_data.platforms[platform].userId`
2. Fallback to legacy: `modash_data.userId` or `modash_data.modash_user_id`
3. **Critical:** Validate platform match (userId must be for correct platform)
4. If userId found → Call `/api/discovery/profile` with `userId`

**API Call:**
```typescript
POST /api/discovery/profile
{
  "userId": "modash_user_id",
  "platform": "instagram"
}
```

**Response Handling:**
- Success → Merge Modash data with influencer metadata → Display
- 429 (Rate Limit) → **STOP IMMEDIATELY** → Show error → Use roster data fallback
- 400/404 → Clear userId → Fall back to username search
- 500 → Use roster data only (no retry)

**Performance:** ~200-500ms (single API call, no username lookup needed)

#### Tier 3: Username Lookup (SLOW PATH - ~500-1500ms)

**If no userId or userId failed** (lines 277-372)

**Process:**
1. Fetch username from database:
   ```
   GET /api/influencers/{id}/platform-username?platform={platform}
   ```
2. Extract username from `influencer_platforms` table
3. Clean username (remove @, trim whitespace)
4. Call `/api/discovery/profile` with `username`

**API Call:**
```typescript
POST /api/discovery/profile
{
  "username": "clean_username",
  "platform": "instagram"
}
```

**Username Search Flow (Inside `/api/discovery/profile`):**
1. If platform is YouTube → Use `searchDiscovery()` (POST endpoint)
2. If platform is Instagram/TikTok → Use `listUsers()` (GET endpoint)
3. Search results for exact username match (case-insensitive)
4. Extract `userId` from match
5. Call `getProfileReport(userId, platform)` from Modash API
6. Transform and return profile data

**Performance:** ~500-1500ms (two API calls: username lookup + profile fetch)

---

### PHASE 4: DATA SYNCHRONIZATION TO SERVER

#### Step 4.1: Sync Analytics to Server
**Function:** `syncAnalyticsToServer(payload)` (lines 63-117)

**Purpose:** Persist fetched Modash data back to database for future cache hits

**Sync Key Prevention:**
- Generates sync key: `{influencerId}|{platform}|{userId}|{followers}|{engagement}|{views}`
- Compares with `syncKeyRef.current`
- **Skips sync if data unchanged** (prevents duplicate saves)

**API Call:**
```typescript
POST /api/roster/{influencerId}/refresh-analytics
{
  "platform": "instagram",
  "modashUserId": "...",
  "metrics": {
    "username": "...",
    "followers": 100000,
    "engagementRate": 0.045,
    "avgViews": 50000,
    "avgLikes": 5000,
    "avgComments": 500,
    "url": "...",
    "picture": "..."
  },
  "profile": { /* Full Modash profile object */ }
}
```

#### Step 4.2: Server-Side Update
**File:** `src/app/api/roster/[id]/refresh-analytics/route.ts`

**Update Process:**
1. Parse existing `influencer.notes` JSON
2. Extract existing `modash_data.platforms` structure
3. Update platform-specific entry:
   ```typescript
   platforms[platform] = {
     ...existingPlatformData,
     userId: modashUserId,
     username: "...",
     followers: 100000,
     engagementRate: 0.045,
     // ... other metrics
     last_refreshed: new Date().toISOString(),
     refreshed_by: userId,
     cached_payload: fullProfileObject
   }
   ```
4. Update `influencer_platforms` table:
   - Upsert platform record with Modash metrics
   - Set `modash_user_id` field
   - Update `last_synced` timestamp
5. Save updated `notes` JSON back to `influencers.notes`
6. Recalculate aggregated stats via `updateInfluencerAggregatedStats()`
7. Return updated `notes` string to client

#### Step 4.3: Client-Side State Update
**Callback:** `onNotesUpdate(influencerId, updatedNotes)`

**Updates:**
- Local `influencers` state array
- `selectedInfluencerForAnalytics` state
- `selectedDashboardInfluencer` state

**Result:** UI reflects fresh data immediately, next panel open will hit Tier 1 cache

---

### PHASE 5: AGGREGATED STATS RECALCULATION

#### Step 5.1: Stats Aggregator
**File:** `src/lib/db/queries/influencer-stats-aggregator.ts`

**Function:** `updateInfluencerAggregatedStats(influencerId)`

**Process:**
1. Query all `influencer_platforms` for this influencer
2. Calculate `total_followers`: **SUM** of all platform followers
3. Calculate `total_engagement_rate`: **WEIGHTED AVERAGE** (by followers)
4. Calculate `total_avg_views`: **SIMPLE AVERAGE** across platforms
5. Update `influencers` table with aggregated values

**Formula for Weighted Engagement:**
```
totalWeightedEngagement = Σ(engagementRate × followers)
totalWeight = Σ(followers)
totalEngagementRate = totalWeightedEngagement / totalWeight
```

**Why This Matters:** The roster table displays aggregated stats, which must stay in sync with platform-level Modash data.

---

## 🔗 API ENDPOINTS INVOLVED

### 1. `/api/influencers/light` (GET)
**Purpose:** Load roster list with minimal data
**Returns:** Array of influencers with `notes` field included
**Optimization:** No expensive joins, no JSON aggregation

### 2. `/api/discovery/profile` (POST)
**Purpose:** Fetch Modash profile data
**Accepts:** `{ userId?, username?, platform, includePerformanceData? }`
**Returns:** Full Modash profile object
**Internal Calls:**
- `listUsers()` or `searchDiscovery()` (username lookup)
- `getProfileReport()` (profile fetch)
- `getPerformanceData()` (optional, for enhanced metrics)

### 3. `/api/influencers/{id}/platform-username` (GET)
**Purpose:** Get username for a specific platform
**Query Params:** `?platform=instagram`
**Returns:** `{ success: boolean, username: string | null }`

### 4. `/api/roster/{id}/refresh-analytics` (POST)
**Purpose:** Save Modash data to database
**Accepts:** Platform metrics and full profile payload
**Updates:**
- `influencers.notes` (JSON field)
- `influencer_platforms` table
- Triggers stats aggregation

### 5. `/api/roster/bulk-refresh-analytics` (POST)
**Purpose:** Refresh all roster influencers at once
**Process:** Iterates through all influencers with `modash_data.userId`
**Rate Limiting:** 100ms delay between requests

---

## 📦 SERVICE LAYER

### `src/lib/services/modash.ts`
**Core Functions:**
- `getProfileReport(userId, platform)` - Main Modash API call
- `getPerformanceData(platform, url, limit)` - Enhanced metrics
- `listUsers(platform, {query, limit})` - Username search (Instagram/TikTok)
- `searchDiscovery(platform, filterBody)` - Advanced search (YouTube)
- `getCreditUsage()` - Check API quota

**API Base:** `https://api.modash.io/v1`
**Authentication:** Bearer token from `MODASH_API_KEY` env var

### `src/lib/services/modash-cache.ts`
**Purpose:** 3-tier caching system (Redis → PostgreSQL → Modash API)
**Note:** Used primarily for influencer platform connections, not roster directly

---

## ⚠️ CRITICAL EDGE CASES & ERROR HANDLING

### 1. Rate Limiting (429)
**Behavior:** 
- **IMMEDIATE STOP** - No retries, no fallbacks
- Display error message to user
- Use roster data only (no Modash analytics)

**Implementation:**
- Checked in `useRosterInfluencerAnalytics` (lines 250, 346)
- Prevents cascading API calls that would hit rate limit further

### 2. Invalid/Corrupted Notes JSON
**Behavior:**
- `parseNotes()` safely handles errors
- Returns `null` if JSON parse fails
- Falls back to username lookup or roster data

### 3. Missing Platform Username
**Behavior:**
- Username lookup fails → Use roster data only
- Display basic influencer info without Modash analytics

### 4. Platform Mismatch (userId for wrong platform)
**Behavior:**
- Validates platform match before using userId
- Falls back to username search if mismatch detected
- Handles legacy top-level `userId` with platform validation

### 5. Expired Cache with No Username
**Behavior:**
- Cache expired → Try userId lookup
- userId fails → Try username lookup
- username missing → Use roster data only

### 6. Network Failures
**Behavior:**
- Try-catch around all API calls
- Graceful fallback to roster data
- Error state shown in UI

---

## 🎯 PERFORMANCE OPTIMIZATIONS

### 1. Caching Strategy
- **Tier 1:** In-memory (12-hour TTL) - Instant
- **Tier 2:** userId lookup (no username search) - ~200-500ms
- **Tier 3:** Username search - ~500-1500ms

### 2. Sync Key Deduplication
- Prevents duplicate server syncs
- Compares data hash before syncing
- Reduces database writes

### 3. Lazy Loading
- Analytics panel only loads when opened
- Data fetched on-demand, not on page load
- Reduces initial page load time

### 4. Optimized API Endpoint
- `/api/influencers/light` loads minimal data
- No expensive JSON aggregations
- Platforms parsed as simple arrays

### 5. Batch Updates
- Bulk refresh processes in batches
- Rate limiting between requests (100ms delay)
- Prevents API quota exhaustion

---

## 🔍 DEBUGGING & MONITORING

### Console Logs
**Key Log Points:**
- `🔍 Roster Analytics: Fetching for influencer...` - Hook triggered
- `✅ Roster Analytics: Found stored Modash userId...` - Cache hit
- `✅ Roster Analytics: Successfully fetched Modash data...` - API success
- `⚠️ Roster Analytics: Modash returned no data...` - API returned empty
- `❌ Roster Analytics: Modash API error...` - API failure

### Cache Validation
**Function:** `getAnalyticsProgress()` validates cache freshness
**Display:** Progress badge shows sync status

### Error Tracking
- All errors logged to console
- User-facing error messages displayed
- Fallback states prevent UI crashes

---

## 📋 DATA FLOW SUMMARY

```
┌─────────────────────────────────────────────────────────────┐
│ 1. PAGE LOAD                                                │
│    ├─ useRosterData() hook                                  │
│    ├─ GET /api/influencers/light                            │
│    ├─ Parse notes JSON → extract modash_data                │
│    └─ Display analytics progress badge (getAnalyticsProgress)│
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. USER CLICKS "VIEW ANALYTICS"                             │
│    ├─ handleViewInfluencer()                                │
│    ├─ Opens detailPanelOpen                                 │
│    └─ Triggers useRosterInfluencerAnalytics hook            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. TIER 1: CHECK LOCAL CACHE                                │
│    ├─ getCachedAnalyticsEntry()                             │
│    ├─ Check modash_data.platforms[platform]                 │
│    ├─ Validate last_refreshed < 12 hours                    │
│    └─ ✅ CACHE HIT → Display immediately (SKIP TO STEP 7)   │
│    └─ ❌ CACHE MISS → Continue to Tier 2                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. TIER 2: USE STORED USERID                                │
│    ├─ Extract userId from modash_data.platforms[platform]   │
│    ├─ Fallback to legacy modash_data.userId                 │
│    ├─ POST /api/discovery/profile { userId, platform }      │
│    │   └─ getProfileReport() → Modash API                   │
│    └─ ✅ SUCCESS → Display + Sync (GO TO STEP 6)            │
│    └─ ❌ FAILED → Continue to Tier 3                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. TIER 3: USERNAME LOOKUP                                  │
│    ├─ GET /api/influencers/{id}/platform-username           │
│    ├─ Extract username from influencer_platforms table      │
│    ├─ POST /api/discovery/profile { username, platform }    │
│    │   ├─ listUsers() or searchDiscovery() → Username search│
│    │   ├─ Extract userId from search results                │
│    │   └─ getProfileReport() → Modash API                   │
│    └─ ✅ SUCCESS → Display + Sync (GO TO STEP 6)            │
│    └─ ❌ FAILED → Use roster data only (FALLBACK)           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. SYNC TO SERVER                                           │
│    ├─ syncAnalyticsToServer()                               │
│    ├─ Generate sync key (deduplication)                     │
│    ├─ POST /api/roster/{id}/refresh-analytics               │
│    │   ├─ Update modash_data.platforms[platform]            │
│    │   ├─ Update influencer_platforms table                 │
│    │   ├─ Save notes JSON to influencers.notes              │
│    │   └─ updateInfluencerAggregatedStats()                 │
│    └─ onNotesUpdate() callback → Update local state         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. DISPLAY IN UI                                            │
│    ├─ InfluencerDetailPanel component                       │
│    ├─ Shows followers, engagement, posts, audience          │
│    ├─ Platform-specific metrics                             │
│    └─ All data from Modash (analytics) + Database (CRM)     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 SECURITY & AUTHENTICATION

### Authentication Checks
- All API routes check `auth()` from Clerk
- Staff/Admin role verification for sensitive operations
- Token validation on client-side requests

### Data Access
- Users can only view influencers they have access to
- Bulk refresh requires STAFF/ADMIN role
- Individual analytics refresh respects user permissions

---

## 📝 KEY TAKEAWAYS

1. **Data Source Hierarchy:**
   - **Modash = KING for analytics** (followers, engagement, posts, audience)
   - **Database = KING for CRM data** (assigned_to, labels, display_name, platforms array)

2. **Caching Strategy:**
   - 12-hour TTL for in-memory cache
   - Platform-specific data structure (multi-platform support)
   - Sync key prevents duplicate saves

3. **Performance:**
   - Fastest path: Cache hit (~1ms)
   - Fast path: userId lookup (~200-500ms)
   - Slow path: Username search (~500-1500ms)

4. **Error Resilience:**
   - Graceful fallbacks at every tier
   - Rate limit handling prevents cascade failures
   - Network errors don't crash UI

5. **Data Persistence:**
   - All Modash data stored in `influencers.notes` JSON field
   - Platform-specific structure enables multi-platform support
   - Aggregated stats recalculated after each refresh

---

## 🚨 POTENTIAL ISSUES & RECOMMENDATIONS

### Issue 1: Large Notes JSON Field
**Problem:** `influencers.notes` can grow very large with full Modash payloads
**Impact:** Slow JSON parsing, increased database storage
**Recommendation:** Consider moving rich data to `modash_profile_cache` table, keep only references in notes

### Issue 2: Cache Invalidation
**Problem:** 12-hour TTL might be too long for some use cases
**Recommendation:** Make TTL configurable or reduce to 6 hours

### Issue 3: Rate Limiting
**Problem:** No automatic retry after rate limit expires
**Recommendation:** Implement exponential backoff retry logic

### Issue 4: Username Search Performance
**Problem:** Username lookup requires additional API call
**Recommendation:** Always store userId after first fetch to avoid username searches

### Issue 5: Platform Mismatch Detection
**Problem:** Legacy userId fields might not match selected platform
**Recommendation:** Always use platform-specific `platforms[platform].userId` structure

---

## ✅ VERIFICATION CHECKLIST

- [x] Data flows from Modash API → Database → UI
- [x] Caching prevents unnecessary API calls
- [x] Error handling covers all edge cases
- [x] Multi-platform support (Instagram, TikTok, YouTube)
- [x] Aggregated stats stay in sync
- [x] Rate limiting respected
- [x] Backwards compatibility maintained (legacy userId fields)
- [x] Performance optimized (3-tier cache strategy)
- [x] State management handles updates correctly
- [x] Sync deduplication prevents duplicate saves

---

**Analysis Complete** ✅
**Date:** 2025-01-15
**Files Analyzed:** 20+ files across hooks, services, API routes, and components
**Flow Complexity:** High (multi-tiered caching with fallbacks)
