# Modash API Cleanup Plan

## Current State Analysis

### Actually Used API Routes (Found in Frontend)

1. **ACTIVE ROUTES** (Used in production):
   - `/api/discovery/credits` - Get credit usage
   - `/api/discovery/search` - Main search endpoint (simple searches)
   - `/api/discovery/search-v2` - Advanced search with filters
   - `/api/discovery/profile` - Get profile details
   - `/api/discovery/add-to-roster` - Add influencer to roster

2. **POTENTIALLY ACTIVE** (Need to verify):
   - `/api/discovery/hashtags` - Filter options
   - `/api/discovery/interests` - Filter options
   - `/api/discovery/languages` - Filter options
   - `/api/discovery/locations` - Filter options
   - `/api/discovery/topics` - Filter options
   - `/api/discovery/partnerships` - Filter options
   - `/api/discovery/performance-data` - Real-time metrics
   - `/api/discovery/list-users` - User listing
   - `/api/discovery/profile-report` - Detailed reports
   - `/api/discovery/audience-overlap` - Audience analysis

3. **TEST/DEPRECATED ROUTES** (To be removed):
   - `/api/discovery/test/` ❌
   - `/api/discovery/test-search/` ❌
   - `/api/discovery/test-search-v2/` ❌
   - `/api/discovery/test-cristiano-search/` ❌
   - `/api/discovery/test-profile/` ❌
   - `/api/discovery/search/route.ts.backup` ❌

## Cleanup Steps

### Step 1: Remove Test Routes ✅ COMPLETED
```bash
# Remove test directories
rm -rf src/app/api/discovery/test/
rm -rf src/app/api/discovery/test-search/
rm -rf src/app/api/discovery/test-search-v2/
rm -rf src/app/api/discovery/test-cristiano-search/
rm -rf src/app/api/discovery/test-profile/
rm -f src/app/api/discovery/search/route.ts.backup
```

### Step 2: Verify Filter Endpoints Usage ✅ COMPLETED
**Finding**: These endpoints exist but are NOT used by the frontend.
- hashtags - Provides hashtag suggestions (not used)
- interests - Provides interest categories (not used)
- languages - Provides language options (not used) 
- locations - Provides location search (not used)
- topics - Provides topic suggestions (not used)
- partnerships - Provides brand partnerships (not used)

**Decision**: Keep for now as they may be used for autocomplete in the future.

### Step 3: Consolidate Duplicate Functionality ✅ ANALYZED
**Findings**:
- `profile` - POST endpoint that gets full profile data including reports
- `profile-report` - GET endpoint that only gets location data (city/country)
- **Overlap**: The profile endpoint already includes report functionality
- **Recommendation**: Remove profile-report as it's redundant

**search vs search-v2**:
- `search` - Uses List Users API for simple username/keyword searches
- `search-v2` - Uses Search Influencers API for complex filtering
- **Status**: Clear distinction, both are needed

### Step 4: Document API Architecture

## Proposed Clean Architecture

```
src/
├── lib/services/
│   └── modash.ts                    # Core Modash service class
│
└── app/api/discovery/
    ├── README.md                    # API documentation
    ├── credits/                     # Credit usage tracking
    ├── search/                      # Simple search (username/keyword)
    ├── search-advanced/             # Advanced search with filters
    ├── profile/                     # Individual profile data
    ├── filters/                     # Filter options endpoints
    │   ├── hashtags/
    │   ├── interests/
    │   ├── languages/
    │   ├── locations/
    │   └── topics/
    └── roster/                      # Roster management
        └── add/
```

## Service Layer Pattern

All API routes should follow this pattern:

```typescript
// API Route (thin wrapper)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = await modashService.methodName(body)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
```

## Next Steps

1. **Immediate**: Remove test routes
2. **Today**: Audit filter endpoints usage
3. **Tomorrow**: Consolidate duplicates
4. **This Week**: Create comprehensive API documentation
5. **Future**: Add API versioning strategy