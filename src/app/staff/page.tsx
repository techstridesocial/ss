import { redirect } from 'next/navigation'

// Staff root route should always redirect to roster
// This ensures that any staff user who lands on /staff is immediately redirected to /staff/roster
export default async function StaffPage() {
  // Absolute redirect - no conditions, no exceptions
  redirect('/staff/roster')
}