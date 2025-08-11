# Discovery API Documentation

## Overview

The Discovery API provides endpoints for searching and analyzing influencers using the Modash Discovery API service. All endpoints use the centralized `modashService` from `/lib/services/modash.ts`.

## Active Endpoints

### 1. Credits Management
- **Endpoint**: `GET /api/discovery/credits`
- **Purpose**: Fetch current credit usage and limits
- **Used by**: Staff discovery page (credits indicator)

### 2. Influencer Search
- **Endpoint**: `POST /api/discovery/search`
- **Purpose**: Simple influencer search by username/keyword
- **Used by**: Staff discovery page (main search)
- **Note**: Uses List Users API for exact matches

### 3. Advanced Search
- **Endpoint**: `POST /api/discovery/search-v2`
- **Purpose**: Complex filtering with multiple criteria
- **Used by**: Staff discovery page (when filters are applied)
- **Note**: Uses Search Influencers API

### 4. Profile Details
- **Endpoint**: `POST /api/discovery/profile`
- **Purpose**: Get detailed influencer profile data
- **Used by**: Influencer detail panel
- **Features**: Includes report data and location info

### 5. Roster Management
- **Endpoint**: `POST /api/discovery/add-to-roster`
- **Purpose**: Add discovered influencer to internal roster
- **Used by**: Discovery table "Add to Roster" button

### 6. Filter Autocomplete (ACTIVE)
- **Endpoint**: `GET /api/discovery/hashtags`
- **Purpose**: Provide hashtag suggestions with autocomplete
- **Used by**: Hashtags filter inputs (Instagram/TikTok)

### 7. Topic Autocomplete (ACTIVE)
- **Endpoint**: `GET /api/discovery/topics`
- **Purpose**: Provide topic suggestions with autocomplete  
- **Used by**: Topics filter input (YouTube)

### 8. Location Autocomplete (ACTIVE)
- **Endpoint**: `GET /api/discovery/locations`
- **Purpose**: Provide location suggestions with autocomplete
- **Used by**: Location filter input (Demographics)

### 9. Language Autocomplete (ACTIVE)
- **Endpoint**: `GET /api/discovery/languages`
- **Purpose**: Provide language suggestions with autocomplete
- **Used by**: Language filter input (Demographics)

## Future Feature Endpoints

These endpoints exist but are not currently used:

### Remaining Filter APIs
- `GET /api/discovery/interests` - Interest categories
- `GET /api/discovery/partnerships` - Brand partnerships

**Note**: These could be implemented for additional filter types.

### Analytics APIs
- `GET /api/discovery/performance-data` - Real-time performance metrics (standalone)
- `GET /api/discovery/audience-overlap` - Audience analysis

**Note**: No overlapping functionality. Each endpoint has a clear, distinct purpose.

## API Architecture

```
Frontend (Discovery Page)
    ↓
API Routes (Thin Wrappers)
    ↓
modashService (Business Logic)
    ↓
Modash Discovery API
```

## Best Practices

1. **All API routes should be thin wrappers** - Business logic belongs in `modashService`
2. **Use consistent error handling** - Return `{ success, data, error }` format
3. **Log API calls** - Use console.log with emojis for debugging
4. **Handle rate limits** - Modash API has usage limits

## Future Improvements

1. **Remove unused endpoints** if they won't be implemented
2. **Consolidate overlapping functionality** (profile vs profile-report)
3. **Add API versioning** for future changes
4. **Implement filter autocomplete** using the existing endpoints