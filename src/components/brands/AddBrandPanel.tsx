'use client'

import { useState } from 'react'
import { X, Building2, Mail, Globe, User, MapPin, Phone, Tag, CheckCircle, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/components/ui/use-toast'

interface AddBrandPanelProps {
  isOpen: boolean
  onClose: () => void
  onSave: (brandData: any) => void
}

const Section = ({ 
  title, 
  children, 
  className = '',
  delay = 0
}: { 
  title: string
  children: React.ReactNode
  className?: string
  delay?: number
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`space-y-6 ${className}`}
    >
      <div className="flex items-center space-x-2">
        <div className="w-1 h-6 bg-black rounded-full"></div>
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      </div>
      {children}
    </motion.div>
  )
}

const InputField = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  icon,
  error = false
}: {
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  required?: boolean
  icon?: React.ReactNode
  error?: boolean
}) => {
  return (
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
}

const SelectField = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  icon,
  error = false
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder: string
  required?: boolean
  icon?: React.ReactNode
  error?: boolean
}) => {
  return (
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
          {options.map((option) => (
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
}

export default function AddBrandPanel({ isOpen, onClose, onSave }: AddBrandPanelProps) {
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    website: '',
    industry: '',
    company_size: '',
    location_country: '',
    location_city: ''
  })
  
  const [brandUsers, setBrandUsers] = useState([
    { email: '', role: 'BRAND' },
    { email: '', role: 'BRAND' }
  ])
  
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)

  const industryOptions = [
    { value: 'beauty_cosmetics', label: 'Beauty & Cosmetics' },
    { value: 'fashion', label: 'Fashion & Style' },
    { value: 'fitness_health', label: 'Fitness & Health' },
    { value: 'technology', label: 'Technology' },
    { value: 'food_beverage', label: 'Food & Beverage' },
    { value: 'travel', label: 'Travel & Tourism' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'home_lifestyle', label: 'Home & Lifestyle' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'finance', label: 'Finance & Banking' },
    { value: 'education', label: 'Education' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'marketing_agency', label: 'Marketing Agency' },
    { value: 'other', label: 'Other' }
  ]

  const companySizeOptions = [
    { value: 'startup', label: 'Startup (1-10 employees)' },
    { value: 'small', label: 'Small (11-50 employees)' },
    { value: 'medium', label: 'Medium (51-200 employees)' },
    { value: 'large', label: 'Large (201-1000 employees)' },
    { value: 'enterprise', label: 'Enterprise (1000+ employees)' }
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: false }))
    }
  }

  const handleUserChange = (index: number, field: string, value: string) => {
    setBrandUsers(prev => prev.map((user, i) => 
      i === index ? { ...user, [field]: value } : user
    ))
  }

  const getValidUsers = () => {
    return brandUsers.filter(user => user.email.trim())
  }

  const validateForm = () => {
    const newErrors: Record<string, boolean> = {}
    
    // Required field validation
    if (!formData.company_name.trim()) newErrors.company_name = true
    if (!formData.contact_name.trim()) newErrors.contact_name = true
    if (!formData.email.trim()) newErrors.email = true
    if (!formData.industry) newErrors.industry = true

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = true
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateUserEmails = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const validUsers = getValidUsers()
    
    for (const user of validUsers) {
      if (!emailRegex.test(user.email)) {
        toast({
          title: 'Validation Error',
          description: `Please enter a valid email address for ${user.email}`,
          variant: 'destructive'
        })
        return false
      }
    }
    
    // Check for duplicate emails
    const emails = validUsers.map(user => user.email.toLowerCase())
    const uniqueEmails = new Set(emails)
    if (emails.length !== uniqueEmails.size) {
      toast({
        title: 'Validation Error',
        description: 'Please ensure all user email addresses are unique.',
        variant: 'destructive'
      })
      return false
    }
    
    return true
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    // Validate user emails if any are provided
    if (!validateUserEmails()) {
      return
    }

    setIsLoading(true)
    
    try {
      const validUsers = getValidUsers()
      await onSave({
        ...formData,
        brandUsers: validUsers
      })
      
      // Reset form with animation
      setTimeout(() => {
        setFormData({
          company_name: '',
          contact_name: '',
          email: '',
          phone: '',
          website: '',
          industry: '',
          company_size: '',
          location_country: '',
          location_city: ''
        })
        
        setBrandUsers([
          { email: '', role: 'BRAND' },
          { email: '', role: 'BRAND' }
        ])
        
        setErrors({})
        setCurrentStep(1)
      }, 500)
      
      onClose()
    } catch (error) {
      console.error('Error saving brand:', error)
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
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-[60] overflow-hidden flex flex-col"
          >
            {/* Enhanced Header */}
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex-shrink-0"
            >
              <div className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Add New Brand</h2>
                    <p className="text-sm text-gray-600 font-medium">Create a new brand profile and invite team members</p>
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
              <div className="p-8 space-y-10">
                {/* Company Information */}
                <Section title="Company Information" delay={0.1}>
                  <div className="space-y-6">
                    <InputField
                      label="Company Name"
                      value={formData.company_name}
                      onChange={(value) => handleInputChange('company_name', value)}
                      placeholder="Enter your company name"
                      required
                      icon={<Building2 size={18} />}
                      error={errors.company_name}
                    />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <SelectField
                        label="Industry"
                        value={formData.industry}
                        onChange={(value) => handleInputChange('industry', value)}
                        options={industryOptions}
                        placeholder="Select your industry"
                        required
                        icon={<Tag size={18} />}
                        error={errors.industry}
                      />
                      
                      <SelectField
                        label="Company Size"
                        value={formData.company_size}
                        onChange={(value) => handleInputChange('company_size', value)}
                        options={companySizeOptions}
                        placeholder="Select company size"
                      />
                    </div>

                    <InputField
                      label="Website"
                      type="url"
                      value={formData.website}
                      onChange={(value) => handleInputChange('website', value)}
                      placeholder="https://www.yourcompany.com"
                      icon={<Globe size={18} />}
                    />
                  </div>
                </Section>

                {/* Primary Contact */}
                <Section title="Primary Contact" delay={0.2}>
                  <div className="space-y-6">
                    <InputField
                      label="Contact Name"
                      value={formData.contact_name}
                      onChange={(value) => handleInputChange('contact_name', value)}
                      placeholder="Enter the main contact person"
                      required
                      icon={<User size={18} />}
                      error={errors.contact_name}
                    />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <InputField
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={(value) => handleInputChange('email', value)}
                        placeholder="contact@company.com"
                        required
                        icon={<Mail size={18} />}
                        error={errors.email}
                      />
                      
                      <InputField
                        label="Phone Number"
                        type="tel"
                        value={formData.phone}
                        onChange={(value) => handleInputChange('phone', value)}
                        placeholder="+44 20 1234 5678"
                        icon={<Phone size={18} />}
                      />
                    </div>
                  </div>
                </Section>

                {/* Location */}
                <Section title="Location" delay={0.3}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <InputField
                      label="Country"
                      value={formData.location_country}
                      onChange={(value) => handleInputChange('location_country', value)}
                      placeholder="United Kingdom"
                      icon={<MapPin size={18} />}
                    />
                    
                    <InputField
                      label="City"
                      value={formData.location_city}
                      onChange={(value) => handleInputChange('location_city', value)}
                      placeholder="London"
                    />
                  </div>
                </Section>

                {/* Brand Users */}
                <Section title="Team Members (Optional)" delay={0.4}>
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                          <User size={14} className="text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-900 mb-2">Invite Team Members</h4>
                          <p className="text-sm text-blue-700 leading-relaxed">
                            Add up to 2 team members who will have access to the brand portal. They'll receive an invitation email to create their accounts and can immediately start collaborating on campaigns.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {brandUsers.map((user, index) => (
                      <motion.div 
                        key={index} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + (index * 0.1) }}
                        className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-6 hover:shadow-md transition-shadow duration-300"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-base font-bold text-gray-800">Team Member {index + 1}</h4>
                          {user.email && (
                            <motion.button
                              type="button"
                              onClick={() => {
                                handleUserChange(index, 'email', '')
                              }}
                              className="text-xs text-red-600 hover:text-red-800 transition-colors px-3 py-1 rounded-lg hover:bg-red-50"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Clear
                            </motion.button>
                          )}
                        </div>
                        
                        <InputField
                          label="Email Address"
                          type="email"
                          value={user.email}
                          onChange={(value) => handleUserChange(index, 'email', value)}
                          placeholder="john.smith@company.com"
                          icon={<Mail size={18} />}
                        />
                        
                        {user.email && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center space-x-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl p-4"
                          >
                            <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
                            <span className="font-medium">
                              Ready to invite {user.email}
                            </span>
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </Section>
              </div>
            </div>

            {/* Enhanced Footer */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="border-t border-gray-100 bg-gradient-to-r from-white to-gray-50 p-8 flex-shrink-0"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-8 py-4 bg-white border-2 border-gray-200 rounded-2xl shadow-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex-1 px-8 py-4 bg-black text-white rounded-2xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-lg hover:shadow-xl relative overflow-hidden group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10">
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Creating Brand...</span>
                      </div>
                    ) : (
                      'Create Brand'
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
} 