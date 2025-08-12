'use client'

import { Hash, Lightbulb } from 'lucide-react'
import { CollapsibleSection } from '../components/CollapsibleSection'
import { InfluencerData } from '../types'

interface ContentStrategySectionProps {
  influencer: InfluencerData
}

export const ContentStrategySection = ({ influencer }: ContentStrategySectionProps) => {
  const hashtags = influencer.relevant_hashtags || []
  const topics = influencer.content_topics || []

  if (hashtags.length === 0 && topics.length === 0) {
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
              {hashtags.slice(0, 8).map((hashtag, index) => {
                // Handle both string hashtags and Modash hashtag objects
                const tag = typeof hashtag === 'string' ? hashtag : hashtag?.tag || ''
                return (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200"
                  >
                    {tag && tag.startsWith('#') ? tag : `#${tag}`}
                  </span>
                )
              })}
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



      </div>
    </CollapsibleSection>
  )
}