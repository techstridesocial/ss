import { NextRequest as _NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

// GET /api/debug/auth-test - Test authentication and database connection
export async function GET(_request: NextRequest) {
  try {
    console.log('🔍 [DEBUG] Auth test endpoint called')
    
    // Test Clerk authentication
    const { userId: clerkId } = await auth()
    console.log('🔍 [DEBUG] Clerk userId:', clerkId)
    
    if (!clerkId) {
      return NextResponse.json({ 
        error: 'No Clerk authentication',
        authenticated: false 
      }, { status: 401 })
    }

    // Test database connection
    try {
      const { query } = await import('@/lib/db/connection')
      const testQuery = await query('SELECT NOW() as current_time')
      console.log('🔍 [DEBUG] Database connection test:', testQuery[0])
    } catch (dbError) {
      console.error('🔍 [DEBUG] Database connection failed:', dbError)
      return NextResponse.json({
        error: 'Database connection failed',
        authenticated: true,
        clerkId,
        dbError: dbError.message
      }, { status: 500 })
    }

    // Test user lookup
    try {
      const { getUserFromClerkId } = await import('@/lib/db/queries/users')
      const user = await getUserFromClerkId(clerkId)
      console.log('🔍 [DEBUG] User lookup result:', user)
      
      return NextResponse.json({
        success: true,
        authenticated: true,
        clerkId,
        user: user ? {
          id: user.id,
          email: user.email,
          role: user.role
        } : null,
        message: user ? 'User found in database' : 'User not found in database'
      })
    } catch (userError) {
      console.error('🔍 [DEBUG] User lookup failed:', userError)
      return NextResponse.json({
        error: 'User lookup failed',
        authenticated: true,
        clerkId,
        userError: userError.message
      }, { status: 500 })
    }

  } catch (error) {
    console.error('🔍 [DEBUG] Auth test error:', error)
    return NextResponse.json({ 
      error: 'Auth test failed',
      details: error.message 
    }, { status: 500 })
  }
}
