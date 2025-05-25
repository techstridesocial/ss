'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Menu, X, ChevronDown, LogOut, Settings } from 'lucide-react'
import { useClerk } from '@clerk/nextjs'
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
        relative px-4 py-2 text-sm font-medium transition-colors duration-200
        ${isActive 
          ? 'text-gray-900 bg-gray-100' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }
        rounded-md
      `}
    >
      {label}
      {isActive && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
          layoutId="activeTab"
          initial={false}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </Link>
  )
}

export default function StaffNavigation() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { signOut } = useClerk()
  const userRole = useUserRole()

  // Navigation items based on role
  const getNavItems = () => {
    const baseItems = [
      { href: '/staff', label: 'OVERVIEW' },
      { href: '/staff/brands', label: 'BRANDS' },
      { href: '/staff/roster', label: 'ROSTER' },
      { href: '/staff/campaigns', label: 'CAMPAIGNS' },
      { href: '/staff/scraping', label: 'SCRAPING' }
    ]

    // Add admin-only items if user is admin
    if (userRole === 'ADMIN') {
      baseItems.push({ href: '/admin/system', label: 'SYSTEM' })
      baseItems.push({ href: '/admin/logs', label: 'LOGS' })
    }

    return baseItems
  }

  const navItems = getNavItems()

  const handleSignOut = () => {
    signOut()
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/staff" className="text-xl font-bold text-gray-900">
                Stride Social
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-8 md:flex md:space-x-1">
              {navItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
                />
              ))}
            </div>
          </div>

          {/* Right side - Account Dropdown */}
          <div className="flex items-center">
            {/* Desktop Account Dropdown */}
            <div className="hidden md:block relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <span>ACCOUNT</span>
                <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1"
                >
                  <Link
                    href="/staff/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <Settings size={16} className="mr-2" />
                    Profile Settings
                  </Link>
                  <hr className="my-1" />
                  <button
                    onClick={handleSignOut}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </button>
                </motion.div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-white border-t border-gray-200"
        >
          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                className={`
                  block px-3 py-2 text-base font-medium rounded-md transition-colors
                  ${pathname === item.href || pathname.startsWith(item.href + '/') 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Mobile Account Section */}
            <hr className="my-2" />
            <Link
              href="/staff/profile"
              onClick={closeMobileMenu}
              className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
            >
              Profile Settings
            </Link>
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md"
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
    </nav>
  )
} 