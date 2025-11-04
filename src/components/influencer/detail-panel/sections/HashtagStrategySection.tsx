import React from 'react'
import { Hash, TrendingUp, Target, Zap } from 'lucide-react'
import { CollapsibleSection } from '../components/CollapsibleSection'
import { MetricRow } from '../components/MetricRow'
import { InfluencerData } from '../types'

interface HashtagStrategySectionProps {
  influencer: InfluencerData
}

export const HashtagStrategySection = ({ influencer }: HashtagStrategySectionProps) => {
  const hashtags = influencer.relevant_hashtags || []
  const modashHashtags = (influencer as any).hashtags || [] // From Modash API
  const hasHashtags = hashtags.length > 0 || modashHashtags.length > 0

  if (!hasHashtags) {
    return (
      <CollapsibleSection title="Hashtag Strategy">
        <div className="text-gray-500 text-sm italic">
          No hashtag data available
        </div>
      </CollapsibleSection>
    )
  }

  // Use Modash hashtags if available, otherwise fall back to relevant_hashtags
  const displayHashtags = modashHashtags.length > 0 ? modashHashtags : hashtags
  const totalHashtags = displayHashtags.length
  const topHashtags = displayHashtags.slice(0, 8) // Show top 8 hashtags

  return (
    <CollapsibleSection title="Hashtag Strategy">
      <div className="space-y-4">
        {/* Hashtag Overview */}
        <div className="grid grid-cols-2 gap-4">
          <MetricRow 
            icon={Hash} 
            label="Total Hashtags" 
            value={totalHashtags.toString()} 
          />
          <MetricRow 
            icon={Target} 
            label="Strategy Score" 
            value={totalHashtags > 20 ? "Excellent" : totalHashtags > 10 ? "Good" : "Basic"} 
          />
        </div>

        {/* Top Hashtags */}
        {topHashtags.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Most Used Hashtags
            </h4>
            <div className="flex flex-wrap gap-2">
              {topHashtags.map((hashtag: any, index: number) => {
                // Handle both string hashtags and Modash hashtag objects
                const tag = typeof hashtag === 'string' ? hashtag : hashtag.tag
                const weight = typeof hashtag === 'object' ? hashtag.weight : null
                
                return (
                  <div key={index} className="flex flex-col">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                      <Hash className="w-3 h-3 mr-1" />
                      {tag ? tag.replace('#', '') : 'No tag'}
                    </span>
                    {weight && (
                      <span className="text-xs text-gray-500 text-center mt-1">
                        {(weight * 100).toFixed(2)}%
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Hashtag Strategy Insights */}
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <div className="flex items-center text-green-700">
            <Zap className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">
              {totalHashtags > 20 ? 'Advanced hashtag optimization' : 
               totalHashtags > 10 ? 'Good hashtag diversity' : 
               'Room for hashtag expansion'}
            </span>
          </div>
        </div>
      </div>
    </CollapsibleSection>
  )
}