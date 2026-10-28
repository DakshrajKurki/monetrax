const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ARTIFACT_DIR = '/Users/dakshrajsinghkurki/.gemini/antigravity/brain/ccb6dbb2-7678-4812-a36c-a070a47004d3';

async function run() {
  console.log('Launching browser to capture Risky chip proof...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--window-size=1600,1000'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1500, height: 950, deviceScaleFactor: 2 });

  await page.goto('http://localhost:5173/detail/TXN-84204', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // Open Risky Assistant
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('open-risky-assistant'));
  });
  await new Promise(r => setTimeout(r, 800));

  // Send message asking to analyze case features
  const chatInput = await page.$('input[placeholder*="Ask Risky"], input[placeholder*="Ask about"]');
  if (chatInput) {
    await chatInput.type('Summarize risk factors for this case');
    await page.keyboard.press('Enter');
    console.log('Message submitted to live Gemini, awaiting live response (may take 10-20s)...');
    
    // Wait for response to be rendered
    await page.waitForFunction(() => {
      const msgs = document.querySelectorAll('.scrollbar-thin > div');
      const text = document.body.innerText;
      return msgs.length >= 2 && !text.includes('Investigating stream indicators...');
    }, { timeout: 35000 });
  }

  await new Promise(r => setTimeout(r, 500));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'proof_risky_live_gemini_chip.png')
  });

  console.log('Proof screenshot successfully saved: proof_risky_live_gemini_chip.png');
  await browser.close();
}

run().catch(err => {
  console.error('Error during capture:', err);
  process.exit(1);
});
