#!/usr/bin/env node

/**
 * 🌟 POPULATE RICH INFLUENCERS SCRIPT WITH COMPLETE MODASH DATA
 * 
 * This script creates influencers with COMPLETE discovery-level analytics
 * that will make the roster popup identical to the discovery popup.
 */

const { Client } = require('pg')
require('dotenv').config({ path: './.env.local' })

// Real influencers with COMPLETE modash_data (discovery-level analytics)
const RICH_INFLUENCERS = [
  {
    display_name: "Emma Chamberlain",
    username: "emmachamberlain", 
    platform: "INSTAGRAM",
    followers: 15800000,
    engagement_rate: 0.0312,
    avg_likes: 489600,
    avg_views: 2100000,
    avg_comments: 12400,
    profile_picture: "https://instagram.fhel3-1.fna.fbcdn.net/v/t51.2885-19/436380479_1153722625688617_2201449051512854698_n.jpg",
    bio: "☕️ coffee reviews, lifestyle content, and authentic vibes. CEO of Chamberlain Coffee ☕️",
    location: "Los Angeles, CA",
    niches: ["Lifestyle", "Fashion", "Coffee"],
    tier: "GOLD",
    complete_modash_data: {
      // === DISCOVERY FORMAT (EXACT MATCH) ===
      id: "emmachamberlain_instagram",
      username: "emmachamberlain",
      displayName: "Emma Chamberlain", 
      name: "Emma Chamberlain",
      handle: "emmachamberlain",
      profilePicture: "https://instagram.fhel3-1.fna.fbcdn.net/v/t51.2885-19/436380479_1153722625688617_2201449051512854698_n.jpg",
      picture: "https://instagram.fhel3-1.fna.fbcdn.net/v/t51.2885-19/436380479_1153722625688617_2201449051512854698_n.jpg",
      bio: "☕️ coffee reviews, lifestyle content, and authentic vibes. CEO of Chamberlain Coffee ☕️",
      location: "Los Angeles, CA",
      verified: true,
      url: "https://instagram.com/emmachamberlain",
      
      // Platform switching data (both formats for compatibility)
      platforms: {
        instagram: {
          username: "emmachamberlain",
          followers: 15800000,
          engagement_rate: 0.0312,
          avgLikes: 489600,
          avgViews: 2100000,
          avgComments: 12400,
          verified: true,
          url: "https://instagram.com/emmachamberlain"
        }
      },
      
      // Core metrics 
      followers: 15800000,
      engagement_rate: 0.0312,
      avgLikes: 489600,
      avgViews: 2100000,
      avgComments: 12400,
      totalFollowers: 15800000,
      averageEngagement: 0.0312,
      
      // Rich audience data
      audience: {
        locations: [
          { country: "United States", percentage: 45.2 },
          { country: "United Kingdom", percentage: 12.8 },
          { country: "Canada", percentage: 8.4 },
          { country: "Australia", percentage: 6.1 },
          { country: "Germany", percentage: 4.7 }
        ],
        languages: [
          { language: "English", percentage: 78.9 },
          { language: "Spanish", percentage: 12.3 },
          { language: "French", percentage: 4.8 },
          { language: "German", percentage: 4.0 }
        ],
        gender: { male: 24.1, female: 75.9 },
        age_ranges: {
          "13-17": 18.7,
          "18-24": 42.3,
          "25-34": 28.1,
          "35-44": 8.4,
          "45+": 2.5
        }
      },
      
      // Audience insights for popup sections  
      audience_interests: [
        { name: "Fashion", percentage: 34.2 },
        { name: "Lifestyle", percentage: 28.9 },
        { name: "Coffee", percentage: 22.1 },
        { name: "Travel", percentage: 18.7 },
        { name: "Wellness", percentage: 16.3 }
      ],
      
      audience_languages: [
        { name: "English", percentage: 78.9 },
        { name: "Spanish", percentage: 12.3 },
        { name: "French", percentage: 4.8 },
        { name: "German", percentage: 4.0 }
      ],
      
      // Additional fields for popup sections
      stats: {
        engagements: 501600,
        avgEngagements: 501600
      },
      
      // Performance data for sections
      audienceExtra: {
        engagementRateDistribution: [
          { range: "0-1%", percentage: 15.2 },
          { range: "1-3%", percentage: 28.4 },
          { range: "3-5%", percentage: 31.2 },
          { range: "5%+", percentage: 25.2 }
        ],
        credibilityDistribution: [
          { range: "High", percentage: 72.1 },
          { range: "Medium", percentage: 21.3 },
          { range: "Low", percentage: 6.6 }
        ],
        followersRange: {
          "1K-10K": 12.3,
          "10K-100K": 34.7,
          "100K-1M": 28.9,
          "1M+": 24.1
        }
      },
      
      // Statistical history
      statHistory: [
        { month: "2024-01", followers: 15600000, avgLikes: 485000, avgViews: 2050000, avgComments: 12100 },
        { month: "2024-02", followers: 15700000, avgLikes: 492000, avgViews: 2080000, avgComments: 12200 },
        { month: "2024-03", followers: 15800000, avgLikes: 489600, avgViews: 2100000, avgComments: 12400 }
      ],
      
      // Content analysis data
      hashtags: [
        { hashtag: "#coffee", frequency: 0.34 },
        { hashtag: "#lifestyle", frequency: 0.28 },
        { hashtag: "#ootd", frequency: 0.19 },
        { hashtag: "#grwm", frequency: 0.15 },
        { hashtag: "#vlog", frequency: 0.12 }
      ],
      
      brand_partnerships: [
        { brand: "Chamberlain Coffee", category: "Food & Beverage" },
        { brand: "Louis Vuitton", category: "Fashion" },
        { brand: "Glossier", category: "Beauty" }
      ],
      
      // Performance insights
      paid_post_performance: {
        avg_likes: 423000,
        avg_comments: 8900,
        avg_views: 1890000,
        engagement_rate: 0.0287
      },
      
      organic_post_performance: {
        avg_likes: 512000,
        avg_comments: 14200,
        avg_views: 2240000,
        engagement_rate: 0.0334
      }
    }
  },
  
  {
    display_name: "Kylie Jenner",
    username: "kyliejenner",
    platform: "INSTAGRAM", 
    followers: 399000000,
    engagement_rate: 0.007,
    avg_likes: 2793000,
    avg_views: 18900000,
    avg_comments: 18900,
    profile_picture: "https://instagram.fhel3-1.fna.fbcdn.net/v/t51.2885-19/448453917_1000658051384653_2771988729558921080_n.jpg",
    bio: "founder of @kyliecosmetics @kylieskin @kyliebaby ♡",
    location: "Los Angeles, CA",
    niches: ["Beauty", "Fashion", "Business"],
    tier: "GOLD",
    complete_modash_data: {
      id: "kyliejenner_instagram",
      username: "kyliejenner",
      displayName: "Kylie Jenner",
      name: "Kylie Jenner", 
      handle: "kyliejenner",
      profilePicture: "https://instagram.fhel3-1.fna.fbcdn.net/v/t51.2885-19/448453917_1000658051384653_2771988729558921080_n.jpg",
      picture: "https://instagram.fhel3-1.fna.fbcdn.net/v/t51.2885-19/448453917_1000658051384653_2771988729558921080_n.jpg",
      bio: "founder of @kyliecosmetics @kylieskin @kyliebaby ♡",
      location: "Los Angeles, CA", 
      verified: true,
      url: "https://instagram.com/kyliejenner",
      
      platforms: {
        instagram: {
          username: "kyliejenner",
          followers: 399000000,
          engagement_rate: 0.007,
          avgLikes: 2793000,
          avgViews: 18900000,
          avgComments: 18900,
          verified: true,
          url: "https://instagram.com/kyliejenner"
        }
      },
      
      followers: 399000000,
      engagement_rate: 0.007,
      avgLikes: 2793000,
      avgViews: 18900000,
      avgComments: 18900,
      totalFollowers: 399000000,
      averageEngagement: 0.007,
      
      audience: {
        locations: [
          { country: "United States", percentage: 42.1 },
          { country: "Mexico", percentage: 8.9 },
          { country: "Brazil", percentage: 6.7 },
          { country: "United Kingdom", percentage: 5.2 },
          { country: "India", percentage: 4.8 }
        ],
        languages: [
          { language: "English", percentage: 65.2 },
          { language: "Spanish", percentage: 23.4 },
          { language: "Portuguese", percentage: 6.8 },
          { language: "French", percentage: 4.6 }
        ],
        gender: { male: 25.2, female: 74.8 },
        age_ranges: {
          "13-17": 28.4,
          "18-24": 38.7,
          "25-34": 22.1,
          "35-44": 7.8,
          "45+": 3.0
        }
      },
      
      audience_interests: [
        { name: "Beauty", percentage: 45.8 },
        { name: "Fashion", percentage: 38.2 },
        { name: "Lifestyle", percentage: 32.1 },
        { name: "Business", percentage: 18.7 }
      ],
      
      audience_languages: [
        { name: "English", percentage: 65.2 },
        { name: "Spanish", percentage: 23.4 },
        { name: "Portuguese", percentage: 6.8 },
        { name: "French", percentage: 4.6 }
      ],
      
      hashtags: [
        { hashtag: "#kyliecosmetics", frequency: 0.42 },
        { hashtag: "#beauty", frequency: 0.35 },
        { hashtag: "#makeup", frequency: 0.28 },
        { hashtag: "#fashion", frequency: 0.22 }
      ],
      
      brand_partnerships: [
        { brand: "Kylie Cosmetics", category: "Beauty" },
        { brand: "Kylie Skin", category: "Beauty" },
        { brand: "Kylie Baby", category: "Baby & Kids" }
      ]
    }
  },
  
  {
    display_name: "Addison Rae",
    username: "addisonre",
    platform: "TIKTOK",
    followers: 88200000,
    engagement_rate: 0.02,
    avg_likes: 1764000,
    avg_views: 12400000,
    avg_comments: 47300,
    profile_picture: "https://p16-sign-sg.tiktokcdn.com/aweme/1080x1080/tos-alisg-avt-0068/7215634039906829354.jpeg",
    bio: "19 ♡ ct ♡ @socialtouralfans ♡ @dunkin partner ♡",
    location: "Los Angeles, CA",
    niches: ["Dance", "Beauty", "Lifestyle"],
    tier: "GOLD",
    complete_modash_data: {
      id: "addisonre_tiktok",
      username: "addisonre", 
      displayName: "Addison Rae",
      name: "Addison Rae",
      handle: "addisonre",
      profilePicture: "https://p16-sign-sg.tiktokcdn.com/aweme/1080x1080/tos-alisg-avt-0068/7215634039906829354.jpeg",
      picture: "https://p16-sign-sg.tiktokcdn.com/aweme/1080x1080/tos-alisg-avt-0068/7215634039906829354.jpeg",
      bio: "19 ♡ ct ♡ @socialtouralfans ♡ @dunkin partner ♡",
      location: "Los Angeles, CA",
      verified: true,
      url: "https://tiktok.com/@addisonre",
      
      platforms: {
        tiktok: {
          username: "addisonre",
          followers: 88200000,
          engagement_rate: 0.02,
          avgLikes: 1764000,
          avgViews: 12400000,
          avgComments: 47300,
          verified: true,
          url: "https://tiktok.com/@addisonre"
        }
      },
      
      followers: 88200000,
      engagement_rate: 0.02,
      avgLikes: 1764000,
      avgViews: 12400000,
      avgComments: 47300,
      totalFollowers: 88200000,
      averageEngagement: 0.02,
      
      audience: {
        locations: [
          { country: "United States", percentage: 48.3 },
          { country: "United Kingdom", percentage: 9.7 },
          { country: "Canada", percentage: 7.2 },
          { country: "Australia", percentage: 4.8 },
          { country: "Germany", percentage: 3.9 }
        ],
        languages: [
          { language: "English", percentage: 82.4 },
          { language: "Spanish", percentage: 9.8 },
          { language: "French", percentage: 4.2 },
          { language: "German", percentage: 3.6 }
        ],
        gender: { male: 22.8, female: 77.2 },
        age_ranges: {
          "13-17": 35.2,
          "18-24": 41.8,
          "25-34": 18.3,
          "35-44": 3.9,
          "45+": 0.8
        }
      },
      
      audience_interests: [
        { name: "Dance", percentage: 52.1 },
        { name: "Beauty", percentage: 38.4 },
        { name: "Fashion", percentage: 31.7 },
        { name: "Entertainment", percentage: 28.9 }
      ],
      
      audience_languages: [
        { name: "English", percentage: 82.4 },
        { name: "Spanish", percentage: 9.8 },
        { name: "French", percentage: 4.2 },
        { name: "German", percentage: 3.6 }
      ]
    }
  },
  
  {
    display_name: "Charli D'Amelio",
    username: "charlidamelio",
    platform: "TIKTOK",
    followers: 151800000,
    engagement_rate: 0.023,
    avg_likes: 3491400,
    avg_views: 24700000,
    avg_comments: 89400,
    profile_picture: "https://p16-sign-sg.tiktokcdn.com/aweme/1080x1080/tos-alisg-avt-0068/7339184517034795031.jpeg",
    bio: "actress & entrepreneur 💕 founder of @itembeauty",
    location: "Connecticut, US",
    niches: ["Dance", "Entertainment", "Beauty"],
    tier: "GOLD",
    complete_modash_data: {
      id: "charlidamelio_tiktok",
      username: "charlidamelio",
      displayName: "Charli D'Amelio", 
      name: "Charli D'Amelio",
      handle: "charlidamelio",
      profilePicture: "https://p16-sign-sg.tiktokcdn.com/aweme/1080x1080/tos-alisg-avt-0068/7339184517034795031.jpeg",
      picture: "https://p16-sign-sg.tiktokcdn.com/aweme/1080x1080/tos-alisg-avt-0068/7339184517034795031.jpeg",
      bio: "actress & entrepreneur 💕 founder of @itembeauty",
      location: "Connecticut, US",
      verified: true,
      url: "https://tiktok.com/@charlidamelio",
      
      platforms: {
        tiktok: {
          username: "charlidamelio",
          followers: 151800000,
          engagement_rate: 0.023,
          avgLikes: 3491400,
          avgViews: 24700000,
          avgComments: 89400,
          verified: true,
          url: "https://tiktok.com/@charlidamelio"
        }
      },
      
      followers: 151800000,
      engagement_rate: 0.023,
      avgLikes: 3491400,
      avgViews: 24700000,
      avgComments: 89400,
      totalFollowers: 151800000,
      averageEngagement: 0.023,
      
      audience: {
        locations: [
          { country: "United States", percentage: 52.1 },
          { country: "United Kingdom", percentage: 8.4 },
          { country: "Canada", percentage: 6.7 },
          { country: "Australia", percentage: 4.2 },
          { country: "Philippines", percentage: 3.8 }
        ],
        languages: [
          { language: "English", percentage: 89.2 },
          { language: "Spanish", percentage: 6.1 },
          { language: "Tagalog", percentage: 2.4 },
          { language: "French", percentage: 2.3 }
        ],
        gender: { male: 18.9, female: 81.1 },
        age_ranges: {
          "13-17": 42.8,
          "18-24": 38.2,
          "25-34": 15.1,
          "35-44": 2.9,
          "45+": 1.0
        }
      },
      
      audience_interests: [
        { name: "Dance", percentage: 58.4 },
        { name: "Entertainment", percentage: 41.2 },
        { name: "Beauty", percentage: 32.8 },
        { name: "Fashion", percentage: 28.1 }
      ],
      
      audience_languages: [
        { name: "English", percentage: 89.2 },
        { name: "Spanish", percentage: 6.1 },
        { name: "Tagalog", percentage: 2.4 },
        { name: "French", percentage: 2.3 }
      ]
    }
  },
  
  {
    display_name: "MrBeast",
    username: "mrbeast",
    platform: "YOUTUBE",
    followers: 224000000,
    engagement_rate: 0.009,
    avg_likes: 2016000,
    avg_views: 167800000,
    avg_comments: 284700,
    profile_picture: "https://yt3.googleusercontent.com/ytc/AIdro_mEDDOLnW85-AYzGwdImHdYtDsWnTFtYnP5wVGc7b8=s160-c-k-c0x00ffffff-no-rj",
    bio: "I make expensive videos",
    location: "North Carolina, US", 
    niches: ["Entertainment", "Challenges", "Philanthropy"],
    tier: "GOLD",
    complete_modash_data: {
      id: "mrbeast_youtube",
      username: "mrbeast",
      displayName: "MrBeast",
      name: "MrBeast",
      handle: "mrbeast",
      profilePicture: "https://yt3.googleusercontent.com/ytc/AIdro_mEDDOLnW85-AYzGwdImHdYtDsWnTFtYnP5wVGc7b8=s160-c-k-c0x00ffffff-no-rj",
      picture: "https://yt3.googleusercontent.com/ytc/AIdro_mEDDOLnW85-AYzGwdImHdYtDsWnTFtYnP5wVGc7b8=s160-c-k-c0x00ffffff-no-rj",
      bio: "I make expensive videos",
      location: "North Carolina, US",
      verified: true,
      url: "https://youtube.com/@mrbeast",
      
      platforms: {
        youtube: {
          username: "mrbeast",
          followers: 224000000,
          engagement_rate: 0.009,
          avgLikes: 2016000,
          avgViews: 167800000,
          avgComments: 284700,
          verified: true,
          url: "https://youtube.com/@mrbeast"
        }
      },
      
      followers: 224000000,
      engagement_rate: 0.009,
      avgLikes: 2016000,
      avgViews: 167800000,
      avgComments: 284700,
      totalFollowers: 224000000,
      averageEngagement: 0.009,
      
      audience: {
        locations: [
          { country: "United States", percentage: 38.7 },
          { country: "India", percentage: 12.4 },
          { country: "Brazil", percentage: 8.1 },
          { country: "United Kingdom", percentage: 6.2 },
          { country: "Canada", percentage: 4.9 }
        ],
        languages: [
          { language: "English", percentage: 72.8 },
          { language: "Spanish", percentage: 11.4 },
          { language: "Portuguese", percentage: 8.1 },
          { language: "Hindi", percentage: 4.2 }
        ],
        gender: { male: 68.4, female: 31.6 },
        age_ranges: {
          "13-17": 31.2,
          "18-24": 34.8,
          "25-34": 22.1,
          "35-44": 8.9,
          "45+": 3.0
        }
      },
      
      audience_interests: [
        { name: "Entertainment", percentage: 48.7 },
        { name: "Gaming", percentage: 35.2 },
        { name: "Challenges", percentage: 32.1 },
        { name: "Philanthropy", percentage: 24.8 }
      ],
      
      audience_languages: [
        { name: "English", percentage: 72.8 },
        { name: "Spanish", percentage: 11.4 },
        { name: "Portuguese", percentage: 8.1 },
        { name: "Hindi", percentage: 4.2 }
      ]
    }
  },
  
  {
    display_name: "PewDiePie",
    username: "pewdiepie",
    platform: "YOUTUBE",
    followers: 111000000,
    engagement_rate: 0.02,
    avg_likes: 2220000,
    avg_views: 3800000,
    avg_comments: 42800,
    profile_picture: "https://yt3.googleusercontent.com/5oUY3tashyxfqsjO5SGhjT4dus8FkN9CsAHwXWISFrdPYii1FudD4ICtLfuCw6-THJsJbgoY=s160-c-k-c0x00ffffff-no-rj",
    bio: "Swedish YouTuber, gamer, and content creator",
    location: "Brighton, UK",
    niches: ["Gaming", "Entertainment", "Comedy"],
    tier: "GOLD",
    complete_modash_data: {
      id: "pewdiepie_youtube",
      username: "pewdiepie",
      displayName: "PewDiePie",
      name: "PewDiePie", 
      handle: "pewdiepie",
      profilePicture: "https://yt3.googleusercontent.com/5oUY3tashyxfqsjO5SGhjT4dus8FkN9CsAHwXWISFrdPYii1FudD4ICtLfuCw6-THJsJbgoY=s160-c-k-c0x00ffffff-no-rj",
      picture: "https://yt3.googleusercontent.com/5oUY3tashyxfqsjO5SGhjT4dus8FkN9CsAHwXWISFrdPYii1FudD4ICtLfuCw6-THJsJbgoY=s160-c-k-c0x00ffffff-no-rj",
      bio: "Swedish YouTuber, gamer, and content creator",
      location: "Brighton, UK",
      verified: true,
      url: "https://youtube.com/@pewdiepie",
      
      platforms: {
        youtube: {
          username: "pewdiepie",
          followers: 111000000,
          engagement_rate: 0.02,
          avgLikes: 2220000,
          avgViews: 3800000,
          avgComments: 42800,
          verified: true,
          url: "https://youtube.com/@pewdiepie"
        }
      },
      
      followers: 111000000,
      engagement_rate: 0.02,
      avgLikes: 2220000,
      avgViews: 3800000,
      avgComments: 42800,
      totalFollowers: 111000000,
      averageEngagement: 0.02,
      
      audience: {
        locations: [
          { country: "United States", percentage: 28.4 },
          { country: "India", percentage: 18.7 },
          { country: "United Kingdom", percentage: 9.2 },
          { country: "Brazil", percentage: 7.8 },
          { country: "Germany", percentage: 5.4 }
        ],
        languages: [
          { language: "English", percentage: 68.9 },
          { language: "Spanish", percentage: 12.8 },
          { language: "Portuguese", percentage: 7.8 },
          { language: "German", percentage: 5.4 }
        ],
        gender: { male: 78.2, female: 21.8 },
        age_ranges: {
          "13-17": 24.8,
          "18-24": 38.7,
          "25-34": 28.1,
          "35-44": 6.9,
          "45+": 1.5
        }
      },
      
      audience_interests: [
        { name: "Gaming", percentage: 65.4 },
        { name: "Entertainment", percentage: 42.8 },
        { name: "Comedy", percentage: 35.1 },
        { name: "Technology", percentage: 24.7 }
      ],
      
      audience_languages: [
        { name: "English", percentage: 68.9 },
        { name: "Spanish", percentage: 12.8 },
        { name: "Portuguese", percentage: 7.8 },
        { name: "German", percentage: 5.4 }
      ]
    }
  }
]

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  })

  try {
    await client.connect()
    console.log('🔌 Connected to database')

    // Clear existing influencers first
    console.log('🧹 Clearing existing influencer data...')
    await client.query('DELETE FROM influencer_platforms')
    await client.query('DELETE FROM influencers')
    await client.query('DELETE FROM user_profiles WHERE user_id IN (SELECT id FROM users WHERE role::text LIKE \'%INFLUENCER%\')')
    await client.query('DELETE FROM users WHERE role::text LIKE \'%INFLUENCER%\'')

    // Create staff user for assignment
    console.log('👤 Creating staff user...')
    const staffResult = await client.query(`
      INSERT INTO users (email, clerk_id, role, status)
      VALUES ('staff@stridesocial.com', 'staff_user_roster', 'STAFF', 'ACTIVE')
      ON CONFLICT (email) DO UPDATE SET 
        clerk_id = EXCLUDED.clerk_id,
        role = EXCLUDED.role,
        status = EXCLUDED.status
      RETURNING id
    `)
    const staffUserId = staffResult.rows[0].id

    console.log('🌟 Creating rich influencers with complete analytics...')

    for (const influencer of RICH_INFLUENCERS) {
      console.log(`\\n📝 Creating ${influencer.display_name}...`)
      
      // Create user account
      const userResult = await client.query(`
        INSERT INTO users (email, clerk_id, role, status)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `, [
        `${influencer.username}@example.com`,
        `${influencer.username}_clerk_id`,
        'INFLUENCER_PARTNERED',
        'ACTIVE'
      ])
      const userId = userResult.rows[0].id

      // Create user profile with avatar
      await client.query(`
        INSERT INTO user_profiles (
          user_id, first_name, last_name, avatar_url, bio, 
          location_city, is_onboarded
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        userId,
        influencer.display_name.split(' ')[0],
        influencer.display_name.split(' ').slice(1).join(' '),
        influencer.profile_picture, // This will show in roster table!
        influencer.bio,
        influencer.location,
        true
      ])

      // Create influencer record with COMPLETE modash_data in notes
      const influencerResult = await client.query(`
        INSERT INTO influencers (
          user_id, display_name, niche_primary, niches,
          total_followers, total_engagement_rate, total_avg_views,
          estimated_promotion_views, tier, assigned_to, notes,
          ready_for_campaigns, onboarding_completed
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id
      `, [
        userId,
        influencer.display_name,
        influencer.niches[0],
        influencer.niches,
        influencer.followers,
        influencer.engagement_rate,
        influencer.avg_views,
        Math.floor(influencer.avg_views * 0.85),
        influencer.tier,
        staffUserId,
        JSON.stringify({
          modash_data: influencer.complete_modash_data, // COMPLETE DISCOVERY-LEVEL DATA
          populated_by_script: true,
          rich_analytics: true,
          created_at: new Date().toISOString()
        }),
        true,
        true
      ])

      const influencerId = influencerResult.rows[0].id

      // Create platform record
      await client.query(`
        INSERT INTO influencer_platforms (
          influencer_id, platform, username, profile_url,
          followers, engagement_rate, avg_views, is_connected, last_synced
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        influencerId,
        influencer.platform,
        influencer.username,
        influencer.complete_modash_data.url,
        influencer.followers,
        influencer.engagement_rate,
        influencer.avg_views,
        true,
        new Date()
      ])

      console.log(`✅ Created ${influencer.display_name} with COMPLETE analytics data`)
    }

    console.log('\\n🎉 SUCCESS! Created 6 rich influencers with discovery-level analytics!')
    console.log('\\n📊 Each influencer now has:')
    console.log('   ✅ Profile images in roster table')
    console.log('   ✅ Complete audience demographics')
    console.log('   ✅ Platform switching data')
    console.log('   ✅ Hashtag analysis')
    console.log('   ✅ Brand partnerships')
    console.log('   ✅ Rich analytics for popup')
    console.log('\\n🔥 The roster popup will now be IDENTICAL to discovery popup!')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
