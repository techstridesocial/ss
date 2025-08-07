# Instagram List Interests API - Modash Documentation

**Part of**: [Instagram Modash API Integration](./Instagram%20Modash%20API%20Integration.md)

## Overview
Search the list of interests for audience targeting and campaign optimization. This endpoint allows you to find audience interests for precise demographic targeting and niche discovery.

**✅ Implementation Status**: **READY FOR IMPLEMENTATION** in Stride Social Dashboard
- **Potential Service Method**: `modashService.listInterests(query, limit)`
- **Potential API Route**: `/api/discovery/interests` 
- **Potential Usage**: Audience targeting, niche discovery, campaign optimization, interest-based filtering
- **Cost**: **FREE** - No credits used

## Endpoint
```
GET /instagram/interests
```

## Base URL
```
https://api.modash.io/v1/instagram/interests
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
  'https://api.modash.io/v1/instagram/interests?limit=10&query=fitness' \
  -H 'Authorization: Bearer <YOUR_token_HERE>'
```

### JavaScript/TypeScript
```typescript
const response = await fetch('https://api.modash.io/v1/instagram/interests?limit=10&query=fitness', {
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
  "interests": [
    {
      "id": 1,
      "name": "Fitness"
    }
  ],
  "total": 28
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `error` | boolean | If there is an error |
| `interests` | Array<Interest> | Array of interest objects |
| `interests[].id` | number | Unique interest identifier |
| `interests[].name` | string | Interest name |
| `total` | number | Total number of interests |

### Interest Object Structure
```typescript
interface Interest {
  id: number;        // Unique interest identifier
  name: string;      // Interest name (e.g., "Fitness", "Beauty", "Travel")
}
```

### Example Success Response
```json
{
  "error": false,
  "interests": [
    {
      "id": 1,
      "name": "Fitness"
    },
    {
      "id": 2,
      "name": "Beauty"
    },
    {
      "id": 3,
      "name": "Travel"
    },
    {
      "id": 4,
      "name": "Fashion"
    },
    {
      "id": 5,
      "name": "Food"
    },
    {
      "id": 6,
      "name": "Technology"
    },
    {
      "id": 7,
      "name": "Sports"
    },
    {
      "id": 8,
      "name": "Gaming"
    },
    {
      "id": 9,
      "name": "Music"
    },
    {
      "id": 10,
      "name": "Photography"
    }
  ],
  "total": 28
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

### 1. **Audience Interest Targeting**
- Target campaigns based on specific audience interests
- Find influencers with audiences interested in particular niches
- Optimize campaign relevance and engagement

### 2. **Niche Discovery and Analysis**
- Explore available interest categories for campaign planning
- Identify trending or emerging interest areas
- Cross-category campaign opportunities

### 3. **Campaign Optimization**
- Match brand products/services to relevant audience interests
- Multi-interest targeting for broader reach
- Interest-based performance analysis

### 4. **Influencer-Audience Alignment**
- Ensure influencer content aligns with audience interests
- Find influencers with highly engaged niche audiences
- Verify audience quality and relevance

## Integration Opportunities

### Potential Implementation Areas

#### 1. **Enhanced Discovery Filtering**
```typescript
// Add interest filters to influencer search
const interestFilters = await modashService.listInterests("fitness", 20);
```

#### 2. **Campaign Interest Targeting**
```typescript
// Interest-based campaign setup
const targetInterests = await modashService.listInterests("", 28);
```

#### 3. **Audience Analysis Enhancement**
```typescript
// Interest analysis for audience insights
const audienceInterests = await modashService.listInterests("beauty", 15);
```

## Proposed Service Implementation

```typescript
// In src/lib/services/modash.ts
async listInterests(query?: string, limit: number = 10): Promise<{
  error: boolean;
  interests: Array<{
    id: number;
    name: string;
  }>;
  total: number;
  message?: string;
}> {
  try {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (query) params.append('query', query);
    
    const endpoint = `/v1/instagram/interests${params.toString() ? '?' + params.toString() : ''}`;
    
    console.log('🎯 Fetching interests:', { query, limit, endpoint });
    
    const result = await this.makeRequest(endpoint, 'GET');
    
    if (result.error) {
      console.error('❌ List Interests API error:', result);
      return {
        error: true,
        interests: [],
        total: 0,
        message: result.message || 'Failed to fetch interests'
      };
    }
    
    console.log('✅ List Interests API success:', {
      query,
      interestsCount: result.interests?.length || 0,
      total: result.total || 0,
      firstInterests: result.interests?.slice(0, 3)?.map((i: any) => i.name)
    });
    
    return {
      error: false,
      interests: result.interests || [],
      total: result.total || 0
    };
  } catch (error) {
    console.error('❌ Error fetching interests:', error);
    return {
      error: true,
      interests: [],
      total: 0,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
```

## Proposed API Route

```typescript
// In src/app/api/discovery/interests/route.ts
import { NextResponse } from 'next/server';
import { modashService } from '../../../../lib/services/modash';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || undefined;
    const limit = parseInt(searchParams.get('limit') || '10');
    
    console.log('🔍 Interests API request:', { query, limit });
    
    const result = await modashService.listInterests(query, limit);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Interests API error:', error);
    return NextResponse.json(
      { 
        error: true, 
        interests: [],
        total: 0,
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
```

## Testing Commands

### Basic Interest Search
```bash
# Test fitness interests
curl "http://localhost:3000/api/discovery/interests?query=fitness&limit=5"
```

### Beauty and Lifestyle
```bash
# Test beauty interests
curl "http://localhost:3000/api/discovery/interests?query=beauty&limit=10"
```

### All Available Interests
```bash
# Test all interests (no query)
curl "http://localhost:3000/api/discovery/interests?limit=28"
```

### Direct Modash API Test
```bash
# Test direct Modash API
curl -i -X GET \
  'https://api.modash.io/v1/instagram/interests?limit=10&query=fitness' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'
```

## Benefits for Stride Social

### 🎯 **Precision Audience Targeting**
- **Interest-Based Campaigns**: Target audiences with specific interests and passions
- **Niche Discovery**: Identify specialized interest areas for targeted campaigns
- **Audience Quality**: Ensure campaigns reach genuinely interested audiences

### 📊 **Enhanced Campaign Performance**
- **Relevance Optimization**: Match campaigns to audience interests for higher engagement
- **Cross-Interest Strategies**: Combine multiple interests for broader yet targeted reach
- **Performance Prediction**: Use interest data to forecast campaign success

### 💼 **Strategic Campaign Planning**
- **Market Research**: Understand available interest categories and their popularity
- **Competitive Analysis**: Analyze competitor targeting strategies by interest
- **Trend Identification**: Spot emerging interests and early adoption opportunities

### 💰 **Cost Benefits**
- **Free Usage**: No credits consumed for interest research
- **Unlimited Queries**: Research interests without budget constraints
- **Improved ROI**: Better targeting leads to higher conversion rates

## Interest Categories Overview

Based on the API showing 28 total interests, likely categories include:

### **Lifestyle & Health**
- Fitness & Wellness
- Beauty & Skincare
- Nutrition & Diet
- Mental Health

### **Entertainment & Media**
- Music & Audio
- Gaming & eSports
- Movies & TV
- Books & Literature

### **Creative & Arts**
- Photography
- Art & Design
- Fashion & Style
- DIY & Crafts

### **Technology & Innovation**
- Tech & Gadgets
- Science & Education
- Automotive
- Finance & Business

### **Travel & Experiences**
- Travel & Adventure
- Food & Cuisine
- Sports & Recreation
- Home & Garden

## Implementation Workflow

### 1. **Interest-Based Discovery Enhancement**
```typescript
// Enhanced search with interest filters
const InterestFilter = ({ onInterestSelect }) => {
  const [query, setQuery] = useState('');
  const [interests, setInterests] = useState([]);
  
  const searchInterests = async () => {
    const result = await fetch(`/api/discovery/interests?query=${query}&limit=28`);
    const data = await result.json();
    setInterests(data.interests);
  };
  
  return (
    <div className="interest-filter">
      <input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search interests (e.g., 'fitness', 'beauty')"
      />
      <button onClick={searchInterests}>Search Interests</button>
      
      <div className="interest-grid">
        {interests.map(interest => (
          <div 
            key={interest.id} 
            className="interest-card"
            onClick={() => onInterestSelect(interest)}
          >
            <span className="interest-icon">🎯</span>
            <span className="interest-name">{interest.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 2. **Campaign Interest Targeting**
```typescript
// Multi-interest campaign setup
const CampaignInterestTargeting = ({ onInterestUpdate }) => {
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [allInterests, setAllInterests] = useState([]);
  
  useEffect(() => {
    // Load all available interests
    fetch('/api/discovery/interests?limit=28')
      .then(res => res.json())
      .then(data => setAllInterests(data.interests));
  }, []);
  
  const toggleInterest = (interest) => {
    const newSelection = selectedInterests.find(i => i.id === interest.id)
      ? selectedInterests.filter(i => i.id !== interest.id)
      : [...selectedInterests, interest];
    
    setSelectedInterests(newSelection);
    onInterestUpdate(newSelection);
  };
  
  return (
    <div className="campaign-interest-targeting">
      <h3>Target Audience Interests</h3>
      
      <div className="interest-selection">
        {allInterests.map(interest => (
          <label key={interest.id} className="interest-checkbox">
            <input 
              type="checkbox"
              checked={selectedInterests.some(i => i.id === interest.id)}
              onChange={() => toggleInterest(interest)}
            />
            <span className="interest-label">{interest.name}</span>
          </label>
        ))}
      </div>
      
      <div className="selected-summary">
        <h4>Selected Interests ({selectedInterests.length})</h4>
        <div className="selected-interests">
          {selectedInterests.map(interest => (
            <span key={interest.id} className="selected-interest-tag">
              {interest.name}
              <button onClick={() => toggleInterest(interest)}>×</button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
```

### 3. **Interest Analytics Dashboard**
```typescript
// Staff dashboard for interest market analysis
const InterestAnalytics = () => {
  const [interests, setInterests] = useState([]);
  const [interestStats, setInterestStats] = useState({});
  
  useEffect(() => {
    // Load all interests and calculate statistics
    Promise.all([
      fetch('/api/discovery/interests?limit=28').then(res => res.json()),
      fetch('/api/analytics/interest-stats').then(res => res.json())
    ]).then(([interestsData, statsData]) => {
      setInterests(interestsData.interests);
      setInterestStats(statsData);
    });
  }, []);
  
  return (
    <div className="interest-analytics">
      <h2>Interest Market Analysis</h2>
      
      <div className="interest-performance">
        {interests.map(interest => (
          <div key={interest.id} className="interest-stat-card">
            <h4>{interest.name}</h4>
            <div className="stats">
              <p>Influencers: {interestStats[interest.id]?.influencerCount || 0}</p>
              <p>Avg Engagement: {interestStats[interest.id]?.avgEngagement || 0}%</p>
              <p>Campaign Performance: {interestStats[interest.id]?.performance || 'N/A'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Database Integration Opportunities

### Interest Tracking Schema
```sql
-- Track influencer interests for targeting
CREATE TABLE influencer_interests (
  id SERIAL PRIMARY KEY,
  influencer_id INTEGER REFERENCES influencers(id),
  interest_id INTEGER,
  interest_name TEXT,
  relevance_score DECIMAL(3,2),
  source TEXT DEFAULT 'modash',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for efficient interest queries
CREATE INDEX idx_influencer_interests_interest_id ON influencer_interests(interest_id);
CREATE INDEX idx_influencer_interests_influencer_id ON influencer_interests(influencer_id);
```

### Campaign Interest Targeting
```sql
-- Track campaign interest targeting
CREATE TABLE campaign_target_interests (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER REFERENCES campaigns(id),
  interest_id INTEGER,
  interest_name TEXT,
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Interest Performance Analytics
```sql
-- Track interest-specific campaign performance
CREATE TABLE interest_performance (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER REFERENCES campaigns(id),
  interest_id INTEGER,
  interest_name TEXT,
  impressions INTEGER,
  engagement_rate DECIMAL(5,2),
  conversion_rate DECIMAL(5,2),
  recorded_at TIMESTAMP DEFAULT NOW()
);
```

## Implementation Priority

### 🔴 **High Priority Features**
1. **Interest filters** in discovery search
2. **Campaign interest targeting** during creation
3. **Interest-based influencer recommendations**

### 🟡 **Medium Priority Features**
1. **Interest performance analytics**
2. **Multi-interest campaign coordination**
3. **Interest trend analysis**

### 🟢 **Low Priority Features**
1. **Interest clustering** and categorization
2. **Seasonal interest tracking**
3. **Interest-based audience insights**

## Next Steps

### 1. **Immediate Implementation**
- [ ] Add `listInterests` method to `modashService`
- [ ] Create `/api/discovery/interests` API route
- [ ] Test with direct API calls

### 2. **UI Integration**
- [ ] Add interest filters to discovery search
- [ ] Create interest targeting in campaign creation
- [ ] Build interest analytics dashboard for staff

### 3. **Advanced Features**
- [ ] Interest-based influencer recommendations
- [ ] Interest performance analytics
- [ ] Multi-interest campaign optimization

---

**Status**: Ready for implementation  
**Priority**: High (audience targeting essential for campaign success)  
**Cost**: Free (no credits required)  
**Complexity**: Low (simple GET endpoint)  

---

© 2025 Stride Social - Instagram List Interests API Documentation