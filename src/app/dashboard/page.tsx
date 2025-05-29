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
    
    // Get user role and redirect to appropriate dashboard
    const userRole = await getCurrentUserRole()
    console.log('Dashboard: userRole =', userRole)
    
    if (userRole) {
      const redirectPath = getRoleRedirectPath(userRole)
      console.log('Dashboard: Redirecting to', redirectPath)
      redirect(redirectPath)
    }
    
    // If no role found, show a simple page instead of redirecting
    console.log('Dashboard: No role found, showing default page')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Setting up your account...</h1>
          <p className="text-gray-600 mb-4">Your account role is being configured.</p>
          <p className="text-sm text-gray-500">User ID: {userId}</p>
          <div className="mt-4">
            <a 
              href="/staff" 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Staff Dashboard
            </a>
          </div>
        </div>
      </div>
    )
    
  } catch (error) {
    console.error('Dashboard error:', error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
          <p className="text-gray-600 mb-4">There was an issue with your authentication.</p>
          <a 
            href="/sign-in" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Sign In Again
          </a>
        </div>
      </div>
    )
  }
} 