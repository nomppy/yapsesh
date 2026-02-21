'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import type { LLMProvider, SpeechProviderType } from '@/types'

const PROVIDER_INFO: Record<LLMProvider, { label: string; help: string }> = {
  claude: {
    label: 'Claude',
    help: 'Get your API key at console.anthropic.com. Sign up, go to API Keys, create one.',
  },
  openai: {
    label: 'OpenAI',
    help: 'Get your API key at platform.openai.com. Sign up, go to API Keys.',
  },
  deepseek: {
    label: 'DeepSeek',
    help: 'Get your API key at platform.deepseek.com. Cheapest option \u2014 great quality at ~$0.14/M input tokens.',
  },
  ollama: {
    label: 'Ollama',
    help: 'Run models locally for free. Install from ollama.com, then `ollama pull llama3.1`.',
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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between shrink-0">
          <h2 className="font-semibold text-zinc-800">Settings</h2>
          <button
            onClick={() => setSettingsOpen(false)}
            className="text-zinc-400 hover:text-zinc-600 text-lg leading-none"
          >
            &#10005;
          </button>
        </div>

        <div className="px-6 py-4 space-y-5 overflow-y-auto">
          {/* LLM Provider */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2 block">
              LLM Provider
            </label>
            <div className="flex flex-wrap gap-2">
              {(['claude', 'openai', 'deepseek', 'ollama'] as LLMProvider[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setLLMProvider(p)}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                    ${llmProvider === p
                      ? 'bg-zinc-900 text-white'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
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
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2 block">
                {keyLabel[llmProvider]} API Key
              </label>
              <input
                type="password"
                value={apiKeys[llmProvider] || ''}
                onChange={(e) => setApiKey(llmProvider, e.target.value)}
                placeholder={`Enter your ${keyLabel[llmProvider]} API key`}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
              />
              <p className="text-[10px] text-zinc-400 mt-1">
                Or set {envVarName[llmProvider]} environment variable
              </p>
            </div>
          )}

          {llmProvider === 'ollama' && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2 block">
                Ollama Model
              </label>
              <input
                type="text"
                value={apiKeys.ollamaModel || ''}
                onChange={(e) => setApiKey('ollamaModel', e.target.value)}
                placeholder="llama3.1"
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
              />
              <p className="text-[10px] text-zinc-400 mt-1">
                Ensure Ollama is running at localhost:11434
              </p>
            </div>
          )}

          {/* Help section */}
          <div>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="text-xs font-medium text-zinc-500 hover:text-zinc-700 flex items-center gap-1"
            >
              <span className={`transition-transform inline-block ${showHelp ? 'rotate-90' : ''}`}>&#9654;</span>
              How to get API keys
            </button>
            {showHelp && (
              <div className="mt-2 space-y-2.5">
                {(['claude', 'openai', 'deepseek', 'ollama'] as LLMProvider[]).map((p) => (
                  <div key={p} className="bg-zinc-50 rounded-lg px-3 py-2">
                    <p className="text-xs font-semibold text-zinc-700">{PROVIDER_INFO[p].label}</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">{PROVIDER_INFO[p].help}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Speech Provider */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2 block">
              Speech Engine
            </label>
            <div className="flex gap-2">
              {([
                { value: 'webspeech', label: 'Web Speech API' },
                { value: 'deepgram', label: 'Deepgram' },
              ] as { value: SpeechProviderType; label: string }[]).map((p) => (
                <button
                  key={p.value}
                  onClick={() => setSpeechProvider(p.value)}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                    ${speechProvider === p.value
                      ? 'bg-zinc-900 text-white'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
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
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2 block">
                Deepgram API Key
              </label>
              <input
                type="password"
                value={apiKeys.deepgram || ''}
                onChange={(e) => setApiKey('deepgram', e.target.value)}
                placeholder="Enter your Deepgram API key"
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
              />
              <p className="text-[10px] text-zinc-400 mt-1">
                Enables speaker diarization (who said what)
              </p>
            </div>
          )}

          {/* Reset Session */}
          <div className="pt-2 border-t border-zinc-100">
            <button
              onClick={() => {
                if (confirm('Clear all topics and transcript? This cannot be undone.')) {
                  resetSession()
                }
              }}
              className="text-xs text-red-500 hover:text-red-600 font-medium"
            >
              Reset Session
            </button>
          </div>
        </div>

        <div className="px-6 py-3 bg-zinc-50 border-t border-zinc-100 shrink-0">
          <button
            onClick={() => setSettingsOpen(false)}
            className="w-full py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
