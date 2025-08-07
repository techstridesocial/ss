# Instagram Search Influencers API - Modash Documentation

**Part of**: [Instagram Modash API Integration](./Instagram%20Modash%20API%20Integration.md)

## Overview
The main influencer discovery API with comprehensive filtering options. This is the primary search endpoint that should replace our current discovery search.

**✅ Implementation Status**: **READY FOR IMPLEMENTATION** in Stride Social Dashboard
- **Service Method**: `modashService.searchInfluencers(filters, page, sort)`
- **API Route**: `/api/discovery/search` (upgrade existing)
- **Usage**: Primary influencer discovery with advanced filtering
- **Cost**: **0.01 credits per result** (typically 0.15 credits for 15 results per page)

## Endpoint
```
POST /instagram/search
```

## Base URL
```
https://api.modash.io/v1/instagram/search
```

## Authentication
Requires Bearer token authentication:
```
Authorization: Bearer <YOUR_ACCESS_TOKEN>
```

## Key Features

### 🎯 **Advanced Filtering**
- **Influencer Filters**: followers, engagement, location, language, age, gender, bio, interests, brands
- **Audience Filters**: demographics, interests, credibility (fake follower detection)
- **Content Filters**: hashtags, mentions, keywords, sponsored posts, reels plays
- **Growth Filters**: follower growth rates over time periods

### 📊 **Sorting Options**
- followers, engagements, engagementRate, relevance, keywords, audienceGeo, audienceLang
- Custom sorting by audience demographics and interests

### 🎭 **Filter Operations**
- **AND/OR/NOT** logic for complex queries
- **Weighted filters** for audience targeting (e.g., 20% minimum US audience)

## Request Structure

### Basic Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | number (0-665) | Page number | 0 |
| `calculationMethod` | string | Metric calculation method | "median" |
| `sort` | object | Sorting configuration | followers desc |
| `filter` | object | Comprehensive filter object | {} |

### Sorting Configuration
```typescript
{
  "sort": {
    "field": "followers" | "engagements" | "engagementRate" | "relevance" | "keywords" | "audienceGeo" | "audienceLang" | "audienceGender" | "audienceAge" | "followersGrowth",
    "direction": "asc" | "desc",
    "value": 123 // Only for audienceGeo and audienceInterest
  }
}
```

### Influencer Filters
```typescript
{
  "filter": {
    "influencer": {
      "followers": { "min": 20000, "max": 70000 },
      "engagementRate": 0.02, // Minimum 2%
      "location": [148838, 62149], // Location IDs from locations API
      "language": "en", // Language code from languages API  
      "lastposted": 90, // Days since last post (min 30)
      "relevance": ["#cars", "@topgear"], // Topics/accounts
      "audienceRelevance": ["@topgear"], // Similar audience
      "gender": "MALE" | "FEMALE" | "KNOWN" | "UNKNOWN",
      "age": { "min": 18, "max": 25 }, // 18, 25, 35, 45, 65
      "followersGrowthRate": {
        "interval": "i6months", // i1month to i6months
        "value": 0.01, // 1% growth
        "operator": "gt" // gte, gt, lt, lte
      },
      "bio": "photos videos", // Bio text search
      "hasYouTube": false,
      "hasContactDetails": [
        { "contactType": "email", "filterAction": "must" }
      ],
      "accountTypes": [2], // 1=Regular, 2=Business, 3=Creator
      "brands": [1708, 13], // Brand IDs from brands API
      "interests": [3, 21, 1, 13], // Interest IDs from interests API
      "keywords": "supercars", // Caption keywords
      "textTags": [
        { "type": "hashtag", "value": "carsofinstagram" },
        { "type": "mention", "value": "topgear" }
      ],
      "reelsPlays": { "min": 20000, "max": 50000000 },
      "isVerified": true,
      "hasSponsoredPosts": true,
      "engagements": { "min": 5000, "max": 10000 },
      "filterOperations": [
        { "operator": "and", "filter": "followers" }
      ]
    }
  }
}
```

### Audience Filters (Weighted)
```typescript
{
  "filter": {
    "audience": {
      "location": [
        { "id": 148838, "weight": 0.2 }, // 20% minimum
        { "id": 62149, "weight": 0.2 }
      ],
      "language": { "id": "en", "weight": 0.2 }, // 20% English
      "gender": { "id": "MALE", "weight": 0.5 }, // 50% male
      "age": [
        { "id": "18-24", "weight": 0.3 }, // 30% 18-24
        { "id": "25-34", "weight": 0.3 }  // 30% 25-34
      ],
      "interests": [
        { "id": 1708, "weight": 0.2 }, // 20% fitness interest
        { "id": 13, "weight": 0.2 }    // 20% beauty interest
      ],
      "credibility": 0.75 // 75% real followers (25% fake max)
    }
  }
}
```

## Response Format

### Success Response (200)
```json
{
  "error": false,
  "total": 2,
  "lookalikes": [
    {
      "userId": "173560420",
      "profile": {
        "userId": "173560420",
        "fullname": "Instagram",
        "username": "instagram",
        "url": "https://www.instagram.com/instagram/",
        "picture": "https://imgigp.modash.io/?https://...",
        "followers": 313560626,
        "engagements": 857994,
        "engagementRate": 0.0027362938100525414
      },
      "match": {
        // Matching score and relevance data
      }
    }
  ],
  "directs": [
    {
      "userId": "173560420",
      "profile": {
        "userId": "173560420",
        "fullname": "Instagram", 
        "username": "instagram",
        "url": "https://www.instagram.com/instagram/",
        "picture": "https://imgigp.modash.io/?https://...",
        "followers": 313560626,
        "engagements": 857994,
        "engagementRate": 0.0027362938100525414
      },
      "match": {
        // Matching score and relevance data
      }
    }
  ],
  "isExactMatch": true
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `error` | boolean | If there is an error |
| `total` | number | Total number of results found |
| `lookalikes` | array | Similar influencers (broader match) |
| `directs` | array | Direct matches (exact filter match) |
| `isExactMatch` | boolean | Are results exactly matching filters |

## Example Requests

### Basic Fitness Influencers
```json
{
  "page": 0,
  "sort": { "field": "followers", "direction": "desc" },
  "filter": {
    "influencer": {
      "followers": { "min": 10000, "max": 100000 },
      "engagementRate": 0.02,
      "interests": [3], // Fitness interest ID
      "language": "en"
    }
  }
}
```

### Beauty Influencers in US/UK with High Engagement
```json
{
  "page": 0,
  "sort": { "field": "engagementRate", "direction": "desc" },
  "filter": {
    "influencer": {
      "followers": { "min": 50000, "max": 500000 },
      "engagementRate": 0.03,
      "interests": [13], // Beauty interest ID
      "isVerified": true
    },
    "audience": {
      "location": [
        { "id": 148838, "weight": 0.3 }, // US 30%
        { "id": 62149, "weight": 0.2 }   // UK 20%
      ],
      "credibility": 0.8 // 80% real followers
    }
  }
}
```

### Micro-Influencers with Contact Details
```json
{
  "page": 0,
  "sort": { "field": "engagementRate", "direction": "desc" },
  "filter": {
    "influencer": {
      "followers": { "min": 1000, "max": 10000 },
      "engagementRate": 0.05,
      "hasContactDetails": [
        { "contactType": "email", "filterAction": "must" }
      ],
      "lastposted": 30,
      "accountTypes": [3] // Creator accounts
    }
  }
}
```

## Proposed Service Implementation

```typescript
// In src/lib/services/modash.ts
async searchInfluencers(
  filters: SearchInfluencersFilters,
  page: number = 0,
  sort?: SortOptions
): Promise<{
  success: boolean;
  data?: {
    total: number;
    lookalikes: InfluencerResult[];
    directs: InfluencerResult[];
    isExactMatch: boolean;
  };
  error?: string;
}> {
  try {
    const requestBody = {
      page,
      calculationMethod: "median",
      sort: sort || { field: "followers", direction: "desc" },
      filter: filters
    };

    console.log('🔍 Searching influencers:', { 
      page, 
      hasInfluencerFilters: !!filters.influencer,
      hasAudienceFilters: !!filters.audience 
    });

    const result = await this.makeRequest('/v1/instagram/search', 'POST', requestBody);

    if (result.error) {
      console.error('❌ Search Influencers API error:', result);
      return {
        success: false,
        error: result.message || 'Search failed'
      };
    }

    console.log('✅ Search Influencers API success:', {
      total: result.total,
      directsCount: result.directs?.length || 0,
      lookalikesCount: result.lookalikes?.length || 0,
      isExactMatch: result.isExactMatch
    });

    return {
      success: true,
      data: {
        total: result.total || 0,
        lookalikes: result.lookalikes || [],
        directs: result.directs || [],
        isExactMatch: result.isExactMatch || false
      }
    };
  } catch (error) {
    console.error('❌ Error searching influencers:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
```

## Filter Mapping for Stride Social

### Current Filter → New API Mapping

| Stride Filter | New API Filter | Example |
|---------------|----------------|---------|
| follower_count | influencer.followers | `{min: 10000, max: 100000}` |
| engagement_rate | influencer.engagementRate | `0.02` (2%) |
| location | influencer.location | `[148838, 62149]` |
| niche | influencer.interests | `[3, 13, 21]` |
| verified | influencer.isVerified | `true` |
| gender | influencer.gender | `"FEMALE"` |
| age_range | influencer.age | `{min: 18, max: 25}` |
| has_contact | influencer.hasContactDetails | `[{contactType: "email", filterAction: "must"}]` |

### Audience Targeting Enhancement

| Feature | API Implementation | Business Value |
|---------|-------------------|----------------|
| Geographic | audience.location with weights | Target specific markets |
| Demographic | audience.age, audience.gender | Precise audience matching |
| Quality | audience.credibility | Avoid fake followers |
| Interests | audience.interests with weights | Niche targeting |

## Advanced Features

### 1. **Growth-Based Filtering**
```json
{
  "influencer": {
    "followersGrowthRate": {
      "interval": "i3months",
      "value": 0.05,
      "operator": "gt"
    }
  }
}
```

### 2. **Content-Based Discovery**
```json
{
  "influencer": {
    "keywords": "fitness motivation",
    "textTags": [
      {"type": "hashtag", "value": "fitnessmotivation"},
      {"type": "mention", "value": "nike"}
    ],
    "hasSponsoredPosts": false
  }
}
```

### 3. **Lookalike Audiences**
```json
{
  "influencer": {
    "relevance": ["@topfitnessguru"],
    "audienceRelevance": ["@topfitnessguru"]
  }
}
```

## Cost Optimization Strategy

### Smart Filtering Approach
```typescript
// 1. Use free List Users API for simple username searches
if (isSimpleUsernameSearch(query)) {
  return await this.listUsers(query, limit);
}

// 2. Use 0.01 credit Search API for complex filtering
return await this.searchInfluencers(complexFilters, page);
```

### Credit Usage Examples
- **15 results**: 0.15 credits (~$0.15)
- **50 results**: 0.50 credits (~$0.50)  
- **100 results**: 1.00 credits (~$1.00)

## Benefits for Stride Social

### 🎯 **Precision Targeting**
- **Audience Demographics**: Target specific age, gender, location percentages
- **Interest Alignment**: Match brand niches with influencer audience interests
- **Quality Assurance**: Filter out fake followers with credibility scores

### 🚀 **Advanced Discovery**
- **Growth Tracking**: Find rising influencers with growth filters
- **Content Analysis**: Search by hashtags, mentions, keywords
- **Lookalike Discovery**: Find influencers similar to top performers

### 💼 **Business Intelligence**
- **Market Expansion**: Geographic and demographic targeting
- **Competition Analysis**: Brand partnership and relevance filtering
- **ROI Optimization**: Engagement rate and credibility filtering

### 📊 **Professional Filtering**
- **Contact Availability**: Filter for influencers with email/business contacts
- **Account Types**: Target business/creator accounts specifically
- **Verification Status**: Premium brand-safe influencers

## Implementation Priority

### 🔴 **Phase 1: Core Upgrade**
1. Replace current search endpoint with new Search Influencers API
2. Map existing filters to new API structure
3. Implement pagination and sorting

### 🟡 **Phase 2: Enhanced Filtering**  
1. Add audience demographic filters
2. Implement growth-based discovery
3. Add content and hashtag filtering

### 🟢 **Phase 3: Advanced Features**
1. Lookalike audience discovery
2. Brand partnership analysis
3. Complex filter operations (AND/OR/NOT)

## Testing Commands

### Basic Search Test
```bash
# Test fitness influencers
curl -X POST "http://localhost:3000/api/discovery/search-v2" \
  -H "Content-Type: application/json" \
  -d '{
    "page": 0,
    "filter": {
      "influencer": {
        "followers": {"min": 10000, "max": 100000},
        "engagementRate": 0.02,
        "language": "en"
      }
    }
  }'
```

### Advanced Filter Test
```bash
# Test with audience targeting
curl -X POST "http://localhost:3000/api/discovery/search-v2" \
  -H "Content-Type: application/json" \
  -d '{
    "page": 0,
    "filter": {
      "influencer": {
        "followers": {"min": 50000, "max": 500000},
        "isVerified": true
      },
      "audience": {
        "location": [{"id": 148838, "weight": 0.3}],
        "credibility": 0.8
      }
    }
  }'
```

## Migration Strategy

### 1. **Parallel Implementation**
- Keep current search as fallback
- Add new search as `/search-v2` endpoint
- A/B test performance and results

### 2. **Filter Translation**
```typescript
const translateFilters = (oldFilters: OldFilterFormat): NewFilterFormat => {
  return {
    influencer: {
      followers: oldFilters.follower_count ? {
        min: oldFilters.follower_count.min,
        max: oldFilters.follower_count.max
      } : undefined,
      engagementRate: oldFilters.engagement_rate,
      location: oldFilters.location_ids,
      // ... more mappings
    },
    audience: {
      credibility: 0.8, // Default fake follower protection
      // Add audience filters for enhanced targeting
    }
  };
};
```

### 3. **Gradual Rollout**
- Week 1: Staff portal testing
- Week 2: Brand portal beta
- Week 3: Full deployment with fallback
- Week 4: Remove old endpoint

## Next Steps

### 1. **Immediate Implementation**
- [ ] Add `searchInfluencers` method to `modashService`
- [ ] Create `/api/discovery/search-v2` API route
- [ ] Test with various filter combinations

### 2. **Filter Enhancement**
- [ ] Map all current filters to new API
- [ ] Add audience demographic filters
- [ ] Implement growth and content filters

### 3. **UI Integration**
- [ ] Update staff discovery page to use new search
- [ ] Add advanced filtering UI components
- [ ] Implement result quality indicators

---

**Status**: Ready for implementation  
**Priority**: Critical (main search API upgrade)  
**Cost**: 0.01 credits per result  
**Complexity**: Medium (comprehensive filter mapping required)  

This is the **CORE API** that will transform Stride Social's influencer discovery capabilities with professional-grade precision targeting and audience intelligence.

---

© 2025 Stride Social - Instagram Search Influencers API Documentation