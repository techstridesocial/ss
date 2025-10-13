import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getUserFromClerkId } from '@/lib/db/queries/users'

// GET /api/auth/current-user - Get current user's database ID
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()

    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserFromClerkId(clerkId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      userId: user.id,
      email: user.email,
      role: user.role
    })
  } catch (error) {
    console.error('Error fetching current user:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}
