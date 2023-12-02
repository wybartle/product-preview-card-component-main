import { test, expect } from '@playwright/test';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

test('Page Screenshot', async ({ page }) => {
  await page.goto('https://keaolama-article.vercel.app/');
  
  await sleep(10000);
  await page.screenshot({ path: `screenshot.png`, fullPage: true });
});
