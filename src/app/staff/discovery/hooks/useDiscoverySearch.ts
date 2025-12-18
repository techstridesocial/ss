import { useState, useCallback, useEffect } from 'react'
import { Platform, DiscoveryFilters, Influencer } from '../types/discovery'
import { searchInfluencers } from '../services/discoveryService'

export function useDiscoverySearch(
  selectedPlatform: Platform,
  searchQuery: string,
  currentFilters: DiscoveryFilters
) {
  const [searchResults, setSearchResults] = useState<Influencer[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [apiWarning, setApiWarning] = useState<string | null>(null)

  const handleSearch = useCallback(async () => {
    setIsSearching(true)
    setSearchError(null)
    setApiWarning(null)

    try {
      const filters: DiscoveryFilters = {
        ...currentFilters,
        platform: selectedPlatform,
      }

      if (searchQuery.trim()) {
        filters.searchQuery = searchQuery.trim()
      }

      const { results, creditsUsed, warning } = await searchInfluencers(filters)

      setSearchResults(results)
      setApiWarning(warning || null)

      if (creditsUsed > 0) {
        setTimeout(() => {
          import('@/lib/services/credits').then(({ creditsService }) => {
            creditsService.refreshAfterAction('search')
          })
        }, 1000)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed'

      if (errorMessage.includes('Authentication required')) {
        setSearchError('⚠️ Your session has expired. Please refresh the page to sign in again.')
      } else if (errorMessage.includes('rate limit')) {
        setSearchError('⏱️ Too many requests. Please wait a moment before searching again.')
      } else if (errorMessage.includes('server error')) {
        setSearchError('🔧 Service temporarily unavailable. Please try again in a few minutes.')
      } else if (errorMessage.includes('API key')) {
        setSearchError('🔑 API configuration issue. Please contact support.')
      } else {
        setSearchError(`❌ ${errorMessage}`)
      }

      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [selectedPlatform, searchQuery, currentFilters])

  useEffect(() => {
    if ((searchResults.length > 0 || searchQuery.trim()) && !isSearching) {
      handleSearch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlatform])

  return {
    searchResults,
    isSearching,
    searchError,
    apiWarning,
    handleSearch
  }
}

