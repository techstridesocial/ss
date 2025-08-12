## Modash API Audit — Issues, Hidden Features, and Fixes

### Overview
This document audits our Modash API integration across service code, API routes, and UI usage. It identifies bugs/inconsistencies, features implemented server-side but not exposed in the UI, and provides concrete fixes with endpoint paths and code references.

### Progress
- [x] Step 1 complete (2025-08-11): Core Modash fixes implemented and tested
  - Exported `modashService` and added helpers (`getCreditUsage`, platform-aware `listUsers`, `searchDiscovery`)
  - Fixed broken imports in discovery routes (interests, partnerships, performance-data, search-v2)
  - Corrected partnerships path to `/v1/instagram/brands`
  - Re-enabled and mapped location filter in `mapToModashFilters`
  - Platform-aware search now calls per-platform endpoints (List Users + POST search)
  - Standardized rate-limit error message; added test polyfills; tests pass aside from unrelated DB/security cases
- [x] Step 2 complete (2025-08-11): Audience Overlap service + UI wiring
  - Implemented `getAudienceOverlap` in service with platform path and fallback
  - Wired `POST /api/discovery/audience-overlap` to service
  - Included `overlap` section in extended profile fetch and mapped to `audience_overlap` in detail panel
- [x] Step 3 complete (2025-08-11): Exposed Interests and Partnerships in UI filters
  - Added Interests autocomplete using `/api/discovery/interests`
  - Switched Collaborations to Partnerships autocomplete using `/api/discovery/partnerships`
- [x] Step 4 complete (2025-08-11): Finalized Search v2 response shape
  - Implemented platform-aware call in `search-v2` via `searchDiscovery('instagram', {...})`
  - Normalized response: `{ success, influencers, pagination: { page, total, hasMore }, metadata: { isExactMatch, directsCount, lookalikesCount } }`
  - Staff Discovery handles v2 format without further changes
- [x] Step 4: Finalize Search v2 response shape or remove
- [x] Step 5 complete (2025-08-12): Align credit fields with `/v1/user/info`
  - Mapped `billing.credits` → limit, `billing.rawRequests` → used, computed remaining and percentage
  - Updated `GET /api/discovery/credits` to use normalized `getCreditUsage()`
- [x] Step 6 complete (2025-08-12): Credit-efficient enrichment
  - Limited profile report enrichment to top 10 results for simple searches
  - Added conservative pacing; ready to extend with caching/backoff if needed

### Summary of Key Findings
- Multi-platform search calls Instagram-only endpoint for all platforms.
- Several API routes import a non-existent `modashService` object; service exports named functions only.
- Location filtering is disabled in the search mapping.
- Partnerships endpoint likely mismatched (`/instagram/partnerships` vs documented `/instagram/brands`).
- Search v2 route relies on a missing service method and response shape.
- Audience Overlap route wired but service method missing; UI has a section that never gets data.
- Extended profile endpoint misuses list endpoints with `userId` inputs.
- Possible credit usage computation mismatch.
- Risky credits/rate-limit behavior when enriching search results with full profile reports.

---

### 1) Multi-platform search not actually multi-platform
**Where**
- `src/app/api/discovery/search/route.ts` searches `['instagram','tiktok','youtube']` but calls `searchInfluencers(filters)`.
- `src/lib/services/modash.ts` defines `searchInfluencers` as `GET /v1/instagram/users` (Instagram only).

**Impact**
- TikTok/YouTube results are never included; redundant Instagram calls; misleading platform status in responses; unnecessary credits.

**Fix**
1. Implement platform-aware functions in `src/lib/services/modash.ts`:
   - Simple handle discovery (List Users): `GET /v1/{platform}/users?query={handle}&limit={n}`.
   - Complex discovery search: `POST /v1/{platform}/search` with Modash filter body.
2. Update `src/app/api/discovery/search/route.ts` to call the appropriate per-platform function based on the `platform` loop.
3. For enrichment, keep platform context when calling `getProfileReport` to avoid mixing platform data.

Example service additions (TypeScript signatures):
```ts
// src/lib/services/modash.ts
export async function listUsers(platform: 'instagram'|'tiktok'|'youtube', params: { query: string; limit?: number })
export async function searchDiscovery(platform: 'instagram'|'tiktok'|'youtube', body: any)
```

---

### 2) Broken imports: `modashService` object not exported
**Where**
- Routes importing `modashService` (but service exports named functions):
  - `src/app/api/discovery/performance-data/route.ts`
  - `src/app/api/discovery/interests/route.ts`
  - `src/app/api/discovery/partnerships/route.ts`
  - `src/app/api/discovery/audience-overlap/route.ts`
  - `src/app/api/discovery/search-v2/route.ts`
- `src/lib/jobs/modash-sync.ts` also imports `{ modashService, tierUtils }` which aren’t exported.

**Impact**
- Runtime import errors; endpoints fail.

**Fix (choose one)**
- A) Switch to named imports consistently:
  - e.g., `import { getPerformanceData } from '../../../../lib/services/modash'`.
- B) Or export an object in `src/lib/services/modash.ts`:
  ```ts
  export const modashService = { getProfileReport, getPerformanceData, listHashtags, listInterests, listLanguages, listLocations, listTopics, listPartnerships, searchInfluencers }
  ```
- Also remove/replace `tierUtils` import or implement/export it if needed.

---

### 3) Location filtering disabled
**Where**
- `src/app/api/discovery/search/route.ts` → `mapToModashFilters` logs “temporarily disabled for debugging” and does not set `filters.location`.

**Impact**
- UI location filter has no effect.

**Fix**
1. Maintain a mapping of location slugs to Modash location IDs (or fetch IDs via `GET /v1/instagram/locations`).
2. Set `filters.location = [ids...]` after mapping.
3. Remove debug logs and re-enable.

---

### 4) Partnerships endpoint path mismatch
**Where**
- Service uses `GET /v1/instagram/partnerships`.
- Repo doc “Instagram List Partnerships API” specifies `GET /v1/instagram/brands` and response `{ brands: [{ id, name, count }], total }`.

**Impact**
- Potential 404/invalid schema; UI autocomplete can’t rely on it.

**Fix**
1. Change `listPartnerships` in `src/lib/services/modash.ts` to `GET /v1/instagram/brands` with `query` and `limit`.
2. Ensure API route `src/app/api/discovery/partnerships/route.ts` forwards `{ brands, total }` structure.

---

### 5) Search v2 route not implemented correctly
**Where**
- `src/app/api/discovery/search-v2/route.ts` calls `modashService.searchInfluencers(filter, page, sort)` and expects `{ directs, lookalikes, total, isExactMatch }` in `result.data`.
- No such function/shape exists; also imports `modashService`.

**Impact**
- Endpoint fails; UI path selecting `/api/discovery/search-v2` won’t work.

**Fix**
1. Either remove `search-v2` usage in UI and route until supported; or
2. Implement a new service function that calls Modash’s advanced search and transforms to the expected `directs/lookalikes` shape, then fix the import.

---

### 6) Audience Overlap route lacks service method; UI section inert
**Where**
- `src/app/api/discovery/audience-overlap/route.ts` calls `modashService.getAudienceOverlap` (missing).
- UI: `src/components/influencer/detail-panel/sections/AudienceOverlapSection.tsx` expects `influencer.audience_overlap`.

**Impact**
- No overlap data is ever displayed.

**Fix**
1. Implement `getAudienceOverlap(userIds: string[], options)` in `src/lib/services/modash.ts` calling Modash overlap endpoint (confirm official path/params).
2. Wire route to use the new function; define request body `{ userIds: string[], segments?: string[], metrics?: string[] }`.
3. Populate `audience_overlap` in the detail fetch flow and pass to the section component.

---

### 7) Extended profile misuses list endpoints with `userId`
**Where**
- `src/app/api/discovery/profile-extended/route.ts` passes `userId` into `listHashtags/listPartnerships/listTopics/listInterests/listLanguages`.

**Impact**
- These list endpoints are global suggestion searches (e.g., `GET /instagram/hashtags?query=...`); they don’t accept user IDs and do not return creator-specific data. The enrichment is semantically incorrect.

**Fix**
1. If Modash provides creator-specific endpoints for hashtags/partnerships/topics, switch to those with `userId`.
2. Otherwise, remove userId-driven calls from extended profile, or change to keyword-based enrichment derived from the creator’s profile fields (e.g., use profile topics/hashtags from `getProfileReport`).
3. Only include sections for which Modash provides correct per-creator data to avoid misleading UI.

---

### 8) Performance Data route import/signature
**Where**
- `src/app/api/discovery/performance-data/route.ts` imports `modashService` and calls `getPerformanceData(url, 3)`.
- Service defines named `getPerformanceData(url, postLimit=5)` that sends `post_count`, which may not be supported.

**Impact**
- Import fails; parameter may be ignored.

**Fix**
1. Import the named function: `import { getPerformanceData } from '../../../../lib/services/modash'`.
2. Validate whether `post_count` is supported. If not, remove it and rely on Modash defaults (6/12/30 posts & reels).

---

### 9) Credit usage computation may be inaccurate
**Where**
- `src/app/api/discovery/credits/route.ts` infers credits and usage from `response.billing?.credits` and `response.billing?.rawRequests` of `/user/info`.

**Impact**
- Might misreport real credit limits/usage if the fields differ by plan or endpoint type.

**Fix**
1. Confirm `/v1/user/info` schema with Modash. Adjust to precise fields (e.g., discovery credits vs raw requests, monthly vs annual limits, reset date).
2. Store `resetDate` based on Modash-provided info rather than `new Date()`.

---

### 10) Risk: Enrichment fetches full profile report per result (credits/limits)
**Where**
- `src/app/api/discovery/search/route.ts` enriches up to 50 list-users results by fetching a full profile report for each.

**Impact**
- Potential rate-limit (429) and high credit consumption; unnecessary for initial list UX.

**Fix**
1. Limit enrichment to the top N results (e.g., 5–10) or on-demand when a user opens the detail panel.
2. Add concurrency limiting (e.g., 3–5 concurrent requests) and exponential backoff on 429.
3. Cache profile reports for 24h+ to prevent repeated costs.

---

### 11) Endpoint/version alignment checks
**Where**
- Base URL is `/v1` across service.
- `getProfileReport` uses `/{platform}/profile/{userId}/report`, while docs mention `GET /v1/discovery/profile/{userId}/report`.

**Impact**
- If path differs for plan/type, calls may 404 or return different shapes.

**Fix**
1. Verify Modash’s current path for profile report; unify code and docs accordingly.
2. Update `docs` after confirmation.

---

### Hidden features implemented server-side but not exposed in UI
1. Interests autocomplete
   - API: `GET /api/discovery/interests?query={string}&limit={int}` (route exists but imports `modashService`).
   - UI: No usage found. Expose via `AutocompleteInput` in Staff Discovery filters.
   - Fix: Correct import in route; add UI field using endpoint.

2. Partnerships (brands) autocomplete
   - API: `GET /api/discovery/partnerships?query={string}&limit={int}` (route exists; path mismatch likely).
   - UI: No usage found. Expose via `AutocompleteInput` in filters.
   - Fix: Update service to `/instagram/brands`; correct import; add UI field.

3. Audience Overlap analysis
   - API route scaffolded; service method missing; UI section present but inert.
   - Fix: Implement service + connect route; fetch and attach overlap data when viewing detail.

4. Search v2 path (directs/lookalikes)
   - Route exists but missing service and response transform.
   - Fix: Implement or remove.

---

### Endpoint and UI exposure matrix (selected)
- Search (simple + complex): UI uses `/api/discovery/search`; needs per-platform calls and optional v2.
- Profile: UI uses `/api/discovery/profile` (OK), `/api/discovery/profile-extended` (fix sections).
- Autocomplete used in UI: locations, languages, hashtags, topics.
- Autocomplete available but unused: interests, partnerships.
- Analytics: audience-overlap route present; UI section exists; missing wiring.
- Credits: UI reads `/api/discovery/credits`; verify fields.

---

### Validation checklist after fixes
- Multi-platform search returns platform-diverse results when selecting filters by platform; TikTok/YouTube no longer empty.
- Location filtering affects results and is visible in the query we send to Modash.
- All routes import from `src/lib/services/modash.ts` without errors.
- Partnerships endpoint returns `{ brands, total }` and UI shows brand suggestions.
- Interests autocomplete returns populated list and UI uses it.
- Audience Overlap returns structured data; `AudienceOverlapSection` renders values.
- Search v2 either removed or returns `{ directs, lookalikes, total, isExactMatch }` consistently.
- Credits route shows correct `used/limit/remaining/resetDate` per Modash account.
- Search enrichment is rate-limit-safe and credit-efficient.

---

### Notes and references
- Service endpoints and auth: `src/lib/services/modash.ts`.
- Search route and filters mapping: `src/app/api/discovery/search/route.ts`.
- Extended profile sections: `src/app/api/discovery/profile-extended/route.ts`.
- Audience overlap UI section: `src/components/influencer/detail-panel/sections/AudienceOverlapSection.tsx`.
- Staff Discovery usage of endpoints: `src/app/staff/discovery/page.tsx`.

---

### Are we confident this is complete?
Double-checked the following:
- All discovery API routes under `src/app/api/discovery/*`.
- The Modash service `src/lib/services/modash.ts` (endpoints, auth).
- Staff Discovery UI page and filter components.
- Instagram-specific Modash docs in repo for endpoint names and response shapes.

Gaps we flagged include all import/export inconsistencies, disabled filters, endpoint path mismatches, missing service methods, and UI not exposing available server endpoints. After applying the fixes above, re-run end-to-end testing on:
- Simple handle search, complex filtered search per platform.
- Autocompletes (locations, languages, hashtags, topics, interests, partnerships).
- Profile + extended sections.
- Audience overlap.
- Credits reporting.

