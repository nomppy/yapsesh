'use client'
import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import type { LLMProvider, SpeechProviderType } from '@/types'
const PROVIDER_INFO: Record<LLMProvider, { label: string; help: string }> = {
  claude: { label: 'CLAUDE', help: 'console.anthropic.com' },
  openai: { label: 'OPENAI', help: 'platform.openai.com' },
  deepseek: { label: 'DEEPSEEK', help: 'platform.deepseek.com — budget option' },
  ollama: { label: 'OLLAMA', help: 'ollama.com — runs locally, free' },
}
export function SettingsModal() {
  const settingsOpen = useAppStore((s) => s.settingsOpen); const llmProvider = useAppStore((s) => s.llmProvider)
  const speechProvider = useAppStore((s) => s.speechProvider); const apiKeys = useAppStore((s) => s.apiKeys)
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen); const setLLMProvider = useAppStore((s) => s.setLLMProvider)
  const setSpeechProvider = useAppStore((s) => s.setSpeechProvider); const setApiKey = useAppStore((s) => s.setApiKey)
  const resetSession = useAppStore((s) => s.resetSession); const [showHelp, setShowHelp] = useState(false)
  if (!settingsOpen) return null
  const providerNeedsKey = llmProvider !== 'ollama'
  const keyLabel: Record<string, string> = { claude: 'Anthropic', openai: 'OpenAI', deepseek: 'DeepSeek' }
  const envVar: Record<string, string> = { claude: 'ANTHROPIC_API_KEY', openai: 'OPENAI_API_KEY', deepseek: 'DEEPSEEK_API_KEY' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)' }}>
      <div className="retro-window" style={{ width: 440, maxWidth: '90vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '5px 5px 0px rgba(0,0,0,0.25)' }}>
        <div className="retro-title-bar shrink-0">
          <span>Control Panel — Settings</span>
          <div className="win-ctrl" onClick={() => setSettingsOpen(false)} style={{ background: '#A07060' }} />
        </div>
        <div className="p-4 space-y-4 overflow-y-auto" style={{ background: '#F5F0E8' }}>
          {/* AI Provider */}
          <fieldset style={{ border: '2px groove #C4B8A4', padding: '12px' }}>
            <legend className="text-[10px] font-mono-display font-bold uppercase px-1" style={{ color: '#5B7553' }}>AI Provider</legend>
            <div className="flex flex-wrap gap-1 mb-3">
              {(['claude', 'openai', 'deepseek', 'ollama'] as LLMProvider[]).map((p) => (
                <button key={p} onClick={() => setLLMProvider(p)}
                  className={`retro-btn text-[10px] ${llmProvider === p ? 'retro-btn-pressed' : ''}`}
                  style={llmProvider === p ? { background: '#5B7553', color: '#F5F0E8', borderStyle: 'inset' } : {}}>
                  {PROVIDER_INFO[p].label}
                </button>))}
            </div>
            {providerNeedsKey && (<div className="mb-2">
              <label className="text-[10px] font-mono-display font-bold uppercase block mb-1" style={{ color: '#6B7F6B' }}>{keyLabel[llmProvider]} API Key:</label>
              <input type="password" value={apiKeys[llmProvider] || ''} onChange={(e) => setApiKey(llmProvider, e.target.value)}
                placeholder={`Enter ${keyLabel[llmProvider]} key...`} className="retro-input w-full text-[11px]" />
              <p className="text-[9px] font-mono-display mt-1" style={{ color: '#A09080' }}>Or set {envVar[llmProvider]} env var</p>
            </div>)}
            {llmProvider === 'ollama' && (<div className="mb-2">
              <label className="text-[10px] font-mono-display font-bold uppercase block mb-1" style={{ color: '#6B7F6B' }}>Model:</label>
              <input type="text" value={apiKeys.ollamaModel || ''} onChange={(e) => setApiKey('ollamaModel', e.target.value)}
                placeholder="llama3.1" className="retro-input w-full text-[11px]" />
            </div>)}
            <button onClick={() => setShowHelp(!showHelp)} className="text-[10px] font-mono-display uppercase" style={{ color: '#8B9B85' }}>[{showHelp ? '-' : '+'} HELP]</button>
            {showHelp && (<div className="mt-2 space-y-1">
              {(['claude', 'openai', 'deepseek', 'ollama'] as LLMProvider[]).map((p) => (
                <div key={p} className="text-[10px] font-mono-display" style={{ color: '#6B7F6B' }}>{PROVIDER_INFO[p].label}: {PROVIDER_INFO[p].help}</div>))}
            </div>)}
          </fieldset>
          {/* Speech */}
          <fieldset style={{ border: '2px groove #C4B8A4', padding: '12px' }}>
            <legend className="text-[10px] font-mono-display font-bold uppercase px-1" style={{ color: '#5B7553' }}>Speech Input</legend>
            <div className="flex gap-1">
              {([{ value: 'webspeech', label: 'BROWSER' }, { value: 'deepgram', label: 'DEEPGRAM' }] as { value: SpeechProviderType; label: string }[]).map((p) => (
                <button key={p.value} onClick={() => setSpeechProvider(p.value)}
                  className={`retro-btn text-[10px] ${speechProvider === p.value ? 'retro-btn-pressed' : ''}`}
                  style={speechProvider === p.value ? { background: '#5B7553', color: '#F5F0E8', borderStyle: 'inset' } : {}}>
                  {p.label}
                </button>))}
            </div>
            {speechProvider === 'deepgram' && (<div className="mt-2">
              <label className="text-[10px] font-mono-display font-bold uppercase block mb-1" style={{ color: '#6B7F6B' }}>Deepgram Key:</label>
              <input type="password" value={apiKeys.deepgram || ''} onChange={(e) => setApiKey('deepgram', e.target.value)}
                placeholder="Paste key..." className="retro-input w-full text-[11px]" />
            </div>)}
          </fieldset>
          {/* Danger */}
          <div className="pt-2" style={{ borderTop: '1px solid #D4CFC4' }}>
            <button onClick={() => { if (confirm('Clear all data? Cannot be undone.')) resetSession() }}
              className="retro-btn text-[10px]" style={{ color: '#A07060' }}>RESET SESSION</button>
          </div>
        </div>
        <div className="px-4 py-2 shrink-0" style={{ background: '#E8E0D4', borderTop: '2px groove #C4B8A4' }}>
          <button onClick={() => setSettingsOpen(false)} className="retro-btn retro-btn-accent text-[10px] float-right">APPLY &amp; CLOSE</button>
          <div className="clear-both" />
        </div>
      </div>
    </div>)
}
