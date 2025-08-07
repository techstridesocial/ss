// Utility functions for the influencer detail panel

/**
 * Format numbers for display (e.g., 1500 -> "1.5k", 1500000 -> "1.5M")
 */
export const formatNumber = (num: number | string | undefined): string => {
  if (num === undefined || num === null || num === '') return '0'
  const n = typeof num === 'string' ? parseFloat(num) : num
  if (isNaN(n)) return '0'
  if (n === 0) return '0'
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`
  return n.toLocaleString()
}

/**
 * Format percentage for display (e.g., 0.157 -> "15.7%")
 */
export const formatPercentage = (num: number | undefined): string => {
  if (!num) return '0%'
  if (num > 1) return `${num.toFixed(2)}%` // Already in percentage form
  return `${(num * 100).toFixed(2)}%`
}

/**
 * Get quality badge color based on fake followers quality
 */
export const getQualityColor = (quality: 'below_average' | 'average' | 'above_average'): string => {
  switch (quality) {
    case 'below_average':
      return 'bg-green-100 text-green-700'
    case 'average':
      return 'bg-yellow-100 text-yellow-700'
    case 'above_average':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

/**
 * Get quality display text
 */
export const getQualityText = (quality: 'below_average' | 'average' | 'above_average'): string => {
  return quality.replace('_', ' ')
}

/**
 * Get safe metric value with fallbacks
 */
export const getMetricValue = (
  primary: number | undefined, 
  secondary: number | undefined, 
  fallback: number = 0
): number => {
  return primary ?? secondary ?? fallback
}

/**
 * Check if influencer has content performance data
 */
export const hasContentPerformance = (influencer: any): boolean => {
  return !!(influencer?.content_performance?.reels || 
           influencer?.content_performance?.posts || 
           influencer?.content_performance?.stories)
}

/**
 * Check if influencer has audience data
 */
export const hasAudienceData = (influencer: any): boolean => {
  return !!(influencer?.audience?.gender || 
           influencer?.audience?.age_ranges || 
           influencer?.audience?.locations || 
           influencer?.audience?.languages)
}

/**
 * Check if influencer has paid vs organic data
 */
export const hasPaidOrganicData = (influencer: any): boolean => {
  return !!(influencer?.paid_vs_organic?.paid_engagement_rate || 
           influencer?.paid_vs_organic?.organic_engagement_rate)
}