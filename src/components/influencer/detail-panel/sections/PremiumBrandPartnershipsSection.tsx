'use client'

import { PremiumSection } from '../components/PremiumSection'
import { InfluencerData } from '../types'
import { formatNumber } from '../utils'

interface PremiumBrandPartnershipsSectionProps {
  influencer: InfluencerData
}

export const PremiumBrandPartnershipsSection = ({ influencer }: PremiumBrandPartnershipsSectionProps) => {
  const partnerships = influencer.brand_partnerships || influencer.sponsoredPosts || []
  const brandMentions = influencer.mentions || []
  
  if (!partnerships || !Array.isArray(partnerships) || partnerships.length === 0) {
    return null
  }

  const formatBrandName = (brand: any) => {
    if (typeof brand === 'string') return brand
    
    // Handle nested objects like {id: 1, name: "Brand Name"}
    const name = brand?.name || brand?.brand || brand?.sponsor
    
    // If name is an object, try to get its name property
    if (typeof name === 'object' && name?.name) {
      return String(name.name)
    }
    
    // Convert to string to ensure it's always a string
    return String(name || 'Unknown Brand')
  }

  const getBrandCount = (brand: any) => {
    const count = brand?.count || brand?.mentions || brand?.posts || 1
    // Ensure we always return a number
    return typeof count === 'number' ? count : parseInt(String(count)) || 1
  }

  return (
    <PremiumSection 
      title="Brand Partnerships"
      badge={Array.isArray(partnerships) ? partnerships.length : 0}
      defaultOpen={false}
    >
      <div className="space-y-6">
        {/* Partnership Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-semibold text-gray-900">
              {Array.isArray(partnerships) ? partnerships.length : 0}
            </div>
            <div className="text-sm text-gray-600">Total Partnerships</div>
          </div>
          
          {Array.isArray(brandMentions) && brandMentions.length > 0 && (
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-semibold text-gray-900">
                {brandMentions.length}
              </div>
              <div className="text-sm text-gray-600">Brand Mentions</div>
            </div>
          )}
        </div>

        {/* Brand List */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
            Recent Partnerships
          </h4>
          <div className="space-y-3">
            {partnerships.slice(0, 10).map((partnership: any, index: number) => (
              <div key={index} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {formatBrandName(partnership)}
                  </div>
                  {partnership.category && (
                    <div className="text-sm text-gray-500">
                      {typeof partnership.category === 'object' && partnership.category?.name 
                        ? String(partnership.category.name) 
                        : String(partnership.category)}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  {getBrandCount(partnership) > 1 && (
                    <span className="text-sm font-medium text-gray-600">
                      {getBrandCount(partnership)} posts
                    </span>
                  )}
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Brand Categories */}
        {(() => {
          const categories = partnerships
            .map((p: any) => {
              const category = p.category
              // Handle category objects like {id: 1, name: "Fashion"}
              if (typeof category === 'object' && category?.name) {
                return String(category.name)
              }
              return typeof category === 'string' ? category : null
            })
            .filter((cat: any) => Boolean(cat))
            .reduce((acc: any, cat: any) => {
              acc[cat] = (acc[cat] || 0) + 1
              return acc
            }, {})
          
          const categoryEntries = Object.entries(categories).slice(0, 5)
          
          if (categoryEntries.length > 0) {
            return (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                  Brand Categories
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categoryEntries.map(([category, count]: [string, any]) => (
                    <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-900">{category}</span>
                      <span className="text-sm text-gray-600">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          }
          return null
        })()}

        {/* Performance Insights */}
        {influencer.partnerships_aggregate_metrics && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
              Partnership Performance
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(influencer.partnerships_aggregate_metrics).map(([key, value]: [string, any]) => (
                <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">
                    {typeof value === 'number' ? formatNumber(value) : String(value)}
                  </div>
                  <div className="text-xs text-gray-600 capitalize">
                    {key.replace(/_/g, ' ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PremiumSection>
  )
}
