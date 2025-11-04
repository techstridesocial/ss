import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { getAllContactRecords, createContactRecord, updateContactRecord } from '@/lib/db/queries/contact-tracking'

// GET - Get contact records for influencers
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const influencerId = searchParams.get('influencerId')
    const campaignId = searchParams.get('campaignId')
    const quotationId = searchParams.get('quotationId')

    let contactRecords = await getAllContactRecords()

    // Filter by influencer if specified
    if (influencerId) {
      contactRecords = contactRecords.filter(record => record.influencerId === influencerId)
    }

    // Filter by campaign if specified
    if (campaignId) {
      contactRecords = contactRecords.filter(record => record.campaignId === campaignId)
    }

    // Filter by quotation if specified
    if (quotationId) {
      contactRecords = contactRecords.filter(record => record.quotationId === quotationId)
    }

    return NextResponse.json({
      success: true,
      contactRecords
    })
  } catch (error) {
    console.error('Error fetching contact records:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contact records' },
      { status: 500 }
    )
  }
}

// POST - Create new contact record
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = await getCurrentUserRole()
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json({ 
        error: 'Only staff members can create contact records' 
      }, { status: 403 })
    }

    const data = await request.json()
    
    // Validate required fields
    const requiredFields = ['influencerId', 'contactType', 'subject', 'message']
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Create the contact record
    const contactData = {
      influencerId: data.influencerId,
      contactType: data.contactType,
      subject: data.subject,
      message: data.message,
      status: 'sent' as const,
      sentAt: new Date(),
      respondedAt: undefined,
      nextFollowUp: data.nextFollowUp,
      campaignId: data.campaignId,
      quotationId: data.quotationId,
      sentBy: userId,
      notes: data.notes,
      attachments: data.attachments || []
    }

    const contactRecord = await createContactRecord(contactData)
    
    return NextResponse.json({
      success: true,
      message: 'Contact record created successfully',
      contactRecord
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating contact record:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create contact record' },
      { status: 500 }
    )
  }
}

// PUT - Update contact record
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = await getCurrentUserRole()
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json({ 
        error: 'Only staff members can update contact records' 
      }, { status: 403 })
    }

    const data = await request.json()
    const { id, updates } = data

    if (!id) {
      return NextResponse.json({ 
        error: 'Contact record ID is required' 
      }, { status: 400 })
    }

    const updatedRecord = await updateContactRecord(id, updates)
    
    if (!updatedRecord) {
      return NextResponse.json({ 
        error: 'Contact record not found' 
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Contact record updated successfully',
      contactRecord: updatedRecord
    })
  } catch (error) {
    console.error('Error updating contact record:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update contact record' },
      { status: 500 }
    )
  }
} 