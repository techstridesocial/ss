# Brand Onboarding Test Plan

## Overview
This test plan covers the complete brand onboarding experience, from first login to dashboard access.

---

## 🧪 **Test Environment Setup**

### Prerequisites
- [ ] Development server running on `http://localhost:3001`
- [ ] Fresh brand account (never onboarded)
- [ ] Database migration run: `POST /api/migrate-onboarding`
- [ ] Browser with developer tools available

### Test User Account
- **Role**: BRAND (set in Clerk)
- **Email**: Create a new test brand email
- **Status**: Never onboarded

---

## 🔐 **Test 1: First-Time Login Flow**

### Test Steps
1. **Navigate to login page**
   - [ ] Go to `http://localhost:3001`
   - [ ] Click on "Brand" side of login screen
   - [ ] Sign in with new brand account

2. **Automatic onboarding redirect**
   - [ ] Verify automatic redirect to `/brand/onboarding`
   - [ ] Confirm user cannot access other brand pages without completing onboarding
   - [ ] Try navigating to `/brand` - should redirect back to onboarding

### Expected Results
- ✅ New brand users are automatically redirected to onboarding
- ✅ Cannot access other brand features until onboarding is complete

---

## 📋 **Test 2: Onboarding Flow - Step by Step**

### Test Steps

#### Step 1: Company Name
- [ ] Enter company name (e.g., "Luxe Beauty Co.")
- [ ] Verify field validation (required)
- [ ] Click "Continue"

#### Step 2: Website
- [ ] Enter website URL (e.g., "https://luxebeauty.com")
- [ ] Verify URL validation
- [ ] Click "Continue"

#### Step 3: Industry Selection
- [ ] Select industry from grid (e.g., "Beauty & Cosmetics")
- [ ] Verify visual feedback for selection
- [ ] Click "Continue"

#### Step 4: Company Size
- [ ] Select team size (e.g., "11–50")
- [ ] Verify radio button behavior
- [ ] Click "Continue"

#### Step 5: Company Description
- [ ] Enter brand description (250-300 char limit)
- [ ] Verify character counter
- [ ] Click "Continue"

#### Step 6: Logo Upload
- [ ] Upload logo image (optional)
- [ ] Verify preview shows
- [ ] Click "Continue" (can skip)

#### Step 7: Annual Budget
- [ ] Select budget range (e.g., "$50K – $100K")
- [ ] Verify selection highlighting
- [ ] Click "Continue"

#### Step 8: Content Niches
- [ ] Select multiple niches (e.g., Beauty, Skincare, Lifestyle)
- [ ] Verify multi-select behavior
- [ ] Verify counter shows selected count
- [ ] Click "Continue"

#### Step 9: Target Regions
- [ ] Select multiple regions (e.g., UK, Europe, North America)
- [ ] Verify multi-select behavior
- [ ] Verify counter shows selected count
- [ ] Click "Continue"

#### Step 10: Contact Name
- [ ] Auto-populated from Clerk user
- [ ] Edit if needed
- [ ] Click "Continue"

#### Step 11: Contact Role
- [ ] Enter role (e.g., "Marketing Manager")
- [ ] Click "Continue"

#### Step 12: Contact Email
- [ ] Auto-populated from Clerk email
- [ ] Verify email validation
- [ ] Click "Continue"

#### Step 13: Contact Phone (Optional)
- [ ] Enter phone number or skip
- [ ] Click "Continue"

#### Step 14: Review Details
- [ ] Verify all entered information displays correctly
- [ ] Check company info, contact details, niches, regions
- [ ] Click "Complete Setup"

### Expected Results
- ✅ Smooth step-by-step flow with validation
- ✅ Visual feedback for selections and progress
- ✅ Proper handling of required vs optional fields

---

## 🎉 **Test 3: Completion and Redirect**

### Test Steps
1. **Success animation**
   - [ ] Verify success screen shows with checkmark animation
   - [ ] "You're all set!" message displays
   - [ ] "Redirecting to Dashboard..." shows

2. **Automatic redirect**
   - [ ] Automatic redirect to `/brand` after 3 seconds
   - [ ] Verify full brand dashboard loads
   - [ ] Confirm navigation header shows brand options

3. **Onboarding completion check**
   - [ ] Try accessing `/brand/onboarding` directly
   - [ ] Should redirect to dashboard (onboarding already complete)
   - [ ] Verify all brand portal features are accessible

### Expected Results
- ✅ Smooth success flow with clear feedback
- ✅ Automatic redirect to main dashboard
- ✅ No more forced onboarding redirects

---

## 🗄️ **Test 4: Database Verification**

### Test Steps
1. **Database check** (via staff portal or API)
   - [ ] Verify brand record created in `brands` table
   - [ ] Verify contact record created in `brand_contacts` table
   - [ ] Verify `user_profiles.is_onboarded` set to `true`
   - [ ] Verify user status changed to `ACTIVE`

2. **Data integrity**
   - [ ] All form fields saved correctly
   - [ ] Arrays (niches, regions) stored properly
   - [ ] Contact marked as primary
   - [ ] Logo URL stored if uploaded

### Expected Results
- ✅ All onboarding data saved to database
- ✅ User marked as onboarded
- ✅ Relational data properly linked

---

## 🔄 **Test 5: Returning User Experience**

### Test Steps
1. **Sign out and sign back in**
   - [ ] Sign out from brand portal
   - [ ] Sign back in with same credentials

2. **Direct dashboard access**
   - [ ] Should go directly to `/brand` dashboard
   - [ ] No onboarding redirect
   - [ ] Full portal functionality available

### Expected Results
- ✅ Completed users skip onboarding
- ✅ Direct access to brand features

---

## 🎨 **Test 6: Visual Design and UX**

### Test Steps
1. **Design consistency**
   - [ ] Matches login page background and styling
   - [ ] Blue background with white text
   - [ ] Proper Framer Motion animations
   - [ ] Responsive on mobile/tablet

2. **Progress indication**
   - [ ] Progress bar at top updates correctly
   - [ ] Step counter shows current position
   - [ ] Smooth transitions between steps

3. **Accessibility**
   - [ ] Keyboard navigation works
   - [ ] Form validation messages clear
   - [ ] Proper focus management

### Expected Results
- ✅ Consistent with existing design system
- ✅ Smooth animations and transitions
- ✅ Accessible and responsive

---

## 🚫 **Test 7: Error Handling**

### Test Steps
1. **Network errors**
   - [ ] Disconnect internet during submission
   - [ ] Verify error message shows
   - [ ] Retry mechanism works

2. **Validation errors**
   - [ ] Try submitting empty required fields
   - [ ] Invalid email format
   - [ ] Verify client-side validation

3. **Server errors**
   - [ ] Test with invalid data payloads
   - [ ] Verify graceful error handling

### Expected Results
- ✅ Clear error messages
- ✅ Graceful degradation
- ✅ User can retry/fix issues

---

## ✅ **Success Criteria**

- [ ] New brand users automatically enter onboarding
- [ ] Complete 14-step flow with validation
- [ ] Data saved correctly to database
- [ ] Smooth redirect to dashboard
- [ ] Returning users skip onboarding
- [ ] Matches existing design language
- [ ] Mobile responsive
- [ ] Error handling works
- [ ] Accessibility requirements met

---

## 🔧 **Manual Testing Commands**

```bash
# Run database migration
curl -X POST http://localhost:3001/api/migrate-onboarding

# Check onboarding status (replace with actual user ID)
# Via database or staff portal

# Test API endpoint
curl -X POST http://localhost:3001/api/brand/onboarding \
  -H "Content-Type: application/json" \
  -d '{"company_name":"Test Co","website":"https://test.com",...}'
``` 