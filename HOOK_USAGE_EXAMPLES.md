# Staff Dashboard Hook Usage Examples

This guide shows how to use the new shared hooks to simplify your staff components.

## Table of Contents
1. [useStaffPagination](#usestaffpagination)
2. [useStaffSorting](#usestaffsorting)
3. [useStaffFilters](#usestafffilters)
4. [useStaffTable (All-in-One)](#usestafftable-all-in-one)
5. [React Query Integration](#react-query-integration)

---

## useStaffPagination

**Purpose**: Manage pagination state for any list

### Basic Usage
```typescript
import { useStaffPagination } from '@/lib/hooks/staff'

function MyComponent() {
  const [data, setData] = useState<MyType[]>([])
  
  const pagination = useStaffPagination(data, {
    initialPageSize: 20,
    onPageChange: (page) => console.log('Page changed to:', page)
  })

  return (
    <div>
      {/* Display paginated data */}
      {pagination.paginatedData.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
      
      {/* Pagination Controls */}
      <div className="flex justify-between mt-4">
        <span>
          Showing {pagination.startIndex + 1} to {pagination.endIndex} of {pagination.totalItems}
        </span>
        
        <div className="space-x-2">
          <button 
            onClick={pagination.goToPreviousPage}
            disabled={!pagination.canGoPrevious}
          >
            Previous
          </button>
          
          <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
          
          <button 
            onClick={pagination.goToNextPage}
            disabled={!pagination.canGoNext}
          >
            Next
          </button>
        </div>
        
        <select 
          value={pagination.pageSize} 
          onChange={(e) => pagination.setPageSize(Number(e.target.value))}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>
  )
}
```

---

## useStaffSorting

**Purpose**: Add sorting to any table

### Basic Usage
```typescript
import { useStaffSorting } from '@/lib/hooks/staff'

function MyTable({ data }: { data: Influencer[] }) {
  const { sortedData, SortableHeader, handleSort, sortConfig } = useStaffSorting(data, {
    initialSort: { key: 'display_name', direction: 'asc' }
  })

  return (
    <table>
      <thead>
        <tr>
          {/* Use the SortableHeader component */}
          <SortableHeader sortKey="display_name">Name</SortableHeader>
          <SortableHeader sortKey="total_followers">Followers</SortableHeader>
          <SortableHeader sortKey="total_engagement_rate">Engagement</SortableHeader>
          
          {/* Or use manual sorting */}
          <th onClick={() => handleSort('location')}>
            Location {sortConfig.key === 'location' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
          </th>
        </tr>
      </thead>
      <tbody>
        {sortedData.map(item => (
          <tr key={item.id}>
            <td>{item.display_name}</td>
            <td>{item.total_followers}</td>
            <td>{item.total_engagement_rate}%</td>
            <td>{item.location}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

---

## useStaffFilters

**Purpose**: Manage filter state with helper functions

### Basic Usage
```typescript
import { useStaffFilters, filterHelpers } from '@/lib/hooks/staff'

function MyFilteredList() {
  const [influencers, setInfluencers] = useState<Influencer[]>([])
  
  // Define your filter function
  const filterInfluencers = (data: Influencer[], filters: RosterFilters) => {
    return data.filter(influencer => {
      // Use the helper functions
      if (filters.followerRange && 
          !filterHelpers.checkFollowerRange(influencer.total_followers, filters.followerRange)) {
        return false
      }
      
      if (filters.engagementRange && 
          !filterHelpers.checkEngagementRange(influencer.total_engagement_rate, filters.engagementRange)) {
        return false
      }
      
      // Custom filters
      if (filters.niche && !influencer.niches.includes(filters.niche)) {
        return false
      }
      
      return true
    })
  }
  
  const {
    filters,
    setFilter,
    clearFilters,
    activeFilterCount,
    hasActiveFilters,
    applyFilters
  } = useStaffFilters(filterInfluencers, {
    initialFilters: {
      niche: '',
      followerRange: '',
      engagementRange: '',
      // ... other filters
    }
  })
  
  const filteredData = applyFilters(influencers)

  return (
    <div>
      {/* Filter Controls */}
      <div className="flex gap-4 mb-4">
        <select 
          value={filters.niche}
          onChange={(e) => setFilter('niche', e.target.value)}
        >
          <option value="">All Niches</option>
          <option value="Fashion">Fashion</option>
          <option value="Beauty">Beauty</option>
        </select>
        
        <select 
          value={filters.followerRange}
          onChange={(e) => setFilter('followerRange', e.target.value)}
        >
          <option value="">All Followers</option>
          <option value="10k-50k">10K - 50K</option>
          <option value="50k-100k">50K - 100K</option>
        </select>
        
        {hasActiveFilters && (
          <button onClick={clearFilters}>
            Clear Filters ({activeFilterCount})
          </button>
        )}
      </div>
      
      {/* Display filtered data */}
      {filteredData.map(item => (
        <div key={item.id}>{item.display_name}</div>
      ))}
    </div>
  )
}
```

---

## useStaffTable (All-in-One)

**Purpose**: Complete table management with filtering, sorting, and pagination

### Full Example
```typescript
import { useStaffTable } from '@/lib/hooks/staff'
import { StaffInfluencer, RosterFilters } from '@/types/staff'

function RosterTable() {
  const [influencers, setInfluencers] = useState<StaffInfluencer[]>([])
  
  // Define filter function
  const filterInfluencers = (
    data: StaffInfluencer[], 
    filters: RosterFilters, 
    searchQuery?: string
  ) => {
    return data.filter(influencer => {
      // Search filter
      if (searchQuery) {
        const matches = influencer.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       influencer.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       influencer.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
        if (!matches) return false
      }
      
      // Niche filter
      if (filters.niche && !influencer.niches.includes(filters.niche)) return false
      
      // Platform filter
      if (filters.platform && !influencer.platforms.includes(filters.platform as Platform)) return false
      
      // ... other filters
      
      return true
    })
  }
  
  // One hook to rule them all
  const table = useStaffTable({
    data: influencers,
    filterFn: filterInfluencers,
    initialFilters: {
      niche: '',
      platform: '',
      followerRange: '',
      engagementRange: '',
      location: '',
      influencerType: '',
      contentType: '',
      tier: '',
      status: ''
    },
    initialPageSize: 20,
    initialSort: { key: 'display_name', direction: 'asc' }
  })

  return (
    <div>
      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search influencers..."
        value={table.searchQuery}
        onChange={(e) => table.setSearchQuery(e.target.value)}
        className="px-4 py-2 border rounded"
      />
      
      {/* Filters */}
      <div className="flex gap-4 my-4">
        <select 
          value={table.filters.niche}
          onChange={(e) => table.setFilter('niche', e.target.value)}
        >
          <option value="">All Niches</option>
          <option value="Fashion">Fashion</option>
          <option value="Beauty">Beauty</option>
        </select>
        
        {table.hasActiveFilters && (
          <button onClick={table.clearFilters}>
            Clear Filters ({table.activeFilterCount})
          </button>
        )}
      </div>
      
      {/* Table */}
      <table>
        <thead>
          <tr>
            {/* Use the built-in SortableHeader */}
            <table.SortableHeader sortKey="display_name">Name</table.SortableHeader>
            <table.SortableHeader sortKey="total_followers">Followers</table.SortableHeader>
            <table.SortableHeader sortKey="total_engagement_rate">Engagement</table.SortableHeader>
          </tr>
        </thead>
        <tbody>
          {/* Display only the current page of filtered, sorted data */}
          {table.displayedData.map(influencer => (
            <tr key={influencer.id}>
              <td>{influencer.display_name}</td>
              <td>{influencer.total_followers.toLocaleString()}</td>
              <td>{(influencer.total_engagement_rate * 100).toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <span>
          Showing {table.startIndex + 1} to {Math.min(table.endIndex, table.totalItems)} of {table.totalItems}
        </span>
        
        <div className="space-x-2">
          <button 
            onClick={table.goToPreviousPage}
            disabled={!table.canGoPrevious}
          >
            Previous
          </button>
          
          <span>Page {table.currentPage} of {table.totalPages}</span>
          
          <button 
            onClick={table.goToNextPage}
            disabled={!table.canGoNext}
          >
            Next
          </button>
        </div>
        
        <select 
          value={table.pageSize}
          onChange={(e) => table.setPageSize(Number(e.target.value))}
        >
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
        </select>
      </div>
    </div>
  )
}
```

---

## React Query Integration

**Purpose**: Cache API responses, reduce server load, enable optimistic updates

### Basic Query Usage
```typescript
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/api/queryClient'

function InfluencersList() {
  // Fetch with caching
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.influencers.light(),
    queryFn: async () => {
      const response = await fetch('/api/influencers/light')
      if (!response.ok) throw new Error('Failed to fetch')
      return response.json()
    }
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <button onClick={() => refetch()}>Refresh</button>
      {data.data.map(inf => (
        <div key={inf.id}>{inf.display_name}</div>
      ))}
    </div>
  )
}
```

### Mutation Usage (Create/Update/Delete)
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/api/queryClient'

function AddInfluencerForm() {
  const queryClient = useQueryClient()
  
  // Define mutation
  const mutation = useMutation({
    mutationFn: async (newInfluencer: CreateInfluencerData) => {
      const response = await fetch('/api/influencers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInfluencer)
      })
      if (!response.ok) throw new Error('Failed to create')
      return response.json()
    },
    // Auto-refresh the influencers list after successful creation
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.influencers.all })
    }
  })

  const handleSubmit = (data: CreateInfluencerData) => {
    mutation.mutate(data)
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create Influencer'}
      </button>
      {mutation.isError && <div>Error: {mutation.error.message}</div>}
      {mutation.isSuccess && <div>Success!</div>}
    </form>
  )
}
```

### Combining useQuery with useStaffTable
```typescript
import { useQuery } from '@tanstack/react-query'
import { useStaffTable } from '@/lib/hooks/staff'
import { queryKeys } from '@/lib/api/queryClient'

function OptimizedRosterTable() {
  // Fetch with caching
  const { data: apiData, isLoading } = useQuery({
    queryKey: queryKeys.influencers.light(),
    queryFn: async () => {
      const response = await fetch('/api/influencers/light')
      return response.json()
    }
  })
  
  const influencers = apiData?.data || []
  
  // Full table management
  const table = useStaffTable({
    data: influencers,
    filterFn: filterInfluencers,
    initialFilters: defaultFilters,
    initialPageSize: 20
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <div>
      {/* Search */}
      <input 
        value={table.searchQuery}
        onChange={(e) => table.setSearchQuery(e.target.value)}
      />
      
      {/* Table */}
      <table>
        <thead>
          <tr>
            <table.SortableHeader sortKey="display_name">Name</table.SortableHeader>
            <table.SortableHeader sortKey="total_followers">Followers</table.SortableHeader>
          </tr>
        </thead>
        <tbody>
          {table.displayedData.map(inf => (
            <tr key={inf.id}>
              <td>{inf.display_name}</td>
              <td>{inf.total_followers}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Pagination (single line!) */}
      <Pagination {...table.paginationState} onChange={table.setCurrentPage} />
    </div>
  )
}
```

---

## Advanced Patterns

### Optimistic Updates
```typescript
const mutation = useMutation({
  mutationFn: updateInfluencer,
  onMutate: async (newData) => {
    // Cancel outgoing queries
    await queryClient.cancelQueries({ queryKey: queryKeys.influencers.all })
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(queryKeys.influencers.all)
    
    // Optimistically update
    queryClient.setQueryData(queryKeys.influencers.all, (old: any) => ({
      ...old,
      data: old.data.map((inf: any) => 
        inf.id === newData.id ? { ...inf, ...newData } : inf
      )
    }))
    
    return { previous }
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(queryKeys.influencers.all, context?.previous)
  },
  onSettled: () => {
    // Refetch to ensure sync
    queryClient.invalidateQueries({ queryKey: queryKeys.influencers.all })
  }
})
```

### Prefetching for Instant Navigation
```typescript
import { queryClient, queryKeys } from '@/lib/api/queryClient'

function InfluencerCard({ influencer }: { influencer: Influencer }) {
  // Prefetch detail data on hover
  const handleMouseEnter = () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.influencers.detail(influencer.id),
      queryFn: () => fetch(`/api/influencers/${influencer.id}`).then(r => r.json())
    })
  }
  
  return (
    <div onMouseEnter={handleMouseEnter}>
      <Link href={`/staff/roster/${influencer.id}`}>
        {influencer.display_name}
      </Link>
    </div>
  )
}
```

---

## Filter Helper Functions

All available in `filterHelpers`:

```typescript
import { filterHelpers } from '@/lib/hooks/staff'

// Follower range check
filterHelpers.checkFollowerRange(150000, '100k-500k') // true
filterHelpers.checkFollowerRange(50000, '100k-500k')  // false

// Engagement rate check
filterHelpers.checkEngagementRange(3.5, '2-4') // true
filterHelpers.checkEngagementRange(5.5, '2-4') // false

// Spend range check
filterHelpers.checkSpendRange(12000, '5k-15k') // true

// Campaign count check
filterHelpers.checkCampaignCount(4, '3-5') // true

// Last activity check
filterHelpers.checkLastActivity('2024-11-01', 'week') // true/false depending on current date

// Budget range check
filterHelpers.checkBudgetRange('$5,000 - $8,000', 'under-10k') // true

// Influencer count check
filterHelpers.checkInfluencerCount(7, '5-10') // true

// Duration check
filterHelpers.checkDuration('3 weeks', '3-4') // true
```

---

## Migration Guide

### Before (Old Pattern)
```typescript
function OldComponent() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [filters, setFilters] = useState({ niche: '', platform: '' })
  
  // Manual filtering
  const filtered = data.filter(item => {
    if (filters.niche && !item.niches.includes(filters.niche)) return false
    if (filters.platform && !item.platforms.includes(filters.platform)) return false
    return true
  })
  
  // Manual sorting
  const sorted = [...filtered].sort((a, b) => {
    if (!sortConfig.key) return 0
    // ... 50 lines of sorting logic
  })
  
  // Manual pagination
  const startIndex = (currentPage - 1) * pageSize
  const paginated = sorted.slice(startIndex, startIndex + pageSize)
  
  // ... 200 more lines
}
```

### After (New Pattern)
```typescript
function NewComponent() {
  const [data, setData] = useState<Influencer[]>([])
  
  const table = useStaffTable({
    data,
    filterFn: filterInfluencers,
    initialFilters: { niche: '', platform: '' },
    initialPageSize: 20,
    initialSort: { key: 'display_name', direction: 'asc' }
  })
  
  return (
    <div>
      <input value={table.searchQuery} onChange={(e) => table.setSearchQuery(e.target.value)} />
      <table>
        <thead>
          <tr>
            <table.SortableHeader sortKey="display_name">Name</table.SortableHeader>
          </tr>
        </thead>
        <tbody>
          {table.displayedData.map(item => (
            <tr key={item.id}><td>{item.display_name}</td></tr>
          ))}
        </tbody>
      </table>
      <Pagination {...table.paginationState} />
    </div>
  )
}
```

**Result**: 200 lines → 50 lines, same functionality, better performance

---

## Best Practices

### 1. Always Use Query Keys from queryKeys Factory
```typescript
// ✅ Good
import { queryKeys } from '@/lib/api/queryClient'
const { data } = useQuery({ queryKey: queryKeys.influencers.light() })

// ❌ Bad
const { data } = useQuery({ queryKey: ['influencers', 'light'] })
```

### 2. Invalidate Queries After Mutations
```typescript
// ✅ Good
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.influencers.all })
}

// ❌ Bad
onSuccess: () => {
  window.location.reload() // Don't force reload!
}
```

### 3. Use Filter Helpers for Consistency
```typescript
// ✅ Good
if (filters.followerRange && 
    !filterHelpers.checkFollowerRange(influencer.total_followers, filters.followerRange)) {
  return false
}

// ❌ Bad
if (filters.followerRange === '100k-500k' && 
    (influencer.total_followers < 100000 || influencer.total_followers > 500000)) {
  return false
}
```

---

## Performance Tips

1. **Memoize filter functions** if they're expensive
2. **Use query staleTime** to balance freshness vs. speed
3. **Prefetch on hover** for instant navigation
4. **Combine hooks wisely** - useStaffTable is optimized for common use cases
5. **Don't over-invalidate** - Only invalidate what changed

---

## Questions?

For implementation help, see:
- Type definitions: `src/types/staff.ts`
- Hook source code: `src/lib/hooks/staff/`
- Query config: `src/lib/api/queryClient.ts`
- Working examples: `src/app/staff/roster/page.tsx` (already uses dynamic imports)

