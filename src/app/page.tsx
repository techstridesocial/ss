import React from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole, getRoleRedirectPath } from '../lib/auth/roles'
import LoginSelection from '../components/auth/LoginSelection'

export default async function HomePage() {
  const { userId } = await auth()
  
  // If user is already logged in, redirect to their dashboard
  if (userId) {
    const userRole = await getCurrentUserRole()
    if (userRole) {
      const redirectPath = getRoleRedirectPath(userRole)
      redirect(redirectPath)
    }
  }
  
  // Show login selection screen
  return <LoginSelection />
}
