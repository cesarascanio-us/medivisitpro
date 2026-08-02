const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

  // Login first
  await page.goto('http://localhost:8081/auth', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await page.fill('#login-email', 'cesar.ascanio@gmail.com');
  await page.fill('#login-password', '123456');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3500);
  console.log('After login URL:', page.url());

  // Test /admin/academy
  errors.length = 0;
  await page.goto('http://localhost:8081/admin/academy', { waitUntil: 'networkidle', timeout: 12000 }).catch(() => {});
  await page.waitForTimeout(2500);
  const academyH1 = await page.evaluate(() => document.querySelector('h1') ? document.querySelector('h1').innerText.trim() : 'NO H1');
  const academyTitle = await page.title();
  const academyUrl = page.url();
  const academySnippet = await page.evaluate(() => document.body ? document.body.innerText.slice(0, 200) : '');
  await page.screenshot({ path: 'audit_master_real_screenshots/fix_academy.png' });
  console.log('=== ACADEMY ===');
  console.log('URL:', academyUrl);
  console.log('H1:', academyH1);
  console.log('TITLE:', academyTitle);
  console.log('SNIPPET:', academySnippet.replace(/\n/g, ' ').slice(0, 150));
  console.log('ERRORS:', JSON.stringify(errors.slice(0, 5)));

  // Test /reports
  errors.length = 0;
  await page.goto('http://localhost:8081/reports', { waitUntil: 'networkidle', timeout: 12000 }).catch(() => {});
  await page.waitForTimeout(3000);
  const reportsH1 = await page.evaluate(() => document.querySelector('h1') ? document.querySelector('h1').innerText.trim() : 'NO H1');
  await page.screenshot({ path: 'audit_master_real_screenshots/fix_reports.png' });
  console.log('=== REPORTS ===');
  console.log('H1:', reportsH1);
  console.log('ERRORS:', JSON.stringify(errors.slice(0, 5)));

  // Test /university
  errors.length = 0;
  await page.goto('http://localhost:8081/university', { waitUntil: 'networkidle', timeout: 12000 }).catch(() => {});
  await page.waitForTimeout(2500);
  const uniH1 = await page.evaluate(() => document.querySelector('h1') ? document.querySelector('h1').innerText.trim() : 'NO H1');
  await page.screenshot({ path: 'audit_master_real_screenshots/fix_university.png' });
  console.log('=== UNIVERSITY ===');
  console.log('H1:', uniH1);
  console.log('ERRORS:', JSON.stringify(errors.slice(0, 5)));

  // Test /billing
  errors.length = 0;
  await page.goto('http://localhost:8081/billing', { waitUntil: 'networkidle', timeout: 12000 }).catch(() => {});
  await page.waitForTimeout(2500);
  const billingH1 = await page.evaluate(() => document.querySelector('h1') ? document.querySelector('h1').innerText.trim() : 'NO H1');
  await page.screenshot({ path: 'audit_master_real_screenshots/fix_billing.png' });
  console.log('=== BILLING ===');
  console.log('H1:', billingH1);
  console.log('ERRORS:', JSON.stringify(errors.slice(0, 5)));

  await browser.close();
  console.log('Done!');
})().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
