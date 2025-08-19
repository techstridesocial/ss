# Modash Cache System Documentation

## 🎯 Overview

The Modash Cache System automatically stores and refreshes influencer performance data every 4 weeks, providing instant access to rich analytics while optimizing Modash API credit usage.

## 🏗️ Architecture

### **Core Components:**

1. **Database Schema** - Stores cached profile and audience data
2. **Cache Service** - Handles data fetching and storage
3. **Update Scheduler** - Manages 4-week refresh cycles
4. **Admin Interface** - Manual refresh controls for staff

### **Data Flow:**

```
Influencer "Find My Profile" → Cache Full Modash Data → Display Instantly → Auto-Update Every 4 Weeks
```

---

## 📊 Database Schema

### **Primary Tables:**

| Table | Purpose | Key Data |
|-------|---------|----------|
| `modash_profile_cache` | Core profile metrics | followers, engagement, bio, content arrays |
| `modash_audience_cache` | Demographics & interests | gender, age, location, credibility |
| `modash_update_log` | Update tracking | credits used, success/failure logs |

### **Key Features:**
- **4-week expiration** - Automatic cache invalidation
- **Priority system** - High-priority profiles update sooner
- **JSON storage** - Flexible data structure for rich content
- **Performance indexes** - Fast lookups and sorting

---

## 🔄 Update System

### **Automatic Updates:**
- **Schedule**: Every 4 weeks (28 days)
- **Trigger**: Cron job hitting `/api/modash/update-cache`
- **Batch Size**: 10 profiles per run (rate limiting)
- **Credit Usage**: 1 credit per profile update

### **Update Priority:**
```sql
-- High priority profiles update first
ORDER BY 
  CASE WHEN expires_at <= NOW() THEN 1 ELSE 2 END,
  update_priority DESC,
  expires_at ASC
```

### **Cron Configuration:**
```bash
# Every Sunday at 2 AM UTC (approximately every 4 weeks)
0 2 * * 0
```

---

## 🚀 Implementation Guide

### **1. Database Setup:**
```bash
# Run the setup script
node scripts/setup-modash-cache.js
```

### **2. Environment Variables:**
```env
# Add to your .env file
MODASH_UPDATE_TOKEN=your-secure-update-token
```

### **3. Configure Cron Job:**

**Option A: Vercel Cron (Recommended)**
```json
{
  "crons": [
    {
      "path": "/api/modash/update-cache",
      "schedule": "0 2 * * 0"
    }
  ]
}
```

**Option B: External Cron Service**
```bash
# Add to your cron service
curl -X POST "https://yourdomain.com/api/modash/update-cache" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Option C: GitHub Actions**
```yaml
name: Update Modash Cache
on:
  schedule:
    - cron: '0 2 * * 0'
jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Update
        run: curl -X POST "${{ secrets.DOMAIN }}/api/modash/update-cache" -H "Authorization: Bearer ${{ secrets.TOKEN }}"
```

---

## 📱 User Experience

### **Influencer Flow:**
1. **Search Profile** - "Find My Profile" interface
2. **Select Account** - Choose from found profiles  
3. **Instant Cache** - Full Modash data stored immediately
4. **View Stats** - Rich analytics displayed with "Cached Data" badge
5. **Auto-Refresh** - Updated every 4 weeks automatically

### **Data Source Indicators:**
- 🟢 **"Live Data"** - Recently connected, fresh data
- 🔵 **"Cached Data"** - From cache, shows last update date
- ⚪ **"Search to connect"** - Not connected yet

---

## 🛠️ API Endpoints

### **Cache Management:**

| Endpoint | Method | Purpose | Access |
|----------|--------|---------|---------|
| `/api/modash/update-cache` | POST | Run cache updates | Admin/Cron |
| `/api/modash/update-cache` | GET | Get cache statistics | Admin |
| `/api/modash/refresh-profile` | POST | Refresh specific profile | Staff/Admin |

### **Usage Examples:**

**Get Cache Stats:**
```javascript
const response = await fetch('/api/modash/update-cache')
const { data } = await response.json()
console.log(`${data.total_cached_profiles} profiles cached`)
```

**Manual Refresh:**
```javascript
await fetch('/api/modash/refresh-profile', {
  method: 'POST',
  body: JSON.stringify({
    influencerPlatformId: 'uuid',
    platform: 'instagram',
    modashUserId: 'username'
  })
})
```

---

## 🎯 Credit Optimization

### **Smart Usage Strategy:**
- **Initial Connection**: 1 credit (full rich data)
- **4-Week Updates**: 1 credit per profile
- **Batch Processing**: Max 10 profiles per run
- **Priority System**: Important profiles update first

### **Monthly Credit Budget:**
```
Estimated Monthly Usage:
- 100 cached profiles
- Updates every 4 weeks
- ~25 profiles updated per month
- = 25 credits/month baseline
```

### **Credit Tracking:**
```sql
-- Monitor credit usage
SELECT 
  DATE_TRUNC('month', started_at) as month,
  SUM(credits_used) as total_credits
FROM modash_update_log 
WHERE status = 'completed'
GROUP BY month
ORDER BY month DESC
```

---

## 🔧 Admin Features

### **Cache Management Modal:**
- **Real-time Statistics** - Cached profiles, pending updates
- **Individual Refresh** - Manual profile updates
- **System-wide Update** - Force refresh all expired
- **Credit Usage** - Monthly consumption tracking

### **Monitoring Dashboard:**
```javascript
// Get cache health
const stats = await getCacheStats()
console.log({
  totalCached: stats.total_cached_profiles,
  needingUpdate: stats.profiles_needing_update,
  creditsUsed: stats.credits_used_this_month
})
```

---

## 🚨 Troubleshooting

### **Common Issues:**

**Cache Not Updating:**
1. Check cron job configuration
2. Verify `MODASH_UPDATE_TOKEN`
3. Check Modash API limits
4. Review update logs in database

**High Credit Usage:**
1. Check update frequency settings
2. Review priority assignments
3. Monitor failed updates (retries)

**Missing Data:**
1. Verify Modash profile exists
2. Check cache expiration dates
3. Manual refresh specific profiles

### **Monitoring Queries:**
```sql
-- Check update history
SELECT * FROM modash_update_log 
ORDER BY started_at DESC LIMIT 10;

-- Find expired profiles
SELECT COUNT(*) FROM modash_profile_cache 
WHERE expires_at <= NOW();

-- Credit usage this month
SELECT SUM(credits_used) FROM modash_update_log 
WHERE started_at >= DATE_TRUNC('month', NOW());
```

---

## ✅ Benefits

### **Performance:**
- ⚡ **Instant Data** - No API delays for users
- 🔄 **Background Updates** - Seamless refresh process
- 📊 **Rich Analytics** - Full Modash dataset cached

### **Cost Efficiency:**
- 💰 **Credit Optimization** - 4-week update cycles
- 🎯 **Smart Batching** - Rate-limited updates
- 📈 **Usage Tracking** - Credit consumption monitoring

### **User Experience:**
- 🚀 **Immediate Results** - No waiting for API calls
- 📱 **Always Available** - Cached data always accessible
- 🔍 **Rich Insights** - Full demographics and content analysis

---

## 🔮 Future Enhancements

### **Potential Improvements:**
- **Smart Refresh** - Update based on engagement changes
- **Performance Metrics** - Cache hit/miss tracking
- **Auto-Scaling** - Dynamic update frequency
- **Predictive Updates** - ML-based priority scoring

### **Integration Opportunities:**
- **Campaign Performance** - Link cache data to campaign results
- **Trend Analysis** - Historical performance tracking
- **Brand Matching** - Cache-powered recommendation engine

---

This cache system transforms the influencer stats experience from "Connect OAuth and wait weeks" to "Search, select, and see rich data instantly" while maintaining cost efficiency through smart 4-week update cycles. 
