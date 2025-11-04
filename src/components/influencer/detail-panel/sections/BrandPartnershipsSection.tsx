import React from 'react'
import { Building, TrendingUp, Calendar, Award, Eye, Heart, Image, ExternalLink } from 'lucide-react'
import { CollapsibleSection } from '../components/CollapsibleSection'
import { MetricRow } from '../components/MetricRow'
import { InfluencerData } from '../types'
import { formatNumber } from '../utils'

interface BrandPartnershipsSectionProps {
  influencer: InfluencerData
}

export const BrandPartnershipsSection = ({ influencer }: BrandPartnershipsSectionProps) => {
  // Get sponsored posts with actual sponsor data
  const allSponsoredPosts = influencer.brand_partnerships || influencer.sponsoredPosts || []
  const sponsoredPostsWithSponsors = allSponsoredPosts.filter((post: any) => post.sponsors && post.sponsors.length > 0)
  
  // Extract all unique brands from sponsored posts
  const allBrands = sponsoredPostsWithSponsors.flatMap((post: any) => post.sponsors || [])
  const uniqueBrands = allBrands.reduce((acc: any[], brand: any) => {
    if (!acc.find(b => b.name === brand.name)) {
      acc.push(brand)
    }
    return acc
  }, [])
  
  const brandAffinity = (influencer as any).brandAffinity || (influencer.audience as any)?.brandAffinity || []
  const mentions = (influencer as any).mentions || []
  

  
  // Check if we have any brand-related data
  const hasAnyData = sponsoredPostsWithSponsors.length > 0 || uniqueBrands.length > 0 || 
    brandAffinity.length > 0 || mentions.length > 0

  if (!hasAnyData) {
    return (
      <CollapsibleSection title="Brand Intelligence & Partnerships">
        <div className="text-gray-500 text-sm italic">
          No brand partnership data available
        </div>
      </CollapsibleSection>
    )
  }

  // Calculate partnership insights
  const totalPartnerships = uniqueBrands.length
  // Aggregate brand partners from sponsored posts if explicit list isn't provided
  const brandNameToInfo: Record<string, { count: number; logo?: string; domain?: string }> = {}
  for (const post of sponsoredPostsWithSponsors) {
    const sponsors = Array.isArray((post as any)?.sponsors) ? (post as any).sponsors : []
    for (const s of sponsors) {
      const key = (s?.name || s?.domain || 'Unknown Brand').trim()
      if (!brandNameToInfo[key]) brandNameToInfo[key] = { count: 0, logo: s?.logo_url, domain: s?.domain }
      brandNameToInfo[key].count += 1
      // keep first seen logo/domain
      if (!brandNameToInfo[key].logo && s?.logo_url) brandNameToInfo[key].logo = s.logo_url
      if (!brandNameToInfo[key].domain && s?.domain) brandNameToInfo[key].domain = s.domain
    }
  }
  const aggregatedBrands = Object.entries(brandNameToInfo)
    .map(([name, v]) => ({ name, count: v.count, logo_url: v.logo, domain: v.domain }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Use aggregated brands from sponsored posts
  const topBrands = aggregatedBrands
  const avgPartnershipsPerBrand = topBrands.length > 0 
    ? topBrands.reduce((sum, p) => sum + (p.count || 1), 0) / topBrands.length 
    : 0

  return (
    <CollapsibleSection title="Brand Intelligence & Partnerships" defaultOpen={false}>
      <div className="space-y-5 md:space-y-4">
        
        {/* 🆕 NEW: SPONSORSHIP OVERVIEW */}
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <h4 className="font-medium text-gray-900 mb-3">Sponsorship Overview</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{sponsoredPostsWithSponsors.length}</div>
              <div className="text-xs text-gray-500">Sponsored Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{mentions.length}</div>
              <div className="text-xs text-gray-500">Brand Mentions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{brandAffinity.length}</div>
              <div className="text-xs text-gray-500">Brand Affinities</div>
            </div>
          </div>
        </div>

        {/* Original partnership metrics */}
        {uniqueBrands.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            <MetricRow 
              icon={Building} 
              label="Total Brands" 
              value={totalPartnerships.toString()} 
            />
            <MetricRow 
              icon={TrendingUp} 
              label="Avg Collabs/Brand" 
              value={avgPartnershipsPerBrand.toFixed(2)} 
            />
          </div>
        )}
        
        {/* 🆕 NEW: RECENT SPONSORED POSTS */}
        {sponsoredPostsWithSponsors.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Recent Sponsored Collaborations</h4>
            <div className="space-y-3">
              {sponsoredPostsWithSponsors.slice(0, 5).map((post: any, index: number) => (
                <div 
                  key={index} 
                  className="flex items-start space-x-3 p-3 bg-white border rounded-lg hover:bg-gray-50 hover:border-blue-300 cursor-pointer transition-colors group"
                  onClick={() => post.url && window.open(post.url, '_blank')}
                  title={`View post on Instagram: ${post.url}`}
                >
                  {/* Post thumbnail */}
                  <div className="flex-shrink-0">
                    {post.thumbnail ? (
                      <img 
                        src={post.thumbnail} 
                        alt="Post"
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Image className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Post details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Brand info */}
                        {post.sponsors && post.sponsors.length > 0 ? (
                          <div className="flex items-center space-x-2 mb-1">
                            {post.sponsors[0].logo_url && (
                              <img 
                                src={post.sponsors[0].logo_url} 
                                alt={post.sponsors[0].name}
                                className="w-6 h-6 rounded"
                              />
                            )}
                            <span className="font-medium text-sm text-gray-900">
                              {post.sponsors[0].name}
                            </span>
                            {post.sponsors[0].domain && (
                              <span className="text-xs text-gray-500">
                                {post.sponsors[0].domain}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="font-medium text-sm text-gray-900 mb-1">
                            Brand Partnership
                          </div>
                        )}
                        
                        {/* Post text preview */}
                        {post.text && (
                          <div className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {post.text.length > 100 ? `${post.text.substring(0, 100)}...` : post.text}
                          </div>
                        )}
                        
                        {/* Post date */}
                        <div className="text-xs text-gray-500">
                          {post.created && new Date(post.created).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {/* Performance metrics & External link */}
                      <div className="text-right ml-4">
                        <div className="space-y-1">
                          {/* External link indicator */}
                          <div className="flex items-center justify-end mb-1">
                            <ExternalLink className="w-4 h-4 text-blue-500 group-hover:text-blue-600" />
                          </div>
                          
                          {post.views > 0 && (
                            <div className="text-sm font-medium">{formatNumber(post.views)} views</div>
                          )}
                          {post.likes > 0 && (
                            <div className="text-sm text-gray-600">{formatNumber(post.likes)} likes</div>
                          )}
                          {post.comments > 0 && (
                            <div className="text-sm text-gray-600">{formatNumber(post.comments)} comments</div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Hashtags */}
                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {post.hashtags.slice(0, 5).map((hashtag: string, hIndex: number) => (
                          <span key={hIndex} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            #{hashtag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Brand Partners */}
        {topBrands.length > 0 ? (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Award className="w-4 h-4 mr-2" />
              Top Brand Partners
            </h4>
            <div className="space-y-2">
              {topBrands.map((brand: any, index: number) => (
                <div key={brand.id || brand.name || index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 min-w-0">
                    {brand.logo_url && (
                      <img src={brand.logo_url} alt={brand.name} className="w-5 h-5 rounded" />
                    )}
                    <span className="font-medium text-gray-900 truncate">{brand.name}</span>
                    {brand.domain && <span className="text-xs text-gray-500 truncate">{brand.domain}</span>}
                  </div>
                  {brand.count && (
                    <span className="text-sm text-gray-500">{brand.count} collaborations</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          brandAffinity.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Audience Brand Affinity (no partnerships found)</h4>
              <div className="flex flex-wrap gap-2">
                {brandAffinity.slice(0, 12).map((b: any, i: number) => (
                  <span key={i} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200">{b.name}</span>
                ))}
              </div>
            </div>
          )
        )}
        
        {/* 🆕 NEW: BRAND AFFINITY */}
        {brandAffinity.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Brand Affinity Profile</h4>
            <div className="flex flex-wrap gap-2">
              {brandAffinity.slice(0, 15).map((brand: any, index: number) => (
                <span 
                  key={index} 
                  className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                >
                  {brand.name}
                </span>
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Brands that resonate with this creator's audience
            </div>
          </div>
        )}
        
        {/* 🆕 NEW: BRAND MENTIONS */}
        {mentions.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Brand Mentions</h4>
            <div className="space-y-2">
              {mentions.slice(0, 10).map((mention: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">{mention.tag}</span>
                  <span className="text-xs text-gray-500">
                    Weight: {(mention.weight * 100).toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Partnership Quality Indicator */}
        {uniqueBrands.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center text-blue-700">
              <Award className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">
                {totalPartnerships > 10 ? 'High Brand Appeal' : totalPartnerships > 5 ? 'Moderate Brand Appeal' : 'Emerging Brand Partnerships'}
              </span>
            </div>
          </div>
        )}
      </div>
    </CollapsibleSection>
  )
}