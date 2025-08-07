# Instagram List Partnerships API - Modash Documentation

**Part of**: [Instagram Modash API Integration](./Instagram%20Modash%20API%20Integration.md)

## Overview
Search the list of Partnerships (brands) that have worked with the influencer. This endpoint provides valuable insights into an influencer's collaboration history and brand partnerships.

**✅ Implementation Status**: **READY FOR IMPLEMENTATION** in Stride Social Dashboard
- **Potential Service Method**: `modashService.listPartnerships(query, limit)`
- **Potential API Route**: `/api/discovery/partnerships` 
- **Potential Usage**: Brand partnership analysis, influencer vetting, collaboration history
- **Cost**: **FREE** - No credits used

## Endpoint
```
GET /instagram/brands
```

## Base URL
```
https://api.modash.io/v1/instagram/brands
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
| `query` | string | No | String to search by | `"nike"` |

## Request Example

### cURL
```bash
curl -i -X GET \
  'https://api.modash.io/v1/instagram/brands?limit=10&query=nike' \
  -H 'Authorization: Bearer <YOUR_token_HERE>'
```

### JavaScript/TypeScript
```typescript
const response = await fetch('https://api.modash.io/v1/instagram/brands?limit=10&query=nike', {
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
  "brands": [
    {
      "id": 1,
      "name": "string",
      "count": 123456
    }
  ],
  "total": 28
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `error` | boolean | If there is an error |
| `brands` | Array<Brand> | Array of brand objects |
| `brands[].id` | number | Unique brand identifier |
| `brands[].name` | string | Brand name |
| `brands[].count` | number | Number of collaborations/partnerships |
| `total` | number | Total number of brands |

### Brand Object Structure
```typescript
interface Brand {
  id: number;        // Unique brand identifier
  name: string;      // Brand name (e.g., "Nike", "Huda Beauty")
  count: number;     // Number of collaborations/partnerships
}
```

### Example Success Response
```json
{
  "error": false,
  "brands": [
    {
      "id": 956,
      "name": "Nike",
      "count": 79957139
    },
    {
      "id": 642,
      "name": "Huda Beauty", 
      "count": 28569284
    },
    {
      "id": 227,
      "name": "Beautyblender",
      "count": 2416259
    },
    {
      "id": 230,
      "name": "Beautylish",
      "count": 155123
    },
    {
      "id": 1143,
      "name": "Sally Beauty Supply LLC",
      "count": 339057
    }
  ],
  "total": 5
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

### 1. **Influencer Vetting & Due Diligence**
- Analyze influencer's past brand collaborations
- Identify potential conflicts of interest
- Assess influencer's brand alignment and quality

### 2. **Competitive Analysis**
- See which brands competitors are working with
- Identify partnership opportunities
- Track brand collaboration trends

### 3. **Campaign Strategy Planning**
- Avoid brand conflicts in campaign assignments
- Identify influencers with relevant brand experience
- Plan strategic brand partnerships

### 4. **Influencer Profiling**
- Build comprehensive influencer profiles
- Track collaboration history and patterns
- Assess influencer's commercial appeal

## Integration Opportunities

### Potential Implementation Areas

#### 1. **Influencer Detail Panel Enhancement**
```typescript
// Add partnership history to influencer profiles
const partnershipHistory = await modashService.listPartnerships(influencerHandle);
```

#### 2. **Brand Conflict Detection**
```typescript
// Check for brand conflicts before campaign assignment
const existingPartnerships = await modashService.listPartnerships(influencer.username);
const hasConflict = checkBrandConflicts(existingPartnerships, campaignBrand);
```

#### 3. **Competitive Intelligence**
```typescript
// Analyze competitor brand partnerships
const competitorPartnerships = await modashService.listPartnerships(competitorInfluencer);
```

## Proposed Service Implementation

```typescript
// In src/lib/services/modash.ts
async listPartnerships(query?: string, limit: number = 10): Promise<{
  error: boolean;
  brands: Array<{
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
    
    const endpoint = `/v1/instagram/brands${params.toString() ? '?' + params.toString() : ''}`;
    
    console.log('🤝 Fetching brand partnerships:', { query, limit, endpoint });
    
    const result = await this.makeRequest(endpoint, 'GET');
    
    if (result.error) {
      console.error('❌ List Partnerships API error:', result);
      return {
        error: true,
        brands: [],
        total: 0,
        message: result.message || 'Failed to fetch partnerships'
      };
    }
    
    console.log('✅ List Partnerships API success:', {
      query,
      brandsCount: result.brands?.length || 0,
      total: result.total || 0,
      firstBrands: result.brands?.slice(0, 3)?.map(b => b.name)
    });
    
    return {
      error: false,
      brands: result.brands || [],
      total: result.total || 0
    };
  } catch (error) {
    console.error('❌ Error fetching partnerships:', error);
    return {
      error: true,
      brands: [],
      total: 0,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
```

## Proposed API Route

```typescript
// In src/app/api/discovery/partnerships/route.ts
import { NextResponse } from 'next/server';
import { modashService } from '../../../../lib/services/modash';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || undefined;
    const limit = parseInt(searchParams.get('limit') || '10');
    
    console.log('🔍 Partnerships API request:', { query, limit });
    
    const result = await modashService.listPartnerships(query, limit);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Partnerships API error:', error);
    return NextResponse.json(
      { 
        error: true, 
        brands: [],
        total: 0,
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
```

## Testing Commands

### Basic Partnership Search
```bash
# Test basic partnership search
curl "http://localhost:3000/api/discovery/partnerships?query=nike&limit=10"
```

### General Brand Partnerships
```bash
# Test general brand partnerships (no query)
curl "http://localhost:3000/api/discovery/partnerships?limit=20"
```

### Direct Modash API Test
```bash
# Test direct Modash API
curl -i -X GET \
  'https://api.modash.io/v1/instagram/brands?limit=10&query=nike' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'
```

## Benefits for Stride Social

### 🎯 **Enhanced Influencer Vetting**
- **Partnership History**: See which brands influencers have worked with
- **Quality Assessment**: Evaluate influencer's commercial track record
- **Brand Alignment**: Assess fit with potential campaign brands

### 💼 **Strategic Campaign Planning**
- **Conflict Avoidance**: Prevent brand conflicts in campaign assignments
- **Experience Matching**: Find influencers with relevant brand experience
- **Competitive Intelligence**: Track competitor brand strategies

### 📊 **Data-Driven Insights**
- **Partnership Trends**: Identify popular brand collaboration patterns
- **Market Analysis**: Understand brand-influencer relationship dynamics
- **Portfolio Planning**: Build strategic influencer partnerships

### 💰 **Cost Benefits**
- **Free Usage**: No credits consumed for partnership research
- **Unlimited Queries**: Research partnerships without budget constraints
- **Value Addition**: Enhance service offering without additional costs

## Implementation Workflow

### 1. **Influencer Detail Panel Integration**
```typescript
// Add partnership tab to influencer detail view
const PartnershipHistory = ({ influencerId }) => {
  const [partnerships, setPartnerships] = useState([]);
  
  useEffect(() => {
    fetchPartnerships(influencerId).then(setPartnerships);
  }, [influencerId]);
  
  return (
    <div className="partnerships-section">
      <h3>Brand Partnerships ({partnerships.total})</h3>
      {partnerships.brands.map(brand => (
        <div key={brand.id} className="brand-chip">
          {brand.name}
        </div>
      ))}
    </div>
  );
};
```

### 2. **Campaign Assignment Conflict Check**
```typescript
// Check for brand conflicts before assignment
const validateCampaignAssignment = async (influencerId, campaignBrand) => {
  const partnerships = await modashService.listPartnerships(influencerId);
  const conflictingBrands = partnerships.brands.filter(brand => 
    isCompetitor(brand.name, campaignBrand)
  );
  
  if (conflictingBrands.length > 0) {
    return {
      valid: false,
      conflicts: conflictingBrands,
      message: `Potential brand conflict detected with ${conflictingBrands.map(b => b.name).join(', ')}`
    };
  }
  
  return { valid: true };
};
```

### 3. **Brand Research Dashboard**
```typescript
// Staff dashboard for brand partnership research
const BrandResearchTool = () => {
  const [query, setQuery] = useState('');
  const [partnerships, setPartnerships] = useState([]);
  
  const searchPartnerships = async () => {
    const result = await fetch(`/api/discovery/partnerships?query=${query}&limit=50`);
    const data = await result.json();
    setPartnerships(data.brands);
  };
  
  return (
    <div className="brand-research-tool">
      <input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search brands (e.g., 'nike', 'beauty')"
      />
      <button onClick={searchPartnerships}>Search Partnerships</button>
      
      <div className="results">
        {partnerships.map(brand => (
          <div key={brand.id} className="brand-result">
            <h4>{brand.name}</h4>
            <p>ID: {brand.id}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Implementation Priority

### 🔴 **High Priority Features**
1. **Influencer partnership history** in detail panels
2. **Brand conflict detection** during campaign assignment
3. **Partnership data** in influencer profiles

### 🟡 **Medium Priority Features**
1. **Brand research dashboard** for staff
2. **Partnership analytics** and trending brands
3. **Competitive intelligence** tools

### 🟢 **Low Priority Features**
1. **Partnership timeline** visualization
2. **Brand partnership scoring** algorithms
3. **Historical partnership** tracking and analysis

## Data Integration Opportunities

### Database Schema Enhancement
```sql
-- Add partnerships table to track brand collaborations
CREATE TABLE influencer_partnerships (
  id SERIAL PRIMARY KEY,
  influencer_id INTEGER REFERENCES influencers(id),
  brand_id INTEGER,
  brand_name TEXT,
  partnership_date TIMESTAMP,
  source TEXT DEFAULT 'modash',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for efficient lookups
CREATE INDEX idx_influencer_partnerships_influencer_id ON influencer_partnerships(influencer_id);
CREATE INDEX idx_influencer_partnerships_brand_name ON influencer_partnerships(brand_name);
```

### Sync Strategy
```typescript
// Periodic sync of partnership data
const syncInfluencerPartnerships = async (influencerId: string) => {
  const partnerships = await modashService.listPartnerships(influencerId);
  
  // Store in database for offline access and analytics
  await db.query(`
    INSERT INTO influencer_partnerships (influencer_id, brand_id, brand_name, source)
    VALUES ($1, $2, $3, 'modash')
    ON CONFLICT (influencer_id, brand_id) DO NOTHING
  `, partnerships.brands.map(brand => [influencerId, brand.id, brand.name]));
};
```

## Next Steps

### 1. **Immediate Implementation**
- [ ] Add `listPartnerships` method to `modashService`
- [ ] Create `/api/discovery/partnerships` API route
- [ ] Test with direct API calls

### 2. **UI Integration**
- [ ] Add partnership history to influencer detail panels
- [ ] Create brand conflict detection in campaign assignment
- [ ] Build brand research tool for staff dashboard

### 3. **Advanced Features**
- [ ] Partnership analytics and trending brands
- [ ] Brand conflict detection algorithms
- [ ] Competitive intelligence dashboard

---

**Status**: Ready for implementation  
**Priority**: High (influencer vetting and brand conflict detection)  
**Cost**: Free (no credits required)  
**Complexity**: Low (simple GET endpoint)  

---

© 2025 Stride Social - Instagram List Partnerships API Documentation