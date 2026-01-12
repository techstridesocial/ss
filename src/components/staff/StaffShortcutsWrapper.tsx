'use client'

import React, { ReactNode } from 'react'
import { KeyboardShortcutsProvider } from '@/lib/context/KeyboardShortcutsContext'
import { CommandPalette } from '@/components/ui/CommandPalette'

interface StaffShortcutsWrapperProps {
  children: ReactNode
}

export function StaffShortcutsWrapper({ children }: StaffShortcutsWrapperProps) {
  return (
    <KeyboardShortcutsProvider>
      {children}
      <CommandPalette />
    </KeyboardShortcutsProvider>
  )
}

export default StaffShortcutsWrapper
