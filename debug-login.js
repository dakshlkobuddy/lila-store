import { chromium } from 'playwright';

const b = await chromium.launch({ headless: true });
const p = await b.newPage();
p.setDefaultTimeout(10000);
await p.goto('http://localhost:5174');
await p.waitForLoadState('domcontentloaded');
await p.waitForTimeout(800);

// Check all buttons
const btns = await p.locator('button').allInnerTexts();
console.log('Buttons:', btns);

// Fill form
await p.fill('input[placeholder="Email"]', 'admin@store.com');
await p.fill('input[placeholder="Password"]', 'admin123');

const btns2 = await p.locator('button').allInnerTexts();
console.log('Buttons after fill:', btns2);

// Try clicking submit button specifically
const submitBtn = p.locator('button.ec-btn-primary:has-text("Sign in")');
const count = await submitBtn.count();
console.log('Submit btn count:', count);

if (count > 0) {
  await submitBtn.click();
  await p.waitForTimeout(2000);
  const h1 = await p.locator('h1').allInnerTexts();
  console.log('After click H1:', h1);
  const bodyText = await p.locator('body').innerText();
  console.log('Has Dashboard:', bodyText.includes('Dashboard'));
  console.log('Has invalid email or password:', bodyText.includes('Invalid email'));
  console.log('Has toast or error:', bodyText.includes('error') || bodyText.includes('Invalid'));
}

await b.close();
