'use client'

import { Hash, Briefcase, Lightbulb } from 'lucide-react'
import { CollapsibleSection } from '../components/CollapsibleSection'
import { InfluencerData } from '../types'

interface ContentStrategySectionProps {
  influencer: InfluencerData
}

export const ContentStrategySection = ({ influencer }: ContentStrategySectionProps) => {
  const hashtags = influencer.relevant_hashtags || []
  const partnerships = influencer.brand_partnerships || []
  const topics = influencer.content_topics || []

  if (hashtags.length === 0 && partnerships.length === 0 && topics.length === 0) {
    return null // Don't show section if no data
  }

  return (
    <CollapsibleSection title="Content Strategy" defaultOpen={false}>
      <div className="space-y-4">
        
        {/* Relevant Hashtags */}
        {hashtags.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Hash className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-gray-700">Relevant Hashtags</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {hashtags.slice(0, 8).map((hashtag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200"
                >
                  {hashtag.startsWith('#') ? hashtag : `#${hashtag}`}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Content Topics */}
        {topics.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Lightbulb className="w-4 h-4 text-green-600" />
              <span className="font-medium text-gray-700">Content Topics</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {topics.slice(0, 8).map((topic, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Brand Partnerships */}
        {partnerships.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Briefcase className="w-4 h-4 text-purple-600" />
              <span className="font-medium text-gray-700">Brand Partnerships</span>
            </div>
            <div className="space-y-1">
              {partnerships.slice(0, 5).map((brand, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-purple-50 rounded-lg border border-purple-200"
                >
                  <span className="text-sm font-medium text-purple-900">{brand.name}</span>
                  {brand.count && (
                    <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                      {brand.count.toLocaleString()} mentions
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </CollapsibleSection>
  )
}