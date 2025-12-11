# Toast Notifications Audit Report

This document identifies all places in the application where toast notifications should be added but are currently missing or using `alert()` instead.

## Summary

- **Total files needing toast updates**: 17
- **Total alert() calls to replace**: ~50+
- **Files already using toasts correctly**: Multiple (roster page, campaigns hooks, etc.)

---

## Files Requiring Toast Implementation

### 1. **src/app/staff/roster/page.tsx** ⚠️ HIGH PRIORITY
**Current Status**: Partially using toasts (assignment, delete), but still has alerts

**Missing Toasts:**
- ✅ `onConfirmDelete` - **FIXED** (now uses toast)
- ❌ `onSaveEdit` (lines 518, 521, 527) - Uses alert for success/error
- ❌ `onBulkRefresh` (lines 605, 607) - Uses alert for success/error

**Recommendation**: Replace all `alert()` calls with toast notifications

---

### 2. **src/components/influencer/AddInfluencerPanel.tsx** ⚠️ HIGH PRIORITY
**Current Status**: Uses alert() for all feedback

**Missing Toasts:**
- Line 261: Success message when influencer added
- Line 299: Error message when save fails
- Line 428: Success message when adding from discovery
- Line 436: Error message when adding from discovery fails

**Recommendation**: Import `useToast` and replace all alerts

---

### 3. **src/app/influencer/onboarding/page.tsx** ⚠️ HIGH PRIORITY
**Current Status**: Uses alert() for error feedback

**Missing Toasts:**
- Line 195: Error message when onboarding submission fails

**Recommendation**: Add toast for error, consider success toast before redirect

---

### 4. **src/app/influencer/onboarding/signed/page.tsx** ⚠️ HIGH PRIORITY
**Current Status**: Uses alert() for error feedback

**Missing Toasts:**
- Line 369: Error message when onboarding completion fails

**Recommendation**: Add toast for error, consider success toast before redirect

---

### 5. **src/app/staff/submissions/page.tsx** ⚠️ MEDIUM PRIORITY
**Current Status**: Uses alert() for feedback

**Missing Toasts:**
- Line 84: Error when deleting submission list
- Line 101: Error when submitting list

**Recommendation**: Add success toasts for both operations, error toasts already exist

---

### 6. **src/app/staff/submissions/[id]/page.tsx** ⚠️ MEDIUM PRIORITY
**Current Status**: Uses alert() for feedback

**Missing Toasts:**
- Line 88: Error when submitting list
- Line 109: Error when adding comment

**Recommendation**: Add success toasts for both operations

---

### 7. **src/components/staff/SavedInfluencersTable.tsx** ⚠️ MEDIUM PRIORITY
**Current Status**: Uses inline messages, but has one alert()

**Missing Toasts:**
- Line 110: Error when removing influencer fails

**Note**: This component already has a good inline message system, but the error case uses alert()

---

### 8. **src/app/brand/shortlists/page.tsx** ⚠️ MEDIUM PRIORITY
**Current Status**: Uses alert() for campaign creation

**Missing Toasts:**
- Line 233: Success when campaign created
- Line 241: Error when campaign creation fails

---

### 9. **src/app/brand/quotations/page.tsx** ⚠️ MEDIUM PRIORITY
**Current Status**: Uses alert() for all feedback

**Missing Toasts:**
- Lines 68, 70, 74: Approve quotation (success/error)
- Lines 91, 95: Reject quotation (error)

**Recommendation**: Add comprehensive toast notifications

---

### 10. **src/components/campaigns/RequestQuoteModal.tsx** ⚠️ MEDIUM PRIORITY
**Current Status**: Uses alert() for success

**Missing Toasts:**
- Line 159: Success message when quotation request submitted

---

### 11. **src/components/brands/ViewBrandPanel.tsx** ⚠️ HIGH PRIORITY
**Current Status**: Uses alert() for all feedback

**Missing Toasts:**
- Lines 690, 693: Delete team member (success/error)
- Lines 719, 726, 730, 734: Update brand (success/error)

**Recommendation**: Replace all alerts with toasts

---

### 12. **src/components/campaigns/CampaignDetailPanel.tsx** ⚠️ HIGH PRIORITY
**Current Status**: Uses alert() extensively (20+ instances)

**Missing Toasts:**
- Line 380, 384: Update campaign ID (error)
- Line 558, 616, 618, 622, 624, 630: Add influencer to campaign (various errors)
- Line 722, 726: Update content links (error)
- Line 840, 844: Add link (error)
- Line 944, 948, 984: Clear content links (success/error)
- Line 1095, 1104: Delete link (error)
- Line 1157, 1161: Update discount code (error)

**Recommendation**: This is a critical file - replace all alerts with toasts for better UX

---

### 13. **src/app/brand/submissions/[id]/page.tsx** ⚠️ MEDIUM PRIORITY
**Current Status**: Uses alert() for feedback

**Missing Toasts:**
- Line 92: Error when updating status
- Line 115: Error when adding comment

**Recommendation**: Add success toasts as well

---

### 14. **src/components/influencer/CampaignInvitationCard.tsx** ⚠️ LOW PRIORITY
**Current Status**: Uses alert() for validation

**Missing Toasts:**
- Line 54: Validation error when declining without reason

**Recommendation**: Replace with toast for better UX

---

### 15. **src/components/brands/QuotationDetailPanel.tsx** ⚠️ MEDIUM PRIORITY
**Current Status**: Uses alert() for validation

**Missing Toasts:**
- Line 471: Validation error when sending quote without pricing

**Recommendation**: Replace with toast

---

### 16. **src/app/influencer/signed-check/page.tsx** ⚠️ LOW PRIORITY
**Current Status**: Uses alert() for error

**Missing Toasts:**
- Line 43: Error when saving selection fails

---

### 17. **src/components/brands/AddBrandPanel.tsx** ⚠️ MEDIUM PRIORITY
**Current Status**: Uses alert() for validation

**Missing Toasts:**
- Line 236: Validation error for invalid email
- Line 245: Validation error for duplicate emails

**Recommendation**: Replace with toast for better UX

---

## Implementation Guidelines

### 1. Import Toast Hook
```typescript
import { useToast } from '@/components/ui/use-toast'
```

### 2. Initialize in Component
```typescript
const { toast } = useToast()
```

### 3. Replace Success Alerts
```typescript
// Before
alert('✅ Success message')

// After
toast({
  title: 'Success',
  description: 'Success message',
  variant: 'default'
})
```

### 4. Replace Error Alerts
```typescript
// Before
alert('❌ Error message')

// After
toast({
  title: 'Error',
  description: 'Error message',
  variant: 'destructive'
})
```

### 5. Ensure Toaster is in Layout
Most pages already have `<Toaster />` component. Verify it's present in:
- Root layout or
- Page component

---

## Priority Ranking

### 🔴 Critical (User-facing operations)
1. `src/components/campaigns/CampaignDetailPanel.tsx` - 20+ alerts
2. `src/app/staff/roster/page.tsx` - Edit and bulk operations
3. `src/components/influencer/AddInfluencerPanel.tsx` - Core functionality
4. `src/components/brands/ViewBrandPanel.tsx` - Brand management

### 🟡 High (Important workflows)
5. `src/app/influencer/onboarding/page.tsx` - User onboarding
6. `src/app/influencer/onboarding/signed/page.tsx` - User onboarding
7. `src/app/brand/quotations/page.tsx` - Business critical
8. `src/app/staff/submissions/page.tsx` - Staff workflows

### 🟢 Medium (Nice to have)
9. All other files listed above

---

## Files Already Using Toasts Correctly ✅

These files serve as good examples:
- `src/app/staff/roster/page.tsx` - Assignment and delete operations
- `src/hooks/useCampaigns.ts` - Campaign operations
- `src/app/brand/campaigns/page.tsx` - Campaign management

---

## Next Steps

1. Start with Critical priority files
2. Test each implementation
3. Ensure consistent messaging
4. Update this document as work progresses
