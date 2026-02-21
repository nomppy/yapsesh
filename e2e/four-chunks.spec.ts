import { test, expect } from '@playwright/test'

test('4-chunk pipeline: real Anthropic API, no backend mocks', async ({ page }) => {
  page.on('console', (msg) => console.log(`[${msg.type()}] ${msg.text()}`))
  page.on('pageerror', (err) => console.log(`[PAGE ERROR] ${err.message}`))
  page.on('response', (res) => {
    if (res.url().includes('extract-topics')) {
      res.text().then(body => {
        const preview = body.slice(0, 150)
        console.log(`[API] ${res.status()} ${preview}${body.length > 150 ? '...' : ''}`)
      })
    }
  })

  const CHUNKS = [
    'So I think we really need to focus on the API performance issues. The response times have been over 3 seconds lately and users are complaining. I think the main bottleneck is the database queries.',
    'We should look into adding a caching layer, maybe Redis. That would help with the most frequently accessed data. We could also look at connection pooling for the database.',
    'That reminds me, we also need to talk about the deployment pipeline. The CI builds are taking too long and it is blocking the team from shipping features quickly. Maybe we should look at parallel test execution.',
    'Going back to the API, I think we should also consider switching to GraphQL. It would let the frontend request only the data it needs instead of over-fetching from REST endpoints.',
  ]

  // Mock only SpeechRecognition (no real mic in headless), API is 100% real
  await page.addInitScript(() => {
    class MockSR extends EventTarget {
      continuous = false; interimResults = false; lang = 'en-US'
      onresult: ((e: any) => void) | null = null
      onend: (() => void) | null = null
      onerror: ((e: any) => void) | null = null
      onstart: (() => void) | null = null
      start() { (window as any).__mockSR = this }
      stop() {}
      abort() {}
      _emit(t: string) {
        this.onresult?.({
          resultIndex: 0,
          results: { length: 1, 0: { isFinal: true, length: 1, 0: { transcript: t, confidence: 0.95 } } },
        } as any)
      }
    }
    (window as any).SpeechRecognition = MockSR;
    (window as any).webkitSpeechRecognition = MockSR
  })

  await page.goto('http://localhost:3001')
  await page.evaluate(() => localStorage.removeItem('yappergram-storage'))
  await page.reload()
  await page.waitForLoadState('networkidle')
  await page.waitForFunction(() => !!(window as any).__appStore, { timeout: 5000 })

  // Click Record
  await page.click('button:has-text("Record")')
  await page.waitForTimeout(300)
  console.log('Recording started\n')

  let prevTopicCount = 0

  for (let i = 0; i < CHUNKS.length; i++) {
    console.log(`\n=== CHUNK ${i + 1}/${CHUNKS.length} ===`)
    console.log(`"${CHUNKS[i].slice(0, 60)}..."`)

    // Wait for any in-flight flush to finish
    await page.waitForFunction(() => !(window as any).__appStore.getState().isProcessing, { timeout: 30000 })

    // Emit speech
    await page.evaluate((text) => { (window as any).__mockSR._emit(text) }, CHUNKS[i])

    // Wait for flush to start + finish
    console.log('Waiting for API response...')
    try {
      await page.waitForFunction(
        (prev) => {
          const s = (window as any).__appStore.getState()
          return (!s.isProcessing && Object.keys(s.topics).length >= prev) || s.lastError !== null
        },
        prevTopicCount,
        { timeout: 30000 }
      )
    } catch {
      const state = await page.evaluate(() => {
        const s = (window as any).__appStore.getState()
        return { topics: Object.keys(s.topics).length, processing: s.isProcessing, error: s.lastError, buffer: s.transcriptBuffer }
      })
      console.log(`TIMEOUT state: ${JSON.stringify(state)}`)
    }

    // Check result
    const state = await page.evaluate(() => {
      const s = (window as any).__appStore.getState()
      return {
        topicCount: Object.keys(s.topics).length,
        topicNames: Object.values(s.topics).map((t: any) => `${t.name} (${t.keyPoints.length}pts, speaker=${t.speaker || 'none'})`),
        relCount: s.relationships.length,
        current: s.currentTopicId,
        error: s.lastError,
      }
    })

    if (state.error) {
      console.log(`ERROR: ${state.error}`)
    }
    console.log(`Topics: ${state.topicCount}, Rels: ${state.relCount}, Current: ${state.current}`)
    state.topicNames.forEach((n: string) => console.log(`  ${n}`))

    expect(state.error).toBeNull()
    expect(state.topicCount).toBeGreaterThanOrEqual(1)
    prevTopicCount = state.topicCount
  }

  // Stop recording
  await page.click('button:has-text("Stop")')
  await page.waitForTimeout(1000)

  // Final flowchart check
  const nodes = await page.locator('.react-flow__node').count()
  const edges = await page.locator('.react-flow__edge').count()
  console.log(`\n=== FINAL RESULT ===`)
  console.log(`Flowchart: ${nodes} nodes, ${edges} edges`)

  const nodeTexts = await page.locator('.react-flow__node').allInnerTexts()
  nodeTexts.forEach((t, i) => console.log(`  Node ${i + 1}: ${t.replace(/\n/g, ' | ').slice(0, 120)}`))

  // Verify no <UNKNOWN> speaker anywhere
  const hasUnknown = nodeTexts.some(t => t.includes('<UNKNOWN>') || t.includes('UNKNOWN'))
  console.log(`Contains <UNKNOWN> speaker: ${hasUnknown}`)
  expect(hasUnknown).toBe(false)

  expect(nodes).toBeGreaterThanOrEqual(3)
  expect(edges).toBeGreaterThanOrEqual(2)

  await page.screenshot({ path: 'test-results/four-chunks.png', fullPage: true })
  console.log('Screenshot: test-results/four-chunks.png')
  console.log('\n=== ALL 4 CHUNKS PASSED ===')
})
