# Instagram List Topics API - Modash Documentation

**Part of**: [Instagram Modash API Integration](./Instagram%20Modash%20API%20Integration.md)

## Overview
Search for topics to enhance content strategy and campaign targeting. This endpoint allows you to find content topics for precise content planning and niche targeting.

**✅ Implementation Status**: **READY FOR IMPLEMENTATION** in Stride Social Dashboard
- **Potential Service Method**: `modashService.listTopics(query, limit)`
- **Potential API Route**: `/api/discovery/topics` 
- **Potential Usage**: Content strategy, topic targeting, content planning, niche discovery
- **Cost**: **FREE** - No credits used

## Endpoint
```
GET /instagram/topics
```

## Base URL
```
https://api.modash.io/v1/instagram/topics
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
  'https://api.modash.io/v1/instagram/topics?limit=10&query=fitness' \
  -H 'Authorization: Bearer <YOUR_token_HERE>'
```

### JavaScript/TypeScript
```typescript
const response = await fetch('https://api.modash.io/v1/instagram/topics?limit=10&query=fitness', {
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
    "fitness",
    "workout",
    "gym",
    "health",
    "exercise"
  ]
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `error` | boolean | If there is an error |
| `tags` | Array<string> | Array of topic strings |

### Example Success Response
```json
{
  "error": false,
  "tags": [
    "fitness",
    "workout",
    "gym",
    "health",
    "exercise",
    "training",
    "bodybuilding",
    "cardio",
    "strength",
    "wellness",
    "nutrition",
    "diet",
    "yoga",
    "pilates",
    "running"
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

### 1. **Content Strategy Planning**
- Discover trending topics in specific niches
- Plan content calendars around popular topics
- Identify content gaps and opportunities

### 2. **Campaign Content Optimization**
- Find relevant topics for campaign content
- Align influencer content with brand messaging
- Ensure content relevance and engagement

### 3. **Niche Discovery and Analysis**
- Explore subtopics within broader categories
- Identify emerging content trends
- Cross-topic content opportunities

### 4. **Influencer Content Guidance**
- Provide topic suggestions to signed influencers
- Guide content creation for campaigns
- Ensure brand-relevant content production

## Integration Opportunities

### Potential Implementation Areas

#### 1. **Content Planning Dashboard**
```typescript
// Topic research for content strategy
const contentTopics = await modashService.listTopics("fitness", 20);
```

#### 2. **Campaign Content Guidelines**
```typescript
// Topic suggestions for campaign content
const campaignTopics = await modashService.listTopics("beauty", 15);
```

#### 3. **Influencer Content Briefing**
```typescript
// Topic guidance for influencer content
const nichTopics = await modashService.listTopics("wellness", 25);
```

## Proposed Service Implementation

```typescript
// In src/lib/services/modash.ts
async listTopics(query?: string, limit: number = 10): Promise<{
  error: boolean;
  tags: string[];
  message?: string;
}> {
  try {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (query) params.append('query', query);
    
    const endpoint = `/v1/instagram/topics${params.toString() ? '?' + params.toString() : ''}`;
    
    console.log('📝 Fetching topics:', { query, limit, endpoint });
    
    const result = await this.makeRequest(endpoint, 'GET');
    
    if (result.error) {
      console.error('❌ List Topics API error:', result);
      return {
        error: true,
        tags: [],
        message: result.message || 'Failed to fetch topics'
      };
    }
    
    console.log('✅ List Topics API success:', {
      query,
      tagsCount: result.tags?.length || 0,
      firstTags: result.tags?.slice(0, 3)
    });
    
    return {
      error: false,
      tags: result.tags || []
    };
  } catch (error) {
    console.error('❌ Error fetching topics:', error);
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
// In src/app/api/discovery/topics/route.ts
import { NextResponse } from 'next/server';
import { modashService } from '../../../../lib/services/modash';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || undefined;
    const limit = parseInt(searchParams.get('limit') || '10');
    
    console.log('🔍 Topics API request:', { query, limit });
    
    const result = await modashService.listTopics(query, limit);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Topics API error:', error);
    return NextResponse.json(
      { 
        error: true, 
        tags: [],
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
```

## Testing Commands

### Basic Topic Search
```bash
# Test fitness topics
curl "http://localhost:3000/api/discovery/topics?query=fitness&limit=10"
```

### Beauty and Lifestyle Topics
```bash
# Test beauty topics
curl "http://localhost:3000/api/discovery/topics?query=beauty&limit=15"
```

### General Content Topics
```bash
# Test general topics (no query)
curl "http://localhost:3000/api/discovery/topics?limit=20"
```

### Direct Modash API Test
```bash
# Test direct Modash API
curl -i -X GET \
  'https://api.modash.io/v1/instagram/topics?limit=10&query=fitness' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'
```

## Benefits for Stride Social

### 📝 **Enhanced Content Strategy**
- **Topic Discovery**: Find trending and relevant topics for content planning
- **Content Alignment**: Ensure influencer content matches campaign themes
- **Trend Identification**: Spot emerging topics and content opportunities

### 🎯 **Campaign Content Optimization**
- **Relevant Messaging**: Align campaign content with popular topics
- **Content Briefs**: Provide detailed topic guidance to influencers
- **Performance Prediction**: Use topic data to forecast content success

### 💼 **Strategic Content Planning**
- **Content Calendars**: Plan content around trending topics
- **Cross-Platform Strategy**: Coordinate topics across different social platforms
- **Competitive Analysis**: Analyze competitor content topics and strategies

### 💰 **Cost Benefits**
- **Free Usage**: No credits consumed for topic research
- **Unlimited Queries**: Research topics without budget constraints
- **Content ROI**: Better topic selection leads to higher engagement

## Topic Categories Overview

Based on content analysis, likely topic categories include:

### **Health & Wellness**
- fitness, workout, gym, health, exercise, nutrition, diet, wellness

### **Beauty & Style**
- beauty, makeup, skincare, fashion, style, haircare, cosmetics

### **Lifestyle & Entertainment**
- travel, food, music, photography, art, design, home, lifestyle

### **Technology & Innovation**
- tech, gadgets, science, innovation, automotive, gaming

### **Business & Education**
- business, entrepreneur, education, finance, career, productivity

## Implementation Workflow

### 1. **Content Strategy Dashboard**
```typescript
// Topic research tool for staff
const TopicResearch = () => {
  const [query, setQuery] = useState('');
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const searchTopics = async () => {
    setLoading(true);
    const result = await fetch(`/api/discovery/topics?query=${query}&limit=50`);
    const data = await result.json();
    setTopics(data.tags);
    setLoading(false);
  };
  
  return (
    <div className="topic-research">
      <h3>Content Topic Research</h3>
      
      <div className="search-bar">
        <input 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search topics (e.g., 'fitness', 'beauty')"
        />
        <button onClick={searchTopics} disabled={loading}>
          {loading ? 'Searching...' : 'Search Topics'}
        </button>
      </div>
      
      <div className="topic-results">
        <h4>Found Topics ({topics.length})</h4>
        <div className="topic-tags">
          {topics.map((topic, index) => (
            <span key={index} className="topic-tag">
              #{topic}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
```

### 2. **Campaign Content Planning**
```typescript
// Topic selection for campaign briefs
const CampaignTopicSelector = ({ onTopicsUpdate }) => {
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [availableTopics, setAvailableTopics] = useState([]);
  
  const addTopic = (topic) => {
    if (!selectedTopics.includes(topic)) {
      const newTopics = [...selectedTopics, topic];
      setSelectedTopics(newTopics);
      onTopicsUpdate(newTopics);
    }
  };
  
  const removeTopic = (topic) => {
    const newTopics = selectedTopics.filter(t => t !== topic);
    setSelectedTopics(newTopics);
    onTopicsUpdate(newTopics);
  };
  
  return (
    <div className="campaign-topic-selector">
      <h3>Campaign Content Topics</h3>
      
      <div className="topic-search">
        <TopicResearch onTopicSelect={addTopic} />
      </div>
      
      <div className="selected-topics">
        <h4>Selected Topics ({selectedTopics.length})</h4>
        <div className="selected-topic-tags">
          {selectedTopics.map(topic => (
            <span key={topic} className="selected-topic-tag">
              #{topic}
              <button onClick={() => removeTopic(topic)}>×</button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
```

### 3. **Influencer Content Guidance**
```typescript
// Topic suggestions for influencer content
const InfluencerContentGuide = ({ campaignId, influencerId }) => {
  const [suggestedTopics, setSuggestedTopics] = useState([]);
  const [campaignTopics, setCampaignTopics] = useState([]);
  
  useEffect(() => {
    // Load campaign topics and generate suggestions
    loadCampaignTopics(campaignId).then(setCampaignTopics);
    generateTopicSuggestions(campaignId, influencerId).then(setSuggestedTopics);
  }, [campaignId, influencerId]);
  
  return (
    <div className="influencer-content-guide">
      <h3>Content Topic Guidelines</h3>
      
      <div className="campaign-topics">
        <h4>Required Campaign Topics</h4>
        <div className="required-topics">
          {campaignTopics.map(topic => (
            <span key={topic} className="required-topic">
              #{topic}
            </span>
          ))}
        </div>
      </div>
      
      <div className="suggested-topics">
        <h4>Suggested Additional Topics</h4>
        <div className="suggestion-topics">
          {suggestedTopics.map(topic => (
            <span key={topic} className="suggested-topic">
              #{topic}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
```

## Database Integration Opportunities

### Topic Tracking Schema
```sql
-- Track campaign topics for content strategy
CREATE TABLE campaign_topics (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER REFERENCES campaigns(id),
  topic_tag TEXT,
  is_required BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for efficient topic queries
CREATE INDEX idx_campaign_topics_campaign_id ON campaign_topics(campaign_id);
CREATE INDEX idx_campaign_topics_tag ON campaign_topics(topic_tag);
```

### Content Performance by Topic
```sql
-- Track topic performance in campaigns
CREATE TABLE topic_performance (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER REFERENCES campaigns(id),
  topic_tag TEXT,
  impressions INTEGER,
  engagement_rate DECIMAL(5,2),
  conversion_rate DECIMAL(5,2),
  recorded_at TIMESTAMP DEFAULT NOW()
);
```

### Influencer Topic Expertise
```sql
-- Track influencer expertise by topic
CREATE TABLE influencer_topic_expertise (
  id SERIAL PRIMARY KEY,
  influencer_id INTEGER REFERENCES influencers(id),
  topic_tag TEXT,
  expertise_score DECIMAL(3,2),
  content_count INTEGER,
  avg_engagement DECIMAL(5,2),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Implementation Priority

### 🔴 **High Priority Features**
1. **Topic research tool** for content strategy
2. **Campaign topic planning** during creation
3. **Influencer content guidance** with topic suggestions

### 🟡 **Medium Priority Features**
1. **Topic performance analytics**
2. **Trending topics dashboard**
3. **Cross-campaign topic analysis**

### 🟢 **Low Priority Features**
1. **Topic clustering** and categorization
2. **Seasonal topic trends**
3. **Topic sentiment analysis**

## Content Strategy Applications

### Topic-Based Content Planning
```typescript
// Generate content calendar based on topics
const generateContentCalendar = async (niche: string, duration: number) => {
  const topics = await modashService.listTopics(niche, 30);
  
  const calendar = topics.tags.map((topic, index) => ({
    week: Math.floor(index / 4) + 1,
    topic: topic,
    contentType: getContentTypeForTopic(topic),
    priority: getTopicPriority(topic),
    suggestedInfluencers: findInfluencersForTopic(topic)
  }));
  
  return calendar;
};
```

### Cross-Platform Topic Strategy
```typescript
// Coordinate topics across multiple platforms
const crossPlatformTopicStrategy = {
  instagram: ['fitness', 'workout', 'health'],
  tiktok: ['fitness', 'exercise', 'gym'],
  youtube: ['fitness', 'training', 'nutrition']
};
```

## Next Steps

### 1. **Immediate Implementation**
- [ ] Add `listTopics` method to `modashService`
- [ ] Create `/api/discovery/topics` API route
- [ ] Test with direct API calls

### 2. **UI Integration**
- [ ] Add topic research tool to staff dashboard
- [ ] Create topic selection in campaign creation
- [ ] Build influencer content guidance with topics

### 3. **Advanced Features**
- [ ] Topic performance analytics
- [ ] Trending topics monitoring
- [ ] Content calendar generation based on topics

---

**Status**: Ready for implementation  
**Priority**: High (content strategy completion essential)  
**Cost**: Free (no credits required)  
**Complexity**: Low (simple GET endpoint)  

---

© 2025 Stride Social - Instagram List Topics API Documentation