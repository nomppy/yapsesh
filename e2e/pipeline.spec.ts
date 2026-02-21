import { test, expect } from '@playwright/test'

test('full pipeline: inject transcript → API → flowchart renders', async ({ page }) => {
  // Collect console logs
  const consoleLogs: string[] = []
  page.on('console', (msg) => consoleLogs.push(`[${msg.type()}] ${msg.text()}`))

  // Catch page errors
  const pageErrors: string[] = []
  page.on('pageerror', (err) => pageErrors.push(err.message))

  await page.goto('http://localhost:3001/test')
  await page.waitForLoadState('networkidle')

  // Verify test page loaded
  await expect(page.locator('h1')).toHaveText('YapSesh Test Harness')

  // Step 1: Test API Only
  console.log('\n=== TEST: API Only ===')
  await page.click('text=Test API Only')
  // Wait for the response to appear in the log
  await page.waitForFunction(
    () => document.body.innerText.includes('Response status:'),
    { timeout: 30000 }
  )
  const apiLog = await page.locator('.font-mono').innerText()
  console.log(apiLog)

  // Check API returned 200
  expect(apiLog).toContain('Response status: 200')
  expect(apiLog).not.toContain('Fetch failed')

  // Step 2: Run Full Pipeline
  console.log('\n=== TEST: Full Pipeline ===')
  await page.click('text=Run Full Pipeline')

  // Wait for pipeline completion (up to 2 min for 4 LLM calls)
  await page.waitForFunction(
    () => document.body.innerText.includes('Pipeline complete'),
    { timeout: 120000 }
  )

  const pipelineLog = await page.locator('.font-mono').innerText()
  console.log(pipelineLog)

  // Verify no errors in the log
  expect(pipelineLog).not.toContain('API error')
  expect(pipelineLog).not.toContain('Fetch error')
  expect(pipelineLog).not.toContain('Fetch failed')

  // Verify topics were extracted
  expect(pipelineLog).toContain('NEW')
  expect(pipelineLog).toMatch(/Store now has \d+ topics/)

  // Step 3: Verify flowchart rendered nodes
  const nodeCount = await page.locator('.react-flow__node').count()
  console.log(`\nFlowchart rendered ${nodeCount} nodes`)
  expect(nodeCount).toBeGreaterThanOrEqual(2)

  // Check edges too
  const edgeCount = await page.locator('.react-flow__edge').count()
  console.log(`Flowchart rendered ${edgeCount} edges`)
  expect(edgeCount).toBeGreaterThanOrEqual(1)

  // Step 4: Verify node content
  const nodeTexts = await page.locator('.react-flow__node').allInnerTexts()
  console.log('\nNode contents:')
  nodeTexts.forEach((t, i) => console.log(`  Node ${i + 1}: ${t.replace(/\n/g, ' | ').slice(0, 100)}`))

  // Print any console errors
  const errors = consoleLogs.filter(l => l.startsWith('[error]'))
  if (errors.length) {
    console.log('\n=== Browser console errors ===')
    errors.forEach(e => console.log(e))
  }

  if (pageErrors.length) {
    console.log('\n=== Page errors ===')
    pageErrors.forEach(e => console.log(e))
  }

  console.log('\n=== ALL TESTS PASSED ===')
})
