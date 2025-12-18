# Unused APIs - Flow Analysis & Usage Guide

This document explains where each unused API would be used, what the user journey would look like, and how they would integrate into the application.

---

## 1. `/api/influencer-management` ❌ REMOVE

### Current Status
- **Status:** Duplicate functionality
- **Action:** Should be removed
- **Reason:** Already covered by `/api/influencers/[id]` (PATCH)

### What It Does
Updates influencer management fields:
- `assigned_to` - Staff member assigned to manage influencer
- `labels` - Tags/labels for categorization
- `notes` - Internal notes about the influencer

### Where It Would Be Used (If Not Duplicate)
**Location:** `src/app/staff/roster/page.tsx` or influencer detail panels

**Flow:**
```
Staff Dashboard → Roster Page → Click Influencer → View Details Panel
  → Management Tab → Update Assigned To / Labels / Notes
  → Save → API Call
```

**Current Implementation:**
- Already using `/api/influencers/[id]` (PATCH) in `useRosterActions.ts`
- Function: `handleSaveManagement()`
- Works perfectly, no need for duplicate endpoint

**Recommendation:** ✅ **DELETE** - Redundant endpoint

---

## 2. `/api/influencer-contact` ⚠️ KEEP OR BUILD

### Current Status
- **Status:** Backend ready, frontend missing
- **Action:** Build UI or remove
- **Reason:** Full CRM-style contact tracking system exists but not integrated

### What It Does
Tracks all communications with influencers:
- **GET:** Retrieve contact history (email, DM, phone, meetings)
- **POST:** Log new contact (email sent, DM sent, call made)
- **PUT:** Update contact status (replied, no response, follow-up needed)

**Contact Types:**
- `email` - Email communications
- `dm` - Direct messages (Instagram, TikTok, etc.)
- `phone` - Phone calls
- `meeting` - In-person/video meetings
- `other` - Other contact methods

**Status Tracking:**
- `sent` - Contact initiated
- `replied` - Influencer responded
- `no_response` - No response received
- `follow_up_needed` - Requires follow-up

### Where It Would Be Used

#### **Location 1: Influencer Detail Panel**
**File:** `src/components/influencer/detail-panel/InfluencerDetailPanel.tsx`

**Flow:**
```
Staff Dashboard → Roster → Click Influencer → Analytics Panel
  → "Contact History" Tab (NEW)
    → View all past contacts
    → Filter by type (email/DM/phone)
    → See response status
    → Schedule follow-ups
    → Add notes
```

**UI Components Needed:**
- Contact timeline/feed
- "Log Contact" button
- Contact type selector
- Status badges
- Follow-up reminders

#### **Location 2: Campaign Detail Panel**
**File:** `src/components/campaigns/CampaignDetailPanel.tsx`

**Flow:**
```
Staff Dashboard → Campaigns → Click Campaign → View Details
  → Influencers Tab → Click Influencer
    → "Contact" Button → Log Contact Modal
      → Select contact type
      → Enter subject/message
      → Link to campaign
      → Save → Creates contact record
```

**UI Components Needed:**
- "Contact Influencer" button in influencer row
- Contact logging modal
- Campaign context pre-filled

#### **Location 3: Discovery Page**
**File:** `src/app/staff/discovery/page.tsx`

**Flow:**
```
Staff Dashboard → Discovery → Search Influencers → View Profile
  → "Contact" Button → Quick Contact Modal
    → Log initial outreach
    → Track response
    → Add to follow-up list
```

**UI Components Needed:**
- Quick contact button on profile cards
- Simple contact form
- Link to quotation/campaign if applicable

#### **Location 4: Quotation Detail Panel**
**File:** `src/components/brands/QuotationDetailPanel.tsx`

**Flow:**
```
Brand Dashboard → Quotations → View Quotation
  → Influencers List → "Contact" Button
    → Log contact related to quotation
    → Track negotiation progress
    → Update status (contacted → confirmed → declined)
```

**UI Components Needed:**
- Contact status indicators (already exists!)
- Contact logging for each influencer
- Quotation context linking

### Database Schema
**Table:** `contact_records`
- Links to `influencers`, `campaigns`, `quotations`
- Tracks `sent_at`, `responded_at`, `next_follow_up`
- Stores `subject`, `message`, `notes`, `attachments`

### Benefits of Using This API
1. **CRM Functionality** - Track all influencer communications
2. **Follow-up Management** - Never miss a follow-up
3. **Response Tracking** - See who responds and how quickly
4. **Campaign Context** - Link contacts to specific campaigns/quotations
5. **Team Collaboration** - See who contacted whom and when
6. **Analytics** - Response rates, average response time

### Implementation Priority
**High Value Feature** - Would significantly improve workflow

**Recommendation:** ✅ **BUILD UI** - This is a valuable feature that's already built on the backend

---

## 3. `/api/influencers/[id]/complete` ❌ REMOVE

### Current Status
- **Status:** Redundant endpoint
- **Action:** Should be removed
- **Reason:** `/api/influencers/[id]` already provides this data

### What It Does
Returns complete influencer data including:
- All influencer fields
- Platform data as JSON array
- User profile information
- Formatted for analytics panels

### Where It Would Be Used (If Not Redundant)
**Location:** `src/components/influencer/detail-panel/InfluencerDetailPanel.tsx`

**Flow:**
```
Staff Dashboard → Roster → Click Influencer → Analytics Panel
  → Load complete data → Display all info
```

**Current Implementation:**
- Already using `/api/influencers/[id]` (GET)
- Function: `useRosterInfluencerAnalytics.ts`
- Provides same data structure

**Recommendation:** ✅ **DELETE** - Redundant endpoint

---

## 4. `/api/analytics/update-all` ⚠️ KEEP AS ADMIN TOOL

### Current Status
- **Status:** Admin utility, no UI
- **Action:** Keep for admin use or add UI button
- **Reason:** Useful for bulk operations

### What It Does
Updates analytics for ALL influencers at once:
- Fetches all influencers
- Updates their analytics from content links
- Returns success/failure counts
- Can take significant time (async operation)

### Where It Would Be Used

#### **Location 1: Admin Dashboard (NEW)**
**File:** `src/app/staff/admin/page.tsx` (would need to be created)

**Flow:**
```
Admin Dashboard → Analytics Management
  → "Update All Analytics" Button
    → Confirmation modal
    → Start bulk update
    → Show progress (X of Y processed)
    → Show results (success/failed counts)
```

**UI Components Needed:**
- Admin-only page
- Bulk update button
- Progress indicator
- Results summary

#### **Location 2: Roster Page (Admin Only)**
**File:** `src/app/staff/roster/page.tsx`

**Flow:**
```
Staff Dashboard → Roster Page
  → Admin sees "Bulk Refresh Analytics" button (already exists!)
  → Currently uses `/api/roster/bulk-refresh-analytics`
  → Could use this endpoint instead
```

**Current Implementation:**
- Already has bulk refresh functionality
- Uses different endpoint: `/api/roster/bulk-refresh-analytics`
- This endpoint might be more comprehensive

### Benefits
1. **Bulk Operations** - Update all influencers at once
2. **Data Consistency** - Ensure all analytics are up-to-date
3. **Maintenance** - Useful for periodic data refreshes

### Implementation Priority
**Low Priority** - Nice to have, not critical

**Recommendation:** ⚠️ **KEEP** - Useful admin tool, but not urgent to build UI

---

## 5. `/api/short-links` ⚠️ KEEP OR BUILD

### Current Status
- **Status:** Full implementation, no UI
- **Action:** Build UI or remove
- **Reason:** Campaign link tracking feature exists but not integrated

### What It Does
Creates and manages short tracking links via Short.io:
- **POST:** Create short link for campaign/product URL
- **GET:** Retrieve all tracking links for influencer
- **PUT:** Update link title/metadata
- **DELETE:** Remove tracking link
- **Auto-sync:** Syncs click counts from Short.io

**Features:**
- Creates links like `stridelinks.io/abc123`
- Tracks clicks automatically
- Links to influencers and campaigns
- Stores in `tracking_links` table

### Where It Would Be Used

#### **Location 1: Campaign Detail Panel**
**File:** `src/components/campaigns/CampaignDetailPanel.tsx`

**Flow:**
```
Staff Dashboard → Campaigns → Click Campaign → View Details
  → "Tracking Links" Tab (NEW)
    → "Create Tracking Link" Button
      → Enter product/campaign URL
      → Enter title
      → Select influencer(s)
      → Generate short link
      → Copy link
      → Send to influencer
    → View all links
    → See click counts
    → Filter by influencer
```

**UI Components Needed:**
- Tracking links section
- Create link form
- Link list with click stats
- Copy to clipboard button
- Click analytics chart

#### **Location 2: Influencer Detail Panel**
**File:** `src/components/influencer/detail-panel/InfluencerDetailPanel.tsx`

**Flow:**
```
Staff Dashboard → Roster → Click Influencer → Analytics Panel
  → "Tracking Links" Tab (NEW)
    → View all links for this influencer
    → See click performance
    → Create new link
    → Edit/delete links
```

**UI Components Needed:**
- Links table
- Click count display
- Link management actions

#### **Location 3: Campaign Creation/Edit**
**File:** `src/components/campaigns/CreateCampaignModal.tsx`

**Flow:**
```
Staff Dashboard → Campaigns → Create Campaign
  → Campaign Details Form
    → "Generate Tracking Link" Checkbox
      → Auto-generate link for campaign URL
      → Assign to all influencers
      → Pre-fill in campaign brief
```

**UI Components Needed:**
- Checkbox option
- Link preview
- Auto-assignment toggle

#### **Location 4: Content Submission**
**File:** Campaign content submission flow

**Flow:**
```
Influencer Dashboard → Campaigns → Submit Content
  → Content Form
    → "Add Tracking Link" Field
      → Select from assigned links
      → Or create new link
      → Link appears in content
```

**UI Components Needed:**
- Link selector dropdown
- Create link option
- Link preview

### Database Integration
**Table:** `tracking_links`
- Links to `influencers` table
- Referenced by `campaign_content_submissions.short_link_id`
- Stores Short.io ID, URL, clicks, metadata

**Schema Reference:**
```sql
CREATE TABLE tracking_links (
    id UUID PRIMARY KEY,
    influencer_id UUID REFERENCES influencers(id),
    short_io_link_id VARCHAR(255) UNIQUE,
    short_url TEXT,
    original_url TEXT,
    title VARCHAR(255),
    clicks INTEGER DEFAULT 0,
    created_by UUID,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Benefits of Using This API
1. **Campaign Tracking** - Track which links influencers use
2. **Performance Metrics** - See click-through rates
3. **ROI Measurement** - Measure campaign effectiveness
4. **Link Management** - Centralized link creation/management
5. **Analytics** - Click data per influencer/campaign

### Implementation Priority
**Medium-High Value Feature** - Very useful for campaign tracking

**Recommendation:** ✅ **BUILD UI** - This is a valuable feature for campaign tracking and ROI measurement

---

## Summary & Recommendations

| API | Status | Action | Priority | Estimated Effort |
|-----|--------|--------|----------|------------------|
| `/api/influencer-management` | ❌ Duplicate | **DELETE** | High | 5 min |
| `/api/influencer-contact` | ⚠️ Backend Ready | **BUILD UI** | High | 2-3 days |
| `/api/influencers/[id]/complete` | ❌ Redundant | **DELETE** | High | 5 min |
| `/api/analytics/update-all` | ⚠️ Admin Tool | **KEEP** | Low | N/A |
| `/api/short-links` | ⚠️ Backend Ready | **BUILD UI** | Medium-High | 2-3 days |

### Quick Wins (Delete Now)
1. `/api/influencer-management` - Remove duplicate
2. `/api/influencers/[id]/complete` - Remove redundant

### High-Value Features (Build UI)
1. `/api/influencer-contact` - CRM functionality
2. `/api/short-links` - Campaign tracking

### Keep As-Is
1. `/api/analytics/update-all` - Admin utility (can add UI later)

---

## Implementation Roadmap

### Phase 1: Cleanup (Immediate)
- [ ] Delete `/api/influencer-management`
- [ ] Delete `/api/influencers/[id]/complete`
- [ ] Update API inventory

### Phase 2: High-Value Features (Next Sprint)
- [ ] Build contact tracking UI in influencer panels
- [ ] Build contact logging in campaign/quotation panels
- [ ] Add follow-up reminders
- [ ] Build short links UI in campaign panel
- [ ] Add link creation to campaign flow
- [ ] Build click analytics dashboard

### Phase 3: Admin Tools (Future)
- [ ] Create admin dashboard
- [ ] Add bulk analytics update UI
- [ ] Add other admin utilities

---

## Notes

- All APIs are fully functional on the backend
- Database schemas exist for all features
- Frontend integration is the missing piece
- Contact tracking and short links would significantly improve workflow
- Both features align with existing UI patterns

