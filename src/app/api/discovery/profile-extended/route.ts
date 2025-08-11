import { NextResponse } from 'next/server'
import { listHashtags, listPartnerships, listTopics, listInterests, listLanguages } from '../../../../lib/services/modash'

// Environment and feature flags
const enableMockData = process.env.NEXT_PUBLIC_ALLOW_MOCKS === 'true'
// Note: Never set NEXT_PUBLIC_ALLOW_MOCKS in .env - this ensures no mock data ever

// Cache configuration
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours
const extendedCache = new Map<string, { data: any, timestamp: number }>()

/**
 * Extended Profile Data Endpoint
 * 
 * This endpoint provides additional contextual data for influencer profiles
 * after the core profile has been loaded. This prevents the main profile
 * endpoint from being slow due to parallel API calls.
 * 
 * Fetches:
 * - Hashtag analysis
 * - Brand partnerships 
 * - Content topics
 * - Audience interests
 * - Language breakdown
 * - Audience overlap
 */
export async function POST(request: Request) {
  try {
    const { userId, platform, sections } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log('🔍 Extended profile request:', { userId, platform, sections })

    // Check cache first
    const cacheKey = `extended-${userId}-${platform}-${sections?.join(',') || 'all'}`
    const cached = extendedCache.get(cacheKey)
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      console.log('💾 Using cached extended data for:', cacheKey)
      return NextResponse.json({
        success: true,
        data: { ...cached.data, fromCache: true }
      })
    }

    const requestedSections = sections || ['hashtags', 'partnerships', 'topics', 'interests', 'languages', 'overlap']
    const extendedData: any = {}

    // Only fetch requested sections to reduce API calls
    const promises = []
    
    if (requestedSections.includes('hashtags')) {
      promises.push(
        listHashtags(userId, 10)
          .then(result => ({ section: 'hashtags', data: result }))
          .catch(error => ({ section: 'hashtags', error }))
      )
    }

    if (requestedSections.includes('partnerships')) {
      promises.push(
        listPartnerships(userId, 10)
          .then(result => ({ section: 'partnerships', data: result }))
          .catch(error => ({ section: 'partnerships', error }))
      )
    }

    if (requestedSections.includes('topics')) {
      promises.push(
        listTopics(userId, 10)
          .then(result => ({ section: 'topics', data: result }))
          .catch(error => ({ section: 'topics', error }))
      )
    }

    if (requestedSections.includes('interests')) {
      promises.push(
        listInterests(userId, 10)
          .then(result => ({ section: 'interests', data: result }))
          .catch(error => ({ section: 'interests', error }))
      )
    }

    if (requestedSections.includes('languages')) {
      promises.push(
        listLanguages(userId, 10)
          .then(result => ({ section: 'languages', data: result }))
          .catch(error => ({ section: 'languages', error }))
      )
    }

    // Wait for all requested sections
    const results = await Promise.allSettled(promises)
    
    // Process results
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        const { section, data, error } = result.value
        if (data && !error) {
          extendedData[section] = {
            value: data,
            confidence: 'medium',
            source: 'modash',
            lastUpdated: new Date().toISOString()
          }
        } else {
          console.warn(`⚠️ Failed to fetch ${section} from Modash:`, error)
          extendedData[section] = {
            value: [],
            confidence: 'low',
            source: 'modash',
            lastUpdated: new Date().toISOString()
          }
        }
      }
    })

    // No mock data - only real Modash data used
    console.log('🏭 Extended profile using only real Modash data (no simulations)')

    const finalData = {
      ...extendedData,
      metadata: {
        lastUpdated: new Date().toISOString(),
        sectionsRequested: requestedSections,
        includesSimulatedData: false,  // Never includes simulated data
        dataSource: 'modash',          // All data from Modash APIs
        cacheValidUntil: new Date(Date.now() + CACHE_DURATION).toISOString()
      }
    }

    // Cache the result
    extendedCache.set(cacheKey, { data: finalData, timestamp: Date.now() })

    return NextResponse.json({
      success: true,
      data: { ...finalData, fromCache: false }
    })

  } catch (error) {
    console.error('❌ Extended profile API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to get mock data for testing
function getMockData(section: string): any {
  const mockData: { [key: string]: any } = {
    hashtags: ['fitness', 'workout', 'health', 'motivation', 'lifestyle'],
    partnerships: [
      { name: 'Nike', count: 5 },
      { name: 'Adidas', count: 3 },
      { name: 'Under Armour', count: 2 }
    ],
    topics: ['Sports', 'Fitness', 'Lifestyle', 'Fashion', 'Travel'],
    interests: ['Sports', 'Fashion', 'Fitness', 'Technology', 'Travel', 'Food'],
    languages: ['English', 'Spanish', 'Portuguese', 'Italian'],
    overlap: []
  }
  
  return mockData[section] || []
}