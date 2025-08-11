import { NextResponse } from 'next/server'
import { getProfileReport } from '../../../../lib/services/modash'

export async function POST(request: Request) {
  try {
    const { userId, platform } = await request.json()
    
    console.log('🔍 Modash Profile Request:', { userId, platform })
    
    // Get raw Modash data
    const modashResponse = await getProfileReport(userId, platform)
    
    if (!modashResponse?.profile) {
      throw new Error('No profile data returned from Modash')
    }
    
    // Extract the profile data directly from Modash
    const profile = modashResponse.profile?.profile || {}
    const audience = modashResponse.profile?.audience || {}
    
    console.log('✅ Raw Modash profile data:', {
      followers: profile.followers,
      engagementRate: profile.engagementRate,
      avgLikes: profile.avgLikes,
      avgComments: profile.avgComments,
      credibility: audience.credibility
    })
    
    // Return pure Modash data - no wrappers, no calculations
    return NextResponse.json({
      success: true,
      data: {
        // Core profile metrics from Modash
        userId: userId,
        username: profile.username,
        fullname: profile.fullname,
        followers: profile.followers,
        engagementRate: profile.engagementRate,
        avgLikes: profile.avgLikes,
        avgComments: profile.avgComments,
        picture: profile.picture,
        url: profile.url,
        
        // Audience data from Modash
        credibility: audience.credibility,
        fake_followers_percentage: audience.credibility ? (1 - audience.credibility) * 100 : null,
        
        // Audience demographics - structured for UI
        audience: {
          // Gender breakdown (convert Modash format to UI format)
          gender: audience.genders ? audience.genders.reduce((acc: any, g: any) => {
            acc[g.code.toLowerCase()] = g.weight * 100
            return acc
          }, {}) : null,
          
          // Age ranges (convert Modash format to UI format)
          age_ranges: audience.ages ? audience.ages.reduce((acc: any, age: any) => {
            acc[age.code] = age.weight * 100
            return acc
          }, {}) : null,
          
          // Location breakdown (convert Modash format to UI format)
          locations: audience.geoCountries ? audience.geoCountries.map((loc: any) => ({
            country: loc.name,
            percentage: loc.weight * 100
          })) : null,
          
          // Languages (convert Modash format to UI format)
          languages: audience.languages ? audience.languages.map((lang: any) => ({
            language: lang.name,
            percentage: lang.weight * 100
          })) : null
        },
        
        // Audience interests for specific UI sections
        audience_interests: audience.interests ? audience.interests.map((interest: any) => ({
          name: interest.name,
          percentage: interest.weight * 100
        })) : [],
        
        // Audience languages for specific UI sections
        audience_languages: audience.languages ? audience.languages.map((lang: any) => ({
          name: lang.name,
          percentage: lang.weight * 100
        })) : [],
        
        // Additional sections that can use main profile data
        relevant_hashtags: [], // Would need content analysis from Modash
        brand_partnerships: [], // Would need brand analysis from Modash  
        content_topics: audience.interests ? audience.interests.slice(0, 10).map((interest: any) => interest.name) : [], // Simple string array of topic names
        
        // Raw audience data for debugging
        genders: audience.genders,
        ages: audience.ages,
        geoCountries: audience.geoCountries,
        languages: audience.languages,
        interests: audience.interests,
        
        // Additional data for UI compatibility
        engagement_rate: profile.engagementRate, // Alias for UI
        avgShares: 0, // Not available in Modash
        estimated_reach: null, // Not calculated
        estimated_impressions: null // Not calculated
      },
      source: 'modash',
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('❌ Modash profile error:', error)
        return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
} 