import { redirect } from 'next/navigation'

// Brand root route should always redirect to campaigns
// This ensures that any brand user who lands on /brand is immediately redirected to /brand/campaigns
export default async function BrandPage() {
  // Absolute redirect - no conditions, no exceptions
  redirect('/brand/campaigns')
}
