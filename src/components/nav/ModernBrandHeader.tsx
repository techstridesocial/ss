'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Menu, X, LogOut, Settings, User } from 'lucide-react'
import { useClerk, useUser } from '@clerk/nextjs'
import { useUserRole } from '../../lib/auth/hooks'

interface NavItemProps {
  href: string
  label: string
  isActive: boolean
  onClick?: () => void
}

function NavItem({ href, label, isActive, onClick }: NavItemProps) {
  return (
    <Link 
      href={href}
      onClick={onClick}
      className={`
        relative px-4 py-2 text-base font-medium transition-all duration-200 rounded-lg
        ${isActive 
          ? 'text-white bg-white bg-opacity-20 backdrop-blur-sm' 
          : 'text-white text-opacity-80 hover:text-white hover:bg-white hover:bg-opacity-10'
        }
      `}
    >
      {label}
    </Link>
  )
}

export default function ModernBrandHeader() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const pathname = usePathname()
  const { signOut } = useClerk()
  const { user } = useUser()
  const userRole = useUserRole()

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Navigation items for brands
  const navItems = [
    { href: '/brand/campaigns', label: 'Campaigns' },
    { href: '/brand/influencers', label: 'Influencers' },
    { href: '/brand/shortlists', label: 'Shortlists' }
  ]

  const handleSignOut = () => {
    signOut()
  }

  const getUserInitials = (firstName?: string, lastName?: string) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    }
    if (firstName) {
      return firstName.charAt(0).toUpperCase()
    }
    return 'U'
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const getGreeting = () => {
    if (!isClient) return 'Good morning' // Default for SSR
    
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getUserName = () => {
    if (!isClient || !user) return '' // Return empty string for smooth concatenation
    
    // Try different sources for the user's name
    if (user?.firstName) {
      return user.firstName
    }
    if (user?.fullName) {
      return user.fullName.split(' ')[0] // Get first name from full name
    }
    if (user?.username) {
      return user.username
    }
    if (user?.primaryEmailAddress?.emailAddress) {
      return user.primaryEmailAddress.emailAddress.split('@')[0] // Use email prefix as fallback
    }
    return '' // Return empty string instead of null
  }

  const getPageHeader = () => {
    const userName = getUserName()
    const greeting = getGreeting()
    
    // Check current route and return appropriate header content
    if (pathname === '/brand/influencers' || pathname.startsWith('/brand/influencers/')) {
      return {
        title: 'Discover Influencers',
        subtitle: 'Browse, filter, and analyze influencers to find the perfect match for your campaigns'
      }
    } else if (pathname === '/brand/shortlists' || pathname.startsWith('/brand/shortlists/')) {
      return {
        title: 'Your Shortlists',
        subtitle: 'Manage your saved influencer collections and request quotes'
      }
    } else if (pathname === '/brand/campaigns' || pathname.startsWith('/brand/campaigns/')) {
      return {
        title: 'Campaign Tracker',
        subtitle: 'Monitor your active campaigns and track influencer participation'
      }
    } else {
      // Default fallback - show greeting format
      return {
        title: userName ? `${greeting}, ${userName}!` : `${greeting}!`,
        subtitle: 'Discover and connect with top influencers for your brand'
      }
    }
  }

  return (
    <>
      <div className="p-4 lg:p-6">
        <header 
          className="rounded-2xl sticky top-0 z-50 bg-cover bg-center bg-no-repeat relative overflow-hidden"
          style={{
            backgroundImage: 'url(https://i3adm1jlnkqtxoen.public.blob.vercel-storage.com/header/header-bg-blue-ciNl7Fdr0aqj6WybhUHWs8TcRx4F7D.webp)'
          }}
        >
          {/* Black Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-30 rounded-2xl"></div>
          
          {/* Content */}
          <div className="relative z-10">
            {/* Top Navigation Bar */}
            <div className="w-full h-[72px] px-4 lg:px-8 flex items-center justify-between">
              
              {/* Left side - Logo */}
              <div className="flex items-center">
                <Link href="/brand/campaigns" className="flex items-center">
                  <img 
                    src="https://i3adm1jlnkqtxoen.public.blob.vercel-storage.com/logo/logo-full-white-yyqQnjIujCXZTACVDaoHzFvyh3XDPF.webp"
                    alt="Stride Social"
                    className="h-8 w-auto"
                  />
                </Link>
              </div>

              {/* Center - Navigation Links (Desktop only) */}
              <nav className="hidden lg:flex items-center space-x-2">
                {navItems.map((item) => (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
                  />
                ))}
              </nav>

              {/* Right side - Profile Avatar */}
              <div className="flex items-center">
                {/* Desktop Profile Avatar */}
                <div className="hidden lg:block relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 hover:bg-black hover:bg-opacity-20 rounded-full p-1 transition-colors duration-200"
                  >
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {user?.imageUrl ? (
                        <img 
                          src={user.imageUrl} 
                          alt="Profile" 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        getUserInitials(user?.firstName || '', user?.lastName || '')
                      )}
                    </div>
                  </button>

                  {/* Desktop Dropdown Menu */}
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {user?.primaryEmailAddress?.emailAddress}
                        </p>
                      </div>
                      
                      <div className="py-1">
                        <Link
                          href="/brand/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <User size={16} className="mr-3" />
                          Profile
                        </Link>
                        
                        <Link
                          href="/brand/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <Settings size={16} className="mr-3" />
                          Settings
                        </Link>
                        
                        <button
                          onClick={handleSignOut}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={16} className="mr-3" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Mobile menu button */}
                <div className="lg:hidden">
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-white hover:text-gray-200 transition-colors"
                  >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Greeting Section - Integrated in Header */}
            <div className="w-full px-4 lg:px-8 pt-12 lg:pt-16 pb-4 lg:pb-6 flex items-end">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">
                  {getPageHeader().title}
                </h1>
                <p className="text-white text-opacity-90 text-base lg:text-lg">
                  {getPageHeader().subtitle}
                </p>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="lg:hidden mx-4 lg:mx-6 rounded-b-2xl z-40 bg-black bg-opacity-30 backdrop-blur-md"
        >
          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                className={`
                  block px-3 py-2 text-base font-medium rounded-lg transition-colors
                  ${(item.href === '/brand' 
                      ? pathname === '/brand'
                      : pathname === item.href || pathname.startsWith(item.href + '/')
                    ) 
                    ? 'text-white bg-white bg-opacity-20' 
                    : 'text-white text-opacity-80 hover:text-white hover:bg-white hover:bg-opacity-10'
                  }
                `}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Mobile Profile Section */}
            <hr className="my-2 border-white border-opacity-20" />
            <div className="flex items-center px-3 py-2">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white font-medium text-xs mr-3">
                {user?.imageUrl ? (
                  <img 
                    src={user.imageUrl} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  getUserInitials(user?.firstName || '', user?.lastName || '')
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-white text-opacity-70">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>
            
            <Link
              href="/brand/profile"
              onClick={closeMobileMenu}
              className="block px-3 py-2 text-base font-medium text-white text-opacity-80 hover:text-white hover:bg-white hover:bg-opacity-10 rounded-lg"
            >
              Profile
            </Link>
            <Link
              href="/brand/settings"
              onClick={closeMobileMenu}
              className="block px-3 py-2 text-base font-medium text-white text-opacity-80 hover:text-white hover:bg-white hover:bg-opacity-10 rounded-lg"
            >
              Settings
            </Link>
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-3 py-2 text-base font-medium text-red-300 hover:bg-red-900 hover:bg-opacity-50 rounded-lg"
            >
              Logout
            </button>
          </div>
        </motion.div>
      )}

      {/* Overlay for closing dropdown when clicking outside */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </>
  )
} 