# Instagram List Locations API - Modash Documentation

**Part of**: [Instagram Modash API Integration](./Instagram%20Modash%20API%20Integration.md)

## Overview
Search the list of locations for influencers. This endpoint allows you to find geographic locations for campaign targeting and influencer discovery.

**✅ Implementation Status**: **READY FOR IMPLEMENTATION** in Stride Social Dashboard
- **Potential Service Method**: `modashService.listLocations(query, limit)`
- **Potential API Route**: `/api/discovery/locations` 
- **Potential Usage**: Geographic campaign targeting, location-based influencer discovery
- **Cost**: **FREE** - No credits used

## Endpoint
```
GET /instagram/locations
```

## Base URL
```
https://api.modash.io/v1/instagram/locations
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
| `query` | string | No | String to search by | `"london"` |

## Request Example

### cURL
```bash
curl -i -X GET \
  'https://api.modash.io/v1/instagram/locations?limit=10&query=london' \
  -H 'Authorization: Bearer <YOUR_token_HERE>'
```

### JavaScript/TypeScript
```typescript
const response = await fetch('https://api.modash.io/v1/instagram/locations?limit=10&query=london', {
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
  "locations": [
    {
      "id": 51800,
      "name": "London",
      "title": "London, United Kingdom"
    }
  ],
  "total": 8477
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `error` | boolean | If there is an error |
| `locations` | Array<Location> | Array of location objects |
| `locations[].id` | number | Unique location identifier |
| `locations[].name` | string | Location name |
| `locations[].title` | string | Full title of the location |
| `total` | number | Total number of locations |

### Location Object Structure
```typescript
interface Location {
  id: number;        // Unique location identifier
  name: string;      // Location name (e.g., "London")
  title: string;     // Full title (e.g., "London, United Kingdom")
}
```

### Example Success Response
```json
{
  "error": false,
  "locations": [
    {
      "id": 51800,
      "name": "London",
      "title": "London, United Kingdom"
    },
    {
      "id": 52100,
      "name": "Manchester",
      "title": "Manchester, United Kingdom"
    },
    {
      "id": 52500,
      "name": "Birmingham",
      "title": "Birmingham, United Kingdom"
    },
    {
      "id": 53000,
      "name": "Glasgow",
      "title": "Glasgow, Scotland"
    },
    {
      "id": 53200,
      "name": "Liverpool",
      "title": "Liverpool, United Kingdom"
    }
  ],
  "total": 8477
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

### 1. **Geographic Campaign Targeting**
- Target influencers in specific cities or regions
- Plan location-based marketing campaigns
- Regional brand expansion strategies

### 2. **Local Market Analysis**
- Identify influencer density in target markets
- Analyze regional engagement patterns
- Local competition research

### 3. **International Campaign Planning**
- Multi-market campaign coordination
- Cross-border influencer discovery
- Global brand awareness campaigns

### 4. **Event-Based Marketing**
- Target influencers around event locations
- Local event promotion and coverage
- Pop-up store or activation targeting

## Integration Opportunities

### Potential Implementation Areas

#### 1. **Enhanced Search Filtering**
```typescript
// Add location filters to influencer discovery
const locationFilters = await modashService.listLocations("london", 20);
```

#### 2. **Campaign Creation Enhancement**
```typescript
// Geographic targeting during campaign setup
const targetLocations = await modashService.listLocations("united kingdom", 50);
```

#### 3. **Regional Analytics Dashboard**
```typescript
// Staff dashboard for regional market analysis
const marketLocations = await modashService.listLocations("europe", 100);
```

## Proposed Service Implementation

```typescript
// In src/lib/services/modash.ts
async listLocations(query?: string, limit: number = 10): Promise<{
  error: boolean;
  locations: Array<{
    id: number;
    name: string;
    title: string;
  }>;
  total: number;
  message?: string;
}> {
  try {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (query) params.append('query', query);
    
    const endpoint = `/v1/instagram/locations${params.toString() ? '?' + params.toString() : ''}`;
    
    console.log('📍 Fetching locations:', { query, limit, endpoint });
    
    const result = await this.makeRequest(endpoint, 'GET');
    
    if (result.error) {
      console.error('❌ List Locations API error:', result);
      return {
        error: true,
        locations: [],
        total: 0,
        message: result.message || 'Failed to fetch locations'
      };
    }
    
    console.log('✅ List Locations API success:', {
      query,
      locationsCount: result.locations?.length || 0,
      total: result.total || 0,
      firstLocations: result.locations?.slice(0, 3)?.map((l: any) => l.name)
    });
    
    return {
      error: false,
      locations: result.locations || [],
      total: result.total || 0
    };
  } catch (error) {
    console.error('❌ Error fetching locations:', error);
    return {
      error: true,
      locations: [],
      total: 0,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
```

## Proposed API Route

```typescript
// In src/app/api/discovery/locations/route.ts
import { NextResponse } from 'next/server';
import { modashService } from '../../../../lib/services/modash';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || undefined;
    const limit = parseInt(searchParams.get('limit') || '10');
    
    console.log('🔍 Locations API request:', { query, limit });
    
    const result = await modashService.listLocations(query, limit);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Locations API error:', error);
    return NextResponse.json(
      { 
        error: true, 
        locations: [],
        total: 0,
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
```

## Testing Commands

### Basic Location Search
```bash
# Test UK locations
curl "http://localhost:3000/api/discovery/locations?query=london&limit=10"
```

### Regional Search
```bash
# Test US locations
curl "http://localhost:3000/api/discovery/locations?query=new%20york&limit=20"
```

### General Locations
```bash
# Test general locations (no query)
curl "http://localhost:3000/api/discovery/locations?limit=50"
```

### Direct Modash API Test
```bash
# Test direct Modash API
curl -i -X GET \
  'https://api.modash.io/v1/instagram/locations?limit=10&query=london' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'
```

## Benefits for Stride Social

### 🎯 **Enhanced Geographic Targeting**
- **Location-Based Campaigns**: Target specific cities, regions, or countries
- **Market Expansion**: Identify influencers in new target markets
- **Regional Strategies**: Tailor campaigns to local preferences and cultures

### 📊 **Improved Campaign Planning**
- **Local Events**: Target influencers around event locations
- **Seasonal Campaigns**: Region-specific seasonal marketing
- **Store Locations**: Promote physical locations with local influencers

### 💼 **Strategic Business Intelligence**
- **Market Analysis**: Understand influencer distribution across regions
- **Competitive Research**: Analyze competitor's geographic focus
- **Expansion Planning**: Data-driven market entry decisions

### 💰 **Cost Benefits**
- **Free Usage**: No credits consumed for location research
- **Unlimited Queries**: Research locations without budget constraints
- **Precision Targeting**: Better ROI through geographic precision

## Implementation Workflow

### 1. **Search Enhancement Integration**
```typescript
// Add location filters to discovery search
const LocationFilter = ({ onLocationSelect }) => {
  const [query, setQuery] = useState('');
  const [locations, setLocations] = useState([]);
  
  const searchLocations = async () => {
    const result = await fetch(`/api/discovery/locations?query=${query}&limit=20`);
    const data = await result.json();
    setLocations(data.locations);
  };
  
  return (
    <div className="location-filter">
      <input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search locations (e.g., 'London', 'New York')"
      />
      <button onClick={searchLocations}>Search Locations</button>
      
      <div className="location-results">
        {locations.map(location => (
          <div 
            key={location.id} 
            className="location-option"
            onClick={() => onLocationSelect(location)}
          >
            <h4>{location.name}</h4>
            <p>{location.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 2. **Campaign Creation Enhancement**
```typescript
// Geographic targeting in campaign setup
const CampaignLocationTargeting = ({ onLocationUpdate }) => {
  const [selectedLocations, setSelectedLocations] = useState([]);
  
  const addLocation = (location) => {
    setSelectedLocations(prev => [...prev, location]);
    onLocationUpdate([...selectedLocations, location]);
  };
  
  return (
    <div className="campaign-location-targeting">
      <h3>Target Locations</h3>
      <LocationFilter onLocationSelect={addLocation} />
      
      <div className="selected-locations">
        {selectedLocations.map(location => (
          <div key={location.id} className="selected-location">
            {location.title}
            <button onClick={() => removeLocation(location.id)}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 3. **Analytics Dashboard**
```typescript
// Regional market analysis for staff
const RegionalAnalytics = () => {
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  
  const analyzeRegion = async (location) => {
    // Analyze influencer density and engagement in region
    const influencers = await searchInfluencersByLocation(location.id);
    const analytics = calculateRegionalMetrics(influencers);
    setSelectedRegion({ location, analytics });
  };
  
  return (
    <div className="regional-analytics">
      <h2>Regional Market Analysis</h2>
      <LocationFilter onLocationSelect={analyzeRegion} />
      
      {selectedRegion && (
        <div className="region-insights">
          <h3>{selectedRegion.location.title}</h3>
          <div className="metrics">
            <p>Influencers: {selectedRegion.analytics.count}</p>
            <p>Avg Engagement: {selectedRegion.analytics.avgEngagement}%</p>
            <p>Top Niches: {selectedRegion.analytics.topNiches.join(', ')}</p>
          </div>
        </div>
      )}
    </div>
  );
};
```

## Database Integration Opportunities

### Location Tracking Schema
```sql
-- Track influencer locations for analytics
CREATE TABLE influencer_locations (
  id SERIAL PRIMARY KEY,
  influencer_id INTEGER REFERENCES influencers(id),
  location_id INTEGER,
  location_name TEXT,
  location_title TEXT,
  source TEXT DEFAULT 'modash',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for efficient geographic queries
CREATE INDEX idx_influencer_locations_location_id ON influencer_locations(location_id);
CREATE INDEX idx_influencer_locations_name ON influencer_locations(location_name);
```

### Campaign Location Targeting
```sql
-- Track campaign location targeting
CREATE TABLE campaign_target_locations (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER REFERENCES campaigns(id),
  location_id INTEGER,
  location_name TEXT,
  location_title TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Implementation Priority

### 🔴 **High Priority Features**
1. **Location filters** in discovery search
2. **Campaign location targeting** during creation
3. **Regional analytics** for staff dashboard

### 🟡 **Medium Priority Features**
1. **Location-based influencer recommendations**
2. **Geographic performance analytics**
3. **Multi-market campaign coordination**

### 🟢 **Low Priority Features**
1. **Location hierarchy** (city → region → country)
2. **Geographic heatmaps** for influencer density
3. **Location-based trending analysis**

## Next Steps

### 1. **Immediate Implementation**
- [ ] Add `listLocations` method to `modashService`
- [ ] Create `/api/discovery/locations` API route
- [ ] Test with direct API calls

### 2. **UI Integration**
- [ ] Add location filters to discovery search
- [ ] Create location targeting in campaign creation
- [ ] Build regional analytics dashboard for staff

### 3. **Advanced Features**
- [ ] Location-based influencer recommendations
- [ ] Geographic performance analytics
- [ ] Multi-market campaign coordination tools

---

**Status**: Ready for implementation  
**Priority**: High (geographic targeting essential for campaigns)  
**Cost**: Free (no credits required)  
**Complexity**: Low (simple GET endpoint)  

---

© 2025 Stride Social - Instagram List Locations API Documentation