import React from 'react'
import { Building, TrendingUp, Calendar, Award } from 'lucide-react'
import { CollapsibleSection } from '../components/CollapsibleSection'
import { MetricRow } from '../components/MetricRow'
import { InfluencerData } from '../types'

interface BrandPartnershipsSectionProps {
  influencer: InfluencerData
}

export const BrandPartnershipsSection = ({ influencer }: BrandPartnershipsSectionProps) => {
  const partnerships = influencer.brand_partnerships || []
  const hasPartnerships = partnerships.length > 0

  if (!hasPartnerships) {
    return (
      <CollapsibleSection title="Brand Partnerships">
        <div className="text-gray-500 text-sm italic">
          No brand partnership data available
        </div>
      </CollapsibleSection>
    )
  }

  // Calculate partnership insights
  const totalPartnerships = partnerships.length
  const topBrands = partnerships.slice(0, 5) // Show top 5 brands
  const avgPartnershipsPerBrand = partnerships.reduce((sum, p) => sum + (p.count || 1), 0) / totalPartnerships

  return (
    <CollapsibleSection title="Brand Partnerships">
      <div className="space-y-4">
        {/* Partnership Overview */}
        <div className="grid grid-cols-2 gap-4">
          <MetricRow 
            icon={Building} 
            label="Total Brands" 
            value={totalPartnerships.toString()} 
          />
          <MetricRow 
            icon={TrendingUp} 
            label="Avg Collabs/Brand" 
            value={avgPartnershipsPerBrand.toFixed(1)} 
          />
        </div>

        {/* Top Brand Partners */}
        {topBrands.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Award className="w-4 h-4 mr-2" />
              Top Brand Partners
            </h4>
            <div className="space-y-2">
              {topBrands.map((brand, index) => (
                <div key={brand.id || index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{brand.name}</span>
                  {brand.count && (
                    <span className="text-sm text-gray-500">{brand.count} collaborations</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Partnership Quality Indicator */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center text-blue-700">
            <Award className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">
              {totalPartnerships > 10 ? 'High Brand Appeal' : totalPartnerships > 5 ? 'Moderate Brand Appeal' : 'Emerging Brand Partnerships'}
            </span>
          </div>
        </div>
      </div>
    </CollapsibleSection>
  )
}