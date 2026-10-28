const puppeteer = require('puppeteer-core');
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: true });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  await page.goto('http://localhost:5173/detail/TXN-84204');
  await new Promise(r => setTimeout(r, 1200));
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('open-risky-assistant')));
  await new Promise(r => setTimeout(r, 600));
  const input = await page.$('input[placeholder*="Ask Risky"]');
  await input.type('Summarize this case');
  await page.keyboard.press('Enter');
  console.log('Submitted, waiting for response message...');
  await page.waitForFunction(() => {
    // When reply arrives, "Investigating stream indicators..." disappears or there are >= 3 message blocks
    const indicators = document.querySelector('.animate-pulse');
    const msgs = document.querySelectorAll('.scrollbar-thin > div');
    return msgs.length >= 3 && !document.body.innerText.includes('Investigating stream indicators...');
  }, { timeout: 25000 });
  const lastMsg = await page.evaluate(() => {
    const msgs = document.querySelectorAll('.scrollbar-thin > div');
    const last = msgs[msgs.length - 1];
    return last ? last.innerText : null;
  });
  console.log('Captured Response in UI:\n', lastMsg);
  await page.screenshot({ path: '/Users/dakshrajsinghkurki/.gemini/antigravity/brain/ccb6dbb2-7678-4812-a36c-a070a47004d3/proof_risky_answered.png' });
  await browser.close();
})().catch(e => { console.error('Error:', e); process.exit(1); });
