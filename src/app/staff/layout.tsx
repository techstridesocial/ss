import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '../../lib/auth/roles'
import { UserRole } from '../../lib/auth/types'
import { StaffProtectedRoute } from '../../components/auth/ProtectedRoute'

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get current user and role
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  const userRole = await getCurrentUserRole()
  
  // Ensure only staff and admin can access staff routes
  if (!userRole || (userRole !== UserRole.STAFF && userRole !== UserRole.ADMIN)) {
    redirect('/unauthorized')
  }

  return (
    <StaffProtectedRoute>
      {children}
    </StaffProtectedRoute>
  )
}