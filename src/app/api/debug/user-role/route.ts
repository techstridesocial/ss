import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'Not authenticated', 
        userId: null,
        user: null 
      })
    }

    const user = await currentUser()
    
    return NextResponse.json({
      userId,
      email: user?.emailAddresses[0]?.emailAddress,
      firstName: user?.firstName,
      lastName: user?.lastName,
      role: user?.publicMetadata?.role,
      publicMetadata: user?.publicMetadata,
      allEmails: user?.emailAddresses?.map(email => email.emailAddress)
    })
    
  } catch (error) {
    console.error('Debug user role error:', error)
    return NextResponse.json({
      error: 'Failed to get user info',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 