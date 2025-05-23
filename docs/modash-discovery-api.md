# Modash Discovery API Documentation

## Overview

The Modash Discovery API is a comprehensive influencer marketing API that provides access to **250M+ influencer profiles** across Instagram, TikTok, and YouTube. Unlike their RAW API which provides real-time data, the Discovery API offers pre-processed, analyzed influencer data optimized for search, discovery, and reporting.

---

## Key Features

### 🔍 **Massive Database**
- **250M+ profiles** across Instagram, TikTok, and YouTube
- Minimum thresholds: 1k+ followers (IG/TikTok), 1k+ followers + 5k avg views (YouTube)
- Updated monthly with new creators automatically added

### 📊 **Rich Data Points**
- **Profile Information**: Name, username, bio, followers, contact info, verification status
- **Analytics**: Engagement rates, follower growth, average likes/views/comments
- **Audience Data**: Demographics, locations, interests, fake follower detection
- **Content Analysis**: Popular posts, recent content, hashtag usage
- **Credibility Scoring**: Fake follower percentage, engagement authenticity

### 🎯 **Advanced Search & Filtering**
- **Influencer Filters**: Location, follower range, engagement rate, bio keywords, hashtags
- **Audience Filters**: Demographics, location, interests, language, credibility
- **Lookalike Search**: Find similar influencers to your best performers
- **Topic Relevance**: Search by hashtags and content themes

---

## API Architecture

### **Discovery API vs RAW API**

| Feature | Discovery API | RAW API |
|---------|---------------|---------|
| **Data Type** | Pre-processed, analyzed data | Real-time, raw social data |
| **Best For** | Search, discovery, reports | Campaign tracking, live monitoring |
| **Database Size** | 250M+ profiles | No follower thresholds |
| **Pricing** | Credit-based per endpoint | Request-based per endpoint |
| **Use Cases** | Influencer discovery, audience insights | Post tracking, live metrics |
| **Update Frequency** | Monthly (popular profiles more frequent) | Real-time |

---

## Core Endpoints

### 1. **Search Influencers**
```bash
POST /v1/discovery/search
```

**Purpose**: Search and filter through 250M+ influencer profiles

**Request Structure**:
```json
{
  "page": 0,
  "limit": 15,
  "sort": {
    "field": "followers",
    "direction": "desc"
  },
  "filter": {
    "influencer": {
      "followers": {
        "min": 10000,
        "max": 100000
      },
      "engagement_rate": {
        "min": 2.0
      },
      "location": ["GB"],
      "bio": ["beauty", "skincare"],
      "relevance": ["#beauty"]
    },
    "audience": {
      "location": ["GB"],
      "gender": {
        "female": 0.6
      },
      "age": {
        "18-24": 0.3,
        "25-34": 0.4
      }
    }
  }
}
```

**Key Search Capabilities**:
- **Username Search**: Find specific influencer by handle
- **Bio Keywords**: Search for exact words in bio/username
- **Hashtag Analysis**: Find influencers using specific hashtags
- **Location Targeting**: Filter by influencer or audience location
- **Demographic Filtering**: Age, gender, language of audience
- **Engagement Metrics**: Filter by engagement rate, follower growth

### 2. **Profile Reports**
```bash
GET /v1/discovery/profile/{userId}/report
```

**Purpose**: Get comprehensive analytics for a specific influencer

**Returns**:
- Detailed engagement metrics
- Audience demographics and locations
- Fake follower analysis
- Popular and recent posts
- Growth trends and statistics
- Lookalike suggestions

---

## Data Quality & Refresh Rates

### **Profile Data Layers**

| Data Type | Refresh Rate | Includes |
|-----------|--------------|----------|
| **Basic Data** | Weekly | Followers, username, profile picture |
| **Standard Data** | Bi-weekly | Bio, engagement rate, recent posts |
| **Analyzed Data** | Monthly | Audience demographics, interests, growth trends |

### **Credibility & Fraud Detection**
- **Fake Follower Detection**: AI-powered analysis of follower authenticity
- **Engagement Quality**: Distinguishes real vs. fake engagement
- **Credibility Score**: 0-1 scale (0.8 = 20% fake followers)
- **Methodology**: Profile behavior, account age, engagement patterns

---

## Pricing & Credits

### **Credit System**
- **Annual Commitment**: Starting at $16,200/year
- **Credit-Based**: Each endpoint consumes credits
- **Usage Monitoring**: Track consumption via `/account` endpoint
- **Best Practices**: Batch requests, cache results, respect rate limits

### **Credit Optimization**
- **Search Efficiently**: Use specific filters to reduce broad searches
- **Cache Results**: Store frequently accessed data
- **Batch Processing**: Combine multiple profile requests
- **4-Week Update Cycle**: Avoid unnecessary data refreshes

---

## Integration Best Practices

### **Authentication**
```bash
Authorization: Bearer YOUR_API_KEY
```

### **Rate Limits**
- **Search/Reports**: 2 requests/second (standard tier)
- **Health Check**: 10 requests/second
- **User Lists**: 10 requests/second

### **Error Handling**
- **401**: Invalid API key
- **429**: Rate limit exceeded
- **404**: Profile not found
- **500**: Server error

### **Health Monitoring**
```bash
GET /health
# Response: {"status": "ok"}
```

---

## Use Cases for Stride Social

### **Primary Use Case: Handle-Based Discovery**
1. **Staff Input**: Enter social media handle (@username)
2. **API Search**: Query Modash for exact username match
3. **Data Retrieval**: Get comprehensive profile analytics
4. **Auto-Population**: Pre-fill influencer data in dashboard
5. **Manual Review**: Staff can verify and adjust before importing

### **Search Strategy**
```json
{
  "filter": {
    "influencer": {
      "relevance": ["@specificusername"]
    }
  },
  "limit": 1
}
```

### **Data Points to Extract**
- **Basic Info**: Name, username, followers, verification status
- **Performance**: Engagement rate, average views, growth rate
- **Demographics**: Location, audience breakdown
- **Content**: Popular posts, hashtag usage
- **Credibility**: Fake follower percentage
- **Contact**: Email if publicly available

---

## Implementation Workflow

### **Step 1: Handle Input & Validation**
- Normalize handle format (remove @, validate platform)
- Support Instagram, TikTok, YouTube handles

### **Step 2: Modash API Search**
- Use relevance filter for exact username match
- Fallback to bio keyword search if needed

### **Step 3: Data Processing**
- Extract key metrics for display
- Map Modash categories to internal niches
- Calculate estimated pricing based on followers/engagement

### **Step 4: Staff Review Interface**
- Display comprehensive profile preview
- Show data confidence scores
- Allow manual edits before import

### **Step 5: Database Import**
- Store enriched influencer data
- Track Modash last-updated timestamps
- Set up refresh schedules (monthly)

---

## Error Handling & Edge Cases

### **Common Scenarios**
- **Handle Not Found**: Suggest similar usernames or manual entry
- **Private Account**: Limited data available, note restrictions
- **Below Threshold**: <1k followers may not be in Modash database
- **Multiple Matches**: Present options for staff selection
- **Data Incomplete**: Flag missing metrics for manual review

### **Fallback Strategies**
- **Manual Entry**: If Modash data unavailable
- **Partial Import**: Use available data, mark missing fields
- **Retry Logic**: Handle temporary API errors gracefully

---

## Summary

The Modash Discovery API is perfectly suited for Stride Social's use case of:
- **Quick Influencer Discovery** via social media handles
- **Comprehensive Data Population** without manual entry
- **Audience Analysis** for brand matching
- **Fraud Detection** to ensure quality partnerships
- **Scalable Workflow** for high-volume influencer management

This integration will significantly reduce manual data entry while ensuring high-quality, verified influencer data throughout the platform. 