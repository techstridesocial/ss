# Instagram List Languages API - Modash Documentation

**Part of**: [Instagram Modash API Integration](./Instagram%20Modash%20API%20Integration.md)

## Overview
Search the list of languages for influencers. This endpoint allows you to find languages for international campaign targeting and audience analysis.

**✅ Implementation Status**: **READY FOR IMPLEMENTATION** in Stride Social Dashboard
- **Potential Service Method**: `modashService.listLanguages(query, limit)`
- **Potential API Route**: `/api/discovery/languages` 
- **Potential Usage**: International targeting, multilingual campaigns, audience language analysis
- **Cost**: **FREE** - No credits used

## Endpoint
```
GET /instagram/languages
```

## Base URL
```
https://api.modash.io/v1/instagram/languages
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
| `query` | string | No | String to search by | `"english"` |

## Request Example

### cURL
```bash
curl -i -X GET \
  'https://api.modash.io/v1/instagram/languages?limit=10&query=english' \
  -H 'Authorization: Bearer <YOUR_token_HERE>'
```

### JavaScript/TypeScript
```typescript
const response = await fetch('https://api.modash.io/v1/instagram/languages?limit=10&query=english', {
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
  "languages": [
    {
      "code": "en",
      "name": "English"
    }
  ],
  "total": 98
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `error` | boolean | If there is an error |
| `languages` | Array<Language> | Array of language objects |
| `languages[].code` | string | Language code (ISO 639-1) |
| `languages[].name` | string | Language name |
| `total` | number | Total number of languages |

### Language Object Structure
```typescript
interface Language {
  code: string;      // Language code (e.g., "en", "es", "fr")
  name: string;      // Language name (e.g., "English", "Spanish", "French")
}
```

### Example Success Response
```json
{
  "error": false,
  "languages": [
    {
      "code": "en",
      "name": "English"
    },
    {
      "code": "es", 
      "name": "Spanish"
    },
    {
      "code": "fr",
      "name": "French"
    },
    {
      "code": "de",
      "name": "German"
    },
    {
      "code": "it",
      "name": "Italian"
    },
    {
      "code": "pt",
      "name": "Portuguese"
    },
    {
      "code": "ja",
      "name": "Japanese"
    },
    {
      "code": "ko",
      "name": "Korean"
    },
    {
      "code": "zh",
      "name": "Chinese"
    },
    {
      "code": "ar",
      "name": "Arabic"
    }
  ],
  "total": 98
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

### 1. **International Campaign Targeting**
- Target influencers who speak specific languages
- Plan multilingual marketing campaigns
- Global brand expansion strategies

### 2. **Audience Language Analysis**
- Understand audience language demographics
- Identify multilingual influencers
- Cross-cultural marketing opportunities

### 3. **Regional Market Penetration**
- Target specific language communities
- Localized content strategies
- Cultural adaptation campaigns

### 4. **Multilingual Influencer Discovery**
- Find bilingual or multilingual creators
- International collaboration opportunities
- Cross-market content strategies

## Integration Opportunities

### Potential Implementation Areas

#### 1. **Enhanced Search Filtering**
```typescript
// Add language filters to influencer discovery
const languageFilters = await modashService.listLanguages("spanish", 20);
```

#### 2. **International Campaign Creation**
```typescript
// Multilingual targeting during campaign setup
const targetLanguages = await modashService.listLanguages("", 50);
```

#### 3. **Audience Analytics Enhancement**
```typescript
// Language analysis for audience insights
const audienceLanguages = await modashService.listLanguages("", 100);
```

## Proposed Service Implementation

```typescript
// In src/lib/services/modash.ts
async listLanguages(query?: string, limit: number = 10): Promise<{
  error: boolean;
  languages: Array<{
    code: string;
    name: string;
  }>;
  total: number;
  message?: string;
}> {
  try {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (query) params.append('query', query);
    
    const endpoint = `/v1/instagram/languages${params.toString() ? '?' + params.toString() : ''}`;
    
    console.log('🌐 Fetching languages:', { query, limit, endpoint });
    
    const result = await this.makeRequest(endpoint, 'GET');
    
    if (result.error) {
      console.error('❌ List Languages API error:', result);
      return {
        error: true,
        languages: [],
        total: 0,
        message: result.message || 'Failed to fetch languages'
      };
    }
    
    console.log('✅ List Languages API success:', {
      query,
      languagesCount: result.languages?.length || 0,
      total: result.total || 0,
      firstLanguages: result.languages?.slice(0, 3)?.map((l: any) => l.name)
    });
    
    return {
      error: false,
      languages: result.languages || [],
      total: result.total || 0
    };
  } catch (error) {
    console.error('❌ Error fetching languages:', error);
    return {
      error: true,
      languages: [],
      total: 0,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
```

## Proposed API Route

```typescript
// In src/app/api/discovery/languages/route.ts
import { NextResponse } from 'next/server';
import { modashService } from '../../../../lib/services/modash';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || undefined;
    const limit = parseInt(searchParams.get('limit') || '10');
    
    console.log('🔍 Languages API request:', { query, limit });
    
    const result = await modashService.listLanguages(query, limit);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Languages API error:', error);
    return NextResponse.json(
      { 
        error: true, 
        languages: [],
        total: 0,
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
```

## Testing Commands

### Basic Language Search
```bash
# Test English language
curl "http://localhost:3000/api/discovery/languages?query=english&limit=5"
```

### Popular Languages
```bash
# Test Spanish language
curl "http://localhost:3000/api/discovery/languages?query=spanish&limit=10"
```

### All Languages
```bash
# Test general languages (no query)
curl "http://localhost:3000/api/discovery/languages?limit=20"
```

### Direct Modash API Test
```bash
# Test direct Modash API
curl -i -X GET \
  'https://api.modash.io/v1/instagram/languages?limit=10&query=english' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'
```

## Benefits for Stride Social

### 🌍 **International Expansion**
- **Global Campaigns**: Target specific language communities worldwide
- **Market Entry**: Identify language-specific influencers for new markets
- **Cultural Relevance**: Match campaigns to appropriate linguistic audiences

### 📊 **Enhanced Targeting Precision**
- **Language-Specific Content**: Find influencers who create content in target languages
- **Multilingual Creators**: Identify bilingual influencers for cross-market campaigns
- **Audience Alignment**: Match brand language needs with influencer capabilities

### 💼 **Strategic Business Intelligence**
- **Market Analysis**: Understand language distribution across regions
- **Competitive Research**: Analyze competitor's language targeting strategies
- **Expansion Planning**: Data-driven international market entry decisions

### 💰 **Cost Benefits**
- **Free Usage**: No credits consumed for language research
- **Unlimited Queries**: Research languages without budget constraints
- **Precision Targeting**: Better ROI through linguistic precision

## Implementation Workflow

### 1. **International Campaign Setup**
```typescript
// Language targeting in campaign creation
const LanguageSelector = ({ onLanguageSelect }) => {
  const [query, setQuery] = useState('');
  const [languages, setLanguages] = useState([]);
  
  const searchLanguages = async () => {
    const result = await fetch(`/api/discovery/languages?query=${query}&limit=20`);
    const data = await result.json();
    setLanguages(data.languages);
  };
  
  return (
    <div className="language-selector">
      <input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search languages (e.g., 'Spanish', 'French')"
      />
      <button onClick={searchLanguages}>Search Languages</button>
      
      <div className="language-results">
        {languages.map(language => (
          <div 
            key={language.code} 
            className="language-option"
            onClick={() => onLanguageSelect(language)}
          >
            <span className="language-code">{language.code.toUpperCase()}</span>
            <span className="language-name">{language.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 2. **Multilingual Influencer Discovery**
```typescript
// Enhanced search with language filters
const MultilingualSearch = ({ onSearchUpdate }) => {
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  
  const addLanguage = (language) => {
    setSelectedLanguages(prev => [...prev, language]);
    onSearchUpdate({ languages: [...selectedLanguages, language] });
  };
  
  return (
    <div className="multilingual-search">
      <h3>Target Languages</h3>
      <LanguageSelector onLanguageSelect={addLanguage} />
      
      <div className="selected-languages">
        {selectedLanguages.map(language => (
          <div key={language.code} className="selected-language">
            <span className="flag">{getFlagEmoji(language.code)}</span>
            <span className="name">{language.name}</span>
            <button onClick={() => removeLanguage(language.code)}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 3. **Language Analytics Dashboard**
```typescript
// Staff dashboard for language market analysis
const LanguageAnalytics = () => {
  const [allLanguages, setAllLanguages] = useState([]);
  const [languageStats, setLanguageStats] = useState({});
  
  useEffect(() => {
    // Load all available languages
    fetchLanguages().then(setAllLanguages);
    
    // Calculate language distribution statistics
    calculateLanguageStats().then(setLanguageStats);
  }, []);
  
  return (
    <div className="language-analytics">
      <h2>Language Market Analysis</h2>
      
      <div className="language-distribution">
        {allLanguages.map(language => (
          <div key={language.code} className="language-stat">
            <h4>{language.name} ({language.code})</h4>
            <div className="stats">
              <p>Influencers: {languageStats[language.code]?.count || 0}</p>
              <p>Avg Engagement: {languageStats[language.code]?.engagement || 0}%</p>
              <p>Market Size: {languageStats[language.code]?.marketSize || 'Unknown'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Database Integration Opportunities

### Language Tracking Schema
```sql
-- Track influencer languages for international targeting
CREATE TABLE influencer_languages (
  id SERIAL PRIMARY KEY,
  influencer_id INTEGER REFERENCES influencers(id),
  language_code VARCHAR(10),
  language_name TEXT,
  is_primary BOOLEAN DEFAULT false,
  source TEXT DEFAULT 'modash',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for efficient language queries
CREATE INDEX idx_influencer_languages_code ON influencer_languages(language_code);
CREATE INDEX idx_influencer_languages_influencer_id ON influencer_languages(influencer_id);
```

### Campaign Language Targeting
```sql
-- Track campaign language targeting
CREATE TABLE campaign_target_languages (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER REFERENCES campaigns(id),
  language_code VARCHAR(10),
  language_name TEXT,
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Language Performance Analytics
```sql
-- Track language-specific campaign performance
CREATE TABLE language_performance (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER REFERENCES campaigns(id),
  language_code VARCHAR(10),
  impressions INTEGER,
  engagement_rate DECIMAL(5,2),
  conversion_rate DECIMAL(5,2),
  recorded_at TIMESTAMP DEFAULT NOW()
);
```

## Implementation Priority

### 🔴 **High Priority Features**
1. **Language filters** in discovery search
2. **Multilingual campaign targeting** during creation
3. **Language analytics** for international expansion

### 🟡 **Medium Priority Features**
1. **Multilingual influencer recommendations**
2. **Language-specific performance analytics**
3. **Cross-cultural campaign coordination**

### 🟢 **Low Priority Features**
1. **Language hierarchy** (language families, dialects)
2. **Regional language variants** (e.g., Spanish: Spain vs. Mexico)
3. **Language fluency scoring** for multilingual influencers

## Market Expansion Opportunities

### Major Language Markets
```typescript
// Key language markets for international expansion
const majorLanguageMarkets = [
  { code: 'en', name: 'English', speakers: '1.5B+', markets: ['US', 'UK', 'AU', 'CA'] },
  { code: 'es', name: 'Spanish', speakers: '500M+', markets: ['ES', 'MX', 'AR', 'CO'] },
  { code: 'zh', name: 'Chinese', speakers: '900M+', markets: ['CN', 'TW', 'HK', 'SG'] },
  { code: 'hi', name: 'Hindi', speakers: '600M+', markets: ['IN'] },
  { code: 'ar', name: 'Arabic', speakers: '400M+', markets: ['SA', 'AE', 'EG', 'JO'] },
  { code: 'pt', name: 'Portuguese', speakers: '250M+', markets: ['BR', 'PT'] },
  { code: 'bn', name: 'Bengali', speakers: '230M+', markets: ['BD', 'IN'] },
  { code: 'ru', name: 'Russian', speakers: '150M+', markets: ['RU', 'KZ', 'BY'] },
  { code: 'ja', name: 'Japanese', speakers: '125M+', markets: ['JP'] },
  { code: 'de', name: 'German', speakers: '100M+', markets: ['DE', 'AT', 'CH'] }
];
```

## Next Steps

### 1. **Immediate Implementation**
- [ ] Add `listLanguages` method to `modashService`
- [ ] Create `/api/discovery/languages` API route
- [ ] Test with direct API calls

### 2. **UI Integration**
- [ ] Add language filters to discovery search
- [ ] Create multilingual targeting in campaign creation
- [ ] Build international analytics dashboard for staff

### 3. **Advanced Features**
- [ ] Language-specific influencer recommendations
- [ ] Cross-cultural campaign coordination tools
- [ ] Language performance analytics

---

**Status**: Ready for implementation  
**Priority**: High (international expansion essential)  
**Cost**: Free (no credits required)  
**Complexity**: Low (simple GET endpoint)  

---

© 2025 Stride Social - Instagram List Languages API Documentation