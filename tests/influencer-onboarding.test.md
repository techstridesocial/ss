# Influencer Onboarding Test Plan

## Overview
This test plan covers the complete influencer onboarding experience, from first login to dashboard access, similar to the brand onboarding but for influencer users.

---

## 🧪 **Test Environment Setup**

### Prerequisites
- [ ] Development server running on `http://localhost:3001`
- [ ] Fresh influencer account (never onboarded)
- [ ] Database migration run: `POST /api/migrate-onboarding`
- [ ] Browser with developer tools available

### Test User Account
- **Role**: INFLUENCER_SIGNED or INFLUENCER_PARTNERED (set in Clerk)
- **Email**: Create a new test influencer email
- **Status**: Never onboarded

---

## 🔐 **Test 1: First-Time Login Flow**

### Test Steps
1. **Navigate to login page**
   - [ ] Go to `http://localhost:3001`
   - [ ] Click on "Influencer" side of login screen
   - [ ] Sign in with new influencer account

2. **Automatic onboarding redirect**
   - [ ] Verify automatic redirect to `/influencer/onboarding`
   - [ ] Confirm user cannot access other influencer pages without completing onboarding
   - [ ] Try navigating to `/influencer/campaigns` - should redirect back to onboarding

### Expected Results
- ✅ New influencer users are automatically redirected to onboarding
- ✅ Cannot access other influencer features until onboarding is complete

---

## 📋 **Test 2: Onboarding Flow - Step by Step**

### Test Steps

#### Step 1: First Name
- [ ] Auto-populated from Clerk if available
- [ ] Enter first name (e.g., "Alex")
- [ ] Verify field validation (required)
- [ ] Click "Continue"

#### Step 2: Last Name
- [ ] Auto-populated from Clerk if available
- [ ] Enter last name (e.g., "Thompson")
- [ ] Verify field validation (required)
- [ ] Click "Continue"

#### Step 3: Display Name
- [ ] Auto-populated with full name suggestion
- [ ] Edit display name (e.g., "Alex Thompson")
- [ ] Verify helper text about public visibility
- [ ] Click "Continue"

#### Step 4: Phone Number (Optional)
- [ ] Enter phone number or skip
- [ ] Verify optional field validation
- [ ] Click "Continue"

#### Step 5: Location
- [ ] Enter location (e.g., "London, UK")
- [ ] Verify helper text for format
- [ ] Verify field validation (required)
- [ ] Click "Continue"

#### Step 6: Website (Optional)
- [ ] Enter website URL or skip
- [ ] Verify URL validation and auto-https prefix
- [ ] Click "Continue"

#### Step 7: Profile Picture (Optional)
- [ ] Upload profile picture or skip
- [ ] Verify file selection feedback
- [ ] Click "Continue"

#### Step 8: Review Details
- [ ] Verify all entered information displays correctly
- [ ] Check personal info, location, contact details
- [ ] Verify email auto-populated from Clerk
- [ ] Click "Complete Setup"

### Expected Results
- ✅ Smooth step-by-step flow with validation
- ✅ Cyan background image (matching influencer header styling)
- ✅ Proper handling of required vs optional fields
- ✅ Auto-population from Clerk user data

---

## 🎉 **Test 3: Completion and Redirect**

### Test Steps
1. **Success animation**
   - [ ] Verify success screen shows with checkmark animation
   - [ ] "Welcome to Stride Social! 🎉" message displays
   - [ ] "Redirecting to Dashboard..." shows

2. **Automatic redirect**
   - [ ] Automatic redirect to `/influencer` after 3 seconds
   - [ ] Verify influencer dashboard loads
   - [ ] Confirm navigation header shows influencer options

3. **Onboarding completion check**
   - [ ] Try accessing `/influencer/onboarding` directly
   - [ ] Should redirect to dashboard (onboarding already complete)
   - [ ] Verify all influencer portal features are accessible

### Expected Results
- ✅ Smooth success flow with clear feedback
- ✅ Automatic redirect to main dashboard
- ✅ No more forced onboarding redirects

---

## 🗄️ **Test 4: Database Verification**

### Test Steps
1. **Database check** (via staff portal or API)
   - [ ] Verify user profile updated in `user_profiles` table
   - [ ] Verify influencer record created/updated in `influencers` table
   - [ ] Verify `user_profiles.is_onboarded` set to `true`
   - [ ] Verify `influencers.onboarding_completed` set to `true`

2. **Data integrity**
   - [ ] All form fields saved correctly
   - [ ] Profile picture URL stored if uploaded
   - [ ] Display name set properly
   - [ ] Location data stored correctly

### Expected Results
- ✅ All onboarding data saved to database
- ✅ User marked as onboarded
- ✅ Influencer profile properly created

---

## 🔄 **Test 5: Returning User Experience**

### Test Steps
1. **Sign out and sign back in**
   - [ ] Sign out from influencer portal
   - [ ] Sign back in with same credentials

2. **Direct dashboard access**
   - [ ] Should go directly to `/influencer` dashboard
   - [ ] No onboarding redirect
   - [ ] Full portal functionality available

### Expected Results
- ✅ Completed users skip onboarding
- ✅ Direct access to influencer features

---

## 🎨 **Test 6: Visual Design and UX**

### Test Steps
1. **Design consistency**
   - [ ] Cyan background image (matching ModernInfluencerHeader)
   - [ ] White text and form fields
   - [ ] Proper Framer Motion animations
   - [ ] Responsive on mobile/tablet

2. **Progress indication**
   - [ ] Progress bar at top updates correctly
   - [ ] Step counter shows current position (1 of 8)
   - [ ] Smooth transitions between steps

3. **Accessibility**
   - [ ] Keyboard navigation works
   - [ ] Form validation messages clear
   - [ ] Proper focus management

### Expected Results
- ✅ Consistent with influencer header design (cyan background image)
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
   - [ ] Invalid website format
   - [ ] Verify client-side validation

3. **Server errors**
   - [ ] Test with invalid data payloads
   - [ ] Verify graceful error handling

### Expected Results
- ✅ Clear error messages
- ✅ Graceful degradation
- ✅ User can retry/fix issues

---

## 🔧 **Test 8: API Integration**

### Test Steps
1. **API endpoint testing**
   - [ ] Test `GET /api/influencer/onboarding-status`
   - [ ] Test `POST /api/influencer/onboarding` with valid data
   - [ ] Test `POST /api/migrate-onboarding` for database setup

2. **Data validation**
   - [ ] Required fields validation
   - [ ] Website URL formatting
   - [ ] Proper error responses

### Expected Results
- ✅ All API endpoints working correctly
- ✅ Proper validation and error handling
- ✅ Database operations successful

---

## ✅ **Success Criteria**

- [ ] New influencer users automatically enter onboarding
- [ ] Complete 8-step flow with validation
- [ ] Data saved correctly to database
- [ ] Smooth redirect to dashboard
- [ ] Returning users skip onboarding
- [ ] Distinct design from brand onboarding (cyan image vs blue image)
- [ ] Mobile responsive
- [ ] Error handling works
- [ ] Accessibility requirements met

---

## 🔧 **Manual Testing Commands**

```bash
# Run database migration
curl -X POST http://localhost:3001/api/migrate-onboarding

# Check onboarding status
curl -X GET http://localhost:3001/api/influencer/onboarding-status \
  -H "Authorization: Bearer <clerk-token>"

# Test API endpoint
curl -X POST http://localhost:3001/api/influencer/onboarding \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Alex",
    "last_name": "Thompson", 
    "display_name": "Alex Thompson",
    "location": "London, UK"
  }'
```

---

## 🎯 **Key Differences from Brand Onboarding**

1. **Design**: Cyan background image vs blue background image
2. **Steps**: 8 steps vs 14 steps (focused on personal info)
3. **Data**: Creates influencer record vs brand record
4. **Flow**: Simpler, personal-focused vs business-focused
5. **Validation**: Different required fields
6. **Success Message**: "Welcome to Stride Social!" vs "You're all set!"

---

## 📝 **Notes**

- This test plan should be executed after completing the brand onboarding tests
- Both onboarding systems share the same `is_onboarded` field in `user_profiles`
- The migration handles both brand and influencer users
- Profile picture upload will need Vercel Blob integration in production

---

This test plan ensures the influencer onboarding provides a smooth, professional experience that complements the existing brand onboarding while maintaining the distinct visual identity and workflow appropriate for content creators. 