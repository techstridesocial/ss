import { NextRequest as _NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { Webhook } from 'svix'
import { query } from '@/lib/db/connection'
import { updateInvitationStatus, getInvitationByClerkId } from '@/lib/db/queries/invitations'

export async function POST(request: NextRequest) {
  try {
    // Get the webhook secret from environment
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('CLERK_WEBHOOK_SECRET not found')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    // Get headers
    const headerPayload = await headers()
    const svixId = headerPayload.get('svix-id')
    const svixTimestamp = headerPayload.get('svix-timestamp')
    const svixSignature = headerPayload.get('svix-signature')

    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error('Missing svix headers')
      return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
    }

    // Get the body
    const payload = await request.text()
    
    // Create a new Svix instance with your webhook secret
    const wh = new Webhook(webhookSecret)
    
    let evt: any
    try {
      evt = wh.verify(payload, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      })
    } catch (err) {
      console.error('Error verifying webhook:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle the webhook event
    const { type, data } = evt
    console.log(`Received Clerk webhook: ${type}`)

    // Store webhook event for processing
    await query(
      `INSERT INTO clerk_webhook_events (event_type, clerk_id, clerk_invitation_id, event_data)
       VALUES ($1, $2, $3, $4)`,
      [
        type,
        data.id || null,
        data.invitation_id || null,
        JSON.stringify(data)
      ]
    )

    // Process specific events
    switch (type) {
      case 'user.created':
        await handleUserCreated(data)
        break
      case 'user.updated':
        await handleUserUpdated(data)
        break
      case 'invitation.created':
        await handleInvitationCreated(data)
        break
      case 'invitation.accepted':
        await handleInvitationAccepted(data)
        break
      case 'invitation.revoked':
        await handleInvitationRevoked(data)
        break
      default:
        console.log(`Unhandled webhook event type: ${type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle user.created webhook
 */
async function handleUserCreated(data: any) {
  try {
    console.log('Processing user.created webhook:', data.id)
    
    // Since we're using custom invitations, we don't need to handle invitation status here
    // The invitation acceptance is handled in our custom API endpoint
    console.log(`User created: ${data.id}`)
  } catch (error) {
    console.error('Error handling user.created:', error)
  }
}

/**
 * Handle user.updated webhook
 */
async function handleUserUpdated(data: any) {
  try {
    console.log('Processing user.updated webhook:', data.id)
    // Add any user update logic here if needed
  } catch (error) {
    console.error('Error handling user.updated:', error)
  }
}

/**
 * Handle invitation.created webhook
 */
async function handleInvitationCreated(data: any) {
  try {
    console.log('Processing invitation.created webhook:', data.id)
    
    // Check if invitation already exists in our database
    const existingInvitation = await getInvitationByClerkId(data.id)
    if (!existingInvitation) {
      // This invitation was created outside our system, add it to tracking
      await query(
        `INSERT INTO user_invitations (
          clerk_invitation_id, email, role, status, invited_at, expires_at
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          data.id,
          data.email_address,
          data.public_metadata?.role || 'BRAND',
          'INVITED',
          new Date(data.created_at),
          new Date(data.expires_at)
        ]
      )
      
      console.log(`Added external invitation ${data.id} to tracking`)
    }
  } catch (error) {
    console.error('Error handling invitation.created:', error)
  }
}

/**
 * Handle invitation.accepted webhook
 */
async function handleInvitationAccepted(data: any) {
  try {
    console.log('Processing invitation.accepted webhook:', data.id)
    
    // Update invitation status
    await updateInvitationStatus(data.id, 'ACCEPTED', data.user_id, data.user_id)
    
    console.log(`Updated invitation ${data.id} to ACCEPTED`)
  } catch (error) {
    console.error('Error handling invitation.accepted:', error)
  }
}

/**
 * Handle invitation.revoked webhook
 */
async function handleInvitationRevoked(data: any) {
  try {
    console.log('Processing invitation.revoked webhook:', data.id)
    
    // Update invitation status
    await updateInvitationStatus(data.id, 'DECLINED')
    
    console.log(`Updated invitation ${data.id} to REVOKED`)
  } catch (error) {
    console.error('Error handling invitation.revoked:', error)
  }
}

