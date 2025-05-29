import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole, getRoleRedirectPath } from '../../lib/auth/roles'

// Force dynamic rendering since this route uses auth() and other dynamic functions
export const dynamic = 'force-dynamic'

export default async function DashboardRedirect() {
  try {
    const { userId, sessionClaims } = await auth()
    
    console.log('Dashboard: userId =', userId)
    console.log('Dashboard: sessionClaims =', sessionClaims)
    
    // If not authenticated, redirect to sign-in
    if (!userId) {
      console.log('Dashboard: No userId, redirecting to sign-in')
      redirect('/sign-in')
    }
    
    // Try to get user role with better error handling
    let userRole = null
    try {
      userRole = await getCurrentUserRole()
      console.log('Dashboard: userRole =', userRole)
    } catch (roleError) {
      console.error('Dashboard: Error getting user role:', roleError)
      // If getting role fails, try a fallback approach
      
      // Check if user has publicMetadata with role
      const publicMetadata = (sessionClaims as any)?.publicMetadata
      if (publicMetadata?.role) {
        userRole = publicMetadata.role
        console.log('Dashboard: Using role from publicMetadata:', userRole)
      } else {
        console.log('Dashboard: No role in publicMetadata, defaulting to staff')
        // Default to staff for now - you can change this default
        userRole = 'staff'
      }
    }
    
    if (userRole) {
      const redirectPath = getRoleRedirectPath(userRole)
      console.log('Dashboard: Redirecting to', redirectPath)
      redirect(redirectPath)
    }
    
    // If still no role found, provide options
    console.log('Dashboard: No role found, showing role selection')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome!</h1>
          <p className="text-gray-600 mb-6">Your account is set up. Please select your role to continue:</p>
          
          <div className="space-y-3">
            <a 
              href="/staff" 
              className="block w-full px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Staff Dashboard
            </a>
            <a 
              href="/brand" 
              className="block w-full px-6 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Brand Portal
            </a>
            <a 
              href="/influencer" 
              className="block w-full px-6 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Influencer Portal
            </a>
          </div>
          
          <p className="text-xs text-gray-500 mt-4">User ID: {userId}</p>
        </div>
      </div>
    )
    
  } catch (error) {
    console.error('Dashboard error:', error)
    
    // More specific error handling
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Issue</h1>
          <p className="text-gray-600 mb-4">
            There was a temporary issue with authentication. This usually resolves quickly.
          </p>
          <p className="text-sm text-gray-500 mb-6">Error: {errorMessage}</p>
          
          <div className="space-y-3">
            <a 
              href="/staff" 
              className="block w-full px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Go to Staff Dashboard
            </a>
            <a 
              href="/sign-in" 
              className="block w-full px-6 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Sign In Again
            </a>
          </div>
        </div>
      </div>
    )
  }
} 