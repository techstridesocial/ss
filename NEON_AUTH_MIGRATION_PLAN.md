# 🔄 Clerk to Neon Auth Migration Plan

## Executive Summary

**Migration Complexity:** HIGH ⚠️  
**Estimated Time:** 2-3 weeks (full-time) or 4-6 weeks (part-time)  
**Risk Level:** Medium-High  
**Current Integration:** 386 Clerk references across 124 files

## Current State Analysis

### Clerk Integration Points

1. **Core Authentication (37 files)**
   - `ClerkProvider` in root layout
   - `useUser()` hook in 20+ components
   - `SignIn`/`SignUp` components
   - `auth()` and `currentUser()` in API routes

2. **Middleware** (`src/middleware.ts`)
   - `clerkMiddleware` for route protection
   - Protected/public route matchers
   - CSRF protection integrated with Clerk

3. **API Routes (80+ routes)**
   - Authentication checks using `auth()` from Clerk
   - Role checks using `getCurrentUserRole()` (reads from Clerk metadata)
   - User ID retrieval from Clerk sessions

4. **Role Management**
   - Roles stored in Clerk `publicMetadata.role`
   - Database sync with `users.role` column
   - Role-based access control throughout app

5. **Components**
   - `ProtectedRoute` wrapper
   - `BrandOnboardingCheck`, `InfluencerOnboardingCheck`
   - Navigation headers using Clerk user data

6. **Webhooks**
   - Clerk webhook handler at `/api/webhooks/clerk/route.ts`

## Neon Auth Overview

**Key Differences:**
- Uses **Stack Auth** as the provider (not Clerk)
- User data automatically synced to Neon database
- No separate metadata system - uses database directly
- Different SDK and API structure
- Less UI components out-of-the-box

**Advantages:**
- ✅ Direct database integration (no sync needed)
- ✅ Single vendor (Neon for DB + Auth)
- ✅ Potentially lower cost
- ✅ Better data portability

**Challenges:**
- ⚠️ Different API surface (requires code changes)
- ⚠️ Less mature ecosystem
- ⚠️ Fewer pre-built components
- ⚠️ Different session management

## Migration Strategy

### Phase 1: Research & Setup (2-3 days)

1. **Evaluate Neon Auth Features**
   - [ ] Review Neon Auth documentation
   - [ ] Test authentication flows in a sandbox
   - [ ] Verify role/permission support
   - [ ] Check session management capabilities
   - [ ] Assess UI component availability

2. **Database Schema Updates**
   - [ ] Review Neon Auth user table structure
   - [ ] Plan migration of existing users
   - [ ] Map Clerk metadata to Neon Auth fields
   - [ ] Create migration scripts

3. **Environment Setup**
   - [ ] Set up Neon Auth in Neon dashboard
   - [ ] Configure authentication providers
   - [ ] Set up development environment
   - [ ] Create test accounts

### Phase 2: Core Authentication (3-5 days)

1. **Install & Configure**
   ```bash
   npm uninstall @clerk/nextjs
   npm install @stackframe/stack
   # or whatever Neon Auth SDK uses
   ```

2. **Update Root Layout**
   - Replace `ClerkProvider` with Neon Auth provider
   - Update authentication context

3. **Replace Sign-In/Sign-Up Pages**
   - Remove Clerk `SignIn`/`SignUp` components
   - Implement custom forms or use Neon Auth components
   - Update redirect logic

4. **Update Middleware**
   - Replace `clerkMiddleware` with Neon Auth middleware
   - Update route protection logic
   - Maintain CSRF protection

### Phase 3: API Routes Migration (5-7 days)

1. **Create Auth Utilities**
   - Replace `src/lib/auth/roles.ts` functions
   - Update `getCurrentUserRole()` to read from database
   - Create new `requireAuth()` using Neon Auth

2. **Migrate API Routes (80+ routes)**
   - Replace `auth()` calls with Neon Auth equivalent
   - Update user ID retrieval
   - Update role checks to use database instead of metadata
   - Test each route individually

3. **Update Webhooks**
   - Replace Clerk webhook handler
   - Implement Neon Auth webhook handler
   - Update invitation system

### Phase 4: Component Migration (3-4 days)

1. **Update Hooks**
   - Replace `useUser()` with Neon Auth hook
   - Update `useUserRole()` to read from database
   - Update `useHasRole()` and related hooks

2. **Update Protected Components**
   - Update `ProtectedRoute` component
   - Update onboarding check components
   - Update navigation headers

3. **Update Client Components**
   - Replace all `useUser()` calls
   - Update user data access patterns
   - Test client-side authentication state

### Phase 5: Role & Permission System (2-3 days)

1. **Database-First Roles**
   - Remove dependency on Clerk metadata
   - Ensure all roles read from `users.role` column
   - Update role update endpoints

2. **Permission Checks**
   - Update all permission checks to use database
   - Remove Clerk metadata reads
   - Test role-based access control

### Phase 6: User Migration (2-3 days)

1. **Data Migration Script**
   - Export users from Clerk
   - Map Clerk user IDs to Neon Auth user IDs
   - Migrate user profiles
   - Migrate role assignments
   - Preserve relationships (influencers, brands, etc.)

2. **Testing**
   - Test user login with migrated accounts
   - Verify role assignments
   - Test all user flows

### Phase 7: Cleanup & Testing (2-3 days)

1. **Remove Clerk Dependencies**
   - Remove all Clerk imports
   - Remove Clerk environment variables
   - Clean up unused code

2. **Comprehensive Testing**
   - Test all authentication flows
   - Test all protected routes
   - Test role-based access
   - Test API endpoints
   - Test webhooks

3. **Documentation**
   - Update environment variable docs
   - Update deployment guides
   - Document new authentication flow

## Detailed Migration Steps

### Step 1: Replace Authentication Provider

**File: `src/app/layout.tsx`**
```typescript
// BEFORE
import { ClerkProvider } from '@clerk/nextjs'

<ClerkProvider>
  {children}
</ClerkProvider>

// AFTER (example - actual API depends on Neon Auth SDK)
import { AuthProvider } from '@neon/auth' // or whatever SDK

<AuthProvider>
  {children}
</AuthProvider>
```

### Step 2: Update Middleware

**File: `src/middleware.ts`**
```typescript
// BEFORE
import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware(async (auth, request) => {
  await auth.protect()
})

// AFTER
import { neonAuthMiddleware } from '@neon/auth' // or equivalent

export default neonAuthMiddleware(async (session, request) => {
  if (!session) {
    return NextResponse.redirect('/sign-in')
  }
})
```

### Step 3: Update Auth Utilities

**File: `src/lib/auth/roles.ts`**
```typescript
// BEFORE
import { auth, currentUser } from '@clerk/nextjs/server'

export async function getCurrentUserRole(): Promise<UserRole | null> {
  const user = await currentUser()
  return user?.publicMetadata?.role as UserRole || null
}

// AFTER
import { getSession } from '@neon/auth' // or equivalent
import { query } from '@/lib/db/connection'

export async function getCurrentUserRole(): Promise<UserRole | null> {
  const session = await getSession()
  if (!session?.userId) return null
  
  const result = await query<{ role: UserRole }>(
    'SELECT role FROM users WHERE id = $1',
    [session.userId]
  )
  
  return result[0]?.role || null
}
```

### Step 4: Update API Routes

**Example: `src/app/api/influencers/route.ts`**
```typescript
// BEFORE
import { auth } from '@clerk/nextjs/server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const userResult = await query(
    'SELECT id FROM users WHERE clerk_id = $1',
    [userId]
  )
}

// AFTER
import { getSession } from '@neon/auth' // or equivalent

export async function GET() {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  // userId is now directly from database, no lookup needed
  const userId = session.userId
}
```

### Step 5: Update Client Components

**File: `src/lib/auth/hooks.ts`**
```typescript
// BEFORE
import { useUser } from '@clerk/nextjs'

export function useUserRole(): UserRole | null {
  const { user } = useUser()
  return user?.publicMetadata?.role as UserRole || null
}

// AFTER
import { useSession } from '@neon/auth' // or equivalent
import { useQuery } from '@tanstack/react-query'

export function useUserRole(): UserRole | null {
  const { data: session } = useSession()
  const { data: user } = useQuery({
    queryKey: ['user', session?.userId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${session?.userId}`)
      return res.json()
    },
    enabled: !!session?.userId
  })
  
  return user?.role || null
}
```

## Critical Considerations

### 1. **User ID Migration**
- **Challenge:** Clerk uses `clerk_id` in database, Neon Auth will use different IDs
- **Solution:** Create migration script to map old IDs to new IDs
- **Risk:** All foreign key relationships need updating

### 2. **Session Management**
- **Challenge:** Different session storage/management
- **Solution:** Update all session-dependent code
- **Risk:** Users may need to re-login after migration

### 3. **Role Storage**
- **Current:** Roles in Clerk `publicMetadata` + database `users.role`
- **After:** Roles only in database
- **Solution:** Remove metadata dependency, use database as source of truth

### 4. **UI Components**
- **Challenge:** Neon Auth may not have pre-built components
- **Solution:** Build custom sign-in/sign-up forms or use Stack Auth components
- **Risk:** More development time needed

### 5. **Webhooks**
- **Challenge:** Different webhook format and events
- **Solution:** Rewrite webhook handler
- **Risk:** Invitation system needs updates

## Migration Checklist

### Pre-Migration
- [ ] Backup database
- [ ] Export all Clerk user data
- [ ] Document current authentication flows
- [ ] Set up Neon Auth test environment
- [ ] Create rollback plan

### During Migration
- [ ] Set up feature flag for gradual rollout
- [ ] Migrate in phases (test → staging → production)
- [ ] Test each phase thoroughly
- [ ] Monitor error logs
- [ ] Keep Clerk active during transition

### Post-Migration
- [ ] Verify all users can log in
- [ ] Test all protected routes
- [ ] Test role-based access
- [ ] Update documentation
- [ ] Remove Clerk dependencies
- [ ] Cancel Clerk subscription

## Risk Mitigation

1. **Feature Flag Approach**
   - Use feature flags to gradually migrate users
   - Keep both systems running during transition
   - Rollback capability if issues arise

2. **Parallel Running**
   - Run both Clerk and Neon Auth simultaneously
   - Migrate users in batches
   - Monitor for issues

3. **Comprehensive Testing**
   - Unit tests for auth utilities
   - Integration tests for API routes
   - E2E tests for user flows
   - Load testing for session management

## Estimated Timeline

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Research & Setup | 2-3 days | None |
| Core Authentication | 3-5 days | Phase 1 |
| API Routes | 5-7 days | Phase 2 |
| Components | 3-4 days | Phase 2 |
| Role System | 2-3 days | Phase 3 |
| User Migration | 2-3 days | Phase 5 |
| Cleanup & Testing | 2-3 days | All phases |
| **Total** | **19-28 days** | |

## Recommendation

### ⚠️ **Consider Staying with Clerk IF:**
- Current system is working well
- You need the migration done quickly
- You rely heavily on Clerk's UI components
- You need advanced features (MFA, social logins, etc.)

### ✅ **Consider Migrating to Neon Auth IF:**
- You want tighter database integration
- Cost is a significant factor
- You prefer database-first approach
- You're willing to invest 3-4 weeks in migration
- You can handle custom UI development

## Alternative: Hybrid Approach

Consider keeping Clerk but improving database sync:
- Keep Clerk for authentication
- Improve database sync (already partially done)
- Use database as source of truth for roles
- Reduce dependency on Clerk metadata

This would be a **much smaller migration** (1-2 weeks) with lower risk.

## Next Steps

1. **Decision Point:** Choose migration path
2. **If Migrating:** Start with Phase 1 (Research & Setup)
3. **If Staying:** Consider hybrid approach improvements
4. **Either Way:** Document decision and rationale

---

**Last Updated:** 2025-01-27  
**Status:** Draft - Awaiting Decision
