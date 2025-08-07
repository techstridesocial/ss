'use client'

import { CollapsibleSection } from '../components/CollapsibleSection'
import { InfluencerData } from '../types'
import { hasAudienceData } from '../utils'

interface AudienceSectionProps {
  influencer: InfluencerData
}

const AudienceToggle = () => (
  <div className="flex items-center justify-center mb-6">
    <div className="bg-gray-100 rounded-lg p-1 flex">
      <button className="px-4 py-2 bg-white rounded-md shadow-sm text-sm font-medium text-gray-900 transition-colors">
        by followers
      </button>
      <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
        by likers
      </button>
    </div>
  </div>
)

const GenderBreakdown = ({ gender }: { gender: Record<string, number> }) => (
  <div className="mb-6">
    <h4 className="text-md font-semibold text-gray-900 mb-3">Gender</h4>
    <div className="space-y-2">
      {Object.entries(gender).map(([genderType, percentage]) => (
        <div key={genderType} className="flex items-center justify-between">
          <span className="text-sm text-gray-700 capitalize">{genderType}</span>
          <div className="flex items-center space-x-3">
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  genderType.toLowerCase() === 'male' ? 'bg-blue-500' : 'bg-red-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-900 w-12 text-right">
              {percentage.toFixed(2)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
)

const AgeBreakdown = ({ ageRanges }: { ageRanges: Record<string, number> }) => (
  <div className="mb-6">
    <h4 className="text-md font-semibold text-gray-900 mb-3">Age & Gender</h4>
    <div className="space-y-2">
      {Object.entries(ageRanges).map(([age, percentage]) => (
        <div key={age} className="flex items-center justify-between">
          <span className="text-sm text-gray-700">{age}</span>
          <div className="flex items-center space-x-3">
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-900 w-12 text-right">
              {percentage.toFixed(2)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
)

const LocationBreakdown = ({ 
  locations, 
  title, 
  field 
}: { 
  locations: Array<{ country: string; city?: string; percentage: number }>
  title: string
  field: 'country' | 'city'
}) => {
  const filteredLocations = field === 'city' 
    ? locations.filter(loc => loc.city).slice(0, 5)
    : locations.slice(0, 5)

  if (filteredLocations.length === 0) return null

  return (
    <div>
      <h4 className="text-md font-semibold text-gray-900 mb-3">{title}</h4>
      <div className="space-y-2">
        {filteredLocations.map((location, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-black rounded-full"></div>
              <span className="text-sm text-gray-700">
                {field === 'city' ? location.city : location.country}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {location.percentage.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const LanguageBreakdown = ({ 
  languages 
}: { 
  languages: Array<{ language: string; percentage: number }> 
}) => (
  <div>
    <h4 className="text-md font-semibold text-gray-900 mb-3">Languages</h4>
    <div className="space-y-2">
      {languages.slice(0, 4).map((language, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-black rounded-full"></div>
            <span className="text-sm text-gray-700">{language.language}</span>
          </div>
          <span className="text-sm font-medium text-gray-900">
            {language.percentage.toFixed(2)}%
          </span>
        </div>
      ))}
    </div>
  </div>
)

export const AudienceSection = ({ influencer }: AudienceSectionProps) => {
  if (!hasAudienceData(influencer)) {
    return null
  }

  const { audience } = influencer

  return (
    <CollapsibleSection title="Audience">
      <div className="space-y-6">
        <AudienceToggle />

        {audience?.gender && <GenderBreakdown gender={audience.gender} />}

        {audience?.age_ranges && <AgeBreakdown ageRanges={audience.age_ranges} />}

        {audience?.locations && (
          <div className="grid grid-cols-2 gap-6">
            <LocationBreakdown 
              locations={audience.locations} 
              title="Countries" 
              field="country" 
            />
            <LocationBreakdown 
              locations={audience.locations} 
              title="Cities" 
              field="city" 
            />
          </div>
        )}

        {audience?.languages && <LanguageBreakdown languages={audience.languages} />}
      </div>
    </CollapsibleSection>
  )
}