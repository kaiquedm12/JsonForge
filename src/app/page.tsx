'use client'

import { ThreePanelLayout } from '@/components/layout/ThreePanelLayout'
import { MainPanel } from '@/components/layout/MainPanel'

export default function Home() {
  return (
    <div className="h-full w-full">
      <ThreePanelLayout>
        <MainPanel />
      </ThreePanelLayout>
    </div>
  )
}
