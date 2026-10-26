const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ARTIFACT_DIR = '/Users/dakshrajsinghkurki/.gemini/antigravity/brain/ccb6dbb2-7678-4812-a36c-a070a47004d3';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('Launching Chrome with puppeteer-core...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--enable-webgl',
      '--window-size=1600,1050'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1500, height: 950, deviceScaleFactor: 2 });

  // 1. Command Center Overview
  console.log('Capturing Redesign Proof 1: Command Center Overview...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
  await sleep(1500);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'redesign_1_command_center.png'),
    fullPage: false
  });

  // 2. Sidebar Collapsed Rail (72px) & Expanded
  console.log('Capturing Redesign Proof 2: Sidebar Collapsed and Expanded...');
  await page.evaluate(() => {
    const btn = document.querySelector('button[title*="Collapse sidebar"]');
    if (btn) (btn).click();
  });
  await sleep(600);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'redesign_2_sidebar_collapsed.png')
  });

  // Expand back
  await page.evaluate(() => {
    const btn = document.querySelector('button[title*="Expand sidebar"]');
    if (btn) (btn).click();
  });
  await sleep(600);

  // 3. TopBar with Profile Menu Open
  console.log('Capturing Redesign Proof 3: TopBar and Profile Dropdown...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('header button'));
    const dakshrajBtn = buttons.find(b => b.textContent && b.textContent.includes('Dakshraj'));
    if (dakshrajBtn) dakshrajBtn.click();
  });
  await sleep(500);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'redesign_3_profile_dropdown.png')
  });
  // Close dropdown by clicking elsewhere
  await page.click('body', { offset: { x: 50, y: 50 } });
  await sleep(300);

  // 4. Auto-Triage Modal
  console.log('Capturing Redesign Proof 4: Auto-Triage Modal...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent && b.textContent.includes('Auto-Triage'));
    if (btn) {
      btn.click();
    } else {
      window.dispatchEvent(new CustomEvent('open-auto-triage'));
    }
  });
  await sleep(800);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'redesign_4_auto_triage_modal.png')
  });

  // Close modal via ESC
  await page.keyboard.press('Escape');
  await sleep(500);

  // 5. 3D Surveillance Globe View
  console.log('Capturing Redesign Proof 5: 3D Surveillance Globe...');
  await page.goto('http://localhost:5173/globe', { waitUntil: 'networkidle2' });
  await sleep(3000); // Allow Three.js canvas to render
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'redesign_5_globe_view.png')
  });

  // 6. Command Palette (⌘K)
  console.log('Capturing Redesign Proof 6: Command Palette (⌘K)...');
  await page.evaluate(() => {
    const btn = document.querySelector('button[title*="Search"]');
    if (btn) btn.click();
    else window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
  });
  await sleep(600);
  // Type a query in search box
  await page.keyboard.type('Layering');
  await sleep(400);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'redesign_6_command_palette.png')
  });
  await page.keyboard.press('Escape');
  await sleep(400);

  // 7. Risky AI Copilot
  console.log('Capturing Redesign Proof 7: Risky AI Copilot...');
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('open-risky-assistant'));
  });
  await sleep(800);
  const chatInput = await page.$('input[placeholder*="Ask Risky"], input[placeholder*="Ask about"]');
  if (chatInput) {
    await chatInput.type('Summarize highest-risk corridor');
    await page.keyboard.press('Enter');
    await sleep(2500);
  }
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'redesign_7_risky_copilot.png')
  });

  // 8. Case Queue View (Kanban / Table)
  console.log('Capturing Redesign Proof 8: Case Queue View...');
  await page.goto('http://localhost:5173/queue', { waitUntil: 'networkidle2' });
  await sleep(1500);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'redesign_8_case_queue.png')
  });

  // 9. Analytics & Reporting View
  console.log('Capturing Redesign Proof 9: Analytics & Reporting...');
  await page.goto('http://localhost:5173/analytics', { waitUntil: 'networkidle2' });
  await sleep(1500);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'redesign_9_analytics_reporting.png')
  });

  console.log('All redesign proofs successfully captured!');
  await browser.close();
}

run().catch(err => {
  console.error('Error during screenshot capture:', err);
  process.exit(1);
});
