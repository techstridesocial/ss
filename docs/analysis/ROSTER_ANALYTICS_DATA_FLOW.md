# 🎯 Roster Analytics Data Flow - Complete Guide

**Date:** 2025-01-15  
**Status:** ✅ **VERIFIED & WORKING**

---

## 📊 **Two Entry Flows for Influencers**

### **FLOW 1: Discovery → Save → Add to Roster** (Staff-added)

**Path:** Discovery Page → Save → Add to Roster

**What Gets Saved:**

1. **`influencers.notes.modash_data`** (JSON):
   ```json
   {
     "modash_data": {
       "userId": "6590609",                    // ✅ Modash userId
       "modash_user_id": "6590609",            // ✅ Alternative name
       "platform": "instagram",
       "username": "kevinhart4real",
       "platforms": {
         "instagram": {
           "userId": "6590609",                // ✅ Platform-specific userId
           "username": "kevinhart4real"
         }
       }
     }
   }
   ```

2. **`influencer_platforms` table**:
   - `username`: `kevinhart4real` ✅ (from Modash)
   - `platform`: `INSTAGRAM`
   - `followers`, `engagement_rate`, etc.

**Files:**
- `src/app/api/staff/saved-influencers/add-to-roster/route.ts`
- `src/lib/db/queries/discovery.ts` → `addDiscoveredInfluencerToRosterWithCompleteData()`

---

### **FLOW 2: Influencer Sign-Up → Add Social Handles** (Self-added)

**Path:** Influencer Onboarding → Add Social Media → Connect Account

**What Gets Saved:**

1. **`influencer_platforms` table**:
   - `username`: `cristiano` ✅ (from user input - raw handle)
   - `modash_user_id`: `null` or `12345678` ✅ (if connection succeeds)
   - `platform`: `INSTAGRAM`

2. **`influencers.notes.modash_data`** (may be empty):
   ```json
   {
     "modash_data": {
       // May be empty if connection not attempted
       // May have userId if connection succeeded
     }
   }
   ```

**Files:**
- `src/app/api/influencer/onboarding/route.ts` → Saves username
- `src/app/api/influencer/social-accounts/route.ts` → Connects & fetches Modash data

---

## 🔍 **How Roster Analytics Fetches Data**

**Location:** `src/components/staff/roster/useRosterInfluencerAnalytics.ts`

### **Step 1: Try Modash userId from Notes** (Line 193-226)

**For:** Flow 1 (Discovery) - Has userId in notes

```typescript
// Checks in priority order:
1. notes.modash_data.platforms[platform].userId  // Platform-specific
2. notes.modash_data.userId                      // Legacy top-level  
3. notes.modash_data.modash_user_id              // Legacy alternative

// If found → Use userId directly (FAST)
GET /instagram/profile/6590609/report
```

**Result:**
- ✅ **Flow 1:** Works! Uses stored userId
- ❌ **Flow 2:** May not have userId → Falls back to Step 2

---

### **Step 2: Get Username from Database** (Line 324-356)

**For:** Flow 2 (Sign-up) OR Flow 1 fallback

```typescript
// Gets username from:
GET /api/influencers/[id]/platform-username?platform=instagram
→ Returns: influencer_platforms.username

// Then uses username directly (OPTIMIZED - 1 API call):
GET /instagram/profile/cristiano/report
```

**Result:**
- ✅ **Flow 1:** Has username → Works as fallback
- ✅ **Flow 2:** Has username from user input → Works!

---

### **Step 3: Search if Direct Username Fails** (Line 362+)

**For:** Edge cases where username doesn't work directly

```typescript
// Only if direct username lookup fails:
POST /instagram/search { query: "cristiano" }
→ Get userId from search results
→ Use userId for profile report
```

**Result:**
- ✅ Fallback for edge cases
- ⚠️ Slower (2 API calls) but more reliable

---

## ✅ **Current Implementation Status**

### **Flow 1 (Discovery):**
```
1. Check notes.modash_data → Find userId "6590609" ✅
2. Use userId directly → GET /instagram/profile/6590609/report ✅
3. Success! (Fast - 1 API call)
```

### **Flow 2 (Sign-up):**
```
1. Check notes.modash_data → No userId found ❌
2. Get username from influencer_platforms → "cristiano" ✅
3. Use username directly → GET /instagram/profile/cristiano/report ✅
4. Success! (Fast - 1 API call, optimized!)
```

---

## 🎯 **Key Insights**

### **1. Username Works Directly in Profile Endpoint!**

According to Modash API docs, the profile endpoint accepts:
- ✅ Username: `GET /instagram/profile/cristiano/report`
- ✅ User ID: `GET /instagram/profile/6590609/report`

**This means:**
- Flow 2 doesn't need to search for userId first!
- We can use username directly → **50% faster!**

### **2. Database Username is ALWAYS Correct**

**Flow 1:** Username from Modash (validated) ✅  
**Flow 2:** Username from user input (may need validation) ⚠️

**Important:** Username from `influencer_platforms.username` is the source of truth!

### **3. Notes userId is Optional**

**Flow 1:** Has userId in notes (fast path) ✅  
**Flow 2:** May not have userId (uses username) ✅

Both work correctly!

---

## 🔧 **Potential Issues & Solutions**

### **Issue 1: Wrong Username Format**

**Problem:** User enters `@cristiano` or `cristiano ` (with @ or spaces)

**Solution:** Already handled in `/api/influencer/social-accounts/route.ts`:
```typescript
const cleanHandle = handle.replace('@', '').trim()  // ✅ Removes @ and trims
```

### **Issue 2: Username Doesn't Exist in Modash**

**Problem:** User enters wrong username that doesn't exist

**Solution:** Current error handling:
- Shows clear error: "Account 'username' not found on platform"
- Falls back to roster data only
- User can update username in settings

### **Issue 3: Username vs UserId Mismatch**

**Problem:** Flow 1 saves userId for one account but username for different account

**Solution:** Current code prioritizes:
1. userId from notes (for Flow 1)
2. username from database (for Flow 2 or fallback)

Both are tried, and the one that works is used.

---

## ✅ **Verification Checklist**

- [x] Flow 1: userId from notes works
- [x] Flow 2: username from database works
- [x] Username cleaning (remove @, trim)
- [x] Error handling for invalid usernames
- [x] Fallback to roster data when Modash fails
- [x] Direct username lookup (optimized - 1 API call)

---

## 🎉 **Status**

✅ **Both flows are correctly handled!**

The code:
1. ✅ Tries userId from notes first (Flow 1 fast path)
2. ✅ Falls back to username from database (Flow 2 works)
3. ✅ Uses username directly in profile endpoint (optimized!)
4. ✅ Handles errors gracefully with clear messages
5. ✅ Shows roster data as fallback

**Ready for production!** 🚀
