'use client'

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Users, 
  Building2, 
  FileText, 
  Megaphone, 
  Send, 
  Compass,
  DollarSign,
  Settings,
  Plus,
  ArrowRight,
  Command,
  CornerDownLeft
} from 'lucide-react'
import { useKeyboardShortcuts } from '@/lib/context/KeyboardShortcutsContext'

// Command types
interface Command {
  id: string
  label: string
  description?: string
  shortcut?: string
  icon: React.ReactNode
  action: () => void
  keywords: string[]
  category: 'navigation' | 'actions' | 'recent'
}

// Simple fuzzy search
function fuzzySearch(query: string, commands: Command[]): Command[] {
  if (!query) return commands
  
  const lowerQuery = query.toLowerCase()
  
  return commands
    .map(command => {
      // Check label match
      const labelMatch = command.label.toLowerCase().includes(lowerQuery)
      // Check keywords match
      const keywordsMatch = command.keywords.some(k => k.toLowerCase().includes(lowerQuery))
      // Check description match
      const descMatch = command.description?.toLowerCase().includes(lowerQuery)
      
      // Calculate score
      let score = 0
      if (command.label.toLowerCase().startsWith(lowerQuery)) score += 10
      if (labelMatch) score += 5
      if (keywordsMatch) score += 3
      if (descMatch) score += 1
      
      return { command, score }
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.command)
}

export function CommandPalette() {
  const router = useRouter()
  const { isCommandPaletteOpen, closeCommandPalette } = useKeyboardShortcuts()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Define all available commands
  const commands: Command[] = useMemo(() => [
    // Navigation commands
    {
      id: 'nav-roster',
      label: 'Go to Roster',
      description: 'View and manage influencer roster',
      icon: <Users className="w-5 h-5" />,
      action: () => router.push('/staff/roster'),
      keywords: ['roster', 'influencers', 'creators', 'talent'],
      category: 'navigation'
    },
    {
      id: 'nav-brands',
      label: 'Go to Brands',
      description: 'Manage brand accounts',
      icon: <Building2 className="w-5 h-5" />,
      action: () => router.push('/staff/brands'),
      keywords: ['brands', 'clients', 'accounts'],
      category: 'navigation'
    },
    {
      id: 'nav-quotations',
      label: 'Go to Quotations',
      description: 'Review quotation requests',
      icon: <FileText className="w-5 h-5" />,
      action: () => router.push('/staff/quotations'),
      keywords: ['quotations', 'quotes', 'requests', 'pricing'],
      category: 'navigation'
    },
    {
      id: 'nav-campaigns',
      label: 'Go to Campaigns',
      description: 'Manage active campaigns',
      icon: <Megaphone className="w-5 h-5" />,
      action: () => router.push('/staff/campaigns'),
      keywords: ['campaigns', 'projects', 'active'],
      category: 'navigation'
    },
    {
      id: 'nav-submissions',
      label: 'Go to Submissions',
      description: 'View submission lists',
      icon: <Send className="w-5 h-5" />,
      action: () => router.push('/staff/submissions'),
      keywords: ['submissions', 'lists', 'submit'],
      category: 'navigation'
    },
    {
      id: 'nav-discovery',
      label: 'Go to Discovery',
      description: 'Discover new influencers',
      icon: <Compass className="w-5 h-5" />,
      action: () => router.push('/staff/discovery'),
      keywords: ['discovery', 'search', 'find', 'new', 'modash'],
      category: 'navigation'
    },
    {
      id: 'nav-finances',
      label: 'Go to Finances',
      description: 'Manage invoices and payments',
      icon: <DollarSign className="w-5 h-5" />,
      action: () => router.push('/staff/finances'),
      keywords: ['finances', 'invoices', 'payments', 'money'],
      category: 'navigation'
    },
    {
      id: 'nav-profile',
      label: 'Go to Profile Settings',
      description: 'Manage your profile and preferences',
      icon: <Settings className="w-5 h-5" />,
      action: () => router.push('/staff/profile'),
      keywords: ['profile', 'settings', 'preferences', 'account'],
      category: 'navigation'
    },
    // Action commands
    {
      id: 'action-add-influencer',
      label: 'Add New Influencer',
      description: 'Add a new influencer to the roster',
      icon: <Plus className="w-5 h-5" />,
      action: () => {
        router.push('/staff/roster')
        // Could trigger a modal open via context/state
      },
      keywords: ['add', 'new', 'influencer', 'create'],
      category: 'actions'
    },
    {
      id: 'action-new-campaign',
      label: 'Create New Campaign',
      description: 'Start a new campaign',
      icon: <Plus className="w-5 h-5" />,
      action: () => {
        router.push('/staff/campaigns')
      },
      keywords: ['new', 'campaign', 'create', 'start'],
      category: 'actions'
    },
    {
      id: 'action-new-submission',
      label: 'Create Submission List',
      description: 'Create a new submission list',
      icon: <Plus className="w-5 h-5" />,
      action: () => {
        router.push('/staff/submissions')
      },
      keywords: ['new', 'submission', 'list', 'create'],
      category: 'actions'
    }
  ], [router])

  // Filter commands based on search query
  const filteredCommands = useMemo(() => {
    return fuzzySearch(query, commands)
  }, [query, commands])

  // Reset state when opening
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isCommandPaletteOpen])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action()
          closeCommandPalette()
        }
        break
      case 'Escape':
        e.preventDefault()
        closeCommandPalette()
        break
    }
  }, [filteredCommands, selectedIndex, closeCommandPalette])

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }
  }, [selectedIndex])

  // Execute command
  const executeCommand = (command: Command) => {
    command.action()
    closeCommandPalette()
  }

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: { [key: string]: Command[] } = {
      navigation: [],
      actions: [],
      recent: []
    }
    
    filteredCommands.forEach(cmd => {
      groups[cmd.category].push(cmd)
    })
    
    return groups
  }, [filteredCommands])

  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCommandPalette}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Command Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-[101] px-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
              {/* Search Input */}
              <div className="relative border-b border-gray-100">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setSelectedIndex(0)
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search commands..."
                  className="w-full pl-14 pr-5 py-5 text-lg bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-gray-400"
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <kbd className="px-2 py-1 text-xs font-medium text-gray-400 bg-gray-100 rounded-md">
                    esc
                  </kbd>
                </div>
              </div>

              {/* Results */}
              <div 
                ref={listRef}
                className="max-h-[400px] overflow-y-auto py-2"
              >
                {filteredCommands.length === 0 ? (
                  <div className="px-5 py-12 text-center">
                    <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No commands found for &quot;{query}&quot;</p>
                    <p className="text-sm text-gray-400 mt-1">Try searching for something else</p>
                  </div>
                ) : (
                  <>
                    {/* Navigation Section */}
                    {groupedCommands.navigation.length > 0 && (
                      <div className="mb-2">
                        <div className="px-5 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Navigation
                        </div>
                        {groupedCommands.navigation.map((command, idx) => {
                          const globalIndex = filteredCommands.findIndex(c => c.id === command.id)
                          return (
                            <button
                              key={command.id}
                              onClick={() => executeCommand(command)}
                              onMouseEnter={() => setSelectedIndex(globalIndex)}
                              className={`w-full flex items-center gap-4 px-5 py-3 transition-colors ${
                                selectedIndex === globalIndex
                                  ? 'bg-gradient-to-r from-cyan-50 to-blue-50'
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              <div className={`p-2 rounded-xl ${
                                selectedIndex === globalIndex
                                  ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25'
                                  : 'bg-gray-100 text-gray-500'
                              }`}>
                                {command.icon}
                              </div>
                              <div className="flex-1 text-left">
                                <div className={`font-medium ${
                                  selectedIndex === globalIndex ? 'text-gray-900' : 'text-gray-700'
                                }`}>
                                  {command.label}
                                </div>
                                {command.description && (
                                  <div className="text-sm text-gray-500">{command.description}</div>
                                )}
                              </div>
                              {selectedIndex === globalIndex && (
                                <div className="flex items-center gap-1 text-gray-400">
                                  <CornerDownLeft className="w-4 h-4" />
                                </div>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {/* Actions Section */}
                    {groupedCommands.actions.length > 0 && (
                      <div className="mb-2">
                        <div className="px-5 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Quick Actions
                        </div>
                        {groupedCommands.actions.map((command, idx) => {
                          const globalIndex = filteredCommands.findIndex(c => c.id === command.id)
                          return (
                            <button
                              key={command.id}
                              onClick={() => executeCommand(command)}
                              onMouseEnter={() => setSelectedIndex(globalIndex)}
                              className={`w-full flex items-center gap-4 px-5 py-3 transition-colors ${
                                selectedIndex === globalIndex
                                  ? 'bg-gradient-to-r from-cyan-50 to-blue-50'
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              <div className={`p-2 rounded-xl ${
                                selectedIndex === globalIndex
                                  ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25'
                                  : 'bg-gray-100 text-gray-500'
                              }`}>
                                {command.icon}
                              </div>
                              <div className="flex-1 text-left">
                                <div className={`font-medium ${
                                  selectedIndex === globalIndex ? 'text-gray-900' : 'text-gray-700'
                                }`}>
                                  {command.label}
                                </div>
                                {command.description && (
                                  <div className="text-sm text-gray-500">{command.description}</div>
                                )}
                              </div>
                              {selectedIndex === globalIndex && (
                                <div className="flex items-center gap-1 text-gray-400">
                                  <CornerDownLeft className="w-4 h-4" />
                                </div>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-600">↑</kbd>
                    <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-600">↓</kbd>
                    <span className="ml-1">Navigate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-600">↵</kbd>
                    <span className="ml-1">Select</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-600">esc</kbd>
                    <span className="ml-1">Close</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Command className="w-3 h-3" />
                  <span>K to toggle</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default CommandPalette
