# Final Modash API Cleanup - Remove Overlaps

## 🚨 Overlapping Endpoints Found

### 1. Remove `profile-report`
- **Why**: The `profile` endpoint already returns location data
- **Usage**: Not used by frontend
- **Action**: DELETE `/api/discovery/profile-report/`

### 2. Remove `list-users` 
- **Why**: The `search` endpoint already uses listUsers internally
- **Usage**: Not used by frontend  
- **Action**: DELETE `/api/discovery/list-users/`

### 3. Keep `performance-data` but clarify usage
- **Why**: While profile and search can fetch performance data, having a dedicated endpoint is useful
- **Usage**: May be used for refreshing data without full profile fetch
- **Action**: KEEP but document when to use it vs profile

## Commands to Execute

```bash
# Remove redundant endpoints
rm -rf src/app/api/discovery/profile-report/
rm -rf src/app/api/discovery/list-users/
```

## After Cleanup - True Active Endpoints

1. **Credits**: `GET /api/discovery/credits`
2. **Search**: `POST /api/discovery/search` (handles both simple & listUsers)
3. **Search V2**: `POST /api/discovery/search-v2` (advanced filters)
4. **Profile**: `POST /api/discovery/profile` (includes performance & location)
5. **Performance Data**: `GET/POST /api/discovery/performance-data` (dedicated metrics)
6. **Add to Roster**: `POST /api/discovery/add-to-roster`

## After Cleanup - Unused But Kept (Future Features)

7-12. Filter endpoints (hashtags, interests, languages, locations, topics, partnerships)
13. Audience Overlap: `/api/discovery/audience-overlap`

## Result

- **Before**: 16 endpoints with overlaps
- **After**: 13 endpoints with NO overlaps
- **Active**: 6 endpoints
- **Future**: 7 endpoints