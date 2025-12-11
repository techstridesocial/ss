# Campaign ID Implementation

## Overview
Added manual Campaign ID input functionality to the campaign details component, allowing staff to input and update campaign IDs for external tracking.

## Changes Made

### 1. Database Schema
- **File**: `scripts/add-campaign-id-field.sql`
- **Changes**: Added `campaign_id` VARCHAR(100) field to campaigns table
- **Features**: 
  - Unique constraint to prevent duplicates
  - Index for better query performance
  - Auto-populates existing campaigns with UUID prefix

### 2. Type Definitions
- **File**: `src/types/index.ts`
- **Changes**: Added `campaignId?: string` to Campaign interface
- **Purpose**: Type safety for the new field

### 3. Database Queries
- **File**: `src/lib/db/queries/campaigns.ts`
- **Changes**: 
  - Updated `getAllCampaigns()` to include `campaign_id` field
  - Updated `getCampaignById()` to include `campaign_id` field
  - Updated `updateCampaign()` to support `campaignId` updates

### 4. Campaign Details Component
- **File**: `src/components/campaigns/CampaignDetailPanel.tsx`
- **Changes**:
  - Added `CampaignIdField` component for manual ID input
  - Added `handleCampaignIdUpdate` function for API calls
  - Integrated field into campaign details display (second row)

## Features

### CampaignIdField Component
- **Inline Editing**: Click to edit, save/cancel buttons
- **Visual Feedback**: Shows current ID or "No ID set" placeholder
- **Loading States**: Disabled inputs during save operations
- **UUID Display**: Shows truncated UUID for reference
- **Error Handling**: User-friendly error messages

### API Integration
- **Endpoint**: `PUT /api/campaigns/[id]`
- **Payload**: `{ campaignId: string }`
- **Authentication**: Uses Clerk token for security
- **Response**: Updates campaign in Neon database

## Usage

1. **View Campaign**: Open any campaign from the campaigns page
2. **Edit ID**: Click the edit button next to "Campaign ID" field
3. **Enter ID**: Type the desired campaign ID
4. **Save**: Click "Save" to update the database
5. **Cancel**: Click "Cancel" to discard changes

## Database Migration

To apply the database changes, run:
```bash
node scripts/run-campaign-id-migration.js
```

Or manually execute the SQL in `scripts/add-campaign-id-field.sql` against your Neon database.

## Technical Details

- **Field Type**: VARCHAR(100) with unique constraint
- **Default Value**: Auto-generated from UUID prefix for existing campaigns
- **Index**: Created for optimal query performance
- **Validation**: Client-side and server-side validation
- **Error Handling**: Comprehensive error handling with user feedback

## Future Enhancements

- Bulk campaign ID updates
- Campaign ID validation rules
- Export functionality with campaign IDs
- Search/filter by campaign ID
- Campaign ID history tracking
