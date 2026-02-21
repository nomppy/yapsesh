import { chromium } from 'playwright';
import { cp, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';

const OUTPUT_DIR = join(homedir(), 'Downloads', 'yapsesh');
const OUTPUT_FILE = join(OUTPUT_DIR, 'yapsesh-demo.webm');

await mkdir(OUTPUT_DIR, { recursive: true });

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: {
    dir: OUTPUT_DIR,
    size: { width: 1280, height: 720 },
  },
});

const page = await context.newPage();

// Navigate and wait for the main content to be visible
await page.goto('http://localhost:3000');
await page.waitForSelector('header', { state: 'visible' });
console.log('Page loaded');

// Pause on the landing page for 2 seconds
await page.waitForTimeout(2000);

// Open the About modal
await page.click('button[title="About YapSesh"]');
console.log('About modal opened');
await page.waitForTimeout(3000);

// Close the About modal by clicking the "Got it" button
await page.click('text=Got it');
console.log('About modal closed');
await page.waitForTimeout(500);

// Open the Settings modal
await page.click('button[title="Settings"]');
console.log('Settings modal opened');
await page.waitForTimeout(3000);

// Close the Settings modal by clicking the "Done" button
await page.click('text=Done');
console.log('Settings modal closed');
await page.waitForTimeout(500);

// Save video path before closing context
const video = page.video();

// Close context to finalize the video recording
await context.close();
await browser.close();

// Copy the recorded video to the desired output location
if (video) {
  const videoPath = await video.path();
  console.log(`Video saved at: ${videoPath}`);
  await cp(videoPath, OUTPUT_FILE);
  console.log(`Video copied to: ${OUTPUT_FILE}`);
} else {
  console.error('No video was recorded');
}
console.log('Done');
