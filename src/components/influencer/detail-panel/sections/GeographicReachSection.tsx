'use client'

import { PremiumSection } from '../components/PremiumSection'
import { PremiumMetricsGrid } from '../components/PremiumMetricsGrid'
import { InfluencerData } from '../types'
import { getMetricValue, formatPercentage } from '../utils'

interface GeographicReachSectionProps {
  influencer: InfluencerData
  selectedPlatform?: 'instagram' | 'tiktok' | 'youtube'
}

export const GeographicReachSection = ({ 
  influencer, 
  selectedPlatform 
}: GeographicReachSectionProps) => {
  
  // Only show for Instagram and TikTok (not YouTube yet)
  if (selectedPlatform === 'youtube') {
    return null
  }

  const audience = influencer.audience || {}
  
  // Extract geographic data
  const geoCountries = getMetricValue(audience.geoCountries, influencer.geoCountries) || []
  const geoStates = getMetricValue(audience.geoStates, influencer.geoStates) || []
  const geoCities = getMetricValue(audience.geoCities, influencer.geoCities) || []

  // Build geographic metrics
  const geographicMetrics = []

  // Top Country
  if (geoCountries.length > 0) {
    const topCountry = geoCountries[0]
    const countryName = topCountry.name || topCountry.country || 'Unknown'
    const percentage = topCountry.weight || topCountry.percentage || 0
    const quality = percentage > 0.5 ? 'high' : percentage > 0.3 ? 'medium' : 'low'
    
    geographicMetrics.push({
      label: 'Primary Country',
      value: String(countryName),
      secondaryValue: formatPercentage(percentage),
      quality
    })
  }

  // Geographic Diversity - Countries
  if (geoCountries.length > 0) {
    const quality = geoCountries.length > 10 ? 'high' : geoCountries.length > 5 ? 'medium' : 'low'
    
    geographicMetrics.push({
      label: 'Country Reach',
      value: geoCountries.length,
      secondaryValue: 'countries',
      quality
    })
  }

  // State/Regional Reach
  if (geoStates.length > 0) {
    const quality = geoStates.length > 20 ? 'high' : geoStates.length > 10 ? 'medium' : 'low'
    
    geographicMetrics.push({
      label: 'State/Region Reach',
      value: geoStates.length,
      secondaryValue: 'regions',
      quality
    })
  }

  // City-Level Reach
  if (geoCities.length > 0) {
    const quality = geoCities.length > 100 ? 'high' : geoCities.length > 25 ? 'medium' : 'low'
    
    geographicMetrics.push({
      label: 'City Reach',
      value: geoCities.length,
      secondaryValue: 'cities',
      quality
    })
  }

  // Top City (if available)
  if (geoCities.length > 0) {
    const topCity = geoCities[0]
    const cityName = topCity.name || topCity.city || 'Unknown'
    const percentage = topCity.weight || topCity.percentage || 0
    
    if (cityName !== 'Unknown') {
      geographicMetrics.push({
        label: 'Primary City',
        value: String(cityName),
        secondaryValue: percentage > 0 ? formatPercentage(percentage) : '',
        quality: percentage > 0.1 ? 'high' : percentage > 0.05 ? 'medium' : 'low'
      })
    }
  }

  // Geographic Concentration
  if (geoCountries.length > 0) {
    const topCountryWeight = geoCountries[0].weight || geoCountries[0].percentage || 0
    const concentration = topCountryWeight > 0.7 ? 'High' : topCountryWeight > 0.4 ? 'Medium' : 'Low'
    const quality = topCountryWeight > 0.7 ? 'low' : topCountryWeight > 0.4 ? 'medium' : 'high'
    
    geographicMetrics.push({
      label: 'Geographic Spread',
      value: concentration,
      secondaryValue: formatPercentage(topCountryWeight),
      quality
    })
  }

  // Don't render if no geographic data available
  if (geographicMetrics.length === 0) {
    return null
  }

  return (
    <PremiumSection 
      title="Geographic Reach"
      badge={geographicMetrics.length}
      defaultOpen={false}
    >
      <PremiumMetricsGrid 
        metrics={geographicMetrics}
        columns={3}
      />
    </PremiumSection>
  )
}
