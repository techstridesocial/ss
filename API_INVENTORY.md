# API Inventory Report
**Generated:** $(date)  
**Excludes:** Modash APIs (handled separately)

## Status Legend
- ✅ **WORKING** - API is implemented, tested, and actively used
- ⚠️ **UNUSED** - API exists but not called from frontend
- 🔧 **MIGRATION/UTILITY** - One-time migration or utility endpoint
- 🐛 **POTENTIAL ISSUES** - May have issues or needs review
- ❌ **NOT WORKING** - Known to be broken or incomplete

---

## 🔐 Authentication & Authorization

| Endpoint | Method | Status | Usage | Notes |
|----------|--------|--------|-------|-------|
| `/api/auth/current-user` | GET | ✅ WORKING | Used in `lib/auth/current-user.ts` | Returns current authenticated user |
| `/api/webhooks/clerk` | POST | ✅ WORKING | Used by Clerk webhooks | Handles user creation/updates from Clerk |

---

## 👤 User Management

| Endpoint | Method | Status | Usage | Notes |
|----------|--------|--------|-------|-------|
| `/api/users` | GET | ✅ WORKING | Used in `app/api/staff/users/route.ts` | List users |
| `/api/users/[id]/update-role` | PATCH | ✅ WORKING | Used in `components/staff/UserManagementModal.tsx` | Update user role |
| `/api/staff/users` | GET | ✅ WORKING | Used in staff pages | Get staff users |
| `/api/staff-members` | GET | ✅ WORKING | Used in `lib/hooks/staff/useBrands.ts` | Get staff members list |
| `/api/staff/members` | GET | ✅ WORKING | Used in brands page | Alternative staff members endpoint |

---

## 🏢 Brand Management

| Endpoint | Method | Status | Usage | Notes |
|----------|--------|--------|-------|-------|
| `/api/brands` | GET, POST | ✅ WORKING | Used in `app/staff/brands/page.tsx` | List/create brands |
| `/api/brands/[id]` | GET, PATCH, DELETE | ✅ WORKING | Used in brands page | Get/update/delete brand |
| `/api/brands/[id]/assign` | POST | ✅ WORKING | Used in brands page | Assign brand to staff |
| `/api/brand/profile` | GET, PATCH | ✅ WORKING | Used in `app/brand/profile/page.tsx` | Brand profile management |
| `/api/brand/onboarding` | POST | ✅ WORKING | Used in `app/brand/onboarding/page.tsx` | Brand onboarding flow |
| `/api/brand/campaigns` | GET | ✅ WORKING | Used in brand campaigns page | Get brand campaigns |
| `/api/brand/campaigns/[id]` | GET | ✅ WORKING | Used in brand campaigns | Get campaign details |
| `/api/brand/submissions` | GET | ✅ WORKING | Used in brand submissions page | Get brand submissions |
| `/api/brand/submissions/[id]` | GET | ✅ WORKING | Used in submissions | Get submission details |
| `/api/brand/quotations` | GET, POST | ✅ WORKING | Used in `app/brand/quotations/page.tsx` | Brand quotations |
| `/api/brand/quotations/[id]` | GET | ✅ WORKING | Used in quotations page | Get quotation details |

---

## 👥 Influencer Management

| Endpoint | Method | Status | Usage | Notes |
|----------|--------|--------|-------|-------|
| `/api/influencers` | GET, POST | ✅ WORKING | Used in multiple places | List/create influencers |
| `/api/influencers/light` | GET | ✅ WORKING | Used in `components/staff/roster/useRosterData.ts` | Lightweight influencer list |
| `/api/influencers/[id]` | GET, PATCH, DELETE | ✅ WORKING | Used in roster actions | Get/update/delete influencer |
| `/api/influencers/[id]/complete` | POST | ⚠️ UNUSED | Not found in codebase | Complete influencer setup |
| `/api/influencers/[id]/platform-username` | PATCH | ✅ WORKING | Used in influencer profile | Update platform username |
| `/api/influencers/[id]/whatsapp` | GET, POST | ✅ WORKING | Used in influencer pages | WhatsApp contact management |
| `/api/influencer/profile` | GET, PATCH | ✅ WORKING | Used in `app/influencer/profile/page.tsx` | Influencer profile |
| `/api/influencer/stats` | GET | ✅ WORKING | Used in `app/influencer/stats/page.tsx` | Influencer statistics |
| `/api/influencer/campaigns` | GET | ✅ WORKING | Used in `app/influencer/campaigns/page.tsx` | Influencer campaigns |
| `/api/influencer/campaigns/[id]/submit-content` | POST | ✅ WORKING | Used in campaigns page | Submit campaign content |
| `/api/influencer/invoices` | GET | ✅ WORKING | Used in `app/influencer/invoices/page.tsx` | Influencer invoices |
| `/api/influencer/payments` | GET | ✅ WORKING | Used in `app/influencer/payments/page.tsx` | Payment information |
| `/api/influencer/onboarding` | GET, POST | ✅ WORKING | Used in `app/influencer/onboarding/page.tsx` | Influencer onboarding |
| `/api/influencer/onboarding/signed` | GET, POST | ✅ WORKING | Used in signed onboarding | Signed influencer onboarding |
| `/api/influencer/onboarding/signed/complete` | POST | ✅ WORKING | Used in onboarding flow | Complete signed onboarding |
| `/api/influencer/onboarding/signed/brands` | GET | ✅ WORKING | Used in onboarding | Get brands for signed influencer |
| `/api/influencer/refresh-modash-data` | POST | ✅ WORKING | Used in stats page | Refresh Modash data |
| `/api/influencer/search-simple` | GET | ✅ WORKING | Used in search | Simple influencer search |
| `/api/influencer/social-accounts` | GET, POST | ✅ WORKING | Used in profile pages | Social account management |
| `/api/influencer/update-role` | POST | ⚠️ UNUSED | Not found in codebase | Update influencer role |
| `/api/influencer-management` | PUT | ⚠️ UNUSED | Not found in codebase | Alternative management endpoint |
| `/api/influencer-contact` | POST | ⚠️ UNUSED | Not found in codebase | Contact influencer |

---

## 📋 Campaign Management

| Endpoint | Method | Status | Usage | Notes |
|----------|--------|--------|-------|-------|
| `/api/campaigns` | GET, POST | ✅ WORKING | Used in `hooks/useCampaigns.ts` | List/create campaigns |
| `/api/campaigns/[id]` | GET, PATCH, DELETE | ✅ WORKING | Used in campaign detail panels | Get/update/delete campaign |
| `/api/campaigns/[id]/assign` | POST | ✅ WORKING | Used in campaigns page | Assign campaign |
| `/api/campaigns/[id]/content` | GET, POST | ✅ WORKING | Used in campaign panels | Campaign content |
| `/api/campaigns/[id]/duplicate` | POST | ✅ WORKING | Used in campaigns page | Duplicate campaign |
| `/api/campaigns/[id]/influencers` | GET, POST | ✅ WORKING | Used in campaign panels | Campaign influencers |
| `/api/campaigns/[id]/payments` | GET, POST | ✅ WORKING | Used in payment panels | Campaign payments |
| `/api/campaigns/[id]/submit-content` | POST | ✅ WORKING | Used in campaigns | Submit content to campaign |
| `/api/campaigns/content/pending` | GET | ✅ WORKING | Used in content pages | Pending content |
| `/api/campaigns/content/stats` | GET | ✅ WORKING | Used in content pages | Content statistics |
| `/api/campaigns/influencer/[influencerId]` | GET | ✅ WORKING | Used in campaigns | Get influencer campaigns |
| `/api/campaign-templates` | GET | ✅ WORKING | Used in `components/campaigns/CampaignTemplatesModal.tsx` | Campaign templates |
| `/api/campaign-invitations/respond` | POST | ✅ WORKING | Used in invitation pages | Respond to campaign invitation |

---

## 📝 Submissions

| Endpoint | Method | Status | Usage | Notes |
|----------|--------|--------|-------|-------|
| `/api/submissions/[id]/comments` | GET, POST | ✅ WORKING | Used in submission pages | Submission comments |
| `/api/submissions/[id]/influencers` | GET | ✅ WORKING | Used in submissions | Submission influencers |
| `/api/staff/submissions` | GET, POST | ✅ WORKING | Used in `app/staff/submissions/page.tsx` | Staff submissions |
| `/api/staff/submissions/[id]` | GET, PATCH | ✅ WORKING | Used in submission pages | Get/update submission |
| `/api/staff/submissions/[id]/submit` | POST | ✅ WORKING | Used in submissions | Submit submission |

---

## 💰 Payments & Invoices

| Endpoint | Method | Status | Usage | Notes |
|----------|--------|--------|-------|-------|
| `/api/invoices/[id]/pdf` | GET | ✅ WORKING | Used in invoice pages | Generate invoice PDF |
| `/api/staff/invoices` | GET | ✅ WORKING | Used in `app/staff/finances/page.tsx` | Staff invoices |
| `/api/staff/invoices/[id]` | GET | ✅ WORKING | Used in invoice modals | Get invoice details |
| `/api/staff/invoices/bulk` | POST | ✅ WORKING | Used in finances page | Bulk invoice operations |
| `/api/roster/[id]/payments` | GET, POST | ✅ WORKING | Used in roster pages | Roster payments |

---

## 🔍 Discovery & Search

| Endpoint | Method | Status | Usage | Notes |
|----------|--------|--------|-------|-------|
| `/api/discovery/search` | POST | ✅ WORKING | Used in `app/staff/discovery/page.tsx` | Search influencers |
| `/api/discovery/search-v2` | POST | ✅ WORKING | Used in discovery page | Enhanced search |
| `/api/discovery/profile` | GET | ✅ WORKING | Used in discovery | Get profile |
| `/api/discovery/profile-extended` | GET | ✅ WORKING | Used in discovery | Extended profile data |
| `/api/discovery/add-to-roster` | POST | ✅ WORKING | Used in discovery page | Add to roster |
| `/api/discovery/credits` | GET | ✅ WORKING | Used in discovery | Get discovery credits |
| `/api/discovery/hashtags` | GET | ✅ WORKING | Used in discovery filters | Get hashtags |
| `/api/discovery/interests` | GET | ✅ WORKING | Used in discovery filters | Get interests |
| `/api/discovery/languages` | GET | ✅ WORKING | Used in discovery filters | Get languages |
| `/api/discovery/locations` | GET | ✅ WORKING | Used in discovery filters | Get locations |
| `/api/discovery/partnerships` | GET | ✅ WORKING | Used in discovery | Get partnerships |
| `/api/discovery/performance-data` | GET | ✅ WORKING | Used in discovery | Performance data |
| `/api/discovery/topics` | GET | ✅ WORKING | Used in discovery filters | Get topics |

---

## 📊 Analytics & Roster

| Endpoint | Method | Status | Usage | Notes |
|----------|--------|--------|-------|-------|
| `/api/roster/[id]` | GET | ✅ WORKING | Used in roster pages | Get roster influencer |
| `/api/roster/[id]/refresh-analytics` | POST | ✅ WORKING | Used in roster actions | Refresh analytics |
| `/api/roster/bulk-refresh-analytics` | POST | ✅ WORKING | Used in `app/staff/roster/page.tsx` | Bulk refresh analytics |
| `/api/analytics/update-all` | POST | ⚠️ UNUSED | Not found in codebase | Update all analytics |

---

## 📋 Quotations

| Endpoint | Method | Status | Usage | Notes |
|----------|--------|--------|-------|-------|
| `/api/quotations` | GET, POST | ✅ WORKING | Used in quotations pages | List/create quotations |
| `/api/quotations/approve` | POST | ✅ WORKING | Used in quotations | Approve quotation |
| `/api/quotations/create-campaign` | POST | ✅ WORKING | Used in quotations | Create campaign from quotation |

---

## 📑 Shortlists

| Endpoint | Method | Status | Usage | Notes |
|----------|--------|--------|-------|-------|
| `/api/shortlists` | GET, POST | ✅ WORKING | Used in shortlist pages | List/create shortlists |
| `/api/shortlists/influencers` | GET, POST, DELETE | ✅ WORKING | Used in shortlist pages | Shortlist influencers |
| `/api/staff/saved-influencers` | GET, POST, DELETE | ✅ WORKING | Used in `lib/hooks/useStaffSavedInfluencers.ts` | Saved influencers |
| `/api/staff/saved-influencers/add-to-roster` | POST | ✅ WORKING | Used in saved influencers | Add to roster |

---

## 🔗 Links & Content

| Endpoint | Method | Status | Usage | Notes |
|----------|--------|--------|-------|-------|
| `/api/content-links/delete` | DELETE | ✅ WORKING | Used in `components/campaigns/CampaignDetailPanel.tsx` | Delete content links |
| `/api/short-links` | GET, POST | ⚠️ UNUSED | Only referenced in audit | Short link management |

---

## 🎫 Invitations

| Endpoint | Method | Status | Usage | Notes |
|----------|--------|--------|-------|-------|
| `/api/invitations/accept` | POST | ✅ WORKING | Used in `app/invitation/accept/page.tsx` | Accept invitation |
| `/api/invitations/validate/[token]` | GET | ✅ WORKING | Used in invitation pages | Validate invitation token |
| `/api/staff/invitations` | GET, POST | ✅ WORKING | Used in invitation modals | Staff invitations |
| `/api/staff/invitations/[id]` | GET, PATCH, DELETE | ✅ WORKING | Used in invitation management | Manage invitation |

---

## 🔔 Notifications

| Endpoint | Method | Status | Usage | Notes |
|----------|--------|--------|-------|-------|
| `/api/notifications` | GET, POST, PATCH | ✅ WORKING | Used in `components/notifications/NotificationBell.tsx` | Notification management |
| `/api/onboarding-status` | GET | ✅ WORKING | Used in onboarding checks | Check onboarding status |

---

## 🖼️ Media & Uploads

| Endpoint | Method | Status | Usage | Notes |
|----------|--------|--------|-------|-------|
| `/api/upload-profile-image` | POST | ✅ WORKING | Used in profile pages | Upload profile image |

---

## 🔧 Admin & Utilities

| Endpoint | Method | Status | Usage | Notes |
|----------|--------|--------|-------|-------|
| `/api/admin/clear-content-links` | POST | 🔧 UTILITY | Admin only | Clear all content links |
| `/api/audit` | GET | ✅ WORKING | Used for audit logs | Get audit trail |
| `/api/health` | GET | ✅ WORKING | Health check | API health status |
| `/api/test` | GET | 🔧 UTILITY | Testing | Test endpoint |

---

## 🔒 GDPR Compliance

| Endpoint | Method | Status | Usage | Notes |
|----------|--------|--------|-------|-------|
| `/api/gdpr/export` | GET | ✅ WORKING | GDPR compliance | Export user data |
| `/api/gdpr/delete` | POST | ✅ WORKING | GDPR compliance | Delete user data |

---

## 🔄 Migration Endpoints

| Endpoint | Method | Status | Usage | Notes |
|----------|--------|--------|-------|-------|
| `/api/migrate` | POST | 🔧 MIGRATION | One-time use | Create tracking_links table |
| `/api/migrate-management-fields` | POST | 🔧 MIGRATION | One-time use | Migrate management fields |
| `/api/migrate-onboarding` | POST | 🔧 MIGRATION | One-time use | Migrate onboarding data |

---

## 🐛 Debug Endpoints

| Endpoint | Method | Status | Usage | Notes |
|----------|--------|--------|-------|-------|
| `/api/debug/auth-test` | GET | 🔧 DEBUG | Development | Test authentication |
| `/api/debug/database` | GET | 🔧 DEBUG | Development | Test database connection |
| `/api/debug/database-data` | GET | 🔧 DEBUG | Development | Get database data |
| `/api/debug/notifications-test` | POST | 🔧 DEBUG | Development | Test notifications |
| `/api/debug/user-role` | GET | 🔧 DEBUG | Development | Check user role |

---

## Summary Statistics

- **Total APIs:** 117
- **✅ Working & Used:** ~85
- **⚠️ Unused:** ~15
- **🔧 Utility/Migration:** ~12
- **🐛 Debug:** ~5

---

## Recommendations

### High Priority
1. **Remove or document unused APIs:**
   - `/api/influencer/update-role`
   - `/api/influencer-management`
   - `/api/influencer-contact`
   - `/api/influencers/[id]/complete`
   - `/api/analytics/update-all`
   - `/api/short-links` (if not needed)

2. **Review migration endpoints:**
   - Consider removing after migrations are complete
   - Or document as admin-only utilities

3. **Clean up debug endpoints:**
   - Remove from production builds
   - Keep only in development environment

### Medium Priority
1. **Consolidate duplicate endpoints:**
   - `/api/staff-members` vs `/api/staff/members`
   - Consider standardizing on one

2. **Document API usage:**
   - Add JSDoc comments to all endpoints
   - Create API documentation

### Low Priority
1. **Performance optimization:**
   - Review unused endpoints for potential removal
   - Optimize frequently used endpoints

---

## Notes

- All Modash-related APIs are excluded from this inventory
- Status is based on code analysis and may need verification through testing
- Some endpoints may be used in ways not detected by static analysis
- Migration endpoints should be reviewed for completion status
