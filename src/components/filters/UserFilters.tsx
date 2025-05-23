'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Filter } from 'lucide-react'
import { UserRole } from '../../types/database'

interface UserFiltersProps {
  currentSearch?: string
  currentRole?: UserRole
}

export default function UserFilters({ currentSearch, currentRole }: UserFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleRoleChange = (newRole: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (newRole) {
      params.set('role', newRole)
    } else {
      params.delete('role')
    }
    params.delete('page') // Reset to first page when filtering
    
    router.push(`/staff/users?${params.toString()}`)
  }

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const searchTerm = formData.get('search') as string
    
    const params = new URLSearchParams(searchParams.toString())
    
    if (searchTerm) {
      params.set('search', searchTerm)
    } else {
      params.delete('search')
    }
    params.delete('page') // Reset to first page when searching
    
    router.push(`/staff/users?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/staff/users')
  }

  const hasFilters = currentSearch || currentRole

  return (
    <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
        {/* Search */}
        <div className="flex-1">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="search"
              defaultValue={currentSearch}
              placeholder="Search users by name or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <button type="submit" className="sr-only">Search</button>
          </form>
        </div>

        {/* Role Filter */}
        <div className="flex items-center space-x-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={currentRole || ''}
            onChange={(e) => handleRoleChange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Roles</option>
            <option value="BRAND">Brand</option>
            <option value="INFLUENCER_SIGNED">Influencer (Signed)</option>
            <option value="INFLUENCER_PARTNERED">Influencer (Partnered)</option>
            <option value="STAFF">Staff</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        {/* Reset Filters */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  )
} 