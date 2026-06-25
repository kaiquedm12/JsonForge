'use client'

import { Sidebar } from './Sidebar'
import { RightPanel } from './RightPanel'

interface ThreePanelLayoutProps {
  children: React.ReactNode
}

export function ThreePanelLayout({ children }: ThreePanelLayoutProps) {
  return (
    <div className="flex h-full w-full overflow-hidden" style={{ height: '100dvh' }}>
      <Sidebar />
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {children}
      </main>
      <RightPanel />
    </div>
  )
}
