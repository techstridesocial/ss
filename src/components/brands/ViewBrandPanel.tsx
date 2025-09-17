'use client'

import { useState } from 'react'
import { X, Building2, Mail, Globe, User, MapPin, Phone, Tag, CheckCircle, AlertCircle, Calendar, DollarSign, Target, TrendingUp, FileText, Star, ExternalLink, Edit } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ViewBrandPanelProps {
  isOpen: boolean
  onClose: () => void
  brand: any // In real app, this would be a proper Brand interface
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`space-y-6 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-1 h-6 bg-black rounded-full"></div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
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
  type?: 'text' | 'email' | 'url' | 'phone'
}) => {
  const renderValue = () => {
    if (!value) return <span className="text-gray-400 italic">Not provided</span>
    
    switch (type) {
      case 'email':
        return <a href={`mailto:${value}`} className="text-blue-600 hover:text-blue-800 transition-colors">{value}</a>
      case 'url':
        return <a href={value.toString()} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors flex items-center space-x-1">
          <span>{value}</span>
          <ExternalLink size={14} />
        </a>
      case 'phone':
        return <a href={`tel:${value}`} className="text-blue-600 hover:text-blue-800 transition-colors">{value}</a>
      default:
        return <span className="text-gray-900 font-medium">{value}</span>
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center space-x-3">
        {icon && (
          <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
            <div className="text-gray-600">
              {icon}
            </div>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
          <div className="text-sm">
            {renderValue()}
          </div>
        </div>
      </div>
    </div>
  )
}

const StatCard = ({
  title,
  value,
  icon,
  color,
  trend
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'red'
  trend?: string
}) => {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-8 hover:shadow-lg hover:border-gray-200 transition-all duration-300 group">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="p-2 rounded-2xl bg-gray-50 group-hover:bg-gray-100 transition-colors duration-300">
            <div className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
              {icon}
            </div>
          </div>
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">{title}</p>
          {trend && <p className="text-xs text-gray-400">{trend}</p>}
        </div>
      </div>
    </div>
  )
}

const CampaignCard = ({
  campaign,
  delay = 0
}: {
  campaign: any
  delay?: number
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-bold text-gray-900 mb-1">{campaign.name}</h4>
          <p className="text-sm text-gray-600">{campaign.description}</p>
        </div>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(campaign.status)}`}>
          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Budget</p>
          <p className="text-sm font-bold text-gray-900">${campaign.budget.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Influencers</p>
          <p className="text-sm font-bold text-gray-900">{campaign.influencer_count}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Start Date</p>
          <p className="text-sm font-medium text-gray-900">{campaign.start_date}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">End Date</p>
          <p className="text-sm font-medium text-gray-900">{campaign.end_date}</p>
        </div>
      </div>
    </motion.div>
  )
}

const EditBrandPanel = ({ 
  isOpen, 
  onClose, 
  brandData, 
  onSave 
}: { 
  isOpen: boolean
  onClose: () => void
  brandData: any
  onSave: (data: any) => void
}) => {
  const [formData, setFormData] = useState({
    company_name: brandData.company_name || '',
    contact_name: brandData.contact_name || '',
    email: brandData.email || '',
    phone: brandData.phone || '+44 20 1234 5678',
    website: brandData.website || 'https://luxebeauty.com',
    industry: brandData.industry || '',
    company_size: '51-200 employees',
    location_country: 'United Kingdom',
    location_city: 'London'
  })
  
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(false)

  const industryOptions = [
    { value: 'Beauty & Cosmetics', label: 'Beauty & Cosmetics' },
    { value: 'Fashion & Style', label: 'Fashion & Style' },
    { value: 'Fitness & Health', label: 'Fitness & Health' },
    { value: 'Technology', label: 'Technology' },
    { value: 'Food & Beverage', label: 'Food & Beverage' },
    { value: 'Travel & Tourism', label: 'Travel & Tourism' },
    { value: 'Automotive', label: 'Automotive' },
    { value: 'Home & Lifestyle', label: 'Home & Lifestyle' },
    { value: 'Entertainment', label: 'Entertainment' },
    { value: 'Finance & Banking', label: 'Finance & Banking' },
    { value: 'Education', label: 'Education' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Marketing Agency', label: 'Marketing Agency' },
    { value: 'Other', label: 'Other' }
  ]

  const companySizeOptions = [
    { value: 'Startup (1-10 employees)', label: 'Startup (1-10 employees)' },
    { value: 'Small (11-50 employees)', label: 'Small (11-50 employees)' },
    { value: 'Medium (51-200 employees)', label: 'Medium (51-200 employees)' },
    { value: 'Large (201-1000 employees)', label: 'Large (201-1000 employees)' },
    { value: 'Enterprise (1000+ employees)', label: 'Enterprise (1000+ employees)' }
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: false }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, boolean> = {}
    
    if (!formData.company_name.trim()) newErrors.company_name = true
    if (!formData.contact_name.trim()) newErrors.contact_name = true
    if (!formData.email.trim()) newErrors.email = true
    if (!formData.industry) newErrors.industry = true

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = true
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return
    
    setIsLoading(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Error updating brand:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const InputField = ({ label, type = 'text', value, onChange, placeholder, required = false, icon, error = false }: any) => (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500 text-base">*</span>}
      </label>
      <div className="relative group">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <div className={`transition-colors duration-200 ${error ? 'text-red-400' : 'text-gray-400 group-focus-within:text-black'}`}>
              {icon}
            </div>
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${icon ? 'pl-12' : 'pl-4'} pr-4 py-4 bg-white border-2 ${
            error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
              : 'border-gray-200 focus:border-black hover:border-gray-300'
          } rounded-2xl focus:outline-none focus:ring-4 focus:ring-black/10 transition-all duration-300 text-sm font-medium placeholder:text-gray-400 shadow-sm hover:shadow-md focus:shadow-lg`}
        />
      </div>
    </div>
  )

  const SelectField = ({ label, value, onChange, options, placeholder, required = false, icon, error = false }: any) => (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500 text-base">*</span>}
      </label>
      <div className="relative group">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <div className={`transition-colors duration-200 ${error ? 'text-red-400' : 'text-gray-400 group-focus-within:text-black'}`}>
              {icon}
            </div>
          </div>
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full ${icon ? 'pl-12' : 'pl-4'} pr-12 py-4 bg-white border-2 ${
            error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
              : 'border-gray-200 focus:border-black hover:border-gray-300'
          } rounded-2xl focus:outline-none focus:ring-4 focus:ring-black/10 transition-all duration-300 text-sm font-medium appearance-none shadow-sm hover:shadow-md focus:shadow-lg cursor-pointer`}
        >
          <option value="">{placeholder}</option>
          {options.map((option: any) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <svg className={`w-5 h-5 transition-colors duration-200 ${error ? 'text-red-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[70]"
          />
          
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
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-[70] overflow-hidden flex flex-col"
          >
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex-shrink-0"
            >
              <div className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Edit Brand</h2>
                    <p className="text-sm text-gray-600 font-medium">Update {brandData.company_name} information</p>
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
              </div>
            </motion.div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
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
                <Section title="Company Information" delay={0.1}>
                  <div className="space-y-6">
                    <InputField
                      label="Company Name"
                      value={formData.company_name}
                      onChange={(value: string) => handleInputChange('company_name', value)}
                      placeholder="Enter company name"
                      required
                      icon={<Building2 size={18} />}
                      error={errors.company_name}
                    />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <SelectField
                        label="Industry"
                        value={formData.industry}
                        onChange={(value: string) => handleInputChange('industry', value)}
                        options={industryOptions}
                        placeholder="Select industry"
                        required
                        icon={<Tag size={18} />}
                        error={errors.industry}
                      />
                      
                      <SelectField
                        label="Company Size"
                        value={formData.company_size}
                        onChange={(value: string) => handleInputChange('company_size', value)}
                        options={companySizeOptions}
                        placeholder="Select company size"
                      />
                    </div>

                    <InputField
                      label="Website"
                      type="url"
                      value={formData.website}
                      onChange={(value: string) => handleInputChange('website', value)}
                      placeholder="https://www.company.com"
                      icon={<Globe size={18} />}
                    />
                  </div>
                </Section>

                <Section title="Primary Contact" delay={0.2}>
                  <div className="space-y-6">
                    <InputField
                      label="Contact Name"
                      value={formData.contact_name}
                      onChange={(value: string) => handleInputChange('contact_name', value)}
                      placeholder="Enter contact name"
                      required
                      icon={<User size={18} />}
                      error={errors.contact_name}
                    />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <InputField
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={(value: string) => handleInputChange('email', value)}
                        placeholder="contact@company.com"
                        required
                        icon={<Mail size={18} />}
                        error={errors.email}
                      />
                      
                      <InputField
                        label="Phone Number"
                        type="tel"
                        value={formData.phone}
                        onChange={(value: string) => handleInputChange('phone', value)}
                        placeholder="+44 20 1234 5678"
                        icon={<Phone size={18} />}
                      />
                    </div>
                  </div>
                </Section>

                <Section title="Location" delay={0.3}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <InputField
                      label="Country"
                      value={formData.location_country}
                      onChange={(value: string) => handleInputChange('location_country', value)}
                      placeholder="United Kingdom"
                      icon={<MapPin size={18} />}
                    />
                    
                    <InputField
                      label="City"
                      value={formData.location_city}
                      onChange={(value: string) => handleInputChange('location_city', value)}
                      placeholder="London"
                    />
                  </div>
                </Section>
              </div>
            </div>

            <div className="border-t border-gray-100 bg-white p-8">
              <div className="flex justify-end space-x-4">
                <motion.button
                  onClick={onClose}
                  className="px-8 py-3 bg-white border-2 border-gray-200 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 text-gray-700 font-medium shadow-sm hover:shadow-md"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-8 py-3 bg-black text-white rounded-2xl hover:bg-gray-800 disabled:bg-gray-400 transition-all duration-300 font-medium shadow-lg hover:shadow-xl flex items-center space-x-2"
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      <span>Save Changes</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default function ViewBrandPanel({ isOpen, onClose, brand }: ViewBrandPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'team_members'>('overview')
  const [isEditMode, setIsEditMode] = useState(false)
  const [teamMembers, setTeamMembers] = useState([
    {
      id: 'user_1',
      email: 'sarah.johnson@luxebeauty.com',
      name: 'Sarah Johnson',
      role: 'BRAND',
      status: 'active',
      last_login: '2024-01-20',
      created_at: '2024-01-10',
      avatar_url: null
    },
    {
      id: 'user_2',
      email: 'marketing@luxebeauty.com',
      name: 'Alex Thompson',
      role: 'BRAND',
      status: 'active',
      last_login: '2024-01-18',
      created_at: '2024-01-12',
      avatar_url: null
    }
  ])

  // Mock data enhancement for the selected brand
  const mockBrandData = {
    ...brand,
    campaigns: [
      {
        id: 'camp_1',
        name: 'Summer Product Launch',
        description: 'Launch campaign for new summer collection with micro-influencers',
        status: 'active',
        budget: 15000,
        spent: 8750,
        influencer_count: 12,
        start_date: '2024-01-15',
        end_date: '2024-02-28',
        reach: 450000,
        engagement_rate: 4.2
      },
      {
        id: 'camp_2',
        name: 'Holiday Brand Awareness',
        description: 'Holiday season brand awareness campaign',
        status: 'completed',
        budget: 25000,
        spent: 24500,
        influencer_count: 18,
        start_date: '2023-11-01',
        end_date: '2023-12-31',
        reach: 780000,
        engagement_rate: 3.8
      },
      {
        id: 'camp_3',
        name: 'Q2 Product Seeding',
        description: 'Product seeding campaign for Q2 launch',
        status: 'DRAFT',
        budget: 12000,
        spent: 0,
        influencer_count: 8,
        start_date: '2024-04-01',
        end_date: '2024-05-15',
        reach: 0,
        engagement_rate: 0
      }
    ],
    shortlists: [
      {
        id: 'short_1',
        name: 'Micro Beauty Influencers',
        influencer_count: 15,
        created_date: '2024-01-20',
        status: 'active'
      },
      {
        id: 'short_2',
        name: 'Premium Lifestyle Creators',
        influencer_count: 8,
        created_date: '2024-01-18',
        status: 'pending_review'
      },
      {
        id: 'short_3',
        name: 'Holiday Campaign Talents',
        influencer_count: 22,
        created_date: '2023-12-01',
        status: 'completed'
      }
    ]
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
            <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
            Active
          </span>
        )
      case 'inactive':
        return (
          <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">
            <div className="w-2 h-2 bg-red-600 rounded-full mr-2"></div>
            Inactive
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
            <div className="w-2 h-2 bg-yellow-600 rounded-full mr-2"></div>
            Pending
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800 border border-gray-200">
            <div className="w-2 h-2 bg-gray-600 rounded-full mr-2"></div>
            Unknown
          </span>
        )
    }
  }

  const handleDeleteTeamMember = async (memberId: string, memberName: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to remove ${memberName} from the team?\n\nThis will revoke their access to the brand portal immediately.`
    )
    
    if (confirmDelete) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Remove from local state
        setTeamMembers(prev => prev.filter(member => member.id !== memberId))
        
        alert(`✅ ${memberName} has been successfully removed from the team.`)
      } catch (error) {
        console.error('Error deleting team member:', error)
        alert('❌ Error removing team member. Please try again.')
      }
    }
  }

  const handleEditBrand = () => {
    setIsEditMode(true)
  }

  const handleSaveEdit = async (editedData: any) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Saving edited brand data:', editedData)
      alert(`✅ ${editedData.company_name} has been updated successfully!`)
      
      setIsEditMode(false)
    } catch (error) {
      console.error('Error updating brand:', error)
      alert('❌ Error updating brand. Please try again.')
      throw error
    }
  }

  return (
    <>
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
              className="fixed right-0 top-0 h-full w-full max-w-4xl bg-white shadow-2xl z-[60] overflow-hidden flex flex-col"
            >
              {/* Enhanced Header with Status */}
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex-shrink-0"
              >
                <div className="p-8">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center">
                        {mockBrandData.logo_url ? (
                          <img src={mockBrandData.logo_url} alt={mockBrandData.company_name} className="w-full h-full rounded-2xl object-cover" />
                        ) : (
                          <Building2 size={32} className="text-gray-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h2 className="text-2xl font-bold text-gray-900">{mockBrandData.company_name}</h2>
                          {getStatusBadge(mockBrandData.status)}
                        </div>
                        <p className="text-sm text-gray-600 font-medium mb-2">{mockBrandData.industry}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Contact: {mockBrandData.contact_name}</span>
                          <span>•</span>
                          <span>Since {mockBrandData.last_activity}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <motion.button
                        className="p-3 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-all duration-200 group"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleEditBrand}
                      >
                        <Edit size={18} className="text-gray-600 group-hover:text-gray-800 transition-colors" />
                      </motion.button>
                      <motion.button
                        onClick={onClose}
                        className="p-3 rounded-2xl hover:bg-gray-100 transition-all duration-200 group"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <X size={20} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Tab Navigation */}
                  <div className="mt-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                      {[
                        { id: 'overview', label: 'Overview' },
                        { id: 'campaigns', label: 'Campaigns' },
                        { id: 'team_members', label: 'Team Members' }
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
              <div className="flex-1 overflow-y-auto custom-scrollbar">
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
                
                <div className="p-8">
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <div className="space-y-10">
                      {/* Key Metrics */}
                      <Section title="Key Metrics" delay={0.1}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          <StatCard
                            title="Total Spend"
                            value={`$${mockBrandData.total_spend.toLocaleString()}`}
                            icon={<DollarSign size={24} />}
                            color="green"
                            trend="Across all campaigns"
                          />
                          <StatCard
                            title="Active Campaigns"
                            value={mockBrandData.active_campaigns}
                            icon={<Target size={24} />}
                            color="blue"
                            trend="Currently running"
                          />
                          <StatCard
                            title="Shortlists"
                            value={mockBrandData.shortlists_count}
                            icon={<FileText size={24} />}
                            color="purple"
                            trend="Created this month"
                          />
                          <StatCard
                            title="Total Reach"
                            value="1.2M"
                            icon={<TrendingUp size={24} />}
                            color="yellow"
                            trend="Estimated reach"
                          />
                        </div>
                      </Section>

                      {/* Company Information */}
                      <Section title="Company Information" delay={0.2}>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <InfoField
                            label="Company Name"
                            value={mockBrandData.company_name}
                            icon={<Building2 size={18} />}
                          />
                          <InfoField
                            label="Industry"
                            value={mockBrandData.industry}
                            icon={<Tag size={18} />}
                          />
                          <InfoField
                            label="Website"
                            value={mockBrandData.website || 'https://luxebeauty.com'}
                            icon={<Globe size={18} />}
                            type="url"
                          />
                          <InfoField
                            label="Company Size"
                            value="51-200 employees"
                            icon={<User size={18} />}
                          />
                        </div>
                      </Section>

                      {/* Contact Information */}
                      <Section title="Contact Information" delay={0.3}>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <InfoField
                            label="Primary Contact"
                            value={mockBrandData.contact_name}
                            icon={<User size={18} />}
                          />
                          <InfoField
                            label="Email"
                            value={mockBrandData.email}
                            icon={<Mail size={18} />}
                            type="email"
                          />
                          <InfoField
                            label="Phone"
                            value="+44 20 1234 5678"
                            icon={<Phone size={18} />}
                            type="phone"
                          />
                          <InfoField
                            label="Location"
                            value="London, United Kingdom"
                            icon={<MapPin size={18} />}
                          />
                        </div>
                      </Section>
                    </div>
                  )}

                  {/* Campaigns Tab */}
                  {activeTab === 'campaigns' && (
                    <div className="space-y-8">
                      <Section title="Campaign History" delay={0.1}>
                        <div className="space-y-6">
                          {mockBrandData.campaigns.map((campaign: any, index: number) => (
                            <CampaignCard
                              key={campaign.id}
                              campaign={campaign}
                              delay={0.1 + (index * 0.1)}
                            />
                          ))}
                        </div>
                      </Section>
                    </div>
                  )}

                  {/* Team Members Tab */}
                  {activeTab === 'team_members' && (
                    <div className="space-y-8">
                      <Section title="Team Members" delay={0.1}>
                        <div className="space-y-6">
                          {teamMembers.map((member: any, index: number) => (
                            <motion.div
                              key={member.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 + (index * 0.1), duration: 0.4 }}
                              className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow duration-300"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className="flex-shrink-0">
                                    {member.avatar_url ? (
                                      <img 
                                        className="w-12 h-12 rounded-2xl object-cover border-2 border-gray-200" 
                                        src={member.avatar_url} 
                                        alt={member.name}
                                      />
                                    ) : (
                                      <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center border-2 border-blue-200">
                                        <User size={20} className="text-blue-600" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-1">
                                      <h4 className="font-semibold text-gray-900">{member.name}</h4>
                                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                                        member.status === 'active' 
                                          ? 'bg-green-100 text-green-800 border border-green-200'
                                          : 'bg-red-100 text-red-800 border border-red-200'
                                      }`}>
                                        <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                          member.status === 'active' ? 'bg-green-600' : 'bg-red-600'
                                        }`}></div>
                                        {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-1">{member.email}</p>
                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                      <span>Role: {member.role}</span>
                                      <span>•</span>
                                      <span>Last login: {member.last_login}</span>
                                      <span>•</span>
                                      <span>Joined: {member.created_at}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <motion.button
                                    onClick={() => handleDeleteTeamMember(member.id, member.name)}
                                    className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-all duration-200 group"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    title={`Remove ${member.name} from team`}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </motion.button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                          
                          {/* Empty state */}
                          {teamMembers.length === 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1, duration: 0.4 }}
                              className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center"
                            >
                              <User size={32} className="text-gray-400 mx-auto mb-4" />
                              <h3 className="text-lg font-medium text-gray-900 mb-2">No team members</h3>
                              <p className="text-sm text-gray-500">This brand doesn't have any team members with portal access yet.</p>
                            </motion.div>
                          )}
                        </div>
                      </Section>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Brand Panel - Separate from main AnimatePresence */}
      <EditBrandPanel
        isOpen={isEditMode}
        onClose={() => setIsEditMode(false)}
        brandData={mockBrandData}
        onSave={handleSaveEdit}
      />
    </>
  )
} 