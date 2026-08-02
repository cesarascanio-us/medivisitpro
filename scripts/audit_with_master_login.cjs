const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:8081';
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'audit_master_real_screenshots');
const RESULTS_FILE = path.join(__dirname, '..', 'audit_master_real_results.json');

const MASTER_USER = 'cesar.ascanio@gmail.com';
const MASTER_PASS = '123456';

const MODULES = [
  { name: '01_landing', route: '/' },
  { name: '02_auth', route: '/auth' },
  { name: '03_demo_onboarding', route: '/demo' },
  { name: '04_dashboard', route: '/dashboard' },
  { name: '05_visits', route: '/visits' },
  { name: '06_doctors', route: '/doctors' },
  { name: '07_pharmacies', route: '/pharmacies' },
  { name: '08_drugstores', route: '/drugstores' },
  { name: '09_natural_stores', route: '/natural-stores' },
  { name: '10_commerces', route: '/commerces' },
  { name: '11_specialties', route: '/specialties' },
  { name: '12_health_centers', route: '/health-centers' },
  { name: '13_products', route: '/products' },
  { name: '14_samples', route: '/samples' },
  { name: '15_material_pop', route: '/material-pop' },
  { name: '16_sample_banks', route: '/sample-banks' },
  { name: '17_planner', route: '/planner' },
  { name: '18_route_planner', route: '/route-planner' },
  { name: '19_coverage_map', route: '/coverage-map' },
  { name: '20_promotional_cycles', route: '/promotional-cycles' },
  { name: '21_objectives', route: '/objectives' },
  { name: '22_expenses', route: '/expenses' },
  { name: '23_sales_pipeline', route: '/sales-pipeline' },
  { name: '24_quotes', route: '/quotes' },
  { name: '25_transfer_orders', route: '/transfer-orders' },
  { name: '26_reports', route: '/reports' },
  { name: '27_users', route: '/users' },
  { name: '28_zones', route: '/zones' },
  { name: '29_hr', route: '/hr' },
  { name: '30_master_panel', route: '/master-panel' },
  { name: '31_roles', route: '/roles' },
  { name: '32_audit_logs', route: '/logs' },
  { name: '33_billing', route: '/billing' },
  { name: '34_settings', route: '/settings' },
  { name: '35_help_faq', route: '/faq' },
  { name: '36_university', route: '/university' },
  { name: '37_rewards', route: '/rewards' }
];

async function runMasterAudit() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  console.log('🚀 Launching Chromium Headless for Real Master Login Audit...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  // Step 1: Real Master Login
  console.log(`🔐 Attempting real login with Master credentials: ${MASTER_USER}...`);
  await page.goto(`${BASE_URL}/auth`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // Fill credentials
  await page.fill('#login-email', MASTER_USER);
  await page.fill('#login-password', MASTER_PASS);
  await page.click('button[type="submit"]');

  console.log('⏳ Waiting for Supabase response & session initialization...');
  await page.waitForTimeout(4000);

  // Check current URL & local session
  const afterLoginUrl = page.url();
  console.log(`📍 URL after login attempt: ${afterLoginUrl}`);

  const storageState = await page.evaluate(() => {
    return {
      localStorage: Object.keys(localStorage).reduce((acc, k) => {
        acc[k] = localStorage.getItem(k);
        return acc;
      }, {}),
      sessionStorage: Object.keys(sessionStorage).reduce((acc, k) => {
        acc[k] = sessionStorage.getItem(k);
        return acc;
      }, {})
    };
  });

  console.log('📦 Session Storage Keys:', Object.keys(storageState.localStorage));

  const results = [];

  for (const mod of MODULES) {
    console.log(`Auditing [${mod.name}] -> ${BASE_URL}${mod.route}`);
    const consoleErrors = [];
    const pageErrors = [];

    const onConsole = msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    };
    const onPageError = err => {
      pageErrors.push(err.message);
    };

    page.on('console', onConsole);
    page.on('pageerror', onPageError);

    const startTime = Date.now();
    let status = 'SUCCESS';

    try {
      await page.goto(`${BASE_URL}${mod.route}`, {
        waitUntil: 'networkidle',
        timeout: 15000
      }).catch(async () => {
        await page.waitForLoadState('domcontentloaded');
      });

      await page.waitForTimeout(2000);

      const domAnalysis = await page.evaluate(() => {
        const h1 = document.querySelector('h1')?.innerText?.trim() || '';
        const h2 = document.querySelector('h2')?.innerText?.trim() || '';
        const title = document.title;
        const buttonsCount = document.querySelectorAll('button').length;
        const tablesCount = document.querySelectorAll('table').length;
        const inputsCount = document.querySelectorAll('input').length;
        const cardsCount = document.querySelectorAll('[class*="card"], [class*="Card"]').length;
        const tableRows = document.querySelectorAll('tbody tr').length;
        const bodySnippet = document.body?.innerText?.slice(0, 300).replace(/\s+/g, ' ').trim() || '';

        return {
          h1,
          h2,
          title,
          buttonsCount,
          tablesCount,
          tableRows,
          inputsCount,
          cardsCount,
          bodySnippet
        };
      });

      const screenshotPath = path.join(SCREENSHOTS_DIR, `${mod.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });

      results.push({
        module: mod.name,
        route: mod.route,
        targetUrl: `${BASE_URL}${mod.route}`,
        currentUrl: page.url(),
        status,
        loadTimeMs: Date.now() - startTime,
        dom: domAnalysis,
        consoleErrors: consoleErrors.slice(0, 10),
        pageErrors,
        screenshot: screenshotPath
      });

    } catch (err) {
      console.error(`❌ Error auditing ${mod.name}:`, err.message);
      results.push({
        module: mod.name,
        route: mod.route,
        status: 'CRASH',
        error: err.message
      });
    } finally {
      page.off('console', onConsole);
      page.off('pageerror', onPageError);
    }
  }

  fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2), 'utf-8');
  console.log('======================================================');
  console.log(`🎉 Master Credentials Audit Completed! Evaluated ${results.length} modules.`);
  console.log(`📄 Comprehensive report saved to: ${RESULTS_FILE}`);
  console.log(`🖼️ Screenshots saved to: ${SCREENSHOTS_DIR}`);
  console.log('======================================================');

  await browser.close();
}

runMasterAudit().catch(err => {
  console.error('Fatal audit error:', err);
  process.exit(1);
});
