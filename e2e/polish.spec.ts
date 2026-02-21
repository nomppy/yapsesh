import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'

// Helper: load topics into the store via localStorage and reload
async function seedTopics(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    const state = {
      state: {
        topics: {
          'api-performance': {
            id: 'api-performance', name: 'API Performance Issues',
            keyPoints: ['Response times over 3 seconds', 'Users complaining', 'Database bottleneck'],
            createdAt: Date.now() - 120000, updatedAt: Date.now() - 60000,
          },
          'caching-solution': {
            id: 'caching-solution', name: 'Redis Caching Solution',
            keyPoints: ['Add Redis caching layer', 'Connection pooling for DB'],
            createdAt: Date.now() - 60000, updatedAt: Date.now() - 30000,
          },
          'deployment-pipeline': {
            id: 'deployment-pipeline', name: 'Deployment Pipeline',
            keyPoints: ['CI builds too slow', 'Parallel test execution'],
            speaker: 'Speaker 1',
            createdAt: Date.now() - 30000, updatedAt: Date.now(),
          },
        },
        relationships: [
          { from: 'api-performance', to: 'caching-solution', type: 'led_to', label: 'led to' },
          { from: 'caching-solution', to: 'deployment-pipeline', type: 'related_to', label: 'related' },
        ],
        currentTopicId: 'deployment-pipeline',
        transcriptHistory: [
          { text: 'API performance is bad, response times over 3 seconds.', timestamp: Date.now() - 120000 },
          { text: 'We should add Redis caching.', timestamp: Date.now() - 60000 },
          { text: 'CI builds are too slow, need parallel tests.', timestamp: Date.now() - 30000 },
        ],
        llmProvider: 'claude',
        speechProvider: 'webspeech',
        apiKeys: {},
      },
      version: 0,
    }
    localStorage.setItem('yappergram-storage', JSON.stringify(state))
  })
  await page.reload()
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000)
}

test.describe('Task 1: Topic node expansion', () => {
  test('clicking a node expands bullet points', async ({ page }) => {
    await page.goto('http://localhost:3001')
    await seedTopics(page)

    // Should have 3 nodes
    const nodes = page.locator('.react-flow__node')
    await expect(nodes).toHaveCount(3)

    // Initially nodes show "X points · click to expand" (collapsed)
    const firstNode = nodes.first()
    await expect(firstNode).toContainText('click to expand')

    // Bullet points should NOT be visible initially
    const bullets = firstNode.locator('ul li')
    await expect(bullets).toHaveCount(0)

    // Click to expand
    await firstNode.click()
    await page.waitForTimeout(300)

    // Now bullet points should be visible
    const expandedBullets = firstNode.locator('ul li')
    const count = await expandedBullets.count()
    console.log(`Expanded node has ${count} bullet points`)
    expect(count).toBeGreaterThanOrEqual(2)

    // Verify actual content
    const bulletTexts = await expandedBullets.allInnerTexts()
    console.log('Bullets:', bulletTexts)
    expect(bulletTexts.some(t => t.includes('3 seconds') || t.includes('complaining') || t.includes('bottleneck'))).toBe(true)

    // Click again to collapse
    await firstNode.click()
    await page.waitForTimeout(300)
    await expect(firstNode.locator('ul li')).toHaveCount(0)
    await expect(firstNode).toContainText('click to expand')

    console.log('Task 1 PASSED: Node expansion works')
  })
})

test.describe('Task 2: Export functionality', () => {
  test('export button downloads valid JSON', async ({ page }) => {
    await page.goto('http://localhost:3001')
    await seedTopics(page)

    // Set up download listener
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button[title="Export session"]'),
    ])

    const filePath = await download.path()
    expect(filePath).toBeTruthy()

    const content = fs.readFileSync(filePath!, 'utf-8')
    const data = JSON.parse(content)

    console.log('Export file keys:', Object.keys(data))
    console.log(`Topics: ${data.topics.length}, Relationships: ${data.relationships.length}, Transcript: ${data.transcript.length}`)

    expect(data.exportedAt).toBeTruthy()
    expect(data.topics).toHaveLength(3)
    expect(data.relationships).toHaveLength(2)
    expect(data.transcript).toHaveLength(3)

    // Verify topic structure
    const topic = data.topics[0]
    expect(topic.id).toBeTruthy()
    expect(topic.name).toBeTruthy()
    expect(topic.keyPoints.length).toBeGreaterThanOrEqual(1)

    console.log('Task 2 PASSED: Export works')
  })
})

test.describe('Task 3: Timeline bar', () => {
  test('timeline shows topic dots when topics exist', async ({ page }) => {
    await page.goto('http://localhost:3001')

    // With no topics, timeline should not be visible
    const timelineBefore = page.locator('.border-t.border-zinc-200.bg-white').last()
    // Seed topics
    await seedTopics(page)

    // Timeline should now be visible with dots
    const timelineDots = page.locator('.border-t.border-zinc-200.bg-white .rounded-full.border-2')
    const dotCount = await timelineDots.count()
    console.log(`Timeline dots: ${dotCount}`)
    expect(dotCount).toBe(3)

    // One dot should be active (scale-125, emerald colored)
    const activeDot = page.locator('.border-t.border-zinc-200.bg-white .bg-emerald-500.border-emerald-300')
    await expect(activeDot).toHaveCount(1)

    console.log('Task 3 PASSED: Timeline bar works')
  })
})
