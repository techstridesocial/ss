'use client'

import { SessionTimeoutProvider as SessionTimeoutProviderComponent } from '@/components/modals/SessionTimeoutModal'

export function SessionTimeoutProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionTimeoutProviderComponent>
      {children}
    </SessionTimeoutProviderComponent>
  )
}
