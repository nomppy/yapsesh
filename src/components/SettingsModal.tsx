'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import type { LLMProvider, SpeechProviderType } from '@/types'

const PROVIDER_INFO: Record<LLMProvider, { label: string; help: string }> = {
  claude: {
    label: 'Claude',
    help: 'Head to console.anthropic.com, sign up, and grab an API key. Easy peasy.',
  },
  openai: {
    label: 'OpenAI',
    help: 'Go to platform.openai.com, sign up, and create an API key.',
  },
  deepseek: {
    label: 'DeepSeek',
    help: 'The budget-friendly option — great quality at ~$0.14/M tokens. Get a key at platform.deepseek.com.',
  },
  ollama: {
    label: 'Ollama',
    help: 'Run models on your own machine, totally free. Install from ollama.com then run `ollama pull llama3.1`.',
  },
}

export function SettingsModal() {
  const settingsOpen = useAppStore((s) => s.settingsOpen)
  const llmProvider = useAppStore((s) => s.llmProvider)
  const speechProvider = useAppStore((s) => s.speechProvider)
  const apiKeys = useAppStore((s) => s.apiKeys)

  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen)
  const setLLMProvider = useAppStore((s) => s.setLLMProvider)
  const setSpeechProvider = useAppStore((s) => s.setSpeechProvider)
  const setApiKey = useAppStore((s) => s.setApiKey)
  const resetSession = useAppStore((s) => s.resetSession)

  const [showHelp, setShowHelp] = useState(false)

  if (!settingsOpen) return null

  const providerNeedsKey = llmProvider !== 'ollama'
  const keyLabel: Record<string, string> = {
    claude: 'Anthropic',
    openai: 'OpenAI',
    deepseek: 'DeepSeek',
  }
  const envVarName: Record<string, string> = {
    claude: 'ANTHROPIC_API_KEY',
    openai: 'OPENAI_API_KEY',
    deepseek: 'DEEPSEEK_API_KEY',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between shrink-0">
          <h2 className="font-serif text-lg text-stone-800" style={{ fontStyle: 'italic' }}>Settings</h2>
          <button
            onClick={() => setSettingsOpen(false)}
            className="text-stone-400 hover:text-stone-600 text-lg leading-none"
          >
            &#10005;
          </button>
        </div>

        <div className="px-6 py-4 space-y-5 overflow-y-auto">
          {/* LLM Provider */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-2 block">
              Which AI should do the thinking?
            </label>
            <div className="flex flex-wrap gap-2">
              {(['claude', 'openai', 'deepseek', 'ollama'] as LLMProvider[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setLLMProvider(p)}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                    ${llmProvider === p
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }
                  `}
                >
                  {PROVIDER_INFO[p].label}
                </button>
              ))}
            </div>
          </div>

          {/* API Key for selected provider */}
          {providerNeedsKey && (
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-2 block">
                {keyLabel[llmProvider]} API Key
              </label>
              <input
                type="password"
                value={apiKeys[llmProvider] || ''}
                onChange={(e) => setApiKey(llmProvider, e.target.value)}
                placeholder={`Paste your ${keyLabel[llmProvider]} key here`}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 bg-stone-50"
              />
              <p className="text-[11px] text-stone-400 mt-1">
                Or set the {envVarName[llmProvider]} env var if you self-host
              </p>
            </div>
          )}

          {llmProvider === 'ollama' && (
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-2 block">
                Ollama Model
              </label>
              <input
                type="text"
                value={apiKeys.ollamaModel || ''}
                onChange={(e) => setApiKey('ollamaModel', e.target.value)}
                placeholder="llama3.1"
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 bg-stone-50"
              />
              <p className="text-[11px] text-stone-400 mt-1">
                Make sure Ollama is running at localhost:11434
              </p>
            </div>
          )}

          {/* Help section */}
          <div>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="text-xs font-medium text-stone-500 hover:text-stone-700 flex items-center gap-1"
            >
              <span className={`transition-transform inline-block ${showHelp ? 'rotate-90' : ''}`}>&#9654;</span>
              Where do I get API keys?
            </button>
            {showHelp && (
              <div className="mt-2 space-y-2.5">
                {(['claude', 'openai', 'deepseek', 'ollama'] as LLMProvider[]).map((p) => (
                  <div key={p} className="bg-stone-50 rounded-lg px-3 py-2">
                    <p className="text-xs font-semibold text-stone-700">{PROVIDER_INFO[p].label}</p>
                    <p className="text-[11px] text-stone-500 mt-0.5">{PROVIDER_INFO[p].help}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Speech Provider */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-2 block">
              How should we hear you?
            </label>
            <div className="flex gap-2">
              {([
                { value: 'webspeech', label: 'Browser built-in' },
                { value: 'deepgram', label: 'Deepgram' },
              ] as { value: SpeechProviderType; label: string }[]).map((p) => (
                <button
                  key={p.value}
                  onClick={() => setSpeechProvider(p.value)}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                    ${speechProvider === p.value
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }
                  `}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {speechProvider === 'deepgram' && (
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-2 block">
                Deepgram API Key
              </label>
              <input
                type="password"
                value={apiKeys.deepgram || ''}
                onChange={(e) => setApiKey('deepgram', e.target.value)}
                placeholder="Paste your Deepgram key"
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 bg-stone-50"
              />
              <p className="text-[11px] text-stone-400 mt-1">
                This lets us tell apart who's saying what
              </p>
            </div>
          )}

          {/* Reset Session */}
          <div className="pt-2 border-t border-stone-100">
            <button
              onClick={() => {
                if (confirm('Wipe everything and start fresh? No undo on this one.')) {
                  resetSession()
                }
              }}
              className="text-xs text-red-500 hover:text-red-600 font-medium"
            >
              Wipe session clean
            </button>
          </div>
        </div>

        <div className="px-6 py-3 bg-stone-50 border-t border-stone-100 shrink-0">
          <button
            onClick={() => setSettingsOpen(false)}
            className="w-full py-2 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors"
          >
            All good
          </button>
        </div>
      </div>
    </div>
  )
}
