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
  const lookalikesByTopics = (influencer as any).lookalikesByTopics || []
  
  // Combine all lookalikes data
  const allLookalikes = [...lookalikes, ...lookalikesByTopics]
  
  // Check if we have any growth or lookalike data
  const hasAnyData = statHistory.length > 0 || allLookalikes.length > 0
  
  if (!hasAnyData) {
    return null
  }
  
  return (
    <CollapsibleSection title="Growth & Similar Creators" defaultOpen={false}>
      <div className="space-y-6">
        
        {/* 📊 INTERACTIVE GROWTH CHARTS */}
        {statHistory.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-4">📈 Growth Timeline</h4>
            
            {/* Follower Growth Chart */}
            <div className="mb-6">
              <h5 className="text-sm font-medium text-gray-700 mb-3">Follower Growth</h5>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={statHistory.slice(-12)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                      tickFormatter={(value) => formatNumber(value)}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatNumber(value), 'Followers']}
                      labelStyle={{ color: '#374151' }}
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="followers" 
                      stroke="#3b82f6" 
                      fill="#93c5fd"
                      fillOpacity={0.6}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Engagement Metrics Chart */}
            <div className="mb-6">
              <h5 className="text-sm font-medium text-gray-700 mb-3">Engagement Trends</h5>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={statHistory.slice(-12)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                      tickFormatter={(value) => formatNumber(value)}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        formatNumber(value), 
                        name === 'avgLikes' ? 'Avg Likes' : 
                        name === 'avgComments' ? 'Avg Comments' : 
                        name === 'avgViews' ? 'Avg Views' : name
                      ]}
                      labelStyle={{ color: '#374151' }}
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avgLikes" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avgComments" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avgViews" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {/* Legend */}
              <div className="flex items-center justify-center space-x-6 mt-3 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-gray-600">Avg Likes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Avg Comments</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-600">Avg Views</span>
                </div>
              </div>
            </div>

            {/* Compact Table for Recent Months */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-3">Recent Growth Data</h5>
              <div className="space-y-2">
                {statHistory.slice(-3).map((stat: any, index: number) => (
                  <div key={index} className="grid grid-cols-5 gap-3 p-3 bg-gray-50 rounded-lg text-xs">
                    <div className="font-medium text-gray-900">{stat.month}</div>
                    <div className="text-center">
                      <div className="font-medium">{formatNumber(stat.followers)}</div>
                      <div className="text-gray-500">followers</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{formatNumber(stat.avgLikes)}</div>
                      <div className="text-gray-500">avg likes</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{formatNumber(stat.avgViews || 0)}</div>
                      <div className="text-gray-500">avg views</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{formatNumber(stat.avgComments)}</div>
                      <div className="text-gray-500">avg comments</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Growth Analysis */}
            {statHistory.length >= 2 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h5 className="text-sm font-medium text-blue-900 mb-2">📊 Growth Analysis</h5>
                {(() => {
                  const latest = statHistory[statHistory.length - 1]
                  const previous = statHistory[statHistory.length - 2]
                  if (!latest || !previous) return null
                  const followerGrowth = ((latest.followers - previous.followers) / previous.followers) * 100
                  const engagementGrowth = latest.avgLikes && previous.avgLikes 
                    ? ((latest.avgLikes - previous.avgLikes) / previous.avgLikes) * 100 
                    : 0
                  
                  return (
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className={`w-4 h-4 ${followerGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                        <span className="text-gray-700">
                          Follower growth: <span className={`font-medium ${followerGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {followerGrowth >= 0 ? '+' : ''}{followerGrowth.toFixed(1)}%
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className={`w-4 h-4 ${engagementGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                        <span className="text-gray-700">
                          Engagement growth: <span className={`font-medium ${engagementGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {engagementGrowth >= 0 ? '+' : ''}{engagementGrowth.toFixed(1)}%
                          </span>
                        </span>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
        )}
        
        {/* 🆕 LOOKALIKE CREATORS */}
        {allLookalikes.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">👥 Similar Creators {lookalikesByTopics.length > 0 && <span className="text-sm text-gray-500">(by topics & audience)</span>}</h4>
            <div className="space-y-3">
              {allLookalikes.slice(0, 5).map((creator: any, index: number) => (
                <div 
                  key={index} 
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => creator.url && window.open(creator.url, '_blank')}
                >
                  <img 
                    src={creator.picture} 
                    alt={creator.fullname} 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h5 className="font-medium text-gray-900 truncate">{creator.fullname}</h5>
                      {creator.url && <ExternalLink className="w-3 h-3 text-gray-400 hover:text-blue-600" />}
                    </div>
                    <p className="text-sm text-gray-600">@{creator.username}</p>
                  </div>
                  <div className="text-right text-xs text-gray-500 space-y-1">
                    <div className="font-medium">{formatNumber(creator.followers)} followers</div>
                    <div>{formatNumber(creator.engagements)} engagements</div>
                  </div>
                </div>
              ))}
              
              {allLookalikes.length > 5 && (
                <div className="text-center py-2">
                  <span className="text-sm text-gray-500">
                    +{allLookalikes.length - 5} more similar creators
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
        
      </div>
    </CollapsibleSection>
  )
}