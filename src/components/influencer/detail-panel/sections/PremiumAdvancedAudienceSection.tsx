'use client'

import { PremiumSection } from '../components/PremiumSection'
import { PremiumMetricsGrid } from '../components/PremiumMetricsGrid'
import { InfluencerData } from '../types'
import { formatNumber, formatPercentage, getMetricValue } from '../utils'

interface PremiumAdvancedAudienceSectionProps {
  influencer: InfluencerData
}

export const PremiumAdvancedAudienceSection = ({ influencer }: PremiumAdvancedAudienceSectionProps) => {
  const audience = influencer.audience || {}
  
  // Extract advanced audience data
  const ethnicities = getMetricValue(audience.ethnicities, influencer.ethnicities) || []
  const geoCities = getMetricValue(audience.geoCities, influencer.geoCities) || []
  const geoStates = getMetricValue(audience.geoStates, influencer.geoStates) || []
  const notableUsers = getMetricValue(audience.notableUsers, influencer.notableUsers) || []
  const audienceLookalikes = getMetricValue(audience.audienceLookalikes, influencer.audienceLookalikes) || []
  const audienceReachability = getMetricValue(audience.audienceReachability, influencer.audienceReachability)
  const audienceTypes = getMetricValue(audience.audienceTypes, influencer.audienceTypes) || []
  
  // Build advanced audience metrics
  const advancedMetrics = []
  
  // Audience Reachability
  if (audienceReachability) {
    let reachabilityValue = audienceReachability
    let reachabilityQuality = 'medium'
    
    if (typeof audienceReachability === 'number') {
      reachabilityValue = `${Math.round(audienceReachability)}/100`
      reachabilityQuality = audienceReachability > 70 ? 'high' : audienceReachability > 40 ? 'medium' : 'low'
    } else if (typeof audienceReachability === 'object' && audienceReachability.score) {
      reachabilityValue = `${Math.round(audienceReachability.score)}/100`
      reachabilityQuality = audienceReachability.score > 70 ? 'high' : audienceReachability.score > 40 ? 'medium' : 'low'
    }
    
    advancedMetrics.push({
      label: 'Audience Reachability',
      value: String(reachabilityValue),
      quality: reachabilityQuality
    })
  }
  
  // Notable Users Count
  if (Array.isArray(notableUsers) && notableUsers.length > 0) {
    advancedMetrics.push({
      label: 'Notable Followers',
      value: formatNumber(notableUsers.length),
      quality: notableUsers.length > 50 ? 'high' : notableUsers.length > 10 ? 'medium' : 'low'
    })
  }
  
  // Geographic Diversity
  const totalCities = Array.isArray(geoCities) ? geoCities.length : 0
  const totalStates = Array.isArray(geoStates) ? geoStates.length : 0
  
  if (totalCities > 0) {
    advancedMetrics.push({
      label: 'Geographic Cities',
      value: formatNumber(totalCities),
      quality: totalCities > 100 ? 'high' : totalCities > 25 ? 'medium' : 'low'
    })
  }
  
  if (totalStates > 0) {
    advancedMetrics.push({
      label: 'Geographic States',
      value: formatNumber(totalStates),
      quality: totalStates > 20 ? 'high' : totalStates > 10 ? 'medium' : 'low'
    })
  }
  
  // Audience Types Diversity
  if (Array.isArray(audienceTypes) && audienceTypes.length > 0) {
    const topAudienceType = audienceTypes[0]
    if (topAudienceType) {
      const typeName = typeof topAudienceType === 'string' ? topAudienceType : 
                      topAudienceType.name || topAudienceType.type || 'Mixed'
      const typeWeight = typeof topAudienceType === 'object' ? topAudienceType.weight || 0 : 0
      
      advancedMetrics.push({
        label: 'Primary Audience Type',
        value: `${String(typeName)} ${typeWeight > 0 ? `(${formatPercentage(typeWeight)})` : ''}`,
        quality: typeWeight > 0.6 ? 'high' : 'medium'
      })
    }
  }
  
  // Ethnic Diversity
  if (Array.isArray(ethnicities) && ethnicities.length > 0) {
    advancedMetrics.push({
      label: 'Ethnic Diversity',
      value: `${ethnicities.length} groups`,
      quality: ethnicities.length > 5 ? 'high' : ethnicities.length > 2 ? 'medium' : 'low'
    })
  }
  
  // Lookalikes Count
  if (Array.isArray(audienceLookalikes) && audienceLookalikes.length > 0) {
    advancedMetrics.push({
      label: 'Similar Audiences',
      value: formatNumber(audienceLookalikes.length),
      quality: audienceLookalikes.length > 20 ? 'high' : audienceLookalikes.length > 5 ? 'medium' : 'low'
    })
  }
  
  // If no advanced data available, don't render the section
  if (advancedMetrics.length === 0 && 
      (!Array.isArray(ethnicities) || ethnicities.length === 0) &&
      (!Array.isArray(geoCities) || geoCities.length === 0) &&
      (!Array.isArray(notableUsers) || notableUsers.length === 0) &&
      (!Array.isArray(audienceLookalikes) || audienceLookalikes.length === 0)) {
    return null
  }
  
  return (
    <PremiumSection 
      title="Advanced Audience Intelligence"
      badge={advancedMetrics.length}
      defaultOpen={false}
    >
      <div className="space-y-6">
        {/* Advanced Metrics */}
        {advancedMetrics.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
              Audience Quality Insights
            </h4>
            <PremiumMetricsGrid 
              metrics={advancedMetrics}
              columns={2}
            />
          </div>
        )}
        
        {/* Ethnic Diversity Breakdown */}
        {Array.isArray(ethnicities) && ethnicities.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
              Ethnic Diversity ({ethnicities.length})
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ethnicities.slice(0, 6).map((ethnicity: any, index: number) => {
                const name = typeof ethnicity === 'string' ? ethnicity : ethnicity.name || ethnicity.code
                const weight = typeof ethnicity === 'object' ? ethnicity.weight || 0 : 0
                
                return (
                  <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-900 capitalize">
                      {String(name)}
                    </span>
                    {weight > 0 && (
                      <span className="text-sm font-semibold text-gray-600">
                        {formatPercentage(weight)}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
        
        {/* Geographic Breakdown */}
        {(Array.isArray(geoCities) && geoCities.length > 0) && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
              Top Cities ({geoCities.length})
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {geoCities.slice(0, 9).map((city: any, index: number) => {
                const name = typeof city === 'string' ? city : city.name || city.city
                const weight = typeof city === 'object' ? city.weight || 0 : 0
                
                return (
                  <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-900">
                      {String(name)}
                    </span>
                    {weight > 0 && (
                      <span className="text-sm font-semibold text-gray-600">
                        {formatPercentage(weight)}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
        
        {/* Notable Users */}
        {Array.isArray(notableUsers) && notableUsers.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
              Notable Followers ({notableUsers.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {notableUsers.slice(0, 6).map((user: any, index: number) => {
                const username = typeof user === 'string' ? user : user.username || user.handle || user.name
                const followers = typeof user === 'object' ? user.followers || user.followersCount : null
                
                return (
                  <div key={index} className="flex items-center justify-between py-3 px-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">
                        {String(username)}
                      </span>
                      {followers && (
                        <div className="text-xs text-gray-600">
                          {formatNumber(followers)} followers
                        </div>
                      )}
                    </div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        
        {/* Audience Lookalikes */}
        {Array.isArray(audienceLookalikes) && audienceLookalikes.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
              Similar Audience Profiles ({audienceLookalikes.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {audienceLookalikes.slice(0, 4).map((lookalike: any, index: number) => {
                const name = typeof lookalike === 'string' ? lookalike : lookalike.name || lookalike.username
                const similarity = typeof lookalike === 'object' ? lookalike.similarity || lookalike.score : null
                
                return (
                  <div key={index} className="flex items-center justify-between py-3 px-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg">
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">
                        {String(name)}
                      </span>
                      {similarity && (
                        <div className="text-xs text-gray-600">
                          {Math.round(similarity * 100)}% similar
                        </div>
                      )}
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        
        {/* Audience Types Breakdown */}
        {Array.isArray(audienceTypes) && audienceTypes.length > 1 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
              Audience Composition
            </h4>
            <div className="space-y-2">
              {audienceTypes.slice(0, 5).map((type: any, index: number) => {
                const name = typeof type === 'string' ? type : type.name || type.type
                const weight = typeof type === 'object' ? type.weight || 0 : 0
                
                return (
                  <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-900 capitalize">
                      {String(name)}
                    </span>
                    <span className="text-sm font-semibold text-gray-600">
                      {weight > 0 ? formatPercentage(weight) : ''}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </PremiumSection>
  )
}

