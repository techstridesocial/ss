import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getUserInfo, getCreditUsage } from '@/lib/services/modash'

// GET - Check Modash API credits for both Discovery and Raw APIs
export async function GET(_request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('💳 Checking Modash API credits...')

    // Get detailed user info from Modash
    const userInfo = await getUserInfo()
    console.log('📊 Raw user info from Modash:', JSON.stringify(userInfo, null, 2))

    // Get processed credit usage
    const creditUsage = await getCreditUsage()
    console.log('💳 Processed credit usage:', creditUsage)

    // Extract billing information
    const billing = (userInfo as any)?.billing || {}
    const plan = billing?.plan || {}

    // Try to extract Discovery and Raw API credits separately
    const discoveryCredits = {
      limit: billing?.discoveryCredits?.limit || 
             plan?.discoveryCredits || 
             billing?.credits?.discovery || 
             0,
      used: billing?.discoveryCredits?.used || 
            billing?.usage?.discovery || 
            0,
      remaining: 0
    }
    discoveryCredits.remaining = Math.max(0, discoveryCredits.limit - discoveryCredits.used)

    const rawCredits = {
      limit: billing?.rawCredits?.limit || 
             plan?.rawCredits || 
             billing?.credits?.raw || 
             0,
      used: billing?.rawCredits?.used || 
            billing?.rawRequests || 
            billing?.usage?.raw || 
            0,
      remaining: 0
    }
    rawCredits.remaining = Math.max(0, rawCredits.limit - rawCredits.used)

    // Get general credit info
    const generalCredits = {
      limit: billing?.credits || 
             billing?.creditLimit || 
             plan?.credits || 
             0,
      used: billing?.requestsUsed || 
            billing?.usage?.total || 
            0,
      remaining: 0
    }
    generalCredits.remaining = Math.max(0, generalCredits.limit - generalCredits.used)

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      user: {
        email: (userInfo as any)?.email || 'N/A',
        plan: plan?.name || 'N/A',
        status: (userInfo as any)?.status || 'N/A'
      },
      credits: {
        discovery: discoveryCredits,
        raw: rawCredits,
        general: generalCredits
      },
      billing: {
        resetDate: billing?.resetAt || billing?.period?.resetAt || billing?.nextReset || 'N/A',
        period: billing?.period?.type || 'monthly'
      },
      rawBillingData: billing // Include raw data for debugging
    }

    console.log('✅ Credit check completed:', {
      discovery: `${discoveryCredits.used}/${discoveryCredits.limit} (${discoveryCredits.remaining} remaining)`,
      raw: `${rawCredits.used}/${rawCredits.limit} (${rawCredits.remaining} remaining)`,
      general: `${generalCredits.used}/${generalCredits.limit} (${generalCredits.remaining} remaining)`
    })

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Credit check error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to check credits',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
