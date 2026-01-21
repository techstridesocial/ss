# Payment Center Verification Plan

## Overview
This document outlines the verification process for the influencer payment center system, including database schema, API endpoints, and UI components.

## System Architecture

### 1. **Influencer Payment Center** (`/influencer/payments`)
- **Purpose**: Allows influencers to add/manage payment methods (PayPal or Bank Transfer)
- **Features**:
  - Add PayPal account (email, first name, last name)
  - Add Bank account (account holder, account number, routing number, SWIFT, IBAN, etc.)
  - View payment summary (total earned, pending, paid out, this month)
  - View payment history
  - Create and manage invoices
- **API Endpoint**: `/api/influencer/payments` (GET, POST)

### 2. **Staff Payment View** (Roster Detail Panel)
- **Purpose**: Allows staff to view influencer payment information
- **Location**: Staff Roster → Click influencer → Payment Methods section
- **Features**:
  - View payment method (masked for security)
  - View payment summary statistics
  - View payment transaction history
- **API Endpoint**: `/api/roster/[id]/payments` (GET)

### 3. **Database Schema**

#### Tables:
1. **`influencer_payments`**
   - Stores encrypted payment method details
   - Columns: `id`, `influencer_id`, `payment_method`, `encrypted_details`, `is_verified`, `created_at`, `updated_at`
   - Unique constraint on `influencer_id` (one payment method per influencer)

2. **`payment_transactions`**
   - Stores payment transaction history
   - Columns: `id`, `campaign_influencer_id`, `amount`, `currency`, `status`, `transaction_id`, `processed_at`, `created_at`

3. **`payment_method_type` ENUM**
   - Values: `PAYPAL`, `BANK_TRANSFER`, `WISE`, `STRIPE`

## Verification Steps

### Step 1: Verify Database Schema
**Endpoint**: `GET /api/debug/verify-payment-schema`

**Expected Results**:
- ✅ `influencer_payments` table exists with correct columns
- ✅ `payment_transactions` table exists with correct columns
- ✅ `payment_method_type` enum exists with values
- ✅ Unique constraint on `influencer_payments.influencer_id`

**How to Test**:
1. Open browser and navigate to: `http://localhost:3000/api/debug/verify-payment-schema`
2. Check the JSON response for table existence and structure
3. Review debug logs at `/Users/jo-remi/Desktop/ss/.cursor/debug.log`

---

### Step 2: Test Influencer Payment Center (Add Payment Method)
**Page**: `/influencer/payments`
**User**: Signed influencer account (e.g., `signed2@test.com`)

**Test Scenario A: Add PayPal**
1. Log in as influencer
2. Navigate to `/influencer/payments`
3. Click "Add PayPal" button
4. Fill in:
   - Email: `test@paypal.com`
   - First Name: `John`
   - Last Name: `Doe`
5. Click "Save PayPal Details"

**Expected Results**:
- ✅ Success message appears
- ✅ Payment method displays with masked email (e.g., `t***@paypal.com`)
- ✅ Data saved to `influencer_payments` table with encrypted details
- ✅ Debug logs show successful save operation

**Test Scenario B: Add Bank Account**
1. Click "Add Bank Account" (or Edit if PayPal already exists)
2. Fill in required fields:
   - Account Type: `Personal` or `Business`
   - Account Holder Name: `John Doe`
   - Account Number: `12345678`
   - Routing Number: `987654321`
   - Currency: `GBP`
   - VAT Registered: `Yes` or `No`
3. Click "Save Bank Details"

**Expected Results**:
- ✅ Success message appears
- ✅ Payment method displays with masked account number (e.g., `****5678`)
- ✅ Data saved to `influencer_payments` table (replaces previous method)
- ✅ Debug logs show successful save operation

---

### Step 3: Verify Staff Can View Payment Info
**Page**: `/staff/roster` → Click influencer → Payment Methods section
**User**: Staff account

**Test Scenario**:
1. Log in as staff user
2. Navigate to `/staff/roster`
3. Click on an influencer who has added payment information
4. Scroll to "Payment Methods" section in the detail panel

**Expected Results**:
- ✅ Payment method displays (PayPal or Bank Transfer)
- ✅ Payment summary shows statistics (Total Earned, Pending, Paid Out, This Month)
- ✅ Payment details are visible (unmasked for staff)
- ✅ Debug logs show successful fetch from `/api/roster/[id]/payments`

---

### Step 4: Test Payment Summary Calculations
**Database Query**: Check `payment_transactions` table

**Test Scenario**:
1. Verify payment summary calculations are correct
2. Check if transactions from `payment_transactions` are aggregated properly

**Expected Results**:
- ✅ Total Earned = sum of all completed transactions
- ✅ Pending Amount = sum of pending/processing transactions
- ✅ Paid Out = sum of completed transactions
- ✅ This Month = sum of completed transactions from current month

---

### Step 5: Test Encryption/Decryption
**Files**: `src/lib/utils/encryption.ts`, `src/lib/db/queries/payments.ts`

**Test Scenario**:
1. Add payment method as influencer
2. View payment method as influencer (should see masked data)
3. View payment method as staff (should see unmasked data)
4. Check database directly to ensure data is encrypted

**Expected Results**:
- ✅ Payment details are encrypted in database (`encrypted_details` column)
- ✅ Influencer sees masked data (e.g., `t***@paypal.com`, `****5678`)
- ✅ Staff sees unmasked data for operational purposes
- ✅ Encryption/decryption works without errors

---

## Debug Instrumentation

All API routes have been instrumented with debug logging. Logs are written to:
**`/Users/jo-remi/Desktop/ss/.cursor/debug.log`**

### Hypothesis Mapping:
- **H1**: Influencer payment page GET request
- **H2**: Influencer payment method POST (save)
- **H3**: Staff roster payment view GET request
- **H4**: Database schema verification
- **H5**: Encryption/decryption operations

### Reading Logs:
```bash
# View logs in real-time
tail -f /Users/jo-remi/Desktop/ss/.cursor/debug.log

# View all logs
cat /Users/jo-remi/Desktop/ss/.cursor/debug.log

# Clear logs before new test
rm /Users/jo-remi/Desktop/ss/.cursor/debug.log
```

---

## Files Modified

### API Routes:
- `src/app/api/influencer/payments/route.ts` - Influencer payment GET/POST
- `src/app/api/roster/[id]/payments/route.ts` - Staff payment view
- `src/app/api/debug/verify-payment-schema/route.ts` - Schema verification

### Database Queries:
- `src/lib/db/queries/payments.ts` - Payment CRUD operations

### UI Components:
- `src/app/influencer/payments/page.tsx` - Influencer payment center page
- `src/components/influencer/detail-panel/sections/PaymentMethodsSection.tsx` - Staff payment view

### Database Schema:
- `src/lib/db/schema.sql` - Payment tables definition
- `src/lib/db/add-payment-unique-constraint.sql` - Unique constraint migration

---

## Common Issues & Solutions

### Issue 1: "Influencer not found" error
**Solution**: Ensure the influencer record exists in the `influencers` table for the logged-in user.

### Issue 2: Payment data not showing
**Solution**: Check if `influencer_payments` table exists and has data. Run schema verification endpoint.

### Issue 3: Encryption errors
**Solution**: Verify `ENCRYPTION_KEY` environment variable is set in `.env` file.

### Issue 4: Staff cannot view payment data
**Solution**: Ensure staff user has `STAFF` or `ADMIN` role in the system.

---

## Success Criteria

✅ **All hypotheses confirmed**:
- H1: Influencer can load payment page and fetch existing data
- H2: Influencer can save payment method (encrypted in database)
- H3: Staff can view influencer payment info in roster
- H4: Database schema is correct and complete
- H5: Encryption/decryption works correctly

✅ **No errors in debug logs**
✅ **Payment data persists across page refreshes**
✅ **Staff sees unmasked data, influencers see masked data**
✅ **Payment summary calculations are accurate**

---

## Next Steps After Verification

1. **Remove debug instrumentation** from API routes
2. **Test invoice creation and management**
3. **Test payment transaction creation** (when campaigns are completed)
4. **Add payment method verification** (e.g., PayPal email verification)
5. **Implement payment processing** integration (e.g., Stripe, PayPal API)

