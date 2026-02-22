'use client'
import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
const STORAGE_KEY = 'yapsesh-onboarding-seen'
export function OnboardingOverlay() {
  const [visible, setVisible] = useState(false)
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen)
  useEffect(() => { if (!localStorage.getItem(STORAGE_KEY)) setVisible(true) }, [])
  if (!visible) return null
  const dismiss = () => { localStorage.setItem(STORAGE_KEY, '1'); setVisible(false) }
  const openSettings = () => { dismiss(); setSettingsOpen(true) }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.35)' }} onClick={dismiss}>
      <div className="retro-window" style={{ width: 400, maxWidth: '90vw', boxShadow: '6px 6px 0px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
        <div className="retro-title-bar">
          <span>Welcome to YapSesh</span>
          <div className="win-ctrl" onClick={dismiss} style={{ background: '#A07060' }} />
        </div>
        <div className="p-5 parchment-bg">
          <h2 className="text-lg font-serif text-center mb-1" style={{ color: '#2C2418', fontStyle: 'italic' }}>YapSesh</h2>
          <p className="text-[10px] font-mono-display text-center uppercase mb-5" style={{ color: '#8A7A68' }}>Version 1.0</p>

          <div className="space-y-2.5 mb-5">
            <div className="flex gap-3 items-start">
              <span className="text-[11px] font-mono-display font-bold shrink-0" style={{ color: '#5B7553' }}>&#9679;</span>
              <p className="text-[12px]" style={{ color: '#3A3028' }}>Hit <strong>RECORD</strong> and talk about anything.</p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-[11px] font-mono-display font-bold shrink-0" style={{ color: '#5B7553' }}>&#9679;</span>
              <p className="text-[12px]" style={{ color: '#3A3028' }}>AI picks out topics and connections as you go.</p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-[11px] font-mono-display font-bold shrink-0" style={{ color: '#5B7553' }}>&#9679;</span>
              <p className="text-[12px]" style={{ color: '#3A3028' }}>Your conversation becomes a map you can explore.</p>
            </div>
          </div>

          <div className="p-3 mb-4" style={{ background: '#F0E4D0', border: '2px inset #C8B898' }}>
            <p className="text-[11px] font-mono-display font-bold uppercase mb-1" style={{ color: '#C4956A' }}>&#9888; API KEY NEEDED</p>
            <p className="text-[11px]" style={{ color: '#5A4A38' }}>
              You&apos;ll need an API key to get started. Open{' '}
              <button onClick={openSettings} className="underline font-bold" style={{ color: '#5B7553' }}>Settings</button>{' '}
              and paste one in.
            </p>
            <p className="text-[10px] font-mono-display mt-1" style={{ color: '#8A7A68' }}>Works with Claude, OpenAI, DeepSeek, or Ollama.</p>
          </div>
        </div>
        <div className="flex justify-end px-4 py-3" style={{ background: 'linear-gradient(180deg, #E0D8C8 0%, #D0C8B8 100%)', borderTop: '2px outset #D8C8A8' }}>
          <button onClick={dismiss} className="retro-btn retro-btn-accent text-[10px]">LET&apos;S GO</button>
        </div>
      </div>
    </div>)
}
