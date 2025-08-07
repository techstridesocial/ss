# Instagram List Hashtags API - Modash Documentation

**Part of**: [Instagram Modash API Integration](./Instagram%20Modash%20API%20Integration.md)

## Overview
Search for hashtags using the Modash Discovery API. This endpoint allows you to find relevant hashtags based on a search query string.

**✅ Implementation Status**: **NOT YET IMPLEMENTED** in Stride Social Dashboard
- **Potential Service Method**: `modashService.listHashtags(query, limit)`
- **Potential API Route**: `/api/discovery/hashtags` 
- **Potential Usage**: Hashtag suggestions for campaigns and content planning
- **Cost**: **FREE** - No credits used

## Endpoint
```
GET /instagram/hashtags
```

## Base URL
```
https://api.modash.io/v1/instagram/hashtags
```

## Authentication
Requires Bearer token authentication:
```
Authorization: Bearer <YOUR_ACCESS_TOKEN>
```

## Parameters

### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `limit` | number | No | Max items to get (default: 10) | `20` |
| `query` | string | No | String to search by | `"fitness"` |

## Request Example

### cURL
```bash
curl -i -X GET \
  'https://api.modash.io/v1/instagram/hashtags?limit=10&query=fitness' \
  -H 'Authorization: Bearer <YOUR_token_HERE>'
```

### JavaScript/TypeScript
```typescript
const response = await fetch('https://api.modash.io/v1/instagram/hashtags?limit=10&query=fitness', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer <YOUR_ACCESS_TOKEN>',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
```

## Response Format

### Success Response (200)
```json
{
  "error": false,
  "tags": [
    "string"
  ]
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `error` | boolean | If there is an error |
| `tags` | Array<string> | Array of hashtag strings |

### Example Success Response
```json
{
  "error": false,
  "tags": [
    "#fitness",
    "#fitnessmotivation", 
    "#fitnesslife",
    "#fitnessmodel",
    "#fitnessgirl",
    "#fitnessjourney",
    "#fitnessaddict",
    "#fitnesstrainer",
    "#fitnessgoals",
    "#fitnessinspiration"
  ]
}
```

### Error Response
```json
{
  "error": true,
  "message": "Error description"
}
```

## Rate Limits
- No specific rate limits mentioned in documentation
- Standard Modash API rate limits apply
- **No credits consumed** for this endpoint

## Use Cases

### 1. Campaign Hashtag Research
- Research trending hashtags for specific niches
- Find related hashtags for campaign content
- Discover hashtag variations and alternatives

### 2. Content Strategy Planning
- Generate hashtag suggestions for influencers
- Build hashtag pools for different content types
- Analyze hashtag popularity and relevance

### 3. Influencer Guidance
- Provide hashtag recommendations to signed influencers
- Help optimize content reach and discoverability
- Support content planning and strategy

## Integration Opportunities

### Potential Implementation Areas

#### 1. **Campaign Creation Flow**
```typescript
// When creating campaigns, suggest relevant hashtags
const hashtagSuggestions = await modashService.listHashtags(campaignNiche, 20);
```

#### 2. **Influencer Content Guidance**
```typescript
// Provide hashtag suggestions to influencers
const nicheTags = await modashService.listHashtags(influencerNiche, 15);
```

#### 3. **Content Performance Enhancement**
```typescript
// Analyze and suggest hashtags for better reach
const performanceTags = await modashService.listHashtags(contentTopic, 10);
```

## Proposed Service Implementation

```typescript
// In src/lib/services/modash.ts
async listHashtags(query?: string, limit: number = 10): Promise<{
  error: boolean;
  tags: string[];
  message?: string;
}> {
  try {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (query) params.append('query', query);
    
    const endpoint = `/v1/instagram/hashtags${params.toString() ? '?' + params.toString() : ''}`;
    
    const result = await this.makeRequest(endpoint, 'GET');
    
    if (result.error) {
      return {
        error: true,
        tags: [],
        message: result.message || 'Failed to fetch hashtags'
      };
    }
    
    return {
      error: false,
      tags: result.tags || []
    };
  } catch (error) {
    console.error('Error fetching hashtags:', error);
    return {
      error: true,
      tags: [],
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
```

## Proposed API Route

```typescript
// In src/app/api/discovery/hashtags/route.ts
import { NextResponse } from 'next/server';
import { modashService } from '../../../../lib/services/modash';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || undefined;
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const result = await modashService.listHashtags(query, limit);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Hashtags API error:', error);
    return NextResponse.json(
      { error: true, tags: [], message: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Testing Commands

### Basic Search
```bash
# Test basic hashtag search
curl "http://localhost:3000/api/discovery/hashtags?query=fitness&limit=10"
```

### Niche-Specific Search
```bash
# Test niche-specific hashtags
curl "http://localhost:3000/api/discovery/hashtags?query=beauty&limit=15"
```

### Direct Modash API Test
```bash
# Test direct Modash API
curl -i -X GET \
  'https://api.modash.io/v1/instagram/hashtags?limit=10&query=fitness' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'
```

## Benefits for Stride Social

### 🎯 **Campaign Enhancement**
- **Hashtag Research**: Provide data-driven hashtag suggestions
- **Content Optimization**: Help influencers reach broader audiences
- **Strategy Support**: Enhance campaign planning with relevant tags

### 💰 **Cost Benefits**
- **Free Usage**: No credits consumed for hashtag searches
- **Unlimited Queries**: Research hashtags without budget constraints
- **Value Addition**: Enhance service offering without additional costs

### 📊 **Analytics Integration**
- **Performance Tracking**: Correlate hashtag usage with engagement
- **Trend Analysis**: Identify emerging hashtags in specific niches
- **Competitive Intelligence**: Research competitor hashtag strategies

## Implementation Priority

### 🔴 **High Priority Features**
1. **Campaign hashtag suggestions** during campaign creation
2. **Influencer content guidance** for signed influencers
3. **Niche-based hashtag research** for brands

### 🟡 **Medium Priority Features**
1. **Hashtag performance analytics** integration
2. **Trending hashtags dashboard** for staff
3. **Automated hashtag recommendations** based on content

### 🟢 **Low Priority Features**
1. **Hashtag clustering and categorization**
2. **Historical hashtag performance tracking**
3. **Custom hashtag scoring algorithms**

## Next Steps

### 1. **Immediate Implementation**
- [ ] Add `listHashtags` method to `modashService`
- [ ] Create `/api/discovery/hashtags` API route
- [ ] Test with direct API calls

### 2. **UI Integration**
- [ ] Add hashtag suggestions to campaign creation flow
- [ ] Create hashtag research tool for staff dashboard
- [ ] Integrate into influencer content planning

### 3. **Advanced Features**
- [ ] Hashtag performance correlation
- [ ] Trending hashtags monitoring
- [ ] Automated hashtag optimization

---

**Status**: Ready for implementation  
**Priority**: High (campaign enhancement)  
**Cost**: Free (no credits required)  
**Complexity**: Low (simple GET endpoint)

---

© 2025 Stride Social - Instagram List Hashtags API Documentation