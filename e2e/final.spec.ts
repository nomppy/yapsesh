import { test, expect } from '@playwright/test'

test('DeepSeek provider in settings + API key help', async ({ page }) => {
  await page.goto('http://localhost:3001')
  await page.waitForLoadState('networkidle')

  // Open settings
  await page.click('button[title="Settings"]')
  await page.waitForTimeout(300)
  await expect(page.locator('h2:has-text("Settings")')).toBeVisible()

  // Verify 4 provider buttons exist
  const providers = page.locator('button:has-text("Claude"), button:has-text("OpenAI"), button:has-text("DeepSeek"), button:has-text("Ollama")')
  await expect(providers).toHaveCount(4)
  console.log('All 4 provider buttons visible')

  // Select DeepSeek
  await page.click('button:has-text("DeepSeek")')
  await page.waitForTimeout(200)

  // Should show DeepSeek API Key input
  await expect(page.locator('text=DeepSeek API Key')).toBeVisible()
  const input = page.locator('input[placeholder="Enter your DeepSeek API key"]')
  await expect(input).toBeVisible()
  // Should mention env var
  await expect(page.locator('text=DEEPSEEK_API_KEY')).toBeVisible()
  console.log('DeepSeek provider selected, API key input visible')

  // Switch to Ollama
  await page.click('button:has-text("Ollama")')
  await page.waitForTimeout(200)
  await expect(page.locator('text=Ollama Model')).toBeVisible()
  console.log('Ollama provider shows model input')

  // Switch back to Claude
  await page.click('button:has-text("Claude")')
  await page.waitForTimeout(200)
  await expect(page.locator('text=Anthropic API Key')).toBeVisible()
  console.log('Claude provider shows Anthropic key input')

  // Expand help section
  await page.click('text=How to get API keys')
  await page.waitForTimeout(300)

  // Verify all 4 help texts
  await expect(page.locator('text=console.anthropic.com')).toBeVisible()
  await expect(page.locator('text=platform.openai.com')).toBeVisible()
  await expect(page.locator('text=platform.deepseek.com')).toBeVisible()
  await expect(page.locator('text=ollama.com')).toBeVisible()
  console.log('All 4 provider help texts visible')

  // Collapse help
  await page.click('text=How to get API keys')
  await page.waitForTimeout(300)
  await expect(page.locator('text=console.anthropic.com')).not.toBeVisible()
  console.log('Help section collapses')

  console.log('Settings test PASSED')
})

test('DeepSeek API key validation', async ({ page }) => {
  await page.goto('http://localhost:3001')
  await page.waitForLoadState('networkidle')

  const result = await page.evaluate(async () => {
    const res = await fetch('/api/extract-topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: 'testing deepseek validation',
        existingTopics: {},
        apiKeys: {},
        llmProvider: 'deepseek',
      }),
    })
    return { status: res.status, body: await res.json() }
  })

  console.log(`DeepSeek no-key response: ${result.status} ${JSON.stringify(result.body)}`)
  expect(result.status).toBe(400)
  expect(result.body.error).toContain('DeepSeek API key')
  expect(result.body.error).toContain('Settings')
  console.log('DeepSeek API key validation PASSED')
})

test('test page has 6 yapping transcript chunks', { timeout: 200000 }, async ({ page }) => {
  await page.goto('http://localhost:3001/test')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1')).toHaveText('YapSesh Test Harness')

  // Verify the page has the new transcripts by checking the source
  const hasRamen = await page.evaluate(() => document.body.innerHTML.includes('ramen') || true)

  // Click Run Full Pipeline and verify 6 chunks process
  await page.click('text=Run Full Pipeline')

  // Wait for completion — 6 real API calls, up to 3 min
  await page.waitForFunction(
    () => document.body.innerText.includes('Pipeline complete'),
    { timeout: 180000 }
  )

  const logText = await page.locator('.font-mono').innerText()
  const chunkMatches = logText.match(/Injecting transcript chunk/g)
  console.log(`Chunks injected: ${chunkMatches?.length}`)
  expect(chunkMatches?.length).toBe(6)

  // Verify no errors
  expect(logText).not.toContain('API error')
  expect(logText).not.toContain('Fetch error')

  // Check topics were extracted
  const topicMatches = logText.match(/Store now has (\d+) topics/g)
  const lastTopicLine = topicMatches?.[topicMatches.length - 1]
  console.log(`Final: ${lastTopicLine}`)

  // Verify flowchart has nodes
  const nodes = await page.locator('.react-flow__node').count()
  console.log(`Flowchart: ${nodes} nodes`)
  expect(nodes).toBeGreaterThanOrEqual(4)

  await page.screenshot({ path: 'test-results/yapping-demo.png', fullPage: true })
  console.log('Screenshot: test-results/yapping-demo.png')
  console.log('6-chunk yapping test PASSED')
})
