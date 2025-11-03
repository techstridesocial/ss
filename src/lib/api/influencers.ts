import { InfluencerDetailView } from '@/types/database'
import { getInfluencerById } from '@/lib/db/queries/influencers'

/**
 * Fetch detailed influencer data for the detail panel
 */
export async function fetchInfluencerDetails(influencerId: string): Promise<InfluencerDetailView> {
  try {
    const influencer = await getInfluencerById(influencerId)
    
    if (!influencer) {
      throw new Error('Influencer not found')
    }
    
    return influencer
  } catch (_error) {
    console.error('Error fetching influencer details:', error)
    throw error
  }
}

/**
 * Mock function to simulate fetching detailed influencer data (for development)
 * This will be removed when the database is fully set up
 */
export async function fetchInfluencerDetailsMock(influencerId: string): Promise<InfluencerDetailView> {
  // In real implementation, this would call your API or database
  // For now, return mock detailed data
  const mockInfluencer = {
    id: influencerId,
    user_id: 'user_1',
    display_name: 'Sarah Creator',
    niches: ['Lifestyle', 'Fashion'],
    total_followers: 125000,
    total_engagement_rate: 3.8,
    total_avg_views: 45000,
    estimated_promotion_views: 38250,
    price_per_post: 850,
    is_active: true,
    first_name: 'Sarah',
    last_name: 'Creator',
    avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
    location_country: 'United Kingdom',
    location_city: 'Birmingham',
    platforms: ['INSTAGRAM', 'TIKTOK'],
    platform_count: 2,
    
    // Additional required properties
    relationship_status: 'ACTIVE' as const,
    assigned_to: null,
    labels: [],
    notes: null,
    tier: 'GOLD' as const,
    priority_score: 7.5,
    last_contacted: null,
    bio: 'Lifestyle and fashion content creator passionate about sharing daily inspiration.',
    website_url: 'https://sarahcreator.com',
    email: 'hello@sarahcreator.com',
    content_type: 'STANDARD' as const,
    influencer_type: 'SIGNED' as const,
    
    // Detailed platform information
    platform_details: [
      {
        id: 'plat_1',
        influencer_id: influencerId,
        platform: 'INSTAGRAM' as const,
        username: 'sarah.creator',
        followers: 85000,
        following: 1200,
        engagement_rate: 4.2,
        avg_views: 35000,
        avg_likes: 3500,
        avg_comments: 180,
        last_post_date: new Date('2024-01-15'),
        profile_url: 'https://instagram.com/sarah.creator',
        is_verified: false,
        is_connected: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'plat_2',
        influencer_id: influencerId,
        platform: 'TIKTOK' as const,
        username: 'sarahcreates',
        followers: 40000,
        following: 500,
        engagement_rate: 3.4,
        avg_views: 10000,
        avg_likes: 1200,
        avg_comments: 85,
        last_post_date: new Date('2024-01-14'),
        profile_url: 'https://tiktok.com/@sarahcreates',
        is_verified: false,
        is_connected: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ],
    
    // Recent content
    recent_content: [
      {
        id: 'content_1',
        influencer_platform_id: 'plat_1',
        post_url: 'https://instagram.com/p/abc123',
        thumbnail_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=300&fit=crop',
        caption: 'Beautiful sunset at the beach! 🌅 #lifestyle #travel',
        views: 45000,
        likes: 4200,
        comments: 156,
        shares: 23,
        posted_at: new Date('2024-01-15'),
        created_at: new Date()
      },
      {
        id: 'content_2',
        influencer_platform_id: 'plat_1',
        post_url: 'https://instagram.com/p/def456',
        thumbnail_url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=300&h=300&fit=crop',
        caption: 'New outfit inspiration for spring! 🌸 #fashion #ootd',
        views: 38000,
        likes: 3800,
        comments: 142,
        shares: 31,
        posted_at: new Date('2024-01-12'),
        created_at: new Date()
      }
    ],
    
    // Demographics (aggregated)
    demographics: {
      id: 'demo_1',
      influencer_platform_id: 'plat_1',
      age_13_17: 5.2,
      age_18_24: 32.1,
      age_25_34: 28.7,
      age_35_44: 18.4,
      age_45_54: 12.1,
      age_55_plus: 3.5,
      gender_male: 45.3,
      gender_female: 52.2,
      gender_other: 2.5,
      updated_at: new Date()
    },
    
    // Audience locations
    audience_locations: [
      {
        id: 'loc_1',
        influencer_platform_id: 'plat_1',
        country_name: 'United Kingdom',
        country_code: 'GB',
        percentage: 65.2
      },
      {
        id: 'loc_2',
        influencer_platform_id: 'plat_1',
        country_name: 'United States',
        country_code: 'US',
        percentage: 18.7
      },
      {
        id: 'loc_3',
        influencer_platform_id: 'plat_1',
        country_name: 'Canada',
        country_code: 'CA',
        percentage: 8.1
      }
    ],
    
    // Audience languages
    audience_languages: [
      {
        id: 'lang_1',
        influencer_platform_id: 'plat_1',
        language_name: 'English',
        language_code: 'en',
        percentage: 85.4
      },
      {
        id: 'lang_2',
        influencer_platform_id: 'plat_1',
        language_name: 'Spanish',
        language_code: 'es',
        percentage: 8.2
      },
      {
        id: 'lang_3',
        influencer_platform_id: 'plat_1',
        language_name: 'French',
        language_code: 'fr',
        percentage: 6.4
      }
    ],
    
    // Campaign participation
    campaign_participation: []
  } as any as InfluencerDetailView
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  return mockInfluencer
} 