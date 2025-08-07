import React from 'react'
import { BookOpen, TrendingUp, Target, Lightbulb } from 'lucide-react'
import { CollapsibleSection } from '../components/CollapsibleSection'
import { MetricRow } from '../components/MetricRow'
import { InfluencerData } from '../types'

interface ContentTopicsSectionProps {
  influencer: InfluencerData
}

export const ContentTopicsSection = ({ influencer }: ContentTopicsSectionProps) => {
  const topics = influencer.content_topics || []
  const hasTopics = topics.length > 0

  if (!hasTopics) {
    return (
      <CollapsibleSection title="Content Topics">
        <div className="text-gray-500 text-sm italic">
          No content topic data available
        </div>
      </CollapsibleSection>
    )
  }

  // Calculate topic insights
  const totalTopics = topics.length
  const topTopics = topics.slice(0, 8) // Show top 8 topics

  return (
    <CollapsibleSection title="Content Topics">
      <div className="space-y-4">
        {/* Topics Overview */}
        <div className="grid grid-cols-2 gap-4">
          <MetricRow 
            icon={BookOpen} 
            label="Content Themes" 
            value={totalTopics.toString()} 
          />
          <MetricRow 
            icon={Target} 
            label="Content Focus" 
            value={totalTopics > 15 ? "Diverse" : totalTopics > 8 ? "Focused" : "Niche"} 
          />
        </div>

        {/* Top Content Topics */}
        {topTopics.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Primary Content Topics
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {topTopics.map((topic, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between py-2 px-3 bg-purple-50 rounded-lg"
                >
                  <span className="text-sm font-medium text-purple-900 capitalize">{topic}</span>
                  <BookOpen className="w-3 h-3 text-purple-600" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Strategy Insights */}
        <div className="mt-4 p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center text-purple-700">
            <Lightbulb className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">
              {totalTopics > 15 ? 'Multi-niche content creator' : 
               totalTopics > 8 ? 'Well-rounded content strategy' : 
               'Specialized content focus'}
            </span>
          </div>
        </div>
      </div>
    </CollapsibleSection>
  )
}