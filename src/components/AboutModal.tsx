'use client'

import { useState } from 'react'

export function AboutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[85vh] flex flex-col">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between shrink-0">
          <h2 className="font-semibold text-zinc-800">About YapSesh</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 text-lg leading-none"
          >
            &#10005;
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto space-y-5">
          {/* What it does */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-800 mb-1.5">What is YapSesh?</h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              YapSesh listens to your conversations in real time, uses AI to extract the topics being discussed,
              and generates a visual flowchart showing how your conversation flows from subject to subject.
              Great for meetings, brainstorms, podcasts, or just tracking where your yapping goes.
            </p>
          </div>

          {/* How it works */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-800 mb-1.5">How it works</h3>
            <ol className="text-sm text-zinc-600 leading-relaxed space-y-1 list-decimal list-inside">
              <li>Click <strong>Record</strong> to start capturing speech via your browser</li>
              <li>Speech is transcribed locally using the Web Speech API</li>
              <li>Transcript chunks are sent to an LLM to extract topics and relationships</li>
              <li>Topics appear as nodes in an interactive flowchart you can pan, zoom, and edit</li>
            </ol>
          </div>

          {/* Privacy */}
          <div className="bg-emerald-50 rounded-lg px-4 py-3">
            <h3 className="text-sm font-semibold text-emerald-800 mb-1">Privacy</h3>
            <p className="text-sm text-emerald-700 leading-relaxed">
              All data stays in your browser. Nothing is stored on any server. Your transcript, topics,
              and session data live in localStorage and never leave your device &mdash; except for the
              transcript chunks sent to your chosen LLM provider for topic extraction.
            </p>
          </div>

          {/* LLM providers */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-800 mb-1.5">LLM Providers</h3>
            <p className="text-sm text-zinc-600 leading-relaxed mb-2">
              YapSesh uses an LLM only for topic summarization. You bring your own API key.
              Supported providers:
            </p>
            <ul className="text-sm text-zinc-600 space-y-1">
              <li className="flex gap-2"><span className="font-medium text-zinc-700 shrink-0">Claude</span> <span className="text-zinc-400">&mdash;</span> Anthropic (console.anthropic.com)</li>
              <li className="flex gap-2"><span className="font-medium text-zinc-700 shrink-0">OpenAI</span> <span className="text-zinc-400">&mdash;</span> GPT-4o mini (platform.openai.com)</li>
              <li className="flex gap-2"><span className="font-medium text-zinc-700 shrink-0">DeepSeek</span> <span className="text-zinc-400">&mdash;</span> Cheapest option (platform.deepseek.com)</li>
              <li className="flex gap-2"><span className="font-medium text-zinc-700 shrink-0">Ollama</span> <span className="text-zinc-400">&mdash;</span> Run locally, fully offline (ollama.com)</li>
            </ul>
          </div>

          {/* Self-host */}
          <div className="bg-zinc-50 rounded-lg px-4 py-3">
            <h3 className="text-sm font-semibold text-zinc-800 mb-1">Self-host for full privacy</h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              For fully offline usage, self-host YapSesh and use Ollama as your LLM provider.
              No data leaves your machine. See the{' '}
              <a href="https://github.com/nomppy/yapsesh" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 underline">
                GitHub repo
              </a>{' '}
              for setup instructions.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-3 pt-1">
            <a
              href="https://github.com/nomppy/yapsesh"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 text-white text-xs font-medium rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
            <a
              href="mailto:feedback@sunken.site?subject=YapSesh%20Feedback"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 text-zinc-700 text-xs font-medium rounded-lg hover:bg-zinc-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Send Feedback
            </a>
          </div>
        </div>

        <div className="px-6 py-3 bg-zinc-50 border-t border-zinc-100 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}
