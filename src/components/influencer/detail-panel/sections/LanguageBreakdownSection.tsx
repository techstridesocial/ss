import React from 'react'
import { Globe, TrendingUp, MessageCircle, Flag } from 'lucide-react'
import { CollapsibleSection } from '../components/CollapsibleSection'
import { MetricRow } from '../components/MetricRow'
import { InfluencerData } from '../types'

interface LanguageBreakdownSectionProps {
  influencer: InfluencerData
}

export const LanguageBreakdownSection = ({ influencer }: LanguageBreakdownSectionProps) => {
  const languages = influencer.audience_languages || []
  const hasLanguages = languages.length > 0
  


  if (!hasLanguages) {
    return (
      <CollapsibleSection title="Language Breakdown">
        <div className="text-gray-500 text-sm italic">
          No language data available
        </div>
      </CollapsibleSection>
    )
  }

  // Calculate language insights
  const totalLanguages = languages.length
  const topLanguages = languages.slice(0, 8) // Show top 8 languages

  return (
    <CollapsibleSection title="Language Breakdown">
      <div className="space-y-4">
        {/* Language Overview */}
        <div className="grid grid-cols-2 gap-4">
          <MetricRow 
            icon={Globe} 
            label="Languages Spoken" 
            value={totalLanguages.toString()} 
          />
          <MetricRow 
            icon={MessageCircle} 
            label="Global Reach" 
            value={totalLanguages > 10 ? "Worldwide" : totalLanguages > 5 ? "Regional" : "Local"} 
          />
        </div>

        {/* Top Languages */}
        {topLanguages.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Audience Languages
            </h4>
            <div className="space-y-2">
              {topLanguages.map((language, index) => {
                // Use real percentage from Modash API
                const percentage = typeof language === 'string' ? 0 : language.percentage || 0
                const languageName = typeof language === 'string' ? language : language.name || 'Unknown'
                
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <Flag className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900 capitalize min-w-0 flex-1">
                        {languageName}
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-20">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 min-w-fit">{percentage}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Language Insights */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center text-blue-700">
            <Globe className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">
              {totalLanguages > 10 ? 'Truly global audience reach' : 
               totalLanguages > 5 ? 'Strong international presence' : 
               'Primarily monolingual audience'}
            </span>
          </div>
        </div>
      </div>
    </CollapsibleSection>
  )
}