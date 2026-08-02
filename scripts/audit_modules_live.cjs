const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:8080';
const ALT_URL = 'http://localhost:8081';
const SCREENSHOT_DIR = path.resolve(__dirname, '../audit_screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const DEMO_EMAIL = 'demo.medivisitpro@gmail.com';
const DEMO_ORG_ID = 'd3300000-0000-0000-0000-000000000001';

const MOCK_AUTH_SESSION = {
  access_token: "mock-jwt-token-for-local-demo-purposes",
  token_type: "bearer",
  expires_in: 315360000,
  refresh_token: "mock-refresh-token",
  user: {
    id: "d3300000-0000-0000-0000-000000000001",
    aud: "authenticated",
    role: "authenticated",
    email: DEMO_EMAIL,
    email_confirmed_at: new Date().toISOString(),
    phone: "",
    confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: {
      first_name: "Cesar",
      last_name: "Master",
      organization_id: DEMO_ORG_ID,
      role: "master"
    },
    identities: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  expires_at: Math.floor(Date.now() / 1000) + 315360000
};

const MODULE_ROUTES = [
  { name: '01_landing', path: '/', isPublic: true },
  { name: '02_auth', path: '/auth', isPublic: true },
  { name: '03_demo_onboarding', path: '/demo', isPublic: true },
  { name: '04_dashboard', path: '/dashboard' },
  { name: '05_visits', path: '/visits' },
  { name: '06_doctors', path: '/doctors' },
  { name: '07_pharmacies', path: '/pharmacies' },
  { name: '08_drugstores', path: '/drugstores' },
  { name: '09_natural_stores', path: '/natural-stores' },
  { name: '10_commerces', path: '/commerces' },
  { name: '11_specialties', path: '/specialties' },
  { name: '12_health_centers', path: '/health-centers' },
  { name: '13_products', path: '/products' },
  { name: '14_samples', path: '/samples' },
  { name: '15_material_pop', path: '/material-pop' },
  { name: '16_sample_banks', path: '/sample-banks' },
  { name: '17_planner', path: '/planner' },
  { name: '18_route_planner', path: '/route-planner' },
  { name: '19_coverage_map', path: '/coverage-map' },
  { name: '20_promotional_cycles', path: '/promotional-cycles' },
  { name: '21_objectives', path: '/objectives' },
  { name: '22_expenses', path: '/expenses' },
  { name: '23_sales_pipeline', path: '/sales-pipeline' },
  { name: '24_quotes', path: '/quotes' },
  { name: '25_transfer_orders', path: '/transfer-orders' },
  { name: '26_reports', path: '/reports' },
  { name: '27_users', path: '/users' },
  { name: '28_zones', path: '/zones' },
  { name: '29_hr', path: '/hr' },
  { name: '30_master_panel', path: '/master-panel' },
  { name: '31_roles', path: '/roles' },
  { name: '32_audit_logs', path: '/logs' },
  { name: '33_billing', path: '/billing' },
  { name: '34_settings', path: '/settings' },
  { name: '35_help_faq', path: '/faq' },
  { name: '36_university', path: '/university' },
  { name: '37_rewards', path: '/rewards' }
];

async function runLiveAudit() {
  console.log('🚀 Launching Chromium Headless for In-Depth Master Audit...');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  // Test server connectivity
  const probePage = await context.newPage();
  let rootUrl = BASE_URL;
  try {
    const res = await probePage.goto(rootUrl, { timeout: 4000, waitUntil: 'domcontentloaded' });
    if (!res || res.status() >= 400) throw new Error('Status not ok');
  } catch (e) {
    rootUrl = ALT_URL;
  }
  await probePage.close();
  console.log(`📡 Connected to target server: ${rootUrl}`);

  // Inject Master Demo Session in localStorage for all pages under rootUrl
  await context.addInitScript(({ sessionKey, sessionData }) => {
    try {
      localStorage.setItem(sessionKey, JSON.stringify(sessionData));
      localStorage.setItem('demo_role', 'master');
      localStorage.setItem('theme', 'dark');
    } catch (e) {}
  }, {
    sessionKey: 'sb-medivisit-auth-token',
    sessionData: MOCK_AUTH_SESSION
  });

  const page = await context.newPage();
  const auditReport = [];

  for (const mod of MODULE_ROUTES) {
    const targetUrl = `${rootUrl}${mod.path}`;
    const consoleLogs = [];
    const pageErrors = [];

    const onConsole = msg => {
      if (msg.type() === 'error') consoleLogs.push(msg.text());
    };
    const onPageError = err => {
      pageErrors.push(err.message || String(err));
    };

    page.on('console', onConsole);
    page.on('pageerror', onPageError);

    const startTime = Date.now();
    let status = 'SUCCESS';

    try {
      console.log(`Auditing [${mod.name}] -> ${targetUrl}`);
      await page.goto(targetUrl, { timeout: 15000, waitUntil: 'networkidle' }).catch(async () => {
        await page.waitForLoadState('domcontentloaded');
      });

      // Wait 1200ms for animations and components to mount
      await page.waitForTimeout(1200);

      // Check current URL (in case of redirect)
      const currentUrl = page.url();

      // Inspect DOM metrics
      const domSummary = await page.evaluate(() => {
        const h1 = document.querySelector('h1')?.innerText || '';
        const h2 = document.querySelector('h2')?.innerText || '';
        const title = document.title || '';
        const buttonsCount = document.querySelectorAll('button').length;
        const tablesCount = document.querySelectorAll('table').length;
        const inputsCount = document.querySelectorAll('input').length;
        const cardsCount = document.querySelectorAll('.card, [class*="rounded"], [class*="border"]').length;
        const bodySnippet = document.body?.innerText?.slice(0, 300).replace(/\s+/g, ' ') || '';
        
        return {
          h1,
          h2,
          title,
          buttonsCount,
          tablesCount,
          inputsCount,
          cardsCount,
          bodySnippet
        };
      });

      // Check for crash
      const isCrash = pageErrors.length > 0 || 
                      domSummary.bodySnippet.includes('Something went wrong') || 
                      domSummary.bodySnippet.includes('Uncaught exception');

      if (isCrash) {
        status = 'CRASH';
      }

      // Capture screenshot
      const screenshotPath = path.join(SCREENSHOT_DIR, `${mod.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });

      const loadTimeMs = Date.now() - startTime;

      auditReport.push({
        module: mod.name,
        route: mod.path,
        targetUrl,
        currentUrl,
        status,
        loadTimeMs,
        dom: domSummary,
        consoleErrors: consoleLogs,
        pageErrors: pageErrors,
        screenshot: screenshotPath
      });

    } catch (err) {
      console.error(`❌ Error on ${mod.name}:`, err.message);
      auditReport.push({
        module: mod.name,
        route: mod.path,
        targetUrl,
        status: 'FAILED',
        error: err.message,
        consoleErrors: consoleLogs,
        pageErrors: pageErrors
      });
    } finally {
      page.off('console', onConsole);
      page.off('pageerror', onPageError);
    }
  }

  await browser.close();

  const reportPath = path.resolve(__dirname, '../audit_results.json');
  fs.writeFileSync(reportPath, JSON.stringify(auditReport, null, 2), 'utf-8');

  console.log(`\n======================================================`);
  console.log(`🎉 Master Audit Completed! Evaluated ${auditReport.length} modules.`);
  console.log(`📄 Comprehensive report saved to: ${reportPath}`);
  console.log(`🖼️ Screenshots saved to: ${SCREENSHOT_DIR}`);
  console.log(`======================================================`);
}

runLiveAudit().catch(err => {
  console.error('Audit Script Failed:', err);
  process.exit(1);
});
