import { test, expect } from '@playwright/test'

test('full real e2e: Record → speak → diagram appears (no mocks)', async ({ page }) => {
  page.on('console', (msg) => console.log(`[${msg.type()}] ${msg.text()}`))
  page.on('pageerror', (err) => console.log(`[PAGE ERROR] ${err.message}`))
  page.on('requestfailed', (req) => {
    console.log(`[NET FAILED] ${req.url()} - ${req.failure()?.errorText}`)
  })
  page.on('response', (res) => {
    if (res.url().includes('extract-topics')) {
      res.text().then(body => {
        console.log(`[API RESPONSE] ${res.status()} body=${body.slice(0, 200)}`)
      })
    }
  })

  // Mock SpeechRecognition (browser API — can't avoid this, no real mic in CI)
  // But the LLM API call is 100% REAL — hits Anthropic for real.
  await page.addInitScript(() => {
    class MockSpeechRecognition extends EventTarget {
      continuous = false
      interimResults = false
      lang = 'en-US'
      onresult: ((event: any) => void) | null = null
      onend: (() => void) | null = null
      onerror: ((event: any) => void) | null = null
      onstart: (() => void) | null = null

      start() { (window as any).__mockSR = this }
      stop() {}
      abort() {}

      _emit(transcript: string) {
        this.onresult?.({
          resultIndex: 0,
          results: { length: 1, 0: { isFinal: true, length: 1, 0: { transcript, confidence: 0.95 } } },
        } as any)
      }
    }
    (window as any).SpeechRecognition = MockSpeechRecognition;
    (window as any).webkitSpeechRecognition = MockSpeechRecognition
  })

  // Load page, clear state
  await page.goto('http://localhost:3001')
  await page.evaluate(() => localStorage.removeItem('yapsesh-storage'))
  await page.reload()
  await page.waitForLoadState('networkidle')
  await page.waitForFunction(() => !!(window as any).__appStore, { timeout: 5000 })
  console.log('Page ready\n')

  // Click Record
  await page.click('button:has-text("Record")')
  await page.waitForTimeout(300)
  const recording = await page.evaluate(() => (window as any).__appStore.getState().isRecording)
  expect(recording).toBe(true)
  console.log('Recording started')

  // Simulate speech — 21 words, triggers immediate flush (threshold=15)
  console.log('\n--- Sending speech chunk 1 (real API call to Anthropic) ---')
  await page.evaluate(() => {
    (window as any).__mockSR._emit(
      'We need to improve the API performance because the response times are over three seconds and our users are really frustrated with the slowness'
    )
  })

  // Wait for real API call + response + store update
  console.log('Waiting for Anthropic API response...')
  try {
    await page.waitForFunction(
      () => {
        const s = (window as any).__appStore.getState()
        return Object.keys(s.topics).length > 0 || s.lastError !== null
      },
      { timeout: 30000 }
    )
  } catch {
    // If timeout, dump state for debugging
    const state = await page.evaluate(() => {
      const s = (window as any).__appStore.getState()
      return { topics: Object.keys(s.topics).length, processing: s.isProcessing, error: s.lastError, buffer: s.transcriptBuffer }
    })
    console.log('TIMEOUT! State:', JSON.stringify(state))
    throw new Error('Timed out waiting for API response')
  }

  // Check for errors
  const error = await page.evaluate(() => (window as any).__appStore.getState().lastError)
  if (error) {
    console.log(`\n!!! ERROR from real API: ${error}`)
  }
  expect(error).toBeNull()

  // Check store
  const state1 = await page.evaluate(() => {
    const s = (window as any).__appStore.getState()
    return {
      topicCount: Object.keys(s.topics).length,
      topicNames: Object.values(s.topics).map((t: any) => t.name),
      relCount: s.relationships.length,
      current: s.currentTopicId,
    }
  })
  console.log(`\nAfter chunk 1: ${state1.topicCount} topics [${state1.topicNames.join(', ')}]`)
  console.log(`  ${state1.relCount} relationships, current=${state1.current}`)

  // Check flowchart
  await page.waitForTimeout(500)
  let nodes = await page.locator('.react-flow__node').count()
  console.log(`Flowchart: ${nodes} nodes`)
  expect(nodes).toBeGreaterThanOrEqual(1)

  // Chunk 2
  console.log('\n--- Sending speech chunk 2 (real API call to Anthropic) ---')
  await page.waitForTimeout(500)
  await page.evaluate(() => {
    (window as any).__mockSR._emit(
      'I think we should add a Redis caching layer for the database and also we need to talk about the deployment pipeline because CI builds are way too slow'
    )
  })

  console.log('Waiting for second Anthropic API response...')
  const prevCount = state1.topicCount
  try {
    await page.waitForFunction(
      (prev) => {
        const s = (window as any).__appStore.getState()
        return (!s.isProcessing && Object.keys(s.topics).length > prev) || s.lastError !== null
      },
      prevCount,
      { timeout: 30000 }
    )
  } catch {
    console.log('Second chunk may have updated existing topics (no new topics created)')
  }

  await page.waitForTimeout(500)
  const state2 = await page.evaluate(() => {
    const s = (window as any).__appStore.getState()
    return {
      topicCount: Object.keys(s.topics).length,
      topicNames: Object.values(s.topics).map((t: any) => `${t.name} (${t.keyPoints.length}pts)`),
      relCount: s.relationships.length,
      current: s.currentTopicId,
      error: s.lastError,
    }
  })
  console.log(`After chunk 2: ${state2.topicCount} topics, ${state2.relCount} rels`)
  state2.topicNames.forEach((n: string) => console.log(`  ${n}`))
  if (state2.error) console.log(`  ERROR: ${state2.error}`)

  nodes = await page.locator('.react-flow__node').count()
  const edges = await page.locator('.react-flow__edge').count()
  console.log(`\nFlowchart: ${nodes} nodes, ${edges} edges`)

  // Print node contents
  const nodeTexts = await page.locator('.react-flow__node').allInnerTexts()
  nodeTexts.forEach((t, i) => console.log(`  Node ${i + 1}: ${t.replace(/\n/g, ' | ').slice(0, 120)}`))

  // Stop recording
  await page.click('button:has-text("Stop")')
  console.log('\nRecording stopped')

  // Screenshot for visual verification
  await page.screenshot({ path: 'test-results/real-e2e.png', fullPage: true })
  console.log('Screenshot saved to test-results/real-e2e.png')

  expect(nodes).toBeGreaterThanOrEqual(1)
  expect(state2.error).toBeNull()
  console.log('\n=== ALL PASSED ===')
})
