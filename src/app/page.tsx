'use client'

import { useEffect } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { FlowChart } from '@/components/FlowChart'
import { TranscriptPanel } from '@/components/TranscriptPanel'
import { Timeline } from '@/components/Timeline'
import { TopBar } from '@/components/TopBar'
import { SettingsModal } from '@/components/SettingsModal'
import { OnboardingOverlay } from '@/components/OnboardingOverlay'
import { useAppStore } from '@/lib/store'

export default function Home() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      (window as unknown as Record<string, unknown>).__appStore = useAppStore
    }
  }, [])
  return (
    <ReactFlowProvider>
      {/* Desktop background */}
      <div className="flex flex-col h-screen" style={{ background: 'linear-gradient(180deg, #A89878 0%, #B8A888 30%, #C8B8A0 100%)' }}>
        {/* Main retro window */}
        <div className="flex flex-col flex-1 m-2 md:m-3 retro-window overflow-hidden relative scanlines">
          <TopBar />
          <div className="flex flex-col md:flex-row flex-1 min-h-0">
            <div className="flex-1 min-w-0 min-h-[300px] md:min-h-0">
              <FlowChart />
            </div>
            <div className="h-[200px] md:h-auto md:w-[300px] shrink-0">
              <TranscriptPanel />
            </div>
          </div>
          <div className="shrink-0">
            <Timeline />
          </div>
        </div>
        {/* Desktop dock / status bar */}
        <div className="shrink-0 flex items-center justify-between px-3 py-1.5" style={{ background: 'linear-gradient(180deg, #A08868 0%, #8A7858 100%)', borderTop: '2px outset #C8B898', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)' }}>
          <span className="text-[10px] font-mono-display font-bold uppercase" style={{ color: '#F2EBE0' }}>YapSesh v1.0</span>
          <span className="text-[10px] font-mono-display" style={{ color: '#D8C8A8' }}>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>
        <SettingsModal />
        <OnboardingOverlay />
      </div>
    </ReactFlowProvider>
  )
}
