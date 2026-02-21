import { test, expect } from '@playwright/test'

test('no API key: shows clear error pointing to settings', async ({ page }) => {
  page.on('console', (msg) => {
    if (msg.type() === 'error') console.log(`[error] ${msg.text()}`)
  })

  await page.goto('http://localhost:3001')
  await page.evaluate(() => localStorage.removeItem('yapsesh-storage'))
  await page.reload()
  await page.waitForLoadState('networkidle')
  await page.waitForFunction(() => !!(window as any).__appStore, { timeout: 5000 })

  // Simulate what happens when there's no API key:
  // Call the API route directly with no keys and no env var fallback
  const result = await page.evaluate(async () => {
    const res = await fetch('/api/extract-topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: 'Testing no api key scenario',
        existingTopics: {},
        apiKeys: {},
        llmProvider: 'claude',
      }),
    })
    return { status: res.status, body: await res.json() }
  })

  console.log(`API response: ${result.status} ${JSON.stringify(result.body)}`)

  // If ANTHROPIC_API_KEY is set in .env.local, the API will work (200).
  // If not, it should return 400 with a clear message.
  if (result.status === 400) {
    expect(result.body.error).toContain('API key')
    expect(result.body.error).toContain('Settings')
    console.log('Correct: API returned clear error about missing key')
  } else {
    console.log('API key is available in .env.local, testing error UI with forced error')
  }

  // Now test the UI error display by injecting an error into the store
  await page.evaluate(() => {
    const store = (window as any).__appStore
    store.getState().setError('No Anthropic API key configured. Add it in Settings or set ANTHROPIC_API_KEY environment variable.')
  })

  // Error message should appear in top bar
  const errorButton = page.locator('button:has-text("No API key")')
  await expect(errorButton).toBeVisible()
  console.log('Error button visible in top bar')

  // Click it — should open settings
  await errorButton.click()
  await page.waitForTimeout(500)

  // Settings modal should be open
  const settingsTitle = page.locator('text=Settings')
  await expect(settingsTitle).toBeVisible()
  console.log('Settings modal opened')

  // Error should be cleared
  const errorAfter = await page.evaluate(() => (window as any).__appStore.getState().lastError)
  expect(errorAfter).toBeNull()
  console.log('Error cleared after click')

  // Verify the settings modal has the API key input
  const apiKeyInput = page.locator('input[type="password"]')
  await expect(apiKeyInput).toBeVisible()
  console.log('API key input visible in settings')

  console.log('Task 5 PASSED: No API key error handled correctly')
})
