import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db/connection'
import { clerkClient } from '@clerk/nextjs/server'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { invitationId, firstName, lastName, password } = await request.json()

    if (!invitationId || !firstName || !lastName || !password) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 })
    }

    // Validate invitation
    const invitationResult = await query(
      `SELECT * FROM user_invitations 
       WHERE clerk_invitation_id = $1 AND status = 'INVITED'`,
      [invitationId]
    )

    if (invitationResult.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired invitation'
      }, { status: 404 })
    }

    const invitation = invitationResult[0]

    // Check if invitation is expired
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json({
        success: false,
        message: 'This invitation has expired'
      }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await query(
      `SELECT id FROM users WHERE email = $1`,
      [invitation.email]
    )

    if (existingUser.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'A user with this email already exists'
      }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user in our database
    const userResult = await query(
      `INSERT INTO users (
        email, 
        first_name, 
        last_name, 
        password_hash, 
        role, 
        status,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id, email, first_name, last_name, role`,
      [
        invitation.email,
        firstName,
        lastName,
        hashedPassword,
        invitation.role,
        'ACTIVE'
      ]
    )

    if (userResult.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Failed to create user account'
      }, { status: 500 })
    }

    const newUser = userResult[0]

    // Create Clerk user
    try {
      const clerkUser = await clerkClient().users.createUser({
        emailAddress: [invitation.email],
        firstName: firstName,
        lastName: lastName,
        password: password,
        publicMetadata: {
          role: invitation.role,
          userId: newUser.id
        }
      })

      // Update our user record with Clerk user ID
      await query(
        `UPDATE users SET clerk_id = $1 WHERE id = $2`,
        [clerkUser.id, newUser.id]
      )

      // Update invitation status
      await query(
        `UPDATE user_invitations 
         SET status = 'ACCEPTED', 
             accepted_at = NOW(),
             accepted_user_id = $1,
             clerk_id = $2
         WHERE clerk_invitation_id = $3`,
        [newUser.id, clerkUser.id, token]
      )

      return NextResponse.json({
        success: true,
        message: 'Account created successfully',
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          clerkUserId: clerkUser.id
        }
      })

    } catch (clerkError) {
      console.error('Clerk user creation failed:', clerkError)
      
      // Clean up our database user if Clerk creation failed
      await query(`DELETE FROM users WHERE id = $1`, [newUser.id])
      
      return NextResponse.json({
        success: false,
        message: 'Failed to create user account. Please try again.'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error accepting invitation:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to accept invitation'
    }, { status: 500 })
  }
}
