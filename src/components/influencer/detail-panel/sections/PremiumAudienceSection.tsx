'use client'

import { PremiumSection } from '../components/PremiumSection'
import { PremiumMetricsGrid } from '../components/PremiumMetricsGrid'
import { InfluencerData } from '../types'
import { formatNumber, formatPercentage, getMetricValue } from '../utils'

interface PremiumAudienceSectionProps {
  influencer: InfluencerData
}

export const PremiumAudienceSection = ({ influencer }: PremiumAudienceSectionProps) => {
  const audience = influencer.audience || {}
  
  // Extract audience data
  const genders = audience.genders || influencer.genders || []
  const ages = audience.ages || influencer.ages || []
  const countries = audience.geoCountries || influencer.geoCountries || []
  const credibility = getMetricValue(audience.credibility, influencer.credibility)
  
  // Extract interests and languages data
  const interests = influencer.audience_interests || (influencer.audience?.interests ?? [])
  const languages = influencer.audience_languages || []

  // Build demographics metrics
  const demographicMetrics = []

  // Gender breakdown
  if (genders && genders.length > 0) {
    const topGender = genders[0]
    if (topGender) {
      demographicMetrics.push({
        label: 'Primary Gender',
        value: `${topGender.code === 'MALE' ? 'Male' : 'Female'} ${formatPercentage(topGender.weight)}`,
        quality: topGender.weight > 0.6 ? 'high' : 'medium'
      })
    }
  }

  // Age breakdown
  if (ages && ages.length > 0) {
    const topAge = ages[0]
    if (topAge) {
      demographicMetrics.push({
        label: 'Primary Age Group',
        value: `${topAge.code} (${formatPercentage(topAge.weight)})`,
        quality: topAge.weight > 0.3 ? 'high' : 'medium'
      })
    }
  }

  // Geographic breakdown
  if (countries && countries.length > 0) {
    const topCountry = countries[0]
    if (topCountry) {
      demographicMetrics.push({
        label: 'Top Country',
        value: `${topCountry.name} ${formatPercentage(topCountry.weight)}`,
        quality: topCountry.weight > 0.2 ? 'high' : 'medium'
      })
    }
  }

  if (credibility) {
    demographicMetrics.push({
      label: 'Audience Credibility',
      value: typeof credibility === 'number' ? `${Math.round(credibility)}/100` : credibility,
      quality: typeof credibility === 'number' ? (credibility > 70 ? 'high' : credibility > 50 ? 'medium' : 'low') : undefined
    })
  }

  if (demographicMetrics.length === 0) {
    return null
  }

  // Calculate total data points
  const totalDataPoints = demographicMetrics.length + 
    (interests.length > 0 ? 1 : 0) + 
    (languages.length > 0 ? 1 : 0)

  return (
    <PremiumSection 
      title="Audience Intelligence"
      badge={totalDataPoints}
      defaultOpen={false}
    >
      <div className="space-y-6">
        <PremiumMetricsGrid 
          metrics={demographicMetrics}
          columns={2}
        />

        {/* Detailed Breakdowns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Gender Details */}
          {genders && genders.length > 1 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Gender Split
              </h4>
              <div className="space-y-2">
                {genders.slice(0, 3).map((gender: any, index: number) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">
                      {gender.code === 'MALE' ? 'Male' : 'Female'}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatPercentage(gender.weight)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Age Details */}
          {ages && ages.length > 1 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Age Groups
              </h4>
              <div className="space-y-2">
                {ages.slice(0, 4).map((age: any, index: number) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">{age.code}</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatPercentage(age.weight)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Country Details */}
          {countries && countries.length > 1 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Top Countries
              </h4>
              <div className="space-y-2">
                {countries.slice(0, 4).map((country: any, index: number) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">{country.name}</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatPercentage(country.weight)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Audience Interests */}
        {interests && interests.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
              Top Interests ({interests.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {interests.slice(0, 8).map((interest: any, index: number) => {
                let percentage = 0
                if (typeof interest !== 'string') {
                  if (typeof interest.percentage === 'number') {
                    percentage = interest.percentage
                  } else if (typeof interest.weight === 'number') {
                    percentage = interest.weight * 100
                  }
                }
                return (
                  <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-900 capitalize">
                      {typeof interest === 'string' ? interest : interest.name || 'Unknown'}
                    </span>
                    <span className="text-sm font-semibold text-gray-600">
                      {percentage > 0 ? `${percentage.toFixed(1)}%` : ''}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Audience Languages */}
        {languages && languages.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
              Languages Spoken ({languages.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {languages.slice(0, 8).map((language: any, index: number) => {
                const percentage = typeof language === 'string' ? 0 : language.percentage || 0
                const languageName = typeof language === 'string' ? language : language.name || 'Unknown'
                
                return (
                  <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-900 capitalize">
                      {languageName}
                    </span>
                    <span className="text-sm font-semibold text-gray-600">
                      {percentage > 0 ? `${percentage.toFixed(1)}%` : ''}
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
