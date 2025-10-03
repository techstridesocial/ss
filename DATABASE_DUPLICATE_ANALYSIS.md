# Database Duplicate Table Analysis

## 📊 Overview
**Total Tables**: 36  
**Suspicious Pairs Found**: 3

---

## 🔍 FINDINGS: Potential Duplicate Tables

### 1️⃣ **`influencer_platforms` vs `influencer_social_accounts`**

#### Purpose Overlap:
Both tables appear to store social media account information for influencers.

#### Schema Comparison:

**`influencer_platforms`:**
- id
- influencer_id
- platform
- username
- profile_url
- followers
- engagement_rate
- avg_views
- **is_connected** ⭐
- **last_synced** ⭐

**`influencer_social_accounts`:**
- id
- influencer_id
- platform
- **handle** (similar to username)
- **user_id** ⭐
- followers
- engagement_rate
- avg_likes
- avg_comments
- avg_views

#### Analysis:
- **90% overlap** in purpose
- `influencer_platforms` has: `is_connected`, `last_synced` (suggests OAuth integration)
- `influencer_social_accounts` has: `user_id`, `avg_likes`, `avg_comments` (more detailed stats)

#### Recommendation:
🟡 **LIKELY DUPLICATE** - These should probably be merged into ONE table with all fields.

**Suggested Merged Table**: `influencer_social_accounts`
```sql
CREATE TABLE influencer_social_accounts (
  id,
  influencer_id,
  platform,
  username (or handle),
  user_id,
  profile_url,
  followers,
  engagement_rate,
  avg_likes,
  avg_comments,
  avg_views,
  is_connected,
  last_synced,
  created_at,
  updated_at
)
```

---

### 2️⃣ **`influencer_payments` vs `payment_transactions`**

#### Schema Comparison:

**`influencer_payments`:**
- id
- influencer_id
- **payment_method** ⭐
- **encrypted_details** ⭐
- **is_verified** ⭐
- created_at
- updated_at

**`payment_transactions`:**
- id
- **campaign_influencer_id** ⭐
- **amount** ⭐
- **currency** ⭐
- **status** ⭐
- **transaction_id** ⭐
- **processed_at** ⭐
- created_at

#### Analysis:
- **DIFFERENT PURPOSES!**
- `influencer_payments` = Payment METHOD info (bank account, PayPal, etc.)
- `payment_transactions` = Actual TRANSACTION records (payments made)

#### Recommendation:
✅ **NOT DUPLICATES** - These serve different purposes:
- `influencer_payments` = "How to pay the influencer" (payment methods on file)
- `payment_transactions` = "Payments we've made" (transaction history)

**Keep both tables!**

---

### 3️⃣ **`short_links` vs `tracking_links`**

#### Schema Comparison:

**`short_links`:**
- id
- original_url
- **short_code** ⭐
- created_by
- influencer_id
- campaign_id
- clicks
- created_at
- updated_at

**`tracking_links`:**
- id
- influencer_id
- **short_io_link_id** ⭐
- **short_url** ⭐
- original_url
- **title** ⭐
- clicks
- created_by
- created_at
- updated_at

#### Analysis:
- **95% overlap** in purpose
- Both create shortened tracking links
- `short_links` uses `short_code` (custom implementation?)
- `tracking_links` uses `short_io_link_id` (Short.io API integration?)

#### Recommendation:
🟡 **LIKELY DUPLICATE** - You're probably using TWO different link shortening systems:
1. Custom in-house solution (`short_links`)
2. Short.io integration (`tracking_links`)

**Decision needed:**
- If you're only using Short.io → Delete `short_links`
- If you're only using custom → Delete `tracking_links`
- If you need both → Keep both but rename for clarity

---

## 📋 FINAL RECOMMENDATIONS

### 🚨 High Priority - Merge/Cleanup:

#### 1. Merge Social Account Tables
```sql
-- ACTION: Merge influencer_platforms → influencer_social_accounts
-- Add missing columns to influencer_social_accounts:
ALTER TABLE influencer_social_accounts 
  ADD COLUMN is_connected BOOLEAN DEFAULT FALSE,
  ADD COLUMN last_synced TIMESTAMP WITH TIME ZONE,
  ADD COLUMN profile_url TEXT;

-- Migrate data from influencer_platforms
-- Drop influencer_platforms
```

#### 2. Clarify Link Tracking
```sql
-- ACTION: Decide which link system to use
-- Option A: Drop short_links if using Short.io
-- Option B: Drop tracking_links if using custom
-- Option C: Rename both for clarity if both are needed
```

### ✅ Keep As-Is:

#### `influencer_payments` + `payment_transactions`
- **Different purposes**: payment methods vs transaction records
- Both needed for complete payment system

---

## 🎯 Summary

| Table Pair | Verdict | Action |
|------------|---------|--------|
| `influencer_platforms` vs `influencer_social_accounts` | 🟡 DUPLICATE | **MERGE** into one table |
| `influencer_payments` vs `payment_transactions` | ✅ KEEP BOTH | Different purposes |
| `short_links` vs `tracking_links` | 🟡 DUPLICATE | **CHOOSE ONE** or clarify |

---

## 🔧 Migration Plan

### Step 1: Social Accounts Merge
1. Add missing columns to `influencer_social_accounts`
2. Migrate any data from `influencer_platforms`
3. Update all code references
4. Drop `influencer_platforms`

### Step 2: Link Tracking Cleanup
1. Determine which system is actively used
2. Migrate data if needed
3. Drop unused table
4. Update all code references

### Step 3: Verify
1. Check all foreign key references
2. Update database queries in code
3. Test all affected features

---

## Status
- [ ] Review and approve recommendations
- [ ] Execute social accounts merge
- [ ] Resolve link tracking duplication
- [ ] Update documentation

