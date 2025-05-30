import { NextResponse } from 'next/server'
import { modashService } from '../../../../lib/services/modash'

interface TestResult {
  status: 'pending' | 'success' | 'failed'
  data: any
  error: string | null
}

export async function GET() {
  console.log('🧪 Testing Modash API connection...')
  
  const results = {
    timestamp: new Date().toISOString(),
    environment: {
      hasApiKey: !!process.env.MODASH_API_KEY,
      apiKeyLength: process.env.MODASH_API_KEY?.length || 0,
      apiKeyPrefix: process.env.MODASH_API_KEY?.substring(0, 10) || 'NO_KEY',
      nodeEnv: process.env.NODE_ENV
    },
    tests: {
      creditUsage: { status: 'pending', data: null, error: null } as TestResult,
      basicSearch: { status: 'pending', data: null, error: null } as TestResult
    }
  }

  // Test 1: Credit Usage
  try {
    console.log('📊 Test 1: Fetching credit usage...')
    const credits = await modashService.getCreditUsage()
    results.tests.creditUsage = {
      status: 'success',
      data: credits,
      error: null
    }
    console.log('✅ Credit usage test passed:', credits)
  } catch (error) {
    console.error('❌ Credit usage test failed:', error)
    results.tests.creditUsage = {
      status: 'failed',
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }

  // Test 2: Basic Search (minimal filters)
  try {
    console.log('🔍 Test 2: Basic Instagram search...')
    const searchResults = await modashService.searchDiscovery({
      platform: 'instagram',
      followers: { min: 10000, max: 50000 }
    }, 0, 5)
    
    results.tests.basicSearch = {
      status: 'success',
      data: {
        totalResults: searchResults.total,
        returnedResults: searchResults.results.length,
        hasMore: searchResults.hasMore,
        creditsUsed: searchResults.creditsUsed,
        sampleResult: searchResults.results[0] || null
      },
      error: null
    }
    console.log('✅ Basic search test passed:', results.tests.basicSearch.data)
  } catch (error) {
    console.error('❌ Basic search test failed:', error)
    results.tests.basicSearch = {
      status: 'failed',
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }

  // Overall status
  const allTestsPassed = Object.values(results.tests).every(test => test.status === 'success')
  
  return NextResponse.json({
    success: allTestsPassed,
    message: allTestsPassed 
      ? '✅ All Modash API tests passed!' 
      : '⚠️ Some Modash API tests failed. Check the results below.',
    results
  }, { 
    status: allTestsPassed ? 200 : 500 
  })
}

export async function POST() {
  // Test specific platform search
  try {
    const platforms = ['instagram', 'tiktok', 'youtube'] as const
    const results: Record<string, any> = {}

    for (const platform of platforms) {
      console.log(`🔍 Testing ${platform} search...`)
      
      try {
        const searchResults = await modashService.searchDiscovery({
          platform,
          followers: { min: 5000 }
        }, 0, 3)
        
        results[platform] = {
          success: true,
          total: searchResults.total,
          results: searchResults.results.length,
          endpoint: `/${platform}/search`
        }
      } catch (error) {
        results[platform] = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          endpoint: `/${platform}/search`
        }
      }
    }

    return NextResponse.json({
      success: true,
      platforms: results,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 