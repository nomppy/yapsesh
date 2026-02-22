'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'

const STORAGE_KEY = 'yapsesh-onboarding-seen'

const steps = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    ),
    title: 'Record yourself talking about anything',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    title: 'AI identifies topics in real-time',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
        <circle cx="6" cy="6" r="3" />
        <circle cx="18" cy="18" r="3" />
        <circle cx="18" cy="6" r="3" />
        <line x1="8.12" y1="7.88" x2="15.88" y2="16.12" />
        <line x1="15.88" y1="7.88" x2="15.88" y2="7.88" />
        <path d="M9 6h6" />
      </svg>
    ),
    title: 'See your conversation as a visual flowchart',
  },
]

export function OnboardingOverlay() {
  const [visible, setVisible] = useState(false)
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true)
    }
  }, [])

  if (!visible) return null

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  const openSettings = () => {
    dismiss()
    setSettingsOpen(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={dismiss}>
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-8" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-zinc-900 text-center mb-1">Welcome to YapSesh</h2>
        <p className="text-sm text-zinc-500 text-center mb-6">Talk freely, see your thoughts mapped out.</p>

        <div className="space-y-5 mb-6">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="shrink-0 w-12 h-12 rounded-lg bg-zinc-50 flex items-center justify-center">
                {step.icon}
              </div>
              <div>
                <span className="text-xs font-medium text-zinc-400">Step {i + 1}</span>
                <p className="text-sm font-medium text-zinc-700">{step.title}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 mb-6">
          <p className="text-sm text-amber-800 font-medium">Bring your own API key</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Set it in{' '}
            <button onClick={openSettings} className="underline font-medium hover:text-amber-900">
              Settings
            </button>
            {' '}before recording. Supports OpenAI, DeepSeek, and Anthropic.
          </p>
        </div>

        <button
          onClick={dismiss}
          className="w-full bg-zinc-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-zinc-800 transition-colors"
        >
          Get Started
        </button>
      </div>
    </div>
  )
}
