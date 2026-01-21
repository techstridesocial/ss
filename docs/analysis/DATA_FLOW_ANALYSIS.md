# 🔍 Data Flow Analysis: Two Ways Influencers Enter Roster

**Date:** 2025-01-15  
**Critical Discovery:** There are TWO different flows for adding influencers to roster, each storing data differently!

---

## 📊 **FLOW 1: Discovery → Save → Add to Roster**

### **How It Works:**
1. Staff searches discovery page
2. Finds influencer, clicks "Save"
3. Later clicks "Add to Roster"
4. System fetches **COMPLETE Modash data** and saves it

### **What Gets Saved:**

**Location:** `influencers.notes.modash_data`

```json
{
  "modash_data": {
    "userId": "6590609",              // ✅ Modash userId
    "modash_user_id": "6590609",      // ✅ Also stored here
    "platform": "instagram",
    "username": "kevinhart4real",     // ✅ Username
    "platforms": {
      "instagram": {
        "userId": "6590609",          // ✅ Platform-specific userId
        "username": "kevinhart4real"
      }
    },
    // ... complete analytics data
  }
}
```

**Location:** `influencer_platforms` table

| Column | Value | Source |
|--------|-------|--------|
| `username` | `kevinhart4real` | From Modash data |
| `platform` | `INSTAGRAM` | From discovery |
| `followers` | `176113567` | From Modash |
| `engagement_rate` | `0.000374` | From Modash |

**Files:**
- `src/app/api/staff/saved-influencers/add-to-roster/route.ts` (line 186-191)
- `src/lib/db/queries/discovery.ts` (line 217-390)

**Key Point:** Has BOTH Modash userId AND username!

---

## 📊 **FLOW 2: Influencer Sign-Up → Add Social Handles**

### **How It Works:**
1. Influencer signs up themselves
2. Goes through onboarding
3. Adds social media handles (Instagram, TikTok, YouTube usernames)
4. System tries to connect via Modash API

### **What Gets Saved:**

**Location:** `influencer_platforms` table

| Column | Value | Source |
|--------|-------|--------|
| `username` | `cristiano` | User input (raw handle) |
| `platform` | `INSTAGRAM` | User selection |
| `modash_user_id` | `null` or `12345678` | From Modash API (if connection succeeds) |
| `followers` | `0` or actual count | From Modash API (if connection succeeds) |

**Location:** `influencers.notes.modash_data`

```json
{
  "modash_data": {
    // ✅ May have userId if social account connection succeeded
    // ❌ May be empty if connection failed or not attempted
  }
}
```

**Files:**
- `src/app/api/influencer/onboarding/route.ts` (line 268-298)
- `src/app/api/influencer/social-accounts/route.ts` (line 170-194)

**Key Point:** Only has username (from user input), may not have Modash userId!

---

## 🎯 **Current Analytics Fetching Logic**

**Location:** `src/components/staff/roster/useRosterInfluencerAnalytics.ts`

### **Step 1: Check Notes for Modash userId** (Line 193-226)
```typescript
// Tries to find userId from:
1. notes.modash_data.platforms[platform].userId  // Platform-specific
2. notes.modash_data.userId                      // Legacy top-level
3. notes.modash_data.modash_user_id              // Legacy alternative
```

**Problem:** 
- ✅ Flow 1: Has userId → Works!
- ❌ Flow 2: May not have userId → Falls back to username search

### **Step 2: Fallback to Username Search** (Line 306-358)
```typescript
// Gets username from:
GET /api/influencers/[id]/platform-username?platform=instagram
// Returns: influencer_platforms.username
```

**Problem:**
- ✅ Flow 1: Has username in database → Works!
- ✅ Flow 2: Has username from user input → Should work!

---

## ⚠️ **The Issue**

### **Flow 1 (Discovery):**
- Has Modash userId in notes ✅
- Has username in `influencer_platforms` ✅
- **Should work** - uses userId first, falls back to username if needed

### **Flow 2 (Sign-up):**
- May NOT have Modash userId in notes ❌
- Has username in `influencer_platforms` ✅ (from user input)
- **Should work** - falls back to username search
- **BUT:** Username might not exist in Modash or might be wrong format!

---

## ✅ **Solution**

### **Current Implementation (After Recent Fixes):**

1. **Try userId from notes first** (if exists)
   - ✅ Fast path for Flow 1

2. **If no userId, use username directly in profile endpoint**
   - ✅ Fast path for Flow 2 (1 API call instead of 2)
   - ✅ Uses username from `influencer_platforms.username`

3. **If direct username fails, search for userId**
   - ✅ Fallback for edge cases

### **What Should Happen:**

**Flow 1 (Discovery):**
```
notes.modash_data.platforms.instagram.userId = "6590609"
→ Use userId directly ✅
```

**Flow 2 (Sign-up):**
```
influencer_platforms.username = "cristiano"
→ Use username directly in profile endpoint ✅
→ GET /instagram/profile/cristiano/report
```

---

## 🔧 **Verification Needed**

Check if username format is correct:

1. **Discovery Flow:** Username from Modash (already validated)
2. **Sign-up Flow:** Username from user input (may need validation/cleaning)

**Common Issues:**
- User enters `@cristiano` → Need to remove `@`
- User enters `cristiano ` → Need to trim whitespace
- User enters wrong username → Won't exist in Modash

---

## 📝 **Recommendations**

1. ✅ **Current code already handles both flows!**
   - Flow 1: Uses userId from notes
   - Flow 2: Uses username from database

2. ✅ **Direct username lookup is now optimized**
   - 1 API call instead of 2
   - Faster and uses fewer credits

3. ⚠️ **Ensure username validation in sign-up flow**
   - Remove `@` symbol
   - Trim whitespace
   - Validate format

4. ✅ **Error handling improved**
   - Clear messages when username doesn't exist in Modash
   - Shows roster data as fallback

---

## 🎯 **Status**

✅ **Code is correct** - handles both flows properly!

**Next Steps:**
- Verify username format from sign-up flow
- Test with both Flow 1 and Flow 2 influencers
- Ensure username cleaning happens at save time

