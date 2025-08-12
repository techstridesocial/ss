'use client'

import { Users, Star, ExternalLink, Heart } from 'lucide-react'
import { CollapsibleSection } from '../components/CollapsibleSection'
import { InfluencerData } from '../types'
import { formatNumber } from '../utils'

interface CreatorInsightsSectionProps {
  influencer: InfluencerData
}

export const CreatorInsightsSection = ({ influencer }: CreatorInsightsSectionProps) => {
  const creatorInterests = (influencer as any).creator_interests || []
  const creatorBrandAffinity = (influencer as any).creator_brand_affinity || []
  const lookalikes = (influencer as any).lookalikes || []
  
  const hasData = creatorInterests.length > 0 || creatorBrandAffinity.length > 0 || lookalikes.length > 0

  if (!hasData) {
    return null
  }

  return (
    <CollapsibleSection title="Creator Intelligence" defaultOpen={false}>
      <div className="space-y-6">
        
        {/* Creator Interests */}
        {creatorInterests.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Creator Interests</h4>
            <div className="flex flex-wrap gap-2">
              {creatorInterests.slice(0, 10).map((interest: any, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                >
                  <Star className="w-3 h-3 mr-1" />
                  {interest.name || interest}
                  {interest.id && (
                    <span className="ml-1 text-purple-600 text-xs">#{interest.id}</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Creator Brand Affinity */}
        {creatorBrandAffinity.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Creator Brand Preferences</h4>
            <div className="flex flex-wrap gap-2">
              {creatorBrandAffinity.slice(0, 8).map((brand: any, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                >
                  <Heart className="w-3 h-3 mr-1" />
                  {brand.name || brand}
                  {brand.id && (
                    <span className="ml-1 text-indigo-600 text-xs">#{brand.id}</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Lookalike Creators */}
        {lookalikes.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Similar Creators</h4>
            <div className="space-y-3">
              {lookalikes.slice(0, 5).map((creator: any, index: number) => (
                <div 
                  key={index} 
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => {
                    if (creator.username) {
                      window.open(`https://www.instagram.com/${creator.username}`, '_blank')
                    } else if (creator.url) {
                      window.open(creator.url, '_blank')
                    }
                  }}
                  title={`View ${creator.fullname || creator.username || 'profile'} on Instagram`}
                >
                  <div className="flex-shrink-0">
                    {creator.picture ? (
                      <img
                        src={creator.picture}
                        alt={creator.fullname || creator.username || 'Creator'}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                        <Users className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h5 className="font-medium text-gray-900 truncate">
                        {creator.fullname || creator.username || 'Unknown Creator'}
                      </h5>
                      <ExternalLink className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {creator.username && (
                        <span>@{creator.username}</span>
                      )}
                      {creator.followers !== undefined && (
                        <span>{formatNumber(creator.followers)} followers</span>
                      )}
                      {creator.engagements !== undefined && (
                        <span>{formatNumber(creator.engagements)} engagement</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {lookalikes.length > 5 && (
              <div className="text-center mt-3">
                <span className="text-sm text-gray-500">
                  +{lookalikes.length - 5} more similar creators
                </span>
              </div>
            )}
          </div>
        )}
        
      </div>
    </CollapsibleSection>
  )
}