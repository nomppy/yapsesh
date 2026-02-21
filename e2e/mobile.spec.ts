import { test, expect } from '@playwright/test'

async function seedTopics(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    const state = {
      state: {
        topics: {
          'api-performance': {
            id: 'api-performance', name: 'API Performance Issues',
            keyPoints: ['Response times over 3 seconds', 'Database bottleneck'],
            createdAt: Date.now() - 60000, updatedAt: Date.now(),
          },
          'caching': {
            id: 'caching', name: 'Redis Caching',
            keyPoints: ['Add Redis layer'],
            createdAt: Date.now() - 30000, updatedAt: Date.now(),
          },
        },
        relationships: [{ from: 'api-performance', to: 'caching', type: 'led_to' }],
        currentTopicId: 'caching',
        transcriptHistory: [
          { text: 'API is slow.', timestamp: Date.now() - 60000 },
          { text: 'Add Redis.', timestamp: Date.now() - 30000 },
        ],
        llmProvider: 'claude', speechProvider: 'webspeech', apiKeys: {},
      },
      version: 0,
    }
    localStorage.setItem('yappergram-storage', JSON.stringify(state))
  })
  await page.reload()
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000)
}

test('mobile 375px: stacked layout, no overflow', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('http://localhost:3001')
  await seedTopics(page)

  // No horizontal overflow
  const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
  console.log(`Body scroll width: ${bodyWidth}px`)
  expect(bodyWidth).toBeLessThanOrEqual(375)

  // Header visible
  await expect(page.locator('h1')).toBeVisible()
  await expect(page.locator('h1')).toHaveText('YapperGram')

  // Flowchart area should have reasonable height
  const flowchartArea = page.locator('.min-h-\\[300px\\]')
  const flowBounds = await flowchartArea.boundingBox()
  console.log(`Flowchart area: ${JSON.stringify(flowBounds)}`)
  expect(flowBounds).toBeTruthy()
  expect(flowBounds!.height).toBeGreaterThanOrEqual(280)
  expect(flowBounds!.width).toBeGreaterThanOrEqual(300)

  // Transcript panel should be below flowchart (stacked), full width
  const transcriptHeader = page.locator('text=Live Transcript')
  await expect(transcriptHeader).toBeVisible()
  const transBounds = await transcriptHeader.boundingBox()
  console.log(`Transcript header: ${JSON.stringify(transBounds)}`)
  expect(transBounds!.y).toBeGreaterThan(flowBounds!.y + flowBounds!.height - 10) // below flowchart

  // Nodes should be visible in flowchart
  const nodes = await page.locator('.react-flow__node').count()
  console.log(`Nodes visible: ${nodes}`)
  expect(nodes).toBe(2)

  // Timeline at bottom
  const timeline = page.locator('.rounded-full.border-2').first()
  await expect(timeline).toBeVisible()

  await page.screenshot({ path: 'test-results/mobile-after.png', fullPage: true })
  console.log('Screenshot: test-results/mobile-after.png')
  console.log('Mobile layout test PASSED')
})

test('desktop 1280px: side-by-side layout', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('http://localhost:3001')
  await seedTopics(page)

  // Flowchart nodes should be on the left side
  const firstNode = page.locator('.react-flow__node').first()
  await expect(firstNode).toBeVisible()
  const nodeBounds = await firstNode.boundingBox()

  // Transcript header should be on the right side
  const transcriptHeader = page.locator('text=Live Transcript')
  const transBounds = await transcriptHeader.boundingBox()

  console.log(`Node: x=${nodeBounds?.x}`)
  console.log(`Transcript: x=${transBounds?.x}`)

  // Transcript should be to the right of the flowchart nodes, not below
  expect(transBounds!.x).toBeGreaterThan(500)
  expect(transBounds!.y).toBeLessThan(200) // near the top, not stacked below

  console.log('Desktop layout test PASSED')
})
