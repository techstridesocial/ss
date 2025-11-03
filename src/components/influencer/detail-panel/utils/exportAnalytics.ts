/**
 * Export Analytics Utilities
 * Functions to export influencer analytics data
 */

import { InfluencerData } from '../types'

/**
 * Export analytics as JSON file
 */
export function exportAsJSON(influencer: InfluencerData, platform: string) {
  const exportData = {
    influencer: {
      name: influencer.displayName || influencer.name,
      handle: influencer.handle,
      platform: platform,
      exportedAt: new Date().toISOString()
    },
    metrics: {
      followers: influencer.followers,
      engagement_rate: influencer.engagementRate || influencer.engagement_rate,
      avg_views: influencer.avgViews,
      avg_likes: influencer.avgLikes,
      avg_comments: influencer.avgComments
    },
    audience: influencer.audience,
    content_performance: influencer.content_performance,
    brand_partnerships: influencer.brand_partnerships,
    growth_trends: influencer.growth_trends,
    demographics: influencer.demographics,
    hashtags: influencer.relevant_hashtags,
    topics: influencer.content_topics
  }

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${influencer.handle}-${platform}-analytics-${Date.now()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export analytics as CSV file
 */
export function exportAsCSV(influencer: InfluencerData, platform: string) {
  const rows = [
    ['Metric', 'Value'],
    ['Name', influencer.displayName || influencer.name || ''],
    ['Handle', influencer.handle || ''],
    ['Platform', platform],
    ['Followers', influencer.followers?.toString() || '0'],
    ['Engagement Rate', `${((influencer.engagementRate || influencer.engagement_rate || 0) * 100).toFixed(2)}%`],
    ['Avg Views', influencer.avgViews?.toString() || '0'],
    ['Avg Likes', influencer.avgLikes?.toString() || '0'],
    ['Avg Comments', influencer.avgComments?.toString() || '0'],
    ['Post Count', influencer.postCount?.toString() || '0'],
    ['Fake Followers %', influencer.fake_followers_percentage?.toString() || 'N/A'],
    ['Exported At', new Date().toLocaleString()]
  ]

  const csvContent = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${influencer.handle}-${platform}-analytics-${Date.now()}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Copy analytics summary to clipboard
 */
export async function copyToClipboard(influencer: InfluencerData, platform: string) {
  const summary = `
📊 ${influencer.displayName || influencer.name} Analytics (${platform})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Handle: @${influencer.handle}
👥 Followers: ${influencer.followers?.toLocaleString()}
📈 Engagement Rate: ${((influencer.engagementRate || influencer.engagement_rate || 0) * 100).toFixed(2)}%
👁️ Avg Views: ${influencer.avgViews?.toLocaleString() || 'N/A'}
❤️ Avg Likes: ${influencer.avgLikes?.toLocaleString() || 'N/A'}
💬 Avg Comments: ${influencer.avgComments?.toLocaleString() || 'N/A'}
📝 Post Count: ${influencer.postCount || 'N/A'}
🤖 Fake Followers: ${influencer.fake_followers_percentage?.toFixed(1)}% ${influencer.fake_followers_percentage || 0 < 10 ? '✅' : influencer.fake_followers_percentage || 0 < 20 ? '⚠️' : '❌'}

Exported: ${new Date().toLocaleString()}
  `.trim()

  try {
    await navigator.clipboard.writeText(summary)
    return true
  } catch (error) {
    return false
  }
}

