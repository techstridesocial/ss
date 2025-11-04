import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'

// GET /api/debug/notifications-test - Test notifications endpoint
export async function GET(_request: NextRequest) {
  try {
    console.log('🔍 [DEBUG] Notifications test endpoint called')
    
    // Test Clerk authentication
    const { userId } = await auth()
    console.log('🔍 [DEBUG] Clerk userId:', userId)
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'No Clerk authentication',
        authenticated: false 
      }, { status: 401 })
    }

    // Test role check
    try {
      const userRole = await getCurrentUserRole()
      console.log('🔍 [DEBUG] User role:', userRole)
      
      if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
        return NextResponse.json({
          error: 'Insufficient permissions',
          authenticated: true,
          userId,
          role: userRole,
          required: 'STAFF or ADMIN'
        }, { status: 403 })
      }

      return NextResponse.json({
        success: true,
        authenticated: true,
        userId,
        role: userRole,
        message: 'User has sufficient permissions for notifications'
      })
    } catch (roleError) {
      console.error('🔍 [DEBUG] Role check failed:', roleError)
      return NextResponse.json({
        error: 'Role check failed',
        authenticated: true,
        userId,
        roleError: roleError.message
      }, { status: 500 })
    }

  } catch (error) {
    console.error('🔍 [DEBUG] Notifications test error:', error)
    return NextResponse.json({ 
      error: 'Notifications test failed',
      details: error.message 
    }, { status: 500 })
  }
}
