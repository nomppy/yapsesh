'use client'

import { useState, useRef } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { useAppStore } from '@/lib/store'
import { FlowChart } from '@/components/FlowChart'

const SAMPLE_TRANSCRIPTS = [
  "OK so I went to this ramen place last night right, and the guy behind the counter was doing this whole performance, spinning the noodles, shouting, the whole thing. And I'm sitting there thinking about how we used to make instant ramen in the dorm microwave at 2am and somehow that hit harder.",
  "That reminds me, have you been watching that new show Shogun? Because there's this whole subplot about food and culture and power dynamics and it totally changed how I think about cooking. Like food is literally politics. My mom always said that whoever controls the kitchen controls the family.",
  "Speaking of your mom, didn't she just get back from that trip to Portugal? I've been dying to go there, especially Lisbon. I heard the pastéis de nata there are life-changing. And the tile work! I saw this TikTok about azulejo tiles and now I want to retile my entire bathroom.",
  "Oh my god the bathroom renovation rabbit hole. I spent like four hours on YouTube watching this couple renovate a 1920s bungalow and now I'm convinced I need to buy a fixer-upper. But then I looked at mortgage rates and noped right out of that dream. The housing market is absolutely unhinged right now.",
  "The housing thing is so real though. Like my coworker just bought a place in Austin and she's paying less for a 3-bedroom house than I pay for my studio apartment. Maybe remote work is the move. I could literally work from Portugal eating pastéis de nata every morning.",
  "That's the dream honestly. But you know what, I think there's something to be said for having a local community too. Like my neighbor just started this Wednesday morning coffee thing on our street and it's the best part of my week. Six strangers just sitting on someone's porch talking about nothing. That's the real social network.",
]

export default function TestPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [injecting, setInjecting] = useState(false)
  const abortRef = useRef(false)

  const addTranscript = useAppStore((s) => s.addTranscript)
  const clearBuffer = useAppStore((s) => s.clearBuffer)
  const processTopics = useAppStore((s) => s.processTopics)
  const setProcessing = useAppStore((s) => s.setProcessing)
  const resetSession = useAppStore((s) => s.resetSession)
  const topics = useAppStore((s) => s.topics)
  const relationships = useAppStore((s) => s.relationships)
  const currentTopicId = useAppStore((s) => s.currentTopicId)

  function log(msg: string) {
    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    setLogs((prev) => [...prev, `[${ts}] ${msg}`])
  }

  async function runFullPipeline() {
    abortRef.current = false
    setInjecting(true)
    resetSession()
    setLogs([])
    log('Pipeline started — resetting session')

    for (let i = 0; i < SAMPLE_TRANSCRIPTS.length; i++) {
      if (abortRef.current) { log('Aborted'); break }

      const chunk = SAMPLE_TRANSCRIPTS[i]
      log(`Injecting transcript chunk ${i + 1}/${SAMPLE_TRANSCRIPTS.length}: "${chunk.slice(0, 60)}..."`)
      addTranscript(chunk)

      // Flush buffer to LLM
      const state = useAppStore.getState()
      const buffer = clearBuffer()
      if (!buffer.trim()) { log('Buffer empty, skipping'); continue }

      log(`Sending ${buffer.split(/\s+/).length} words to /api/extract-topics...`)
      setProcessing(true)

      try {
        const res = await fetch('/api/extract-topics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript: buffer,
            existingTopics: useAppStore.getState().topics,
            apiKeys: state.apiKeys,
            llmProvider: state.llmProvider,
          }),
        })

        if (!res.ok) {
          const errText = await res.text()
          log(`API error (${res.status}): ${errText}`)
          setProcessing(false)
          continue
        }

        const extraction = await res.json()
        log(`Extraction returned: ${extraction.topics.length} topics, ${extraction.relationships.length} relationships`)
        extraction.topics.forEach((t: { id: string; name: string; isNew: boolean; keyPoints: string[] }) => {
          log(`  ${t.isNew ? 'NEW' : 'UPD'} "${t.name}" (${t.keyPoints.length} points)`)
        })

        processTopics(extraction)

        const after = useAppStore.getState()
        log(`Store now has ${Object.keys(after.topics).length} topics, ${after.relationships.length} relationships, current: ${after.currentTopicId}`)
      } catch (err) {
        log(`Fetch error: ${err instanceof Error ? err.message : err}`)
        setProcessing(false)
      }

      // Small delay between chunks
      if (i < SAMPLE_TRANSCRIPTS.length - 1) {
        log('Waiting 1s before next chunk...')
        await new Promise((r) => setTimeout(r, 1000))
      }
    }

    log('Pipeline complete')
    setInjecting(false)
  }

  async function testApiOnly() {
    setLogs([])
    log('Testing API route directly...')
    try {
      const res = await fetch('/api/extract-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: 'We should fix the login page and add two factor authentication.',
          existingTopics: {},
          apiKeys: useAppStore.getState().apiKeys,
          llmProvider: useAppStore.getState().llmProvider,
        }),
      })
      log(`Response status: ${res.status}`)
      const body = await res.text()
      log(`Response body: ${body.slice(0, 500)}`)
    } catch (err) {
      log(`Fetch failed: ${err instanceof Error ? err.message : err}`)
    }
  }

  return (
    <ReactFlowProvider>
      <div className="flex flex-col h-screen bg-zinc-50">
        <div className="border-b border-zinc-200 bg-white px-4 py-3">
          <h1 className="text-base font-bold text-zinc-800">YapperGram Test Harness</h1>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Flowchart */}
          <div className="flex-1 min-w-0">
            <FlowChart />
          </div>

          {/* Test controls + log */}
          <div className="w-[400px] shrink-0 border-l border-zinc-200 bg-white flex flex-col">
            <div className="px-4 py-3 border-b border-zinc-200 space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={runFullPipeline}
                  disabled={injecting}
                  className="px-3 py-1.5 bg-zinc-900 text-white text-xs font-medium rounded-lg disabled:opacity-50"
                >
                  {injecting ? 'Running...' : 'Run Full Pipeline'}
                </button>
                <button
                  onClick={testApiOnly}
                  className="px-3 py-1.5 bg-zinc-100 text-zinc-700 text-xs font-medium rounded-lg hover:bg-zinc-200"
                >
                  Test API Only
                </button>
                <button
                  onClick={() => { abortRef.current = true }}
                  className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100"
                >
                  Abort
                </button>
              </div>
              <div className="text-[10px] text-zinc-400">
                Store: {Object.keys(topics).length} topics, {relationships.length} rels, current: {currentTopicId || 'none'}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 font-mono text-[11px] leading-relaxed text-zinc-600 space-y-0.5">
              {logs.length === 0 && <p className="text-zinc-400">Click a button to start testing...</p>}
              {logs.map((line, i) => (
                <div key={i} className={line.includes('error') || line.includes('Error') ? 'text-red-500' : ''}>
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ReactFlowProvider>
  )
}
