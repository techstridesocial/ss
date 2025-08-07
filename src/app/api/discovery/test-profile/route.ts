import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  console.log('🧪 Test profile API called with real data simulation')
  
  // Simulate real influencer data that would come from a search result
  const testInfluencerData = {
    userId: "1643308660",
    username: "gomesfariasoficial", 
    followers: 50000,
    engagement_rate: 3.049,
    platform: "instagram",
    profile_picture: "https://example.com/profile.jpg",
    location: "Brazil",
    verified: true
  }

  console.log('🎯 Simulating searchResultData:', testInfluencerData)

  const realFollowers = testInfluencerData.followers
  const realEngagementRate = testInfluencerData.engagement_rate

  const enhancedData = {
    userId: testInfluencerData.userId,
    
    // Use real follower data
    followers: Number(realFollowers),
    
    // Use real engagement rate  
    engagementRate: realEngagementRate > 1 ? realEngagementRate / 100 : realEngagementRate,
    
    // Calculate realistic metrics from real data
    avgLikes: Math.round(realFollowers * (realEngagementRate / 100) * 0.7),
    avgComments: Math.round((realFollowers * (realEngagementRate / 100) * 0.7) * 0.05),
    avgShares: Math.round((realFollowers * (realEngagementRate / 100) * 0.7) * 0.01),
    
    // Enhanced metrics
    fake_followers_percentage: 0.057,
    fake_followers_quality: 'below_average',
    estimated_reach: Math.round(realFollowers * 0.4),
    estimated_impressions: Math.round(realFollowers * 0.4 * 1.5),
    
    // Growth trends
    growth_trends: {
      follower_growth: { 
        value: 2.3,
        trend: 'up',
        percentage: 2.3
      }
    },
    
    // Content performance
    content_performance: {
      reels: {
        avg_plays: Math.round(realFollowers * 0.8),
        engagement_rate: (realEngagementRate / 100) * 1.2,
        avg_likes: Math.round((realFollowers * (realEngagementRate / 100) * 0.7) * 1.3),
        avg_comments: Math.round((realFollowers * (realEngagementRate / 100) * 0.7) * 0.05 * 1.4),
        avg_shares: Math.round((realFollowers * (realEngagementRate / 100) * 0.7) * 0.01 * 2)
      },
      posts: {
        avg_likes: Math.round(realFollowers * (realEngagementRate / 100) * 0.7),
        avg_comments: Math.round((realFollowers * (realEngagementRate / 100) * 0.7) * 0.05),
        avg_shares: Math.round((realFollowers * (realEngagementRate / 100) * 0.7) * 0.01),
        engagement_rate: realEngagementRate / 100
      },
      stories: {
        estimated_reach: Math.round(realFollowers * 0.25),
        estimated_impressions: Math.round(realFollowers * 0.25 * 1.2)
      }
    },
    
    // Paid vs organic
    paid_vs_organic: {
      paid_engagement_rate: 0.017,
      organic_engagement_rate: 0.035,
      paid_performance_ratio: 0.54
    },
    
    // Audience data
    audience: {
      gender: {
        male: 45.2,
        female: 54.8
      },
      age_ranges: {
        "13-17": 8.5,
        "18-24": 32.1,
        "25-34": 28.7,
        "35-44": 19.4,
        "45-64": 11.3
      },
      locations: [
        { country: "Brazil", city: "São Paulo", percentage: 25.4 },
        { country: "Brazil", city: "Rio de Janeiro", percentage: 18.7 },
        { country: "Brazil", city: "Brasília", percentage: 12.3 }
      ],
      languages: [
        { language: "Portuguese", percentage: 78.3 },
        { language: "Spanish", percentage: 15.2 },
        { language: "English", percentage: 4.8 }
      ]
    }
  }

  console.log('✅ Generated enhanced data with real followers:', enhancedData.followers)

  return NextResponse.json({
    success: true,
    data: enhancedData
  })
}