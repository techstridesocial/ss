import React from 'react'
import { requireStaffAccess } from '../../../lib/auth/roles'
import StaffNavigation from '../../../components/nav/StaffNavigation'
import { getUsers } from '../../../lib/db/queries/users'
import { UserRole } from '../../../types/database'
import { Search, Filter, Plus, Edit, Trash2, UserCheck, Mail, MapPin } from 'lucide-react'

interface UserTableProps {
  searchParams: {
    search?: string
    role?: UserRole
    page?: string
  }
}

async function UserTable({ searchParams }: UserTableProps) {
  const page = parseInt(searchParams.page || '1')
  const search = searchParams.search || ''
  const roleFilter = searchParams.role
  
  const filters = {
    search: search || undefined,
    roles: roleFilter ? [roleFilter] : undefined
  }
  
  const { data: users, total, totalPages } = await getUsers(filters, page, 20)

  const getRoleBadgeColor = (role: UserRole) => {
    const colors = {
      BRAND: 'bg-blue-100 text-blue-800',
      INFLUENCER_SIGNED: 'bg-green-100 text-green-800',
      INFLUENCER_PARTNERED: 'bg-yellow-100 text-yellow-800',
      STAFF: 'bg-purple-100 text-purple-800',
      ADMIN: 'bg-red-100 text-red-800'
    }
    return colors[role]
  }

  const getRoleDisplayName = (role: UserRole) => {
    const names = {
      BRAND: 'Brand',
      INFLUENCER_SIGNED: 'Influencer (Signed)',
      INFLUENCER_PARTNERED: 'Influencer (Partnered)',
      STAFF: 'Staff',
      ADMIN: 'Admin'
    }
    return names[role]
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Users ({total})
          </h2>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            <Plus size={16} />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {user.profile?.avatar_url ? (
                        <img
                          className="h-10 w-10 rounded-full"
                          src={user.profile.avatar_url}
                          alt=""
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.profile?.first_name && user.profile?.last_name
                          ? `${user.profile.first_name} ${user.profile.last_name}`
                          : 'No name set'
                        }
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Mail size={12} className="mr-1" />
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                    {getRoleDisplayName(user.role)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {user.profile?.is_onboarded ? (
                      <>
                        <UserCheck size={12} className="text-green-500 mr-1" />
                        <span className="text-sm text-green-600">Onboarded</span>
                      </>
                    ) : (
                      <>
                        <div className="w-3 h-3 rounded-full bg-yellow-400 mr-1"></div>
                        <span className="text-sm text-yellow-600">Pending</span>
                      </>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.profile?.location_country ? (
                    <div className="flex items-center">
                      <MapPin size={12} className="mr-1" />
                      {user.profile.location_country}
                      {user.profile.location_city && `, ${user.profile.location_city}`}
                    </div>
                  ) : (
                    <span className="text-gray-400">Not set</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Edit size={16} />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {page} of {totalPages}
            </div>
            <div className="flex space-x-2">
              {page > 1 && (
                <a
                  href={`/staff/users?page=${page - 1}${search ? `&search=${search}` : ''}${roleFilter ? `&role=${roleFilter}` : ''}`}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                >
                  Previous
                </a>
              )}
              {page < totalPages && (
                <a
                  href={`/staff/users?page=${page + 1}${search ? `&search=${search}` : ''}${roleFilter ? `&role=${roleFilter}` : ''}`}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                >
                  Next
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {users.length === 0 && (
        <div className="px-6 py-12 text-center">
          <p className="text-gray-500">No users found</p>
        </div>
      )}
    </div>
  )
}

export default async function UsersPage({
  searchParams
}: {
  searchParams: { search?: string; role?: UserRole; page?: string }
}) {
  // Server-side protection
  await requireStaffAccess()

  return (
    <div className="min-h-screen bg-gray-50">
      <StaffNavigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">
            Manage all user accounts and their roles
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
            {/* Search */}
            <div className="flex-1">
              <form method="get" className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="search"
                  defaultValue={searchParams.search}
                  placeholder="Search users by name or email..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                {searchParams.role && (
                  <input type="hidden" name="role" value={searchParams.role} />
                )}
              </form>
            </div>

            {/* Role Filter */}
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-400" />
              <select
                name="role"
                defaultValue={searchParams.role || ''}
                onChange={(e) => {
                  const url = new URL(window.location.href)
                  if (e.target.value) {
                    url.searchParams.set('role', e.target.value)
                  } else {
                    url.searchParams.delete('role')
                  }
                  url.searchParams.delete('page')
                  window.location.href = url.toString()
                }}
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
            {(searchParams.search || searchParams.role) && (
              <a
                href="/staff/users"
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Clear Filters
              </a>
            )}
          </div>
        </div>

        {/* User Table */}
        <React.Suspense fallback={
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        }>
          <UserTable searchParams={searchParams} />
        </React.Suspense>
      </main>
    </div>
  )
} 