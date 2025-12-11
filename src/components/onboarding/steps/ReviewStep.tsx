import React from 'react'
import { motion } from 'framer-motion'
import { Mail, Edit } from 'lucide-react'
import { OnboardingData } from '../../../hooks/useOnboardingForm'

interface ReviewStepProps {
  formData: OnboardingData
  onEditStep: (stepId: string) => void
  stepMap: Map<string, number>
  options: {
    budget: Array<{ value: string; label: string }>
    contactMethod: Array<{ value: string; label: string }>
    proactiveSuggestions: Array<{ value: string; label: string }>
  }
}

export function ReviewStep({ formData, onEditStep, stepMap, options }: ReviewStepProps) {
  const getStepIndex = (stepId: string): number => {
    return stepMap.get(stepId) ?? 0
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-4 max-h-96 overflow-y-auto">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="group relative">
            <p className="text-blue-200 font-medium">Company</p>
            <p className="text-white">{formData.company_name}</p>
            <button
              onClick={() => onEditStep('company_name')}
              className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Edit company name"
            >
              <Edit size={14} className="text-blue-300" />
            </button>
          </div>
          <div className="group relative">
            <p className="text-blue-200 font-medium">Industry</p>
            <p className="text-white">{formData.industry}</p>
            <button
              onClick={() => onEditStep('industry')}
              className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Edit industry"
            >
              <Edit size={14} className="text-blue-300" />
            </button>
          </div>
          <div className="group relative">
            <p className="text-blue-200 font-medium">Website</p>
            <p className="text-white break-all">{formData.website}</p>
            <button
              onClick={() => onEditStep('website')}
              className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Edit website"
            >
              <Edit size={14} className="text-blue-300" />
            </button>
          </div>
          <div className="group relative">
            <p className="text-blue-200 font-medium">Team Size</p>
            <p className="text-white">{formData.company_size}</p>
            <button
              onClick={() => onEditStep('company_size')}
              className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Edit company size"
            >
              <Edit size={14} className="text-blue-300" />
            </button>
          </div>
          <div className="group relative">
            <p className="text-blue-200 font-medium">Annual Budget</p>
            <p className="text-white">{options.budget.find(o => o.value === formData.annual_budget)?.label}</p>
            <button
              onClick={() => onEditStep('annual_budget')}
              className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Edit annual budget"
            >
              <Edit size={14} className="text-blue-300" />
            </button>
          </div>
          <div className="group relative">
            <p className="text-blue-200 font-medium">Brand Contact</p>
            <p className="text-white">{formData.brand_contact_name}</p>
            <p className="text-white text-xs">{formData.brand_contact_email}</p>
            <button
              onClick={() => onEditStep('brand_contact_name')}
              className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Edit contact information"
            >
              <Edit size={14} className="text-blue-300" />
            </button>
          </div>
        </div>

        <div className="group relative">
          <p className="text-blue-200 font-medium">Description</p>
          <p className="text-white text-sm">{formData.description}</p>
          <button
            onClick={() => onEditStep('description')}
            className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Edit description"
          >
            <Edit size={14} className="text-blue-300" />
          </button>
        </div>

        <div className="group relative">
          <p className="text-blue-200 font-medium">Content Niches ({formData.preferred_niches.length})</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.preferred_niches.map(niche => (
              <span key={niche} className="px-2 py-1 bg-white/20 rounded-lg text-white text-xs">
                {niche}
              </span>
            ))}
          </div>
          <button
            onClick={() => onEditStep('preferred_niches')}
            className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Edit preferred niches"
          >
            <Edit size={14} className="text-blue-300" />
          </button>
        </div>

        <div className="group relative">
          <p className="text-blue-200 font-medium">Target Regions ({formData.target_regions.length})</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.target_regions.map(region => (
              <span key={region} className="px-2 py-1 bg-white/20 rounded-lg text-white text-xs">
                {region}
              </span>
            ))}
          </div>
          <button
            onClick={() => onEditStep('target_regions')}
            className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Edit target regions"
          >
            <Edit size={14} className="text-blue-300" />
          </button>
        </div>

        {formData.primary_region && (
          <div className="group relative">
            <p className="text-blue-200 font-medium">Primary Region</p>
            <p className="text-white text-sm">{formData.primary_region}</p>
            <button
              onClick={() => onEditStep('primary_region')}
              className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Edit primary region"
            >
              <Edit size={14} className="text-blue-300" />
            </button>
          </div>
        )}

        {formData.campaign_objective && (
          <div className="group relative">
            <p className="text-blue-200 font-medium">Campaign Objective</p>
            <p className="text-white text-sm">{formData.campaign_objective}</p>
            <button
              onClick={() => onEditStep('campaign_objective')}
              className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Edit campaign objective"
            >
              <Edit size={14} className="text-blue-300" />
            </button>
          </div>
        )}

        {formData.product_service_type && (
          <div className="group relative">
            <p className="text-blue-200 font-medium">Product/Service Type</p>
            <p className="text-white text-sm">{formData.product_service_type}</p>
            <button
              onClick={() => onEditStep('product_service_type')}
              className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Edit product service type"
            >
              <Edit size={14} className="text-blue-300" />
            </button>
          </div>
        )}

        {formData.preferred_contact_method && (
          <div className="group relative">
            <p className="text-blue-200 font-medium">Preferred Contact Method</p>
            <p className="text-white text-sm">
              {options.contactMethod.find(o => o.value === formData.preferred_contact_method)?.label}
            </p>
            <button
              onClick={() => onEditStep('preferred_contact_method')}
              className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Edit preferred contact method"
            >
              <Edit size={14} className="text-blue-300" />
            </button>
          </div>
        )}

        {formData.proactive_suggestions && (
          <div className="group relative">
            <p className="text-blue-200 font-medium">Proactive Creator Suggestions</p>
            <p className="text-white text-sm">
              {options.proactiveSuggestions.find(o => o.value === formData.proactive_suggestions)?.label}
            </p>
            <button
              onClick={() => onEditStep('proactive_suggestions')}
              className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Edit proactive suggestions"
            >
              <Edit size={14} className="text-blue-300" />
            </button>
          </div>
        )}

        {formData.invite_team_members === 'yes' && (formData.team_member_1_email || formData.team_member_2_email) && (
          <div className="group relative">
            <p className="text-blue-200 font-medium">Team Members to Invite</p>
            <div className="space-y-1 mt-2">
              {formData.team_member_1_email && (
                <p className="text-white text-sm flex items-center space-x-2">
                  <Mail size={14} className="text-blue-300" />
                  <span>{formData.team_member_1_email}</span>
                </p>
              )}
              {formData.team_member_2_email && (
                <p className="text-white text-sm flex items-center space-x-2">
                  <Mail size={14} className="text-blue-300" />
                  <span>{formData.team_member_2_email}</span>
                </p>
              )}
            </div>
            <button
              onClick={() => onEditStep('team_invitations')}
              className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Edit team invitations"
            >
              <Edit size={14} className="text-blue-300" />
            </button>
          </div>
        )}

        {formData.stride_contact_name && (
          <div className="group relative">
            <p className="text-blue-200 font-medium">Stride Social Contact</p>
            <p className="text-white text-sm">{formData.stride_contact_name}</p>
            <button
              onClick={() => onEditStep('stride_contact_name')}
              className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Edit Stride contact name"
            >
              <Edit size={14} className="text-blue-300" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
