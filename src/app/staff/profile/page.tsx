'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/components/ui/use-toast'
import { Toaster } from '@/components/ui/toaster'
import ModernStaffHeader from '@/components/nav/ModernStaffHeader'
import { StaffProtectedRoute } from '@/components/auth/ProtectedRoute'
import { 
  User, 
  Bell, 
  Lock, 
  Save, 
  Camera, 
  Mail, 
  Phone, 
  MapPin, 
  Check,
  X,
  Eye,
  EyeOff,
  Shield,
  AlertCircle
} from 'lucide-react'

// Types
interface ProfileData {
  first_name: string
  last_name: string
  phone: string
  avatar_url: string
  bio: string
  location_country: string
  location_city: string
}

interface NotificationPreferences {
  email_notifications: boolean
  in_app_notifications: boolean
  quotation_alerts: boolean
  campaign_updates: boolean
  invoice_alerts: boolean
}

interface UserData {
  id: string
  email: string
  role: string
  profile: ProfileData
  notification_preferences: NotificationPreferences
  created_at: string
}

// Section component
const Section = ({
  title,
  icon,
  children,
  delay = 0
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  delay?: number
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 overflow-hidden"
  >
    <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl shadow-lg shadow-cyan-500/25">
          {icon}
        </div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>
    </div>
    <div className="p-6">{children}</div>
  </motion.div>
)

// Toggle switch component
const ToggleSwitch = ({
  label,
  description,
  checked,
  onChange
}: {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}) => (
  <label className="flex items-start justify-between py-4 cursor-pointer group">
    <div className="flex-1 pr-4">
      <div className="font-medium text-gray-900 group-hover:text-cyan-600 transition-colors">
        {label}
      </div>
      <div className="text-sm text-gray-500 mt-0.5">{description}</div>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 ${
        checked ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </label>
)

// Password strength indicator
const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  const getStrength = () => {
    if (!password) return { level: 0, label: '', color: 'bg-gray-200' }
    
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++
    
    const levels = [
      { level: 0, label: '', color: 'bg-gray-200' },
      { level: 1, label: 'Weak', color: 'bg-red-500' },
      { level: 2, label: 'Fair', color: 'bg-orange-500' },
      { level: 3, label: 'Good', color: 'bg-yellow-500' },
      { level: 4, label: 'Strong', color: 'bg-green-500' }
    ]
    
    return levels[strength]
  }
  
  const strength = getStrength()
  
  if (!password) return null
  
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= strength.level ? strength.color : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <div className={`text-xs font-medium ${
        strength.level <= 1 ? 'text-red-600' :
        strength.level === 2 ? 'text-orange-600' :
        strength.level === 3 ? 'text-yellow-600' : 'text-green-600'
      }`}>
        {strength.label}
      </div>
    </div>
  )
}

function StaffProfileContent() {
  const { toast } = useToast()
  
  // State
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  
  // Form states
  const [profile, setProfile] = useState<ProfileData>({
    first_name: '',
    last_name: '',
    phone: '',
    avatar_url: '',
    bio: '',
    location_country: '',
    location_city: ''
  })
  
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    email_notifications: true,
    in_app_notifications: true,
    quotation_alerts: true,
    campaign_updates: true,
    invoice_alerts: true
  })
  
  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  
  // Load profile data
  useEffect(() => {
    fetchProfile()
  }, [])
  
  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/staff/profile')
      const result = await response.json()
      
      if (result.success) {
        setUserData(result.data)
        setProfile(result.data.profile)
        setNotifications(result.data.notification_preferences)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast({
        title: 'Error',
        description: 'Failed to load profile. Please refresh the page.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleSaveProfile = async () => {
    try {
      setIsSaving(true)
      const response = await fetch('/api/staff/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          notification_preferences: notifications
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: 'Profile Updated',
          description: 'Your profile settings have been saved successfully.'
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      toast({
        title: 'Error',
        description: 'Failed to save profile. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }
  
  const handleChangePassword = async () => {
    // Validate
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all password fields.',
        variant: 'destructive'
      })
      return
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'New passwords do not match.',
        variant: 'destructive'
      })
      return
    }
    
    if (passwordForm.newPassword.length < 8) {
      toast({
        title: 'Validation Error',
        description: 'New password must be at least 8 characters.',
        variant: 'destructive'
      })
      return
    }
    
    try {
      setIsChangingPassword(true)
      const response = await fetch('/api/staff/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: 'Password Changed',
          description: 'Your password has been updated successfully.'
        })
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      console.error('Error changing password:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to change password. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsChangingPassword(false)
    }
  }
  
  if (isLoading) {
    return (
      <StaffProtectedRoute>
        <div className="min-h-screen" style={{ backgroundColor: '#EEF7FA' }}>
          <ModernStaffHeader />
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600 mb-4"></div>
              <p className="text-gray-600">Loading your profile...</p>
            </div>
          </div>
        </div>
      </StaffProtectedRoute>
    )
  }
  
  return (
    <StaffProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: '#EEF7FA' }}>
        <ModernStaffHeader />
        
        <main className="px-4 lg:px-6 pb-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Personal Information */}
            <Section 
              title="Personal Information" 
              icon={<User className="w-5 h-5 text-white" />}
              delay={0.1}
            >
              <div className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center overflow-hidden shadow-lg shadow-cyan-500/25">
                      {profile.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl font-bold text-white">
                          {profile.first_name?.[0] || userData?.email?.[0]?.toUpperCase() || '?'}
                        </span>
                      )}
                    </div>
                    <button className="absolute -bottom-1 -right-1 p-2 bg-white rounded-xl shadow-lg hover:bg-gray-50 transition-colors border border-gray-100">
                      <Camera className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Profile Photo</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Upload a professional photo. Recommended size: 256x256px.
                    </p>
                  </div>
                </div>
                
                {/* Form fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={profile.first_name}
                      onChange={(e) => setProfile(p => ({ ...p, first_name: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={profile.last_name}
                      onChange={(e) => setProfile(p => ({ ...p, last_name: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="email"
                      value={userData?.email || ''}
                      disabled
                      className="flex-1 px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                    />
                    <div className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Verified
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Email is managed by your authentication provider and cannot be changed here.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-2" />
                      Country
                    </label>
                    <input
                      type="text"
                      value={profile.location_country}
                      onChange={(e) => setProfile(p => ({ ...p, location_country: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                      placeholder="United States"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={profile.location_city}
                      onChange={(e) => setProfile(p => ({ ...p, location_city: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                      placeholder="New York"
                    />
                  </div>
                </div>
              </div>
            </Section>
            
            {/* Notification Preferences */}
            <Section 
              title="Notification Preferences" 
              icon={<Bell className="w-5 h-5 text-white" />}
              delay={0.2}
            >
              <div className="divide-y divide-gray-100">
                <ToggleSwitch
                  label="Email Notifications"
                  description="Receive important updates and alerts via email"
                  checked={notifications.email_notifications}
                  onChange={(checked) => setNotifications(n => ({ ...n, email_notifications: checked }))}
                />
                <ToggleSwitch
                  label="In-App Notifications"
                  description="Show notifications within the dashboard"
                  checked={notifications.in_app_notifications}
                  onChange={(checked) => setNotifications(n => ({ ...n, in_app_notifications: checked }))}
                />
                <ToggleSwitch
                  label="Quotation Alerts"
                  description="Get notified when new quotation requests arrive"
                  checked={notifications.quotation_alerts}
                  onChange={(checked) => setNotifications(n => ({ ...n, quotation_alerts: checked }))}
                />
                <ToggleSwitch
                  label="Campaign Updates"
                  description="Receive updates about campaign status changes"
                  checked={notifications.campaign_updates}
                  onChange={(checked) => setNotifications(n => ({ ...n, campaign_updates: checked }))}
                />
                <ToggleSwitch
                  label="Invoice Alerts"
                  description="Get notified about invoice and payment updates"
                  checked={notifications.invoice_alerts}
                  onChange={(checked) => setNotifications(n => ({ ...n, invoice_alerts: checked }))}
                />
              </div>
            </Section>
            
            {/* Password Change */}
            <Section 
              title="Change Password" 
              icon={<Lock className="w-5 h-5 text-white" />}
              delay={0.3}
            >
              <div className="space-y-5">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                  <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Password Requirements</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Must be at least 8 characters. Use a mix of letters, numbers, and symbols for better security.
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                      className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                      className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <PasswordStrengthIndicator password={passwordForm.newPassword} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all ${
                      passwordForm.confirmPassword && passwordForm.confirmPassword !== passwordForm.newPassword
                        ? 'border-red-300'
                        : 'border-gray-200'
                    }`}
                    placeholder="Confirm new password"
                  />
                  {passwordForm.confirmPassword && passwordForm.confirmPassword !== passwordForm.newPassword && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <X className="w-4 h-4" /> Passwords do not match
                    </p>
                  )}
                </div>
                
                <motion.button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isChangingPassword ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Changing Password...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Change Password
                    </>
                  )}
                </motion.button>
              </div>
            </Section>
            
            {/* Save Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-end"
            >
              <motion.button
                onClick={handleSaveProfile}
                disabled={isSaving}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </motion.button>
            </motion.div>
          </div>
        </main>
        
        <Toaster />
      </div>
    </StaffProtectedRoute>
  )
}

export default function StaffProfilePage() {
  return <StaffProfileContent />
}
