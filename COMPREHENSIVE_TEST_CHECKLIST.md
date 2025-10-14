# 🧪 Comprehensive System Test Checklist

## ✅ Database Schema Changes

### 1. Brand Assignment System
- [ ] `brands` table has `assigned_staff_id` column (UUID)
- [ ] Foreign key constraint to `users` table
- [ ] API endpoint: `PATCH /api/brands/[id]/assign`

### 2. Campaign Assignment System  
- [ ] `campaigns` table has `assigned_staff_id` column (UUID)
- [ ] Foreign key constraint to `users` table
- [ ] API endpoint: `PATCH /api/campaigns/[id]/assign`

### 3. Quotation Assignment System
- [ ] `quotations` table has `assigned_staff_id` column (UUID)
- [ ] Foreign key constraint to `users` table

### 4. Influencer Assignment System
- [ ] `influencers.assigned_to` column type changed to UUID
- [ ] Foreign key constraint to `users` table
- [ ] API endpoint: `PATCH /api/influencers/[id]` (supports assigned_to, labels, notes)

### 5. Notifications System
- [ ] `notifications` table created with proper schema
- [ ] API endpoint: `GET /api/notifications`
- [ ] Notification service functions created

## ✅ API Endpoints

### Authentication & Users
- [ ] `GET /api/auth/current-user` - Returns current user's database ID
- [ ] `GET /api/staff/members` - Returns list of staff members for dropdowns

### Assignment Endpoints
- [ ] `PATCH /api/brands/[id]/assign` - Assign staff to brand
- [ ] `PATCH /api/campaigns/[id]/assign` - Assign staff to campaign  
- [ ] `PATCH /api/influencers/[id]` - Update influencer assignment/management

### Notifications
- [ ] `GET /api/notifications` - Fetch user notifications
- [ ] `PATCH /api/notifications/[id]` - Mark notification as read

## ✅ Frontend Components

### Staff Dashboard - Brands Page (`/staff/brands`)
- [ ] "Assigned To" column in brands table
- [ ] Dropdown for assigning staff to brands
- [ ] "My Brands" filter functionality
- [ ] Assignment filter in filter panel

### Staff Dashboard - Campaigns Page (`/staff/campaigns`)
- [ ] "Assigned To" column in campaigns table
- [ ] Dropdown for assigning staff to campaigns
- [ ] "My Campaigns" filter functionality
- [ ] Assignment filter in filter panel

### Staff Dashboard - Roster Page (`/staff/roster`)
- [ ] "My Creators" tab functionality
- [ ] Edit management data modal (assigned_to, labels, notes)
- [ ] Filter by assigned staff member

### Notifications
- [ ] Notification bell icon in navigation
- [ ] Notification dropdown/panel
- [ ] Mark as read functionality
- [ ] Real-time notification updates

## ✅ Business Logic

### Assignment Workflow
- [ ] Staff can assign themselves or other staff to brands
- [ ] Staff can assign themselves or other staff to campaigns
- [ ] Staff can edit creator assignments (assigned_to, labels, notes)
- [ ] Notifications are created when assignments are made

### Filter Functionality
- [ ] "My Brands" shows only brands assigned to current user
- [ ] "My Creators" shows only creators assigned to current user
- [ ] "My Campaigns" shows only campaigns assigned to current user
- [ ] Assignment filters work in all relevant pages

### Quote Assignment System
- [ ] When brand submits quote, it goes to assigned staff member
- [ ] If no staff assigned to brand, quote goes to general pool
- [ ] Staff can see quotes assigned to them

## 🧪 Manual Testing Steps

### 1. Test Creator Assignment Editing
1. Go to `/staff/roster`
2. Click "My Creators" tab
3. Click on an influencer to open management panel
4. Try editing:
   - Assigned manager (dropdown)
   - Labels (add/remove)
   - Notes (text field)
5. Save and verify changes persist

### 2. Test Brand Assignment System
1. Go to `/staff/brands`
2. Find a brand in the table
3. Use the "Assigned To" dropdown to assign staff
4. Verify assignment is saved
5. Test "My Brands" filter
6. Check if notification was created

### 3. Test Campaign Assignment System
1. Go to `/staff/campaigns`
2. Find a campaign in the table
3. Use the "Assigned To" dropdown to assign staff
4. Verify assignment is saved
5. Test filter by assignment
6. Check if notification was created

### 4. Test Notifications System
1. Make some assignments (brands, campaigns, creators)
2. Check notification bell icon
3. Open notifications dropdown
4. Verify notifications appear
5. Mark notifications as read
6. Verify read status persists

### 5. Test Staff Dashboard Filters
1. Go to each staff page (`/staff/brands`, `/staff/campaigns`, `/staff/roster`)
2. Test "My X" filters
3. Verify only assigned items show up
4. Test assignment filters in filter panels

## 🔍 Key Files to Verify

### Database Migrations Applied
- `brands.assigned_staff_id` column exists
- `campaigns.assigned_staff_id` column exists  
- `quotations.assigned_staff_id` column exists
- `influencers.assigned_to` is UUID type
- `notifications` table exists

### API Endpoints Working
- All endpoints return proper HTTP status codes
- Authentication is enforced (401 for unauthenticated)
- Validation works (400 for invalid data)
- Success responses include proper data

### Frontend Components Render
- No console errors in browser
- Dropdowns populate with staff members
- Filters work correctly
- State updates properly after API calls

## ✅ Success Criteria

- [ ] All database schema changes are applied
- [ ] All API endpoints respond correctly
- [ ] Frontend components render without errors
- [ ] Assignment functionality works end-to-end
- [ ] Notifications system is functional
- [ ] Filter functionality works as expected
- [ ] No breaking changes to existing functionality

---

## 🚀 Quick Verification Commands

```bash
# Check if server is running
curl http://localhost:3000/api/health

# Test staff members endpoint
curl http://localhost:3000/api/staff/members

# Test authentication (should return 401)
curl http://localhost:3000/api/auth/current-user
```

## 📝 Notes

- All endpoints require proper authentication (Clerk JWT)
- Database changes are permanent and cannot be easily rolled back
- Frontend state management uses React hooks and context
- Notifications use real-time updates where possible
