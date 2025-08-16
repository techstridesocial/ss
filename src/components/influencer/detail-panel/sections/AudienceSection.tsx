'use client'

import { CollapsibleSection } from '../components/CollapsibleSection'
import { InfluencerData } from '../types'
import { hasAudienceData, formatNumber } from '../utils'
import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

interface AudienceSectionProps {
  influencer: InfluencerData
}

// Removed "by likers" toggle since current API payload contains only followers-based audience

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
                style={{ width: `${percentage.toFixed(2)}%` }}
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
                style={{ width: `${percentage.toFixed(2)}%` }}
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



// 🆕 NEW: AUDIENCE TYPES BREAKDOWN
const AudienceTypesBreakdown = ({ audienceTypes }: { audienceTypes: any[] }) => {
  if (!audienceTypes || audienceTypes.length === 0) return null
  
  const getTypeColor = (code: string) => {
    switch(code) {
      case 'real': return 'bg-green-100 text-green-800'
      case 'influencers': return 'bg-blue-100 text-blue-800'
      case 'mass_followers': return 'bg-yellow-100 text-yellow-800'
      case 'suspicious': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  return (
    <div>
      <h4 className="font-medium text-gray-900 mb-3">Follower Quality Distribution</h4>
      <div className="space-y-2">
        {audienceTypes.map((type: any, index: number) => {
          const percentage = (type.weight * 100).toFixed(2)
          
          return (
            <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded ${getTypeColor(type.code)}`}>
                  {type.code.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <span className="font-medium">{percentage}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// 🆕 NEW: AUDIENCE QUALITY METRICS
const AudienceQualityMetrics = ({ audienceData }: { audienceData: any }) => {
  const hasQualityData = audienceData.notable !== undefined || audienceData.credibility !== undefined

  if (!hasQualityData) return null

  return (
    <div>
      <h4 className="font-medium text-gray-900 mb-3">Audience Quality</h4>
      <div className="space-y-2">
        {audienceData.notable !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Notable Followers</span>
            <span className="font-medium">{(audienceData.notable * 100).toFixed(2)}%</span>
          </div>
        )}
        {audienceData.credibility !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Credibility Score</span>
            <span className="font-medium">{(audienceData.credibility * 100).toFixed(1)}%</span>
          </div>
        )}
      </div>
    </div>
  )
}

// 🆕 NEW: AUDIENCE REACHABILITY
const AudienceReachabilityBreakdown = ({ audienceReachability }: { audienceReachability: any[] }) => {
  if (!audienceReachability || audienceReachability.length === 0) return null
  
  return (
    <div>
      <h4 className="font-medium text-gray-900 mb-3">Audience Reachability</h4>
      <div className="space-y-2">
        {audienceReachability.map((reach: any, index: number) => (
          <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
            <span className="text-sm">{reach.code} followers</span>
            <span className="font-medium">{(reach.weight * 100).toFixed(2)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// 🆕 NEW: ETHNICITY BREAKDOWN
const EthnicityBreakdown = ({ ethnicities }: { ethnicities: any[] }) => {
  if (!ethnicities || ethnicities.length === 0) return null
  
  return (
    <div>
      <h4 className="font-medium text-gray-900 mb-3">Ethnicity Distribution</h4>
      <div className="space-y-2">
        {ethnicities.map((ethnicity: any, index: number) => (
          <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
            <span className="text-sm">{ethnicity.name}</span>
            <span className="font-medium">{(ethnicity.weight * 100).toFixed(2)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// 🆕 NEW: NOTABLE USERS
const NotableUsersSection = ({ notableUsers }: { notableUsers: any[] }) => {
  if (!notableUsers || notableUsers.length === 0) return null
  
  return (
    <div>
      <h4 className="font-medium text-gray-900 mb-3">Notable Followers</h4>
      <div className="space-y-2">
        {notableUsers.slice(0, 3).map((user: any, index: number) => (
          <a key={index} href={user.url || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 p-2 bg-white rounded border hover:bg-gray-50">
            <img 
              src={user.picture} 
              alt={user.fullname}
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-blue-700 line-clamp-1">{user.fullname}</div>
              <div className="text-xs text-gray-500">@{user.username}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">{formatNumber(user.followers)}</div>
              <div className="text-xs text-gray-500">followers</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

// 🆕 NEW: AUDIENCE LOOKALIKES
const AudienceLookalikesSection = ({ audienceLookalikes }: { audienceLookalikes: any[] }) => {
  if (!audienceLookalikes || audienceLookalikes.length === 0) return null
  
  return (
    <div>
      <h4 className="font-medium text-gray-900 mb-3">Similar Audiences</h4>
      <div className="space-y-2">
        {audienceLookalikes.slice(0, 3).map((user: any, index: number) => (
          <div key={index} className="flex items-center space-x-3 p-2 bg-blue-50 rounded border border-blue-200">
            <img 
              src={user.picture} 
              alt={user.fullname}
              className="w-8 h-8 rounded-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/default-avatar.svg';
              }}
            />
            <div className="flex-1">
              <div className="text-sm font-medium">{user.fullname}</div>
              <div className="text-xs text-blue-600">Similar audience profile</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 🆕 NEW: ENHANCED GEOGRAPHIC BREAKDOWN
const EnhancedGeographicBreakdown = ({ audienceData }: { audienceData: any }) => {
  if (!audienceData) return null
  
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Top Cities */}
      {audienceData.geoCities && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Top Cities</h4>
          <div className="space-y-1">
            {audienceData.geoCities.slice(0, 5).map((city: any, index: number) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-600">{city.name}</span>
                                  <span className="font-medium">{(city.weight * 100).toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Top States */}
      {audienceData.geoStates && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Top States</h4>
          <div className="space-y-1">
            {audienceData.geoStates.slice(0, 5).map((state: any, index: number) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-600">{state.name}</span>
                                  <span className="font-medium">{(state.weight * 100).toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// 🆕 NEW: BRAND AFFINITY
const BrandAffinitySection = ({ brandAffinity }: { brandAffinity: any[] }) => {
  if (!brandAffinity || brandAffinity.length === 0) return null
  
  return (
    <div>
      <h4 className="font-medium text-gray-900 mb-3">Brand Affinity</h4>
      <div className="flex flex-wrap gap-2">
        {brandAffinity.slice(0, 10).map((brand: any, index: number) => (
          <span 
            key={index} 
            className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
          >
            {brand.name}
          </span>
        ))}
      </div>
    </div>
  )
}

export const AudienceSection = ({ influencer }: AudienceSectionProps) => {
  const hasFollowersAudience = hasAudienceData(influencer)
  if (!hasFollowersAudience) {
    return null
  }

  const audience = useMemo(() => (influencer as any).audience, [influencer])
  
  // Get enhanced audience data from Modash API
  const audienceData = {
    ...audience,
    // 🆕 NEW: Map influencer-level audience data to audienceData
    notable: (influencer as any).audience_notable || audience?.notable,
    credibility: (influencer as any).audience_credibility || audience?.credibility,
    notableUsers: (influencer as any).audience_notable_users || audience?.notableUsers,
    audienceLookalikes: (influencer as any).audience_lookalikes || audience?.audienceLookalikes,
    audienceReachability: (influencer as any).audience_reachability || audience?.audienceReachability,
    audienceTypes: (influencer as any).audience_types || audience?.audienceTypes,
    // 🎯 YOUTUBE-SPECIFIC: Enhanced audience data
    ...((influencer as any).audienceCommenters || {}),
  }
  const brandAffinity = (influencer as any).brandAffinity || audienceData.brandAffinity || []

  return (
    <CollapsibleSection title="Audience Intelligence" defaultOpen={false}>
      <div className="space-y-5 md:space-y-4">
        
        {/* 🆕 NEW: AUDIENCE QUALITY METRICS */}
        <AudienceQualityMetrics audienceData={audienceData} />
        
        {/* Original Audience Toggle */}
        {/* Followers-based audience (toggle removed) */}

        {/* Original Gender & Age breakdowns */}
        {audience?.gender && <GenderBreakdown gender={audience.gender} />}
        {audience?.age_ranges && <AgeBreakdown ageRanges={audience.age_ranges} />}

        {/* 🆕 NEW: AUDIENCE TYPES BREAKDOWN */}
        {audienceData.audienceTypes && (
          <AudienceTypesBreakdown audienceTypes={audienceData.audienceTypes} />
        )}
        
        {/* 🆕 NEW: AUDIENCE REACHABILITY */}
        {audienceData.audienceReachability && (
          <AudienceReachabilityBreakdown audienceReachability={audienceData.audienceReachability} />
        )}

        {/* Enhanced Geographic Breakdown */}
        <EnhancedGeographicBreakdown audienceData={audienceData} />

        {/* 🆕 NEW: GEOGRAPHY & LANGUAGES SIDE-BY-SIDE */}
        {(audienceData.geoCountries || audience?.languages) && (
          <div className="md:w-1/2 md:ml-auto space-y-6">
            {/* Countries */}
            {audienceData.geoCountries && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Countries</h4>
                <div className="space-y-2">
                  {audienceData.geoCountries.slice(0, 10).map((country: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{country.name || country.code || 'Unknown'}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {((country.weight || 0) * 100).toFixed(2)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {audience?.languages && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Languages</h4>
                <div className="space-y-2">
                  {audience.languages.slice(0, 10).map((language: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{language.language || language.name}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {language.percentage !== undefined
                          ? `${language.percentage.toFixed(2)}%`
                          : `${((language.weight || 0) * 100).toFixed(2)}%`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Original location breakdown (fallback) */}
        {audience?.locations && !audienceData.geoCities && (
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
        
        {/* 🆕 NEW: ETHNICITY BREAKDOWN */}
        {audienceData.ethnicities && (
          <EthnicityBreakdown ethnicities={audienceData.ethnicities} />
        )}

        {/* Original Language breakdown (fallback if not shown in grid above) */}
        {audience?.languages && !(audienceData.geoCountries || audience?.languages) && (
          <LanguageBreakdown languages={audience.languages} />
        )}

        {/* 📊 GENDER BREAKDOWN WITH PIE CHART */}
        {audienceData.genders && (
          <div>
            <h4 className="font-medium text-gray-900 mb-4">📊 Gender Breakdown</h4>
            
            {/* Pie Chart */}
            <div className="h-48 w-full mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={audienceData.genders.map((g: any) => ({
                      name: g.code || 'Unknown',
                      value: (g.weight || 0) * 100,
                      count: g.weight || 0
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {audienceData.genders.map((_: any, index: number) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === 0 ? '#3b82f6' : index === 1 ? '#ef4444' : '#10b981'} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Percentage']}
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend */}
            <div className="space-y-2">
              {audienceData.genders.map((g: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ 
                        backgroundColor: index === 0 ? '#3b82f6' : index === 1 ? '#ef4444' : '#10b981' 
                      }}
                    ></div>
                    <span className="text-sm capitalize">{g.code || 'unknown'}</span>
                  </div>
                  <span className="font-medium">{((g.weight || 0) * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🆕 NEW: GENDER PER AGE (from gendersPerAge) */}
        {audienceData.gendersPerAge && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Gender by Age</h4>
            <div className="space-y-2">
              {audienceData.gendersPerAge.slice(0, 10).map((row: any, index: number) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{row.code || 'N/A'}</span>
                  <span className="text-gray-900 font-medium">M {((row.male || 0) * 100).toFixed(2)}% • F {((row.female || 0) * 100).toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🆕 NEW: AGE BANDS (from ages) */}
        {audienceData.ages && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Age Distribution</h4>
            <div className="space-y-2">
              {audienceData.ages.map((a: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{a.code || 'N/A'}</span>
                  <span className="font-medium">{((a.weight || 0) * 100).toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 🆕 NEW: NOTABLE USERS */}
        {audienceData.notableUsers && (
          <NotableUsersSection notableUsers={audienceData.notableUsers} />
        )}
        
        {/* 🆕 NEW: AUDIENCE LOOKALIKES */}
        {audienceData.audienceLookalikes && (
          <AudienceLookalikesSection audienceLookalikes={audienceData.audienceLookalikes} />
        )}
        
        {/* 🆕 NEW: BRAND AFFINITY */}
        {brandAffinity.length > 0 && (
          <BrandAffinitySection brandAffinity={brandAffinity} />
        )}
        
        {/* 🆕 NEW: ETHNICITY BREAKDOWN */}
        {(influencer as any).audience_ethnicities && (influencer as any).audience_ethnicities.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Ethnicity Breakdown</h4>
            <div className="space-y-2">
              {(influencer as any).audience_ethnicities.slice(0, 8).map((ethnicity: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{ethnicity.name || ethnicity.code || 'Unknown'}</span>
                  <span className="font-medium">{((ethnicity.weight || 0) * 100).toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 🆕 NEW: CITIES BREAKDOWN */}
        {(influencer as any).audience_geo_cities && (influencer as any).audience_geo_cities.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Top Cities</h4>
            <div className="space-y-2">
              {(influencer as any).audience_geo_cities.slice(0, 10).map((city: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{city.name || 'Unknown'}</span>
                  <span className="font-medium">{((city.weight || 0) * 100).toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 🆕 NEW: STATES BREAKDOWN */}
        {(influencer as any).audience_geo_states && (influencer as any).audience_geo_states.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Top States/Regions</h4>
            <div className="space-y-2">
              {(influencer as any).audience_geo_states.slice(0, 10).map((state: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{state.name || 'Unknown'}</span>
                  <span className="font-medium">{((state.weight || 0) * 100).toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 🆕 NEW: GENDERS PER AGE */}
        {(influencer as any).audience_genders_per_age && (influencer as any).audience_genders_per_age.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Gender by Age Group</h4>
            <div className="space-y-2">
              {(influencer as any).audience_genders_per_age.slice(0, 8).map((ageGender: any, index: number) => (
                <div key={index} className="text-sm">
                  <div className="font-medium text-gray-700 mb-1">{ageGender.code || 'Unknown Age'}</div>
                  <div className="flex space-x-4 text-xs text-gray-600">
                    <span>Male: {((ageGender.male || 0) * 100).toFixed(1)}%</span>
                    <span>Female: {((ageGender.female || 0) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
      </div>
    </CollapsibleSection>
  )
}