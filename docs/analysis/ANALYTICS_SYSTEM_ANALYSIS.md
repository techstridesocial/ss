# Analytics System Analysis

## 🔍 **Current Analytics Flow & Endpoints**

### **1. Frontend Analytics Display**
**File**: `src/components/campaigns/CampaignDetailPanel.tsx` (lines 1466-1557)

**How Analytics Are Calculated:**
```typescript
// Total Engagements - SUMS all influencer engagements
const total = campaignInfluencers.reduce((sum, ci) => {
  const inf = ci.influencer || ci
  return sum + (inf.total_engagements || 0)
}, 0)

// Average Engagement Rate - AVERAGES all influencer ERs
const avgRate = campaignInfluencers.reduce((sum, ci) => {
  const inf = ci.influencer || ci
  return sum + (inf.avg_engagement_rate || 0)
}, 0) / campaignInfluencers.length

// Est. Reach - SUMS all influencer reach
const total = campaignInfluencers.reduce((sum, ci) => {
  const inf = ci.influencer || ci
  return sum + (inf.estimated_reach || 0)
}, 0)
```

### **2. Backend Analytics Source**
**File**: `src/app/api/campaigns/[id]/influencers/route.ts`

**Primary Endpoint**: `GET /api/campaigns/[id]/influencers?stats=true&timeline=true`

**Data Source**: `getCampaignInfluencersWithDetails(campaignId)` from `src/lib/db/queries/campaign-influencers.ts`

### **3. Database Analytics Fields**
**Table**: `influencers`

**Analytics Columns:**
- `total_engagements` - Total engagement count
- `avg_engagement_rate` - Average engagement rate (0-1)
- `estimated_reach` - Estimated reach number
- `total_likes` - Total likes count
- `total_comments` - Total comments count
- `total_views` - Total views count
- `analytics_updated_at` - Last update timestamp

### **4. Modash API Integration**
**File**: `src/lib/services/modash.ts`

**Base URL**: `https://api.modash.io/v1`

**Raw API Endpoints:**
- Instagram: `/raw/ig/media-info` (requires shortcode)
- TikTok: `/raw/tiktok/media-info` (requires URL)
- YouTube: `/raw/youtube/video-info` (requires URL)

**Analytics Update Process:**
1. Content links added → `updateInfluencerAnalyticsFromContentLinks()`
2. Calls Modash API for each content link
3. Aggregates analytics across all content pieces
4. Updates database with new totals

## 🚨 **Potential Issues with Current Analytics**

### **1. Data Aggregation Problems**
**Issue**: The frontend sums up individual influencer analytics, which might be incorrect:

```typescript
// This might be wrong - summing individual totals
const total = campaignInfluencers.reduce((sum, ci) => {
  return sum + (inf.total_engagements || 0) // Each influencer's total
}, 0)
```

**Problem**: If each influencer's `total_engagements` already represents their lifetime total (not just campaign-specific), then summing them up gives inflated numbers.

### **2. Engagement Rate Calculation**
**Issue**: Averaging engagement rates across influencers:

```typescript
// This averages ERs, but should it be weighted by followers/views?
const avgRate = campaignInfluencers.reduce((sum, ci) => {
  return sum + (inf.avg_engagement_rate || 0)
}, 0) / campaignInfluencers.length
```

**Problem**: A micro-influencer with 90% ER and a mega-influencer with 2% ER shouldn't average to 46%.

### **3. Modash API Data Quality**
**Issue**: The Modash Raw API might return inconsistent or inflated data:

- **Instagram**: Uses shortcode extraction, might fail on some URL formats
- **TikTok**: Direct URL, but API might return cached/old data
- **YouTube**: Video info might not include all engagement metrics

### **4. Analytics Update Timing**
**Issue**: Analytics are updated when content links change, but:

- **No real-time updates** - only when links are added/removed
- **No periodic refresh** - analytics become stale over time
- **No validation** - corrupted data persists until manual intervention

## 🔧 **Recommended Fixes**

### **1. Fix Data Aggregation Logic**
**Current**: Sum individual influencer totals
**Better**: Calculate campaign-specific analytics

```typescript
// Instead of summing individual totals, calculate fresh analytics
const campaignAnalytics = await calculateCampaignAnalytics(campaignId)
```

### **2. Weighted Engagement Rate**
**Current**: Simple average
**Better**: Weight by follower count or reach

```typescript
// Weight engagement rate by followers
const weightedER = campaignInfluencers.reduce((sum, ci) => {
  const inf = ci.influencer || ci
  const followers = inf.total_followers || 1
  return sum + (inf.avg_engagement_rate * followers)
}, 0) / totalFollowers
```

### **3. Add Data Validation**
**Add validation checks**:
- Sanity checks for unrealistic numbers
- Rate limiting for Modash API calls
- Fallback to cached data if API fails

### **4. Real-time Analytics Refresh**
**Add periodic refresh**:
- Update analytics every 24 hours
- Refresh when campaign detail panel opens
- Cache results with TTL

## 📊 **Current Endpoints Summary**

| Endpoint | Purpose | Data Source |
|----------|---------|-------------|
| `GET /api/campaigns/[id]/influencers` | Campaign influencer list with analytics | Database `influencers` table |
| `GET /api/influencer/stats` | Individual influencer stats | Database `influencer-stats.ts` |
| `GET /api/brand/campaigns/[id]?include=analytics` | Brand campaign analytics | Database aggregation |
| `GET /api/campaigns/content/stats` | Content submission stats | Database `content-submissions` |
| `POST /api/analytics/update-all` | Manual analytics refresh | Modash API + Database update |

## 🎯 **Immediate Action Items**

1. **Verify current data** - Check if the inflated numbers are from database corruption
2. **Test Modash API** - Ensure API returns realistic data
3. **Fix aggregation logic** - Don't sum individual influencer totals
4. **Add validation** - Prevent unrealistic analytics from being stored
5. **Implement refresh** - Add periodic analytics updates

## 🔍 **Debugging Steps**

1. **Check database values**:
   ```sql
   SELECT id, display_name, total_engagements, total_views, total_likes 
   FROM influencers 
   WHERE total_engagements > 1000000;
   ```

2. **Test Modash API**:
   ```bash
   curl "http://localhost:3000/api/modash/test-raw-media?url=INSTAGRAM_URL"
   ```

3. **Check analytics update logs**:
   - Look for `[MODASH DEBUG]` logs in console
   - Check `analytics_updated_at` timestamps

4. **Verify content links**:
   ```sql
   SELECT content_links FROM campaign_influencers WHERE content_links != '[]'::jsonb;
   ```

The analytics system has multiple layers that could be causing issues. The most likely culprit is either corrupted database data or incorrect aggregation logic in the frontend.
