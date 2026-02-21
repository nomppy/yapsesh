import { test, expect } from '@playwright/test'

test('click Record → speech events → flush → flowchart nodes', async ({ page }) => {
  page.on('console', (msg) => console.log(`[${msg.type()}] ${msg.text()}`))
  page.on('pageerror', (err) => console.log(`[PAGE ERROR] ${err.message}`))
  page.on('requestfailed', (req) => {
    console.log(`[NET FAILED] ${req.url()} - ${req.failure()?.errorText}`)
  })
  page.on('response', (res) => {
    if (res.url().includes('extract-topics')) {
      console.log(`[API] ${res.status()} ${res.url()}`)
    }
  })

  // Inject a mock SpeechRecognition BEFORE the page loads
  await page.addInitScript(() => {
    class MockSpeechRecognition extends EventTarget {
      continuous = false
      interimResults = false
      lang = 'en-US'
      onresult: ((event: any) => void) | null = null
      onend: (() => void) | null = null
      onerror: ((event: any) => void) | null = null
      onstart: (() => void) | null = null
      private _running = false

      start() {
        this._running = true;
        (window as any).__mockSpeechRecognition = this
        console.log('[MOCK] SpeechRecognition.start() called')
      }

      stop() {
        this._running = false
        console.log('[MOCK] SpeechRecognition.stop() called')
      }

      abort() { this._running = false }

      simulateResult(transcript: string, isFinal: boolean) {
        console.log(`[MOCK] simulateResult: "${transcript.slice(0, 50)}..." (final=${isFinal})`)
        if (this.onresult) {
          this.onresult({
            resultIndex: 0,
            results: {
              length: 1,
              0: {
                isFinal,
                length: 1,
                0: { transcript, confidence: 0.95 },
              },
            },
          } as any)
        }
      }
    }

    (window as any).SpeechRecognition = MockSpeechRecognition;
    (window as any).webkitSpeechRecognition = MockSpeechRecognition
  })

  await page.goto('http://localhost:3001')
  await page.evaluate(() => localStorage.removeItem('yappergram-storage'))
  await page.reload()
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1')).toHaveText('YapperGram')
  await page.waitForFunction(() => !!(window as any).__appStore, { timeout: 5000 })
  console.log('Ready')

  // Click Record
  await page.click('button:has-text("Record")')
  await page.waitForTimeout(300)
  console.log('Recording started')

  // Speech chunk 1
  console.log('\n=== Speech chunk 1 ===')
  await page.evaluate(() => {
    (window as any).__mockSpeechRecognition.simulateResult(
      'We need to focus on API performance because response times are over 3 seconds and users are really complaining about it',
      true
    )
  })

  // Log store state immediately after
  let state = await page.evaluate(() => {
    const s = (window as any).__appStore.getState()
    return { buffer: s.transcriptBuffer, bufferLen: s.transcriptBuffer.length, processing: s.isProcessing, topics: Object.keys(s.topics).length }
  })
  console.log(`Immediate state: buffer="${state.buffer.slice(0,40)}..." (${state.bufferLen} chars), processing=${state.processing}, topics=${state.topics}`)

  // Wait for first flush to complete
  console.log('Waiting for first flush...')
  await page.waitForFunction(
    () => {
      const s = (window as any).__appStore.getState()
      return Object.keys(s.topics).length > 0
    },
    { timeout: 30000 }
  )

  state = await page.evaluate(() => {
    const s = (window as any).__appStore.getState()
    return {
      buffer: s.transcriptBuffer, processing: s.isProcessing,
      topicCount: Object.keys(s.topics).length,
      topicNames: Object.values(s.topics).map((t: any) => t.name),
    }
  })
  console.log(`After flush 1: ${state.topicCount} topics [${state.topicNames}], buffer="${state.buffer}", processing=${state.processing}`)

  let nodeCount = await page.locator('.react-flow__node').count()
  console.log(`Flowchart: ${nodeCount} nodes`)
  expect(nodeCount).toBeGreaterThanOrEqual(1)

  // Speech chunk 2 — wait a beat first to ensure flush 1 is fully done
  console.log('\n=== Speech chunk 2 ===')
  await page.waitForTimeout(500)

  await page.evaluate(() => {
    (window as any).__mockSpeechRecognition.simulateResult(
      'The main bottleneck is the database queries so we should add a Redis caching layer to reduce the load on the database significantly',
      true
    )
  })

  state = await page.evaluate(() => {
    const s = (window as any).__appStore.getState()
    return { buffer: s.transcriptBuffer, bufferLen: s.transcriptBuffer.length, processing: s.isProcessing, topics: Object.keys(s.topics).length }
  })
  console.log(`Immediate after chunk 2: buffer="${state.buffer.slice(0,60)}..." (${state.bufferLen} chars), processing=${state.processing}, topics=${state.topics}`)

  // Wait for second flush
  console.log('Waiting for second flush...')
  const prevTopicCount = state.topics
  try {
    await page.waitForFunction(
      (prev) => {
        const s = (window as any).__appStore.getState()
        // Either more topics, or processing finished with updated topics
        return !s.isProcessing && (Object.keys(s.topics).length > prev ||
          Object.values(s.topics).some((t: any) => t.updatedAt > Date.now() - 15000))
      },
      prevTopicCount,
      { timeout: 30000 }
    )
  } catch {
    console.log('Timeout waiting for second flush')
  }

  state = await page.evaluate(() => {
    const s = (window as any).__appStore.getState()
    return {
      buffer: s.transcriptBuffer, processing: s.isProcessing,
      topicCount: Object.keys(s.topics).length,
      topicNames: Object.values(s.topics).map((t: any) => `${t.name} (${t.keyPoints.length} pts)`),
      relCount: s.relationships.length,
    }
  })
  console.log(`After flush 2: ${state.topicCount} topics, ${state.relCount} rels, buffer="${state.buffer}", processing=${state.processing}`)
  state.topicNames.forEach((n: string) => console.log(`  ${n}`))

  nodeCount = await page.locator('.react-flow__node').count()
  const edgeCount = await page.locator('.react-flow__edge').count()
  console.log(`\nFlowchart: ${nodeCount} nodes, ${edgeCount} edges`)

  // Click Stop
  await page.click('button:has-text("Stop")')
  console.log('Recording stopped')

  // Final check — the stop also triggers a flush of any remaining buffer
  await page.waitForTimeout(2000)
  const finalState = await page.evaluate(() => {
    const s = (window as any).__appStore.getState()
    return {
      topicCount: Object.keys(s.topics).length,
      relCount: s.relationships.length,
      buffer: s.transcriptBuffer,
      processing: s.isProcessing,
    }
  })
  console.log(`\nFinal: ${finalState.topicCount} topics, ${finalState.relCount} rels, buffer="${finalState.buffer}", processing=${finalState.processing}`)

  nodeCount = await page.locator('.react-flow__node').count()
  console.log(`Final flowchart: ${nodeCount} nodes`)

  expect(nodeCount).toBeGreaterThanOrEqual(1)
  console.log('\n=== ALL PASSED ===')
})
