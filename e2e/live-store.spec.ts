import { test, expect } from '@playwright/test'

test('live store: addTranscript → flushBuffer → nodes appear without reload', async ({ page }) => {
  page.on('console', (msg) => console.log(`[${msg.type()}] ${msg.text()}`))
  page.on('pageerror', (err) => console.log(`[PAGE ERROR] ${err.message}`))
  page.on('requestfailed', (req) => {
    console.log(`[NET FAILED] ${req.url()} - ${req.failure()?.errorText}`)
  })
  page.on('response', (res) => {
    if (res.url().includes('extract-topics')) {
      console.log(`[API] ${res.status()} (${res.url()})`)
    }
  })

  await page.goto('http://localhost:3001')
  await page.evaluate(() => localStorage.removeItem('yappergram-storage'))
  await page.reload()
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1')).toHaveText('YapperGram')

  // Wait for store to be exposed
  await page.waitForFunction(() => !!(window as any).__appStore, { timeout: 5000 })
  console.log('Store exposed on window')

  // Verify store is functional
  const storeCheck = await page.evaluate(() => {
    const store = (window as any).__appStore
    const state = store.getState()
    return {
      hasAddTranscript: typeof state.addTranscript === 'function',
      hasClearBuffer: typeof state.clearBuffer === 'function',
      hasProcessTopics: typeof state.processTopics === 'function',
      topicCount: Object.keys(state.topics).length,
      buffer: state.transcriptBuffer,
      llmProvider: state.llmProvider,
    }
  })
  console.log('Store check:', JSON.stringify(storeCheck))

  // Step 1: Simulate speech recognition delivering text — call addTranscript
  console.log('\n=== Step 1: addTranscript (simulating speech recognition) ===')
  await page.evaluate(() => {
    const store = (window as any).__appStore
    store.getState().addTranscript(
      'We need to focus on API performance. Response times are over 3 seconds and users are complaining. The database queries seem to be the main bottleneck.'
    )
    store.getState().addTranscript(
      'We should add a Redis caching layer for the most frequently accessed data. That should significantly reduce the load on the database.'
    )
  })

  const afterAdd = await page.evaluate(() => {
    const state = (window as any).__appStore.getState()
    return {
      bufferWordCount: state.transcriptBuffer.trim().split(/\s+/).length,
      historyLength: state.transcriptHistory.length,
      buffer: state.transcriptBuffer.slice(0, 100) + '...',
    }
  })
  console.log('After addTranscript:', JSON.stringify(afterAdd))

  // Check transcript panel shows entries
  const transcriptEntries = await page.locator('.overflow-y-auto .group').count()
  console.log(`Transcript panel entries: ${transcriptEntries}`)
  expect(transcriptEntries).toBe(2)

  // Step 2: Simulate flushBuffer — exactly what AudioCapture does
  console.log('\n=== Step 2: flushBuffer (simulating AudioCapture flush) ===')
  const flushResult = await page.evaluate(async () => {
    const store = (window as any).__appStore
    const state = store.getState()
    const logs: string[] = []

    // This is the EXACT logic from AudioCapture.flushBuffer:
    const buffer = state.clearBuffer()
    if (!buffer.trim()) {
      logs.push('Buffer was empty!')
      return { logs, success: false }
    }
    logs.push(`Buffer cleared: ${buffer.split(/\s+/).length} words`)

    state.setProcessing(true)
    logs.push('setProcessing(true)')

    try {
      // This is the extractTopics function call
      const currentState = store.getState()
      logs.push(`Calling /api/extract-topics with provider=${currentState.llmProvider}`)
      logs.push(`apiKeys: ${JSON.stringify(Object.keys(currentState.apiKeys))}`)

      const response = await fetch('/api/extract-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: buffer,
          existingTopics: currentState.topics,
          apiKeys: currentState.apiKeys,
          llmProvider: currentState.llmProvider,
        }),
      })

      logs.push(`Response: ${response.status} ${response.statusText}`)

      if (!response.ok) {
        const errText = await response.text()
        logs.push(`Error body: ${errText}`)
        state.setProcessing(false)
        return { logs, success: false }
      }

      const extraction = await response.json()
      logs.push(`Got ${extraction.topics.length} topics, ${extraction.relationships.length} rels`)
      for (const t of extraction.topics) {
        logs.push(`  ${t.isNew ? 'NEW' : 'UPD'} [${t.id}] "${t.name}"`)
      }

      // This is processTopics — the real store method
      state.processTopics(extraction)
      logs.push('processTopics called')

      const after = store.getState()
      logs.push(`Store: ${Object.keys(after.topics).length} topics, ${after.relationships.length} rels, current=${after.currentTopicId}`)

      return { logs, success: true }
    } catch (err: any) {
      logs.push(`FETCH ERROR: ${err.name}: ${err.message}`)
      logs.push(`Stack: ${err.stack?.slice(0, 200)}`)
      state.setProcessing(false)
      return { logs, success: false }
    }
  })

  console.log('\nFlush results:')
  flushResult.logs.forEach((l: string) => console.log(`  ${l}`))
  expect(flushResult.success).toBe(true)

  // Step 3: Check that flowchart nodes appeared WITHOUT reload
  console.log('\n=== Step 3: Verify flowchart updated live ===')
  await page.waitForTimeout(1000) // give React Flow a moment to re-render

  const nodeCount = await page.locator('.react-flow__node').count()
  console.log(`Flowchart nodes: ${nodeCount}`)

  if (nodeCount > 0) {
    const texts = await page.locator('.react-flow__node').allInnerTexts()
    texts.forEach((t, i) => console.log(`  Node ${i + 1}: ${t.replace(/\n/g, ' | ').slice(0, 120)}`))
  }

  const edgeCount = await page.locator('.react-flow__edge').count()
  console.log(`Flowchart edges: ${edgeCount}`)

  expect(nodeCount).toBeGreaterThanOrEqual(1)
  expect(edgeCount).toBeGreaterThanOrEqual(0)

  // Verify header updated
  const header = await page.locator('header').innerText()
  console.log(`Header: ${header.replace(/\n/g, ' ')}`)
  expect(header).toContain('topic')

  console.log('\n=== ALL PASSED ===')
})
