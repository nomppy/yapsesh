'use client'

import { useEffect } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { FlowChart } from '@/components/FlowChart'
import { TranscriptPanel } from '@/components/TranscriptPanel'
import { Timeline } from '@/components/Timeline'
import { TopBar } from '@/components/TopBar'
import { SettingsModal } from '@/components/SettingsModal'
import { useAppStore } from '@/lib/store'

export default function Home() {
  // Expose store for e2e testing in dev
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      (window as unknown as Record<string, unknown>).__appStore = useAppStore
    }
  }, [])
  return (
    <ReactFlowProvider>
      <div className="flex flex-col h-screen bg-zinc-50">
        <TopBar />

        <div className="flex flex-col md:flex-row flex-1 min-h-0">
          {/* Flowchart canvas */}
          <div className="flex-1 min-w-0 min-h-[300px] md:min-h-0">
            <FlowChart />
          </div>

          {/* Transcript panel */}
          <div className="h-[200px] md:h-auto md:w-[320px] shrink-0">
            <TranscriptPanel />
          </div>
        </div>

        <Timeline />
        <SettingsModal />
      </div>
    </ReactFlowProvider>
  )
}
