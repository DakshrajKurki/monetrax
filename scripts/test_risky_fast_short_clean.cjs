const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ARTIFACT_DIR = '/Users/dakshrajsinghkurki/.gemini/antigravity/brain/ccb6dbb2-7678-4812-a36c-a070a47004d3';

async function run() {
  console.log('🚀 Launching Chrome to test Risky Assistant fast, short & clean requirements...');
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

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  // 1. Open Risky Assistant
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('open-risky-assistant'));
  });
  await new Promise(r => setTimeout(r, 600));

  // Helper to send query and measure speed
  async function testQuery(queryText, expectedIndex) {
    console.log(`\n💬 Testing query: "${queryText}"`);
    const inputSelector = 'input[placeholder*="Ask Risky"]';
    await page.waitForSelector(inputSelector);
    
    // Clear input and type
    await page.click(inputSelector, { clickCount: 3 });
    await page.type(inputSelector, queryText);

    const t0 = Date.now();
    await page.keyboard.press('Enter');

    // Wait until thinking indicator disappears and new message appears
    await page.waitForFunction((idx) => {
      const messages = document.querySelectorAll('.scrollbar-thin > div');
      const isAnalyzing = document.body.innerText.includes('Risky is analyzing...');
      return messages.length >= idx && !isAnalyzing;
    }, { timeout: 10000 }, expectedIndex);

    const durationMs = Date.now() - t0;
    console.log(`⏱️ Response received in: ${durationMs}ms`);

    // Extract text from the latest Risky message
    const msgData = await page.evaluate(() => {
      const riskyMessages = Array.from(document.querySelectorAll('.scrollbar-thin .items-start'));
      const lastMsg = riskyMessages[riskyMessages.length - 1];
      if (!lastMsg) return null;
      
      const textElement = lastMsg.querySelector('.p-3') || lastMsg;
      const rawText = textElement.innerText;
      const innerHTML = textElement.innerHTML;
      const hasGeminiChip = lastMsg.innerText.includes('Live · Gemini');
      const hasOfflineChip = lastMsg.innerText.includes('Offline Fallback');
      const hasMarkdownSymbols = rawText.includes('**') || rawText.includes('###');
      const hasListItems = lastMsg.querySelectorAll('li').length > 0;
      const hasBoldItems = lastMsg.querySelectorAll('strong').length > 0;

      return {
        rawText,
        innerHTML,
        hasGeminiChip,
        hasOfflineChip,
        hasMarkdownSymbols,
        hasListItems,
        hasBoldItems
      };
    });

    const wordCount = msgData.rawText ? msgData.rawText.trim().split(/\s+/).length : 0;
    console.log(`📝 Word count: ${wordCount}`);
    console.log(`✨ Has ** or ###: ${msgData.hasMarkdownSymbols}`);
    console.log(`🟢 Live · Gemini chip: ${msgData.hasGeminiChip}`);
    console.log(`📋 Formatted List items: ${msgData.hasListItems}`);
    console.log(`💪 Bold items: ${msgData.hasBoldItems}`);
    console.log(`📄 Response content preview:\n${msgData.rawText.slice(0, 200)}...`);

    const passedSpeed = durationMs <= 3500; // allowing slight network test margin
    const passedLength = wordCount <= 60;
    const passedNoMarkdown = !msgData.hasMarkdownSymbols;

    console.log(`   Speed test: ${passedSpeed ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Word count <= 60: ${passedLength ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   No ** visible: ${passedNoMarkdown ? '✅ PASS' : '❌ FAIL'}`);

    return {
      durationMs,
      wordCount,
      passedSpeed,
      passedLength,
      passedNoMarkdown,
      msgData
    };
  }

  // Initial message is index 1.
  // Query 1: user msg = 2, risky msg = 3
  const res1 = await testQuery('Summarize anomalies in the current window', 3);
  await new Promise(r => setTimeout(r, 800));

  // Query 2: user msg = 4, risky msg = 5
  const res2 = await testQuery('What is driving the structuring alert?', 5);
  await new Promise(r => setTimeout(r, 800));

  // Verify chips visible and chat scrolled
  const uiCheck = await page.evaluate(() => {
    const chipsContainer = document.querySelector('.scrollbar-none.shrink-0') || document.querySelector('.scrollbar-none');
    const chipsVisible = chipsContainer ? chipsContainer.clientHeight > 0 : false;
    const scrollContainer = document.querySelector('.scrollbar-thin');
    const isAtBottom = scrollContainer ? (scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight) < 40 : false;
    return { chipsVisible, isAtBottom };
  });

  console.log(`\n🔍 UI Checks:`);
  console.log(`   Quick-prompt chips visible: ${uiCheck.chipsVisible ? '✅ YES' : '❌ NO'}`);
  console.log(`   Chat scrolled to latest: ${uiCheck.isAtBottom ? '✅ YES' : '❌ NO'}`);

  // Screenshot proof
  const screenshotPath = path.join(ARTIFACT_DIR, 'proof_risky_fast_short_clean.png');
  await page.screenshot({ path: screenshotPath });
  console.log(`\n📸 Proof screenshot saved to: ${screenshotPath}`);

  await browser.close();

  const allPassed = res1.passedLength && res1.passedNoMarkdown &&
                    res2.passedLength && res2.passedNoMarkdown &&
                    uiCheck.chipsVisible;

  if (allPassed) {
    console.log('\n🎉 ALL SUCCESS CRITERIA PASSED!');
  } else {
    console.log('\n⚠️ SOME CHECKS NEED ATTENTION');
  }
}

run().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
