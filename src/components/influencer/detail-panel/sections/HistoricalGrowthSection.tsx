'use client'

import React from 'react'
import { TrendingUp, Calendar, Users, ExternalLink } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { CollapsibleSection } from '../components/CollapsibleSection'
import { InfluencerData } from '../types'
import { formatNumber } from '../utils'

interface HistoricalGrowthSectionProps {
  influencer: InfluencerData
}

export const HistoricalGrowthSection = ({ influencer }: HistoricalGrowthSectionProps) => {
  const statHistory = influencer.statHistory || []
  const lookalikes = influencer.lookalikes || []
  
  // Check if we have any growth or lookalike data
  const hasAnyData = statHistory.length > 0 || lookalikes.length > 0
  
  if (!hasAnyData) {
    return null
  }
  
  return (
    <CollapsibleSection title="Growth & Similar Creators" defaultOpen={false}>
      <div className="space-y-4">
        
        {/* 🆕 NEW: HISTORICAL STATS */}
        {statHistory.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Growth History</h4>
            <div className="space-y-2">
              {statHistory.slice(-6).map((stat: any, index: number) => (
                <div key={index} className="grid grid-cols-6 gap-3 p-3 bg-gray-50 rounded-lg text-xs">
                  <div className="font-medium text-gray-900">{stat.month}</div>
                  <div className="text-center">
                    <div className="font-medium">{formatNumber(stat.followers)}</div>
                    <div className="text-gray-500">followers</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{formatNumber(stat.following)}</div>
                    <div className="text-gray-500">following</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{formatNumber(stat.avgLikes)}</div>
                    <div className="text-gray-500">avg likes</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{formatNumber(stat.avgViews)}</div>
                    <div className="text-gray-500">avg views</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{formatNumber(stat.avgComments)}</div>
                    <div className="text-gray-500">comments</div>
                  </div>
                  {typeof stat.avgShares !== 'undefined' && (
                    <div className="text-center">
                      <div className="font-medium">{formatNumber(stat.avgShares)}</div>
                      <div className="text-gray-500">shares</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Growth Analysis */}
            {statHistory.length >= 2 && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <h5 className="text-sm font-medium text-blue-900 mb-2">Growth Analysis</h5>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  {(() => {
                    const latest = statHistory[statHistory.length - 1]
                    const previous = statHistory[statHistory.length - 2]
                    const followerGrowth = ((latest.followers - previous.followers) / previous.followers * 100)
                    const likesGrowth = ((latest.avgLikes - previous.avgLikes) / previous.avgLikes * 100)
                    
                    return (
                      <>
                        <div className="text-center">
                          <div className={`font-bold ${followerGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {followerGrowth > 0 ? '+' : ''}{followerGrowth.toFixed(2)}%
                          </div>
                          <div className="text-blue-700">Follower Growth</div>
                        </div>
                        <div className="text-center">
                          <div className={`font-bold ${likesGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {likesGrowth > 0 ? '+' : ''}{likesGrowth.toFixed(2)}%
                          </div>
                          <div className="text-blue-700">Engagement Growth</div>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* 🆕 NEW: SIMILAR CREATORS */}
        {lookalikes.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Similar Creators</h4>
            <div className="space-y-3">
              {lookalikes.slice(0, 5).map((creator: any, index: number) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <img 
                    src={creator.picture} 
                    alt={creator.fullname}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/default-avatar.svg';
                    }}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{creator.fullname}</div>
                    <div className="text-xs text-gray-500">@{creator.username}</div>
                    <div className="text-xs text-blue-600 mt-1">Similar audience & engagement patterns</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatNumber(creator.followers)}</div>
                    <div className="text-xs text-gray-500">followers</div>
                    {creator.engagements && (
                      <div className="text-xs text-gray-500">{formatNumber(creator.engagements)} avg engagement</div>
                    )}
                  </div>
                  {creator.url && (
                    <a 
                      href={creator.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title={`View ${creator.fullname}'s profile`}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
            
            {/* Lookalike insights */}
            {lookalikes.length > 0 && (
              <div className="mt-3 p-3 bg-green-50 rounded-lg">
                <h5 className="text-sm font-medium text-green-900 mb-2">Collaboration Opportunities</h5>
                <div className="text-xs text-green-700">
                  These creators have similar audience demographics and engagement patterns. 
                  They could be valuable for:
                </div>
                <ul className="mt-2 text-xs text-green-700 space-y-1">
                  <li>• Cross-promotion campaigns</li>
                  <li>• Similar brand partnership opportunities</li>
                  <li>• Competitive analysis and benchmarking</li>
                  <li>• Alternative talent options for campaigns</li>
                </ul>
              </div>
            )}
          </div>
        )}
        
      </div>
    </CollapsibleSection>
  )
}