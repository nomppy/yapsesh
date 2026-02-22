'use client'
import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
const STORAGE_KEY = 'yapsesh-onboarding-seen'
export function OnboardingOverlay() {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen)
  useEffect(() => { if (!localStorage.getItem(STORAGE_KEY)) setVisible(true) }, [])
  if (!visible) return null
  const dismiss = () => { localStorage.setItem(STORAGE_KEY, '1'); setVisible(false) }
  const openSettings = () => { dismiss(); setSettingsOpen(true) }
  const steps = [
    { title: 'Welcome', content: (
      <div className="text-center">
        <div className="font-mono-display text-[11px] leading-tight mb-4 whitespace-pre" style={{ color: '#5B7553' }}>{`     /\\
    /  \\
   /    \\
  /______\\
     ||`}</div>
        <p className="text-sm font-serif mb-2" style={{ color: '#2C3E2C', fontStyle: 'italic' }}>Welcome to your digital thinking garden.</p>
        <p className="text-[11px] font-mono-display" style={{ color: '#6B7F6B' }}>YapSesh listens while you talk and maps your thoughts into a living flowchart.</p>
      </div>
    )},
    { title: 'How It Works', content: (
      <div className="space-y-3">
        <div className="flex gap-3 items-start"><span className="text-[11px] font-mono-display font-bold shrink-0" style={{ color: '#5B7553' }}>1.</span><p className="text-[12px]" style={{ color: '#2C3E2C' }}>Press <strong>RECORD</strong> and start talking about anything.</p></div>
        <div className="flex gap-3 items-start"><span className="text-[11px] font-mono-display font-bold shrink-0" style={{ color: '#5B7553' }}>2.</span><p className="text-[12px]" style={{ color: '#2C3E2C' }}>AI identifies your topics and how they connect.</p></div>
        <div className="flex gap-3 items-start"><span className="text-[11px] font-mono-display font-bold shrink-0" style={{ color: '#5B7553' }}>3.</span><p className="text-[12px]" style={{ color: '#2C3E2C' }}>Watch your ideas grow into a map you can explore.</p></div>
      </div>
    )},
    { title: 'System Requirements', content: (
      <div>
        <div className="p-3 mb-3" style={{ background: '#F5EDE0', border: '2px inset #C4B8A4' }}>
          <p className="text-[11px] font-mono-display font-bold uppercase mb-1" style={{ color: '#C4956A' }}>&#9888; API KEY REQUIRED</p>
          <p className="text-[12px]" style={{ color: '#6B5D4F' }}>YapSesh needs an AI provider to identify topics. Open <button onClick={openSettings} className="underline font-bold" style={{ color: '#5B7553' }}>Control Panel</button> and enter an API key.</p>
          <p className="text-[10px] font-mono-display mt-2" style={{ color: '#8B9B85' }}>Supports: Claude, OpenAI, DeepSeek, Ollama</p>
        </div>
      </div>
    )},
  ]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)' }} onClick={dismiss}>
      <div className="retro-window" style={{ width: 420, maxWidth: '90vw', boxShadow: '5px 5px 0px rgba(0,0,0,0.25)' }} onClick={(e) => e.stopPropagation()}>
        <div className="retro-title-bar">
          <span>Welcome to YapSesh v1.0 — Step {step + 1}/{steps.length}</span>
          <div className="flex gap-1"><div className="win-ctrl" onClick={dismiss} style={{ background: '#A07060' }} /></div>
        </div>
        <div className="p-5" style={{ background: '#F5F0E8', minHeight: 200 }}>
          <h3 className="text-sm font-mono-display font-bold uppercase mb-4" style={{ color: '#5B7553', borderBottom: '1px solid #D4CFC4', paddingBottom: 8 }}>{steps[step].title}</h3>
          {steps[step].content}
        </div>
        <div className="flex justify-between px-4 py-3" style={{ background: '#E8E0D4', borderTop: '2px groove #C4B8A4' }}>
          <button onClick={dismiss} className="retro-btn text-[10px]">CANCEL</button>
          <div className="flex gap-2">
            {step > 0 && <button onClick={() => setStep(s => s - 1)} className="retro-btn text-[10px]">&lt; BACK</button>}
            {step < steps.length - 1 ? (
              <button onClick={() => setStep(s => s + 1)} className="retro-btn retro-btn-accent text-[10px]">NEXT &gt;</button>
            ) : (
              <button onClick={dismiss} className="retro-btn retro-btn-accent text-[10px]">LET&apos;S GROW</button>
            )}
          </div>
        </div>
      </div>
    </div>)
}
