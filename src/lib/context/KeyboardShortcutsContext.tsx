'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'

interface KeyboardShortcutsContextType {
  isCommandPaletteOpen: boolean
  openCommandPalette: () => void
  closeCommandPalette: () => void
  toggleCommandPalette: () => void
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | null>(null)

export function useKeyboardShortcuts() {
  const context = useContext(KeyboardShortcutsContext)
  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within a KeyboardShortcutsProvider')
  }
  return context
}

interface KeyboardShortcutsProviderProps {
  children: ReactNode
}

export function KeyboardShortcutsProvider({ children }: KeyboardShortcutsProviderProps) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

  const openCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen(true)
  }, [])

  const closeCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen(false)
  }, [])

  const toggleCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen(prev => !prev)
  }, [])

  // Global keyboard event handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd/Ctrl + K - Open command palette
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        toggleCommandPalette()
        return
      }

      // Cmd/Ctrl + / - Show shortcuts help (could be implemented later)
      if ((event.metaKey || event.ctrlKey) && event.key === '/') {
        event.preventDefault()
        // Could open a shortcuts help modal
        return
      }

      // Escape - Close command palette
      if (event.key === 'Escape' && isCommandPaletteOpen) {
        event.preventDefault()
        closeCommandPalette()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isCommandPaletteOpen, toggleCommandPalette, closeCommandPalette])

  return (
    <KeyboardShortcutsContext.Provider
      value={{
        isCommandPaletteOpen,
        openCommandPalette,
        closeCommandPalette,
        toggleCommandPalette
      }}
    >
      {children}
    </KeyboardShortcutsContext.Provider>
  )
}
