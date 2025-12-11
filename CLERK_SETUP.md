# Clerk Development vs Production Setup

## The Problem
Production Clerk keys are restricted to your production domain (`stride-suite.com`). When running locally on `localhost:3000`, you need **development keys**. However, you also need to test email verification!

## ✅ Solution: Use Development Keys + Test Mode

### Step 1: Get Development Keys from Clerk Dashboard

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your **development instance** (not production)
3. Go to **API Keys** section
4. Copy the **Development keys** (they start with `pk_test_` and `sk_test_`)

### Step 2: Enable Test Mode in Clerk Dashboard

1. In Clerk Dashboard, go to your **development instance**
2. Navigate to **Settings** → **Email & Phone**
3. Ensure **Test mode** is enabled (it's enabled by default for development instances)

### Step 3: Update Your `.env.local` File

Use **development keys** for local development:

```env
# Development Keys (for localhost)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 4: Testing Email Verification in Development

Clerk's test mode allows you to test email verification without sending real emails:

#### Option A: Use Test Email Addresses
- Use email addresses with `+clerk_test` suffix: `yourname+clerk_test@example.com`
- No actual email will be sent
- Use the fixed verification code: **`424242`** (always works in test mode)

#### Option B: Use Any Email Address
- In test mode, you can use any email address
- Clerk will show you the verification code in the browser console or use the fixed code `424242`

### Step 5: Keep Production Keys in Vercel

Your **production keys** should be set in Vercel environment variables:
- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Set production keys there for the `production` environment

## Environment Variable Setup

### `.env.local` (Local Development)
```env
# Use DEVELOPMENT keys from Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Vercel Environment Variables (Production)
```env
# Use PRODUCTION keys from Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://stride-suite.com
```

## Quick Fix

1. Get **development keys** from Clerk Dashboard (development instance)
2. Update `.env.local` with development keys
3. Enable **Test mode** in Clerk Dashboard (Settings → Email & Phone)
4. When testing signup, use the verification code **`424242`** (works in test mode)
5. Restart your dev server: `npm run dev`

## Important Notes

- ✅ **Development keys** (`pk_test_`, `sk_test_`) work on `localhost` and any domain
- ✅ **Test mode** allows email verification testing without sending real emails
- ✅ Use verification code **`424242`** in test mode (always works)
- ❌ **Production keys** (`pk_live_`, `sk_live_`) only work on your configured production domain
- 🔒 Never commit `.env.local` to Git (it's already in `.gitignore`)
- 🌐 Production keys should only be in Vercel environment variables

## Testing Email Verification

When testing signup/verification locally:
1. Enter any email address (or use `+clerk_test` suffix)
2. Click "Send verification code"
3. Enter the code: **`424242`** (this always works in test mode)
4. You're verified! ✅

