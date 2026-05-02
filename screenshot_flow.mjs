import { chromium } from 'playwright';

(async () => {
    console.log("🚀 Starting Playwright UI Flow...");
    const browser = await chromium.launch({ headless: false, slowMo: 300 });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        permissions: ['geolocation'],
        geolocation: { latitude: 10.4806, longitude: -66.8983 },
    });
    const page = await context.newPage();

    try {
        console.log("1️⃣ Navigating to Demo...");
        await page.goto('http://localhost:8084/demo');
        
        // Wait for dashboard to load
        await page.waitForSelector('text=Panel Representative', { timeout: 15000 });
        console.log("✅ Dashboard loaded.");
        await page.waitForTimeout(2000);

        console.log("2️⃣ Navigating to Visits...");
        // Click on the sidebar link or navigate directly
        await page.goto('http://localhost:8084/visits');
        await page.waitForSelector('text=Lista de Tareas', { timeout: 10000 });
        await page.screenshot({ path: 'artifacts/screenshot_02_visits.png' });
        
        console.log("3️⃣ Opening a Visit Execution...");
        // Look for the element that has "Tu Ruta" and a visit entry
        const visitItem = await page.$('.group.relative.cursor-pointer');
        if (visitItem) {
            await visitItem.click();
            await page.waitForTimeout(3000); // Wait for transition
            
            // Check-in
            console.log("4️⃣ Executing Check-in...");
            const checkinBtn = await page.$('button:has-text("INICIAR VISITA")');
            if (checkinBtn) {
                await checkinBtn.click();
                await page.waitForTimeout(2000);
                await page.screenshot({ path: 'artifacts/screenshot_04_visit_checkin.png' });
            }

            // Click through tabs if possible
            const devTab = await page.$('button[value="development"], [role="tab"]:has-text("Desarrollo")');
            if (devTab) {
                await devTab.click();
                await page.waitForTimeout(3000);
            }

            const closeTab = await page.$('button[value="closing"], [role="tab"]:has-text("Cierre")');
            if (closeTab) {
                await closeTab.click();
                await page.waitForTimeout(5000); // Stay here so the user can see it!
            }
        } else {
            console.log("⚠️ Could not find a scheduled visit on the dashboard.");
        }

    } catch (error) {
        console.error("❌ Error during UI flow:", error);
        await page.screenshot({ path: 'artifacts/screenshot_error.png' });
    } finally {
        await browser.close();
        console.log("✅ Playwright flow finished.");
    }
})();
