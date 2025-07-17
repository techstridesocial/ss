# Brand Portal Test Plan

## Overview
This test plan covers all brand portal functionality including filtering, shortlist management, and quotation requests. Execute these tests in sequence to verify the complete brand workflow.

---

## 🧪 **Test Environment Setup**

### Prerequisites
- [ ] Development server running on `http://localhost:3001`
- [ ] Brand account created with email access
- [ ] Test data loaded (influencers, campaigns)
- [ ] Browser with developer tools available

### Test User Account
- **Role**: BRAND
- **Email**: Use your test brand email
- **Access**: Brand portal (`/brand/*`)

---

## 🔐 **Test 1: Authentication & Access Control**

### Test Steps
1. **Navigate to login page**
   - [ ] Go to `http://localhost:3001`
   - [ ] Verify split-screen login (Influencer/Brand)
   - [ ] Click on "Brand" side

2. **Brand login flow**
   - [ ] Enter brand credentials
   - [ ] Verify redirect to `/brand` dashboard
   - [ ] Check navigation header shows brand options

3. **Navigation access**
   - [ ] Verify access to `/brand` (Dashboard)
   - [ ] Verify access to `/brand/influencers` (Influencers)
   - [ ] Verify access to `/brand/shortlists` (Shortlists)
   - [ ] Verify access to `/brand/campaigns` (Campaigns)
   - [ ] Verify access to `/brand/profile` (Profile)

4. **Restricted access**
   - [ ] Try accessing `/staff` - should redirect to unauthorized
   - [ ] Try accessing `/admin` - should redirect to unauthorized

### Expected Results
- ✅ Brand can access all brand portal pages
- ✅ Brand cannot access staff/admin pages
- ✅ Navigation shows brand-specific options

---

## 👤 **Test 2: Brand Profile Management**

### Test Steps
1. **Navigate to profile page**
   - [ ] Click profile dropdown in navigation
   - [ ] Click "Profile" option
   - [ ] Verify redirect to `/brand/profile`

2. **View profile information**
   - [ ] Verify company information displays correctly
   - [ ] Check campaign preferences section
   - [ ] Verify contact information
   - [ ] Check account information

3. **Edit profile functionality**
   - [ ] Click "Edit Profile" button
   - [ ] Verify all fields become editable
   - [ ] Test company logo upload:
     - [ ] Click "Upload Logo" button
     - [ ] Select image file (PNG/JPG)
     - [ ] Verify image preview appears
   - [ ] Modify company information:
     - [ ] Change company name
     - [ ] Update industry dropdown
     - [ ] Modify website URL
     - [ ] Update description
   - [ ] Update campaign preferences:
     - [ ] Change budget range
     - [ ] Toggle different niches
     - [ ] Toggle different regions
   - [ ] Update contact information:
     - [ ] Change contact name
     - [ ] Update role
     - [ ] Change phone number

4. **Save changes**
   - [ ] Click "Save Changes" button
   - [ ] Verify loading state appears
   - [ ] Verify success message displays
   - [ ] Check that changes persist after page refresh

5. **Cancel functionality**
   - [ ] Click "Edit Profile" again
   - [ ] Make some changes
   - [ ] Click "Cancel" button
   - [ ] Verify changes are reverted

### Expected Results
- ✅ Profile displays correct brand information
- ✅ Logo upload works with image preview
- ✅ All form fields can be edited
- ✅ Changes save successfully
- ✅ Cancel reverts unsaved changes

---

## 🔍 **Test 3: Advanced Filtering System**

### Test Steps
1. **Navigate to influencers page**
   - [ ] Go to `/brand/influencers`
   - [ ] Verify influencer table loads with data
   - [ ] Check table columns: Influencer, Content Type, Platforms, Niches, Followers, Engagement, Avg Views, Location, Actions

2. **Search functionality**
   - [ ] Enter search term in search bar (e.g., "Sarah")
   - [ ] Verify results filter in real-time
   - [ ] Clear search and verify all results return
   - [ ] Test search by location (e.g., "London")
   - [ ] Test search by niche (e.g., "Fashion")

3. **Filter panel**
   - [ ] Click "Filters" button
   - [ ] Verify filter panel opens with animation
   - [ ] Check all filter categories available:
     - [ ] Niche dropdown
     - [ ] Platform dropdown
     - [ ] Followers range dropdown
     - [ ] Engagement range dropdown
     - [ ] Location dropdown
     - [ ] Content Type dropdown

4. **Single filter testing**
   - [ ] **Niche Filter**:
     - [ ] Select "Beauty" from niche dropdown
     - [ ] Verify results show only beauty influencers
     - [ ] Check active filter chip appears
   - [ ] **Platform Filter**:
     - [ ] Select "Instagram" from platform dropdown
     - [ ] Verify results show only Instagram influencers
     - [ ] Check platform badges in results
   - [ ] **Followers Filter**:
     - [ ] Select "100K - 500K" range
     - [ ] Verify follower counts in results match range
   - [ ] **Engagement Filter**:
     - [ ] Select "4% - 6%" range
     - [ ] Verify engagement rates in results match range
   - [ ] **Location Filter**:
     - [ ] Select "United Kingdom"
     - [ ] Verify location column shows UK locations
   - [ ] **Content Type Filter**:
     - [ ] Select "UGC"
     - [ ] Verify content type badges show UGC

5. **Multiple filter combination**
   - [ ] Clear all filters first
   - [ ] Apply multiple filters simultaneously:
     - [ ] Niche: "Lifestyle"
     - [ ] Platform: "Instagram"
     - [ ] Followers: "50K - 100K"
     - [ ] Location: "United Kingdom"
   - [ ] Verify results match ALL criteria
   - [ ] Check active filter chips show all applied filters
   - [ ] Verify result count updates

6. **Filter management**
   - [ ] **Individual filter removal**:
     - [ ] Click "×" on individual filter chip
     - [ ] Verify that filter is removed
     - [ ] Verify results update accordingly
   - [ ] **Clear all filters**:
     - [ ] Click "Clear All" button
     - [ ] Verify all filters are removed
     - [ ] Verify all results return

7. **Sorting functionality**
   - [ ] Click column headers to test sorting:
     - [ ] Sort by "Followers" (ascending/descending)
     - [ ] Sort by "Engagement" (ascending/descending)
     - [ ] Sort by "Display Name" (alphabetical)
   - [ ] Verify sort indicators appear in headers
   - [ ] Verify data sorts correctly

8. **Pagination**
   - [ ] If more than 20 results, verify pagination controls appear
   - [ ] Test page size selector (10, 20, 50, 100)
   - [ ] Navigate through pages
   - [ ] Verify filters persist across pages

### Expected Results
- ✅ Search works in real-time
- ✅ All filter categories function correctly
- ✅ Multiple filters combine properly (AND logic)
- ✅ Filter chips show active filters
- ✅ Clear functionality works
- ✅ Sorting works on all sortable columns
- ✅ Pagination maintains filter state

---

## 💝 **Test 4: Shortlist Management**

### Test Steps
1. **Adding to shortlist**
   - [ ] From influencers page, find an influencer
   - [ ] Click the heart icon (should be empty/gray)
   - [ ] Verify heart becomes filled/red
   - [ ] Verify tooltip changes to "Remove from Shortlist"
   - [ ] Add 3-5 more influencers to shortlist
   - [ ] Verify heart states update correctly for each

2. **Shortlist navigation**
   - [ ] Click "Shortlists" in navigation
   - [ ] Verify redirect to `/brand/shortlists`
   - [ ] Verify shortlisted influencers appear

3. **Shortlist display**
   - [ ] Verify each shortlisted influencer shows:
     - [ ] Profile picture (or placeholder)
     - [ ] Display name
     - [ ] Platform badge
     - [ ] Follower count
     - [ ] Engagement rate
     - [ ] Location
     - [ ] Niches as tags
   - [ ] Verify grid layout works on desktop
   - [ ] Test responsive layout on mobile

4. **Shortlist actions**
   - [ ] **View Details**:
     - [ ] Click "View Details" on an influencer
     - [ ] Verify detail panel opens
     - [ ] Verify detailed metrics display
     - [ ] Test platform switching in detail panel
     - [ ] Close detail panel
   - [ ] **Remove Individual**:
     - [ ] Click heart icon on an influencer
     - [ ] Verify confirmation dialog appears
     - [ ] Confirm removal
     - [ ] Verify influencer removed from shortlist
     - [ ] Go back to influencers page and verify heart is empty

5. **Clear all functionality**
   - [ ] Add multiple influencers to shortlist
   - [ ] Go to shortlists page
   - [ ] Click "Clear All" button
   - [ ] Verify confirmation dialog appears
   - [ ] Confirm clear all
   - [ ] Verify shortlist is empty
   - [ ] Verify empty state displays correctly

6. **Persistence testing**
   - [ ] Add influencers to shortlist
   - [ ] Refresh the page
   - [ ] Verify shortlist persists
   - [ ] Navigate to different pages and back
   - [ ] Verify shortlist state maintained

### Expected Results
- ✅ Heart icon states update correctly
- ✅ Shortlist persists across page navigation
- ✅ Shortlist page displays all saved influencers
- ✅ Individual and bulk removal work
- ✅ Empty state shows appropriate message
- ✅ Detail panel integration works

---

## 📋 **Test 5: Quotation Request Workflow**

### Test Steps
1. **Campaign creation for quotation**
   - [ ] Go to `/brand/campaigns`
   - [ ] Click "Create Campaign" button
   - [ ] Fill out campaign form:
     - [ ] Campaign Name: "Test Campaign - [Current Date]"
     - [ ] Description: "Test campaign for quotation workflow"
     - [ ] Budget: Select appropriate range
     - [ ] Timeline: "2 weeks"
     - [ ] Deliverables: Select 2-3 options
     - [ ] Brand Notes: "This is a test campaign"

2. **Campaign creation process**
   - [ ] Verify form validation works (try submitting empty)
   - [ ] Fill all required fields
   - [ ] Click "Submit Campaign Brief"
   - [ ] Verify success message appears
   - [ ] Verify campaign appears in campaigns list
   - [ ] Verify campaign status is "PENDING_QUOTATION"

3. **Shortlist integration with campaigns**
   - [ ] Go to influencers page
   - [ ] Add 3-5 influencers to shortlist
   - [ ] Go to shortlists page
   - [ ] Verify shortlisted influencers display
   - [ ] Look for "Request Quote" or "Create Campaign" functionality

4. **Campaign tracking**
   - [ ] Go back to campaigns page
   - [ ] Verify test campaign appears
   - [ ] Check campaign details:
     - [ ] Campaign name displays correctly
     - [ ] Status shows "PENDING_QUOTATION"
     - [ ] Budget and timeline display
     - [ ] Deliverables listed correctly
   - [ ] Test campaign status progression (if implemented)

### Expected Results
- ✅ Campaign creation form works correctly
- ✅ Form validation prevents invalid submissions
- ✅ Campaign appears in campaigns list
- ✅ Campaign details display correctly
- ✅ Integration with shortlist system

---

## 🎯 **Test 6: Detail Panel & Influencer Analysis**

### Test Steps
1. **Opening detail panel**
   - [ ] From influencers page, click "View" (eye icon) on any influencer
   - [ ] Verify detail panel slides in from right
   - [ ] Verify panel width adjusts main content
   - [ ] Verify panel header shows influencer name

2. **Detail panel content**
   - [ ] **Basic Information**:
     - [ ] Profile picture displays
     - [ ] Display name and handle
     - [ ] Bio text
     - [ ] Location information
     - [ ] Website link (if available)
   - [ ] **Platform Metrics**:
     - [ ] Platform switcher (Instagram/TikTok/YouTube)
     - [ ] Follower count
     - [ ] Engagement rate
     - [ ] Average views
     - [ ] Platform-specific badges
   - [ ] **Audience Insights** (if available):
     - [ ] Top countries breakdown
     - [ ] Age group distribution
     - [ ] Gender split
   - [ ] **Recent Content**:
     - [ ] Recent posts thumbnails
     - [ ] Post metrics (likes, comments)
     - [ ] Post dates

3. **Platform switching**
   - [ ] If influencer has multiple platforms:
     - [ ] Click different platform tabs
     - [ ] Verify metrics update for each platform
     - [ ] Verify platform-specific data displays

4. **Panel interactions**
   - [ ] **Shortlist from panel**:
     - [ ] Click heart icon in detail panel
     - [ ] Verify influencer added to shortlist
     - [ ] Verify heart state updates
   - [ ] **Close panel**:
     - [ ] Click "×" close button
     - [ ] Verify panel slides out
     - [ ] Verify main content adjusts back
   - [ ] **URL state**:
     - [ ] Open detail panel
     - [ ] Check URL includes influencer parameter
     - [ ] Refresh page with URL
     - [ ] Verify panel reopens with same influencer

### Expected Results
- ✅ Detail panel opens smoothly
- ✅ All influencer information displays correctly
- ✅ Platform switching works (if multiple platforms)
- ✅ Shortlist integration works from panel
- ✅ URL state management works
- ✅ Panel close functionality works

---

## 🔄 **Test 7: Cross-Feature Integration**

### Test Steps
1. **Complete workflow test**
   - [ ] Start with empty shortlist
   - [ ] Use filters to find specific influencers (e.g., UK Beauty influencers with 50K+ followers)
   - [ ] Add 3 influencers to shortlist
   - [ ] View details for each shortlisted influencer
   - [ ] Go to shortlists page and verify all 3 appear
   - [ ] Create a new campaign
   - [ ] Reference the shortlisted influencers for the campaign

2. **State management test**
   - [ ] Apply filters and add influencer to shortlist
   - [ ] Navigate to profile page
   - [ ] Return to influencers page
   - [ ] Verify filters are maintained (or appropriately reset)
   - [ ] Verify shortlist state is maintained
   - [ ] Check heart states are correct

3. **Performance test**
   - [ ] Apply multiple filters simultaneously
   - [ ] Verify response time is reasonable (<2 seconds)
   - [ ] Test with large result sets
   - [ ] Verify pagination works with filters
   - [ ] Test rapid filter changes

### Expected Results
- ✅ Complete workflow functions smoothly
- ✅ State management works across navigation
- ✅ Performance is acceptable
- ✅ No data loss between page transitions

---

## 📱 **Test 8: Responsive Design & Mobile**

### Test Steps
1. **Desktop testing** (1920x1080)
   - [ ] All features tested above work at full desktop resolution
   - [ ] Tables display all columns properly
   - [ ] Detail panel doesn't crowd main content

2. **Tablet testing** (768px width)
   - [ ] Navigation collapses to hamburger menu
   - [ ] Filter panel remains functional
   - [ ] Table columns adapt appropriately
   - [ ] Detail panel overlays properly

3. **Mobile testing** (375px width)
   - [ ] All navigation works via hamburger menu
   - [ ] Filter panel is accessible and usable
   - [ ] Table scrolls horizontally or adapts
   - [ ] Shortlist grid stacks to single column
   - [ ] Detail panel full-width overlay
   - [ ] Touch interactions work (tapping hearts, buttons)

### Expected Results
- ✅ All features work across all screen sizes
- ✅ Layout adapts appropriately
- ✅ Touch interactions work on mobile
- ✅ No horizontal scrolling issues

---

## 🐛 **Test 9: Error Handling & Edge Cases**

### Test Steps
1. **Network error simulation**
   - [ ] Disconnect internet during influencer loading
   - [ ] Verify graceful error handling
   - [ ] Reconnect and verify recovery

2. **Empty states**
   - [ ] Apply filters that return no results
   - [ ] Verify "No influencers found" message displays
   - [ ] Verify "Clear filters" option available
   - [ ] Test empty shortlist state

3. **Invalid data handling**
   - [ ] Test with incomplete influencer data
   - [ ] Verify missing fields display gracefully
   - [ ] Test broken image URLs (profile pictures)

4. **Browser compatibility**
   - [ ] Test in Chrome (latest)
   - [ ] Test in Firefox (latest)
   - [ ] Test in Safari (if on Mac)
   - [ ] Verify consistent behavior

### Expected Results
- ✅ Graceful error handling
- ✅ Appropriate empty states
- ✅ No crashes with invalid data
- ✅ Cross-browser compatibility

---

## ✅ **Test Completion Checklist**

### All Tests Passed
- [ ] Authentication & Access Control
- [ ] Brand Profile Management
- [ ] Advanced Filtering System
- [ ] Shortlist Management
- [ ] Quotation Request Workflow
- [ ] Detail Panel & Influencer Analysis
- [ ] Cross-Feature Integration
- [ ] Responsive Design & Mobile
- [ ] Error Handling & Edge Cases

### Critical Issues Found
- [ ] None (all tests passing)
- [ ] Minor issues (list below)
- [ ] Major issues (list below)

### Issues Log
If any issues are found during testing, document them here:

1. **Issue**: 
   - **Severity**: Low/Medium/High
   - **Steps to reproduce**:
   - **Expected vs Actual behavior**:
   - **Browser/Device**:

---

## 📊 **Test Results Summary**

### Overall Assessment
- **Brand Portal Functionality**: ✅ Working / ⚠️ Issues Found / ❌ Not Working
- **User Experience**: ✅ Excellent / ⚠️ Good / ❌ Needs Improvement
- **Performance**: ✅ Fast / ⚠️ Acceptable / ❌ Slow
- **Mobile Experience**: ✅ Excellent / ⚠️ Good / ❌ Poor

### Recommendations
- List any recommendations for improvements
- Priority order for any bug fixes needed
- Suggestions for UX enhancements

---

**Test Completed By**: [Your Name]  
**Test Date**: [Current Date]  
**Environment**: Development (localhost:3001)  
**Duration**: [Time taken to complete all tests] 