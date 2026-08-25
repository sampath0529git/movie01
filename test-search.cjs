const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://duckduckgo.com/?q=Cannot+set+property+fetch+of+%23%3CWindow%3E+which+has+only+a+getter+next.js');
  await page.waitForTimeout(2000);
  const text = await page.innerText('body');
  console.log(text.substring(0, 1000));
  await browser.close();
})();
