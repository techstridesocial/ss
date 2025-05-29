'use client'

import { useState, useEffect } from 'react'
import { X, Star, Building2, Calendar, DollarSign, Users, CheckCircle, Play, Pause, Edit, TrendingUp, Target, Clock, Package, Eye, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface CampaignDetailPanelProps {
  isOpen: boolean
  onClose: () => void
  campaign: any
  onEditCampaign?: (campaignId: string) => void
  onPauseCampaign?: (campaignId: string) => void
  onResumeCampaign?: (campaignId: string) => void
  onViewInvitations?: (campaignId: string) => void
}

const Section = ({ 
  title, 
  children, 
  className = '',
  delay = 0,
  action
}: { 
  title: string
  children: React.ReactNode
  className?: string
  delay?: number
  action?: React.ReactNode
}) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className={`bg-white rounded-2xl shadow-sm border border-gray-200/60 ${className}`}
    >
      <div className="px-8 py-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          {action}
        </div>
      </div>
      <div className="p-8">
        {children}
      </div>
    </motion.div>
  )
}

const InfoField = ({
  label,
  value,
  icon,
  type = 'text'
}: {
  label: string
  value: string | number
  icon?: React.ReactNode
  type?: 'text' | 'currency' | 'date' | 'percentage'
}) => {
  const renderValue = () => {
    if (type === 'currency' && typeof value === 'number') {
      return <span className="text-gray-900 font-medium">${value.toLocaleString()}</span>
    }
    
    if (type === 'date' && value) {
      return <span className="text-gray-900 font-medium">{new Date(value as string).toLocaleDateString()}</span>
    }
    
    if (type === 'percentage' && typeof value === 'number') {
      return <span className="text-gray-900 font-medium">{value}%</span>
    }
    
    return <span className="text-gray-900 font-medium">{value}</span>
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        {icon && <span className="text-gray-400">{icon}</span>}
        <label className="text-sm font-medium text-gray-600 uppercase tracking-wide">{label}</label>
      </div>
      <div className="text-base leading-relaxed">{renderValue()}</div>
    </div>
  )
}

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return {
          label: 'Active',
          className: 'bg-green-100 text-green-800 border-green-200',
          dotColor: 'bg-green-600',
          icon: <Play size={10} />
        }
      case 'PAUSED':
        return {
          label: 'Paused',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          dotColor: 'bg-yellow-600',
          icon: <Pause size={10} />
        }
      case 'COMPLETED':
        return {
          label: 'Completed',
          className: 'bg-blue-100 text-blue-800 border-blue-200',
          dotColor: 'bg-blue-600',
          icon: <CheckCircle size={10} />
        }
      case 'CANCELLED':
        return {
          label: 'Cancelled',
          className: 'bg-red-100 text-red-800 border-red-200',
          dotColor: 'bg-red-600',
          icon: <X size={10} />
        }
      default:
        return {
          label: 'Draft',
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          dotColor: 'bg-gray-600',
          icon: <Clock size={10} />
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full border ${config.className}`}>
      <div className={`w-2 h-2 ${config.dotColor} rounded-full mr-2`}></div>
      {config.icon}
      <span className="ml-1">{config.label}</span>
    </span>
  )
}

const ProgressBar = ({ current, total, label, color = 'blue' }: { current: number, total: number, label: string, color?: string }) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className="text-gray-900 font-semibold">{current} / {total} ({percentage}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className={`${colorClasses[color as keyof typeof colorClasses]} h-3 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}

const InvitationStatusCard = ({ invitation }: { invitation: any }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'border-l-green-500 bg-green-50'
      case 'DECLINED': return 'border-l-red-500 bg-red-50'
      case 'PENDING': return 'border-l-yellow-500 bg-yellow-50'
      default: return 'border-l-gray-500 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return <CheckCircle size={16} className="text-green-600" />
      case 'DECLINED': return <X size={16} className="text-red-600" />
      case 'PENDING': return <Clock size={16} className="text-yellow-600" />
      default: return <MessageCircle size={16} className="text-gray-600" />
    }
  }

  return (
    <div className={`border-l-4 ${getStatusColor(invitation.status)} p-4 rounded-r-lg`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {getStatusIcon(invitation.status)}
          <div>
            <h4 className="font-medium text-gray-900">{invitation.influencer_name}</h4>
            <p className="text-sm text-gray-600">${invitation.offered_amount.toLocaleString()}</p>
            {invitation.decline_reason && (
              <p className="text-sm text-red-600 mt-1">Reason: {invitation.decline_reason}</p>
            )}
          </div>
        </div>
        <span className="text-xs text-gray-500">
          {invitation.responded_at ? new Date(invitation.responded_at).toLocaleDateString() : 'Pending'}
        </span>
      </div>
    </div>
  )
}

export default function CampaignDetailPanel({ 
  isOpen, 
  onClose, 
  campaign, 
  onEditCampaign,
  onPauseCampaign,
  onResumeCampaign,
  onViewInvitations
}: CampaignDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'invitations' | 'analytics'>('overview')
  const [isLoading, setIsLoading] = useState(false)

  if (!campaign) return null

  // Mock invitation data - in real app this would come from props or API
  const mockInvitations = [
    {
      id: 'inv_1',
      influencer_name: 'Sarah Creator',
      status: 'ACCEPTED',
      offered_amount: 1500,
      responded_at: '2024-01-10T14:30:00Z'
    },
    {
      id: 'inv_2',
      influencer_name: 'BeautyByBella',
      status: 'PENDING',
      offered_amount: 1200,
      responded_at: null
    },
    {
      id: 'inv_3',
      influencer_name: 'FitnessFiona',
      status: 'DECLINED',
      offered_amount: 920,
      responded_at: '2024-01-16T11:00:00Z',
      decline_reason: 'Schedule conflict with existing brand partnership'
    }
  ]

  const handleAction = async (action: string) => {
    setIsLoading(true)
    try {
      switch (action) {
        case 'edit':
          onEditCampaign?.(campaign.id)
          break
        case 'pause':
          onPauseCampaign?.(campaign.id)
          break
        case 'resume':
          onResumeCampaign?.(campaign.id)
          break
        case 'invitations':
          onViewInvitations?.(campaign.id)
          break
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Enhanced Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[60]"
          />
          
          {/* Enhanced Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 200,
              duration: 0.6
            }}
            className="fixed right-0 top-0 h-full w-full max-w-5xl bg-white shadow-2xl z-[60] overflow-hidden flex flex-col"
          >
            {/* Enhanced Header */}
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex-shrink-0"
            >
              <div className="p-8">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                      <Star size={32} className="text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h2 className="text-2xl font-bold text-gray-900">{campaign.name}</h2>
                        <StatusBadge status={campaign.status} />
                      </div>
                      <p className="text-sm text-gray-600 font-medium mb-2">{campaign.brand_name}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Users size={14} />
                          <span>{campaign.assigned_influencers} influencers</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <DollarSign size={14} />
                          <span>${campaign.budget.toLocaleString()} budget</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>{new Date(campaign.end_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <motion.button
                    onClick={onClose}
                    className="p-3 rounded-2xl hover:bg-gray-100 transition-all duration-200 group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X size={20} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </motion.button>
                </div>

                {/* Tab Navigation */}
                <div className="mt-6 border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    {[
                      { id: 'overview', label: 'Campaign Overview' },
                      { id: 'invitations', label: 'Invitations & Progress' },
                      { id: 'analytics', label: 'Performance Analytics' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.id
                            ? 'border-black text-black'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </motion.div>

            {/* Enhanced Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/30">
              <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                  width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                  background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: rgba(0, 0, 0, 0.2);
                  border-radius: 10px;
                  border: 2px solid transparent;
                  background-clip: content-box;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: rgba(0, 0, 0, 0.3);
                  background-clip: content-box;
                }
              `}</style>
              
              <div className="p-8 space-y-10">
                {/* Campaign Overview Tab */}
                {activeTab === 'overview' && (
                  <>
                    <Section title="Campaign Details" delay={0.1}>
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <InfoField
                            label="Brand"
                            value={campaign.brand_name}
                            icon={<Building2 size={18} />}
                          />
                          <InfoField
                            label="Campaign Name"
                            value={campaign.name}
                            icon={<Star size={18} />}
                          />
                          <InfoField
                            label="Budget"
                            value={campaign.budget}
                            type="currency"
                            icon={<DollarSign size={18} />}
                          />
                          <InfoField
                            label="Spent"
                            value={campaign.spent}
                            type="currency"
                            icon={<TrendingUp size={18} />}
                          />
                          <InfoField
                            label="Start Date"
                            value={campaign.start_date}
                            type="date"
                            icon={<Calendar size={18} />}
                          />
                          <InfoField
                            label="End Date"
                            value={campaign.end_date}
                            type="date"
                            icon={<Calendar size={18} />}
                          />
                        </div>
                        
                        <div className="border-t border-gray-100 pt-6">
                          <InfoField
                            label="Description"
                            value={campaign.description}
                            icon={<MessageCircle size={18} />}
                          />
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                          <div className="space-y-4">
                            <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wide flex items-center">
                              <Target size={16} className="mr-2" />
                              Target Niches
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {campaign.target_niches?.map((niche: string) => (
                                <span key={niche} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                                  {niche}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                          <div className="space-y-4">
                            <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wide flex items-center">
                              <Package size={16} className="mr-2" />
                              Target Platforms
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {campaign.target_platforms?.map((platform: string) => (
                                <span key={platform} className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                                  {platform}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Section>

                    <Section title="Progress Overview" delay={0.2}>
                      <div className="space-y-6">
                        <ProgressBar
                          current={campaign.spent}
                          total={campaign.budget}
                          label="Budget Usage"
                          color="blue"
                        />
                        <ProgressBar
                          current={campaign.completed_deliverables}
                          total={campaign.assigned_influencers}
                          label="Deliverables Completed"
                          color="green"
                        />
                        <ProgressBar
                          current={campaign.invitations_accepted}
                          total={campaign.total_invited}
                          label="Invitations Accepted"
                          color="yellow"
                        />
                      </div>
                    </Section>
                  </>
                )}

                {/* Invitations Tab */}
                {activeTab === 'invitations' && (
                  <>
                    <Section title="Invitation Status" delay={0.1}>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">{campaign.invitations_accepted}</div>
                            <div className="text-sm text-green-800">Accepted</div>
                          </div>
                          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-yellow-600">{campaign.invitations_pending}</div>
                            <div className="text-sm text-yellow-800">Pending</div>
                          </div>
                          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-red-600">{campaign.invitations_declined}</div>
                            <div className="text-sm text-red-800">Declined</div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="text-lg font-semibold text-gray-900">Individual Responses</h4>
                          {mockInvitations.map((invitation) => (
                            <InvitationStatusCard key={invitation.id} invitation={invitation} />
                          ))}
                        </div>
                      </div>
                    </Section>
                  </>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                  <>
                    <Section title="Performance Metrics" delay={0.1}>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <InfoField
                            label="Total Reach"
                            value={campaign.actual_reach?.toLocaleString() || '0'}
                            icon={<TrendingUp size={18} />}
                          />
                          <InfoField
                            label="Estimated Reach"
                            value={campaign.estimated_reach?.toLocaleString() || '0'}
                            icon={<Target size={18} />}
                          />
                        </div>
                        <div className="space-y-4">
                          <InfoField
                            label="Engagement Rate"
                            value={campaign.engagement_rate || 0}
                            type="percentage"
                            icon={<Star size={18} />}
                          />
                          <InfoField
                            label="Cost Per Reach"
                            value={campaign.actual_reach ? Math.round(campaign.spent / campaign.actual_reach * 1000) / 1000 : 0}
                            type="currency"
                            icon={<DollarSign size={18} />}
                          />
                        </div>
                      </div>
                    </Section>

                    <Section title="ROI Analysis" delay={0.2}>
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-900 mb-2">
                            {campaign.actual_reach && campaign.budget 
                              ? `${Math.round((campaign.actual_reach / campaign.budget) * 100)}%` 
                              : 'N/A'
                            }
                          </div>
                          <div className="text-sm text-blue-700">Reach per Dollar Spent</div>
                        </div>
                      </div>
                    </Section>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm p-8">
              <div className="flex justify-between items-center">
                <div className="flex space-x-3">
                  <motion.button
                    onClick={() => handleAction('invitations')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl flex items-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Eye size={16} />
                    <span>Manage Invitations</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={() => handleAction('edit')}
                    className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl flex items-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Edit size={16} />
                    <span>Edit Campaign</span>
                  </motion.button>
                </div>

                <div className="flex space-x-3">
                  {campaign.status === 'ACTIVE' && (
                    <motion.button
                      onClick={() => handleAction('pause')}
                      className="px-6 py-3 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl flex items-center space-x-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Pause size={16} />
                      <span>Pause Campaign</span>
                    </motion.button>
                  )}
                  
                  {campaign.status === 'PAUSED' && (
                    <motion.button
                      onClick={() => handleAction('resume')}
                      className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl flex items-center space-x-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Play size={16} />
                      <span>Resume Campaign</span>
                    </motion.button>
                  )}
                  
                  <motion.button
                    onClick={onClose}
                    className="px-6 py-3 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 text-gray-700 font-medium shadow-sm hover:shadow-md"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
} 