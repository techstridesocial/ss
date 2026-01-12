import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { getAllInvoices, getInvoiceStats, InvoiceFilters } from '@/lib/db/queries/invoices'

// GET - Get all invoices with filters
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = await getCurrentUserRole()
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse filters from query params
    const searchParams = request.nextUrl.searchParams
    const filters: InvoiceFilters = {}

    const status = searchParams.get('status')
    if (status) {
      if (status.includes(',')) {
        filters.status = status.split(',') as InvoiceFilters['status']
      } else {
        filters.status = status as InvoiceFilters['status']
      }
    }

    const influencerId = searchParams.get('influencerId')
    if (influencerId) filters.influencerId = influencerId

    const campaignId = searchParams.get('campaignId')
    if (campaignId) filters.campaignId = campaignId

    const search = searchParams.get('search')
    if (search) filters.search = search

    const dateFrom = searchParams.get('dateFrom')
    if (dateFrom) filters.dateFrom = dateFrom

    const dateTo = searchParams.get('dateTo')
    if (dateTo) filters.dateTo = dateTo

    // Get invoices and stats
    const [invoices, stats] = await Promise.all([
      getAllInvoices(filters),
      getInvoiceStats()
    ])

    return NextResponse.json({
      success: true,
      invoices,
      stats,
      total: invoices.length
    })
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}
