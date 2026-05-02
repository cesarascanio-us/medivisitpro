import { chromium } from 'playwright';

(async () => {
    console.log("🚀 Starting Playwright UI Flow...");
    // HEADLESS FALSE AND SLOWMO to let the user see it live
    const browser = await chromium.launch({ headless: false, slowMo: 400 });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        permissions: ['geolocation'],
        geolocation: { latitude: 10.4806, longitude: -66.8983 },
    });
    const page = await context.newPage();

    try {
        console.log("1️⃣ Navigating to Demo...");
        await page.goto('http://localhost:8084/demo');
        
        // Wait for the redirect to dashboard
        await page.waitForURL('**/dashboard', { timeout: 20000 });
        console.log("✅ Dashboard loaded.");
        await page.waitForTimeout(2000);

        console.log("2️⃣ Navigating to Visits...");
        // Directly navigate to visits to be safe
        await page.goto('http://localhost:8084/visits');
        
        // Wait for visits page to render
        await page.waitForTimeout(3000);
        console.log("✅ Visits loaded.");
        
        console.log("3️⃣ Checking for scheduled visits...");
        // Wait for page to settle
        await page.waitForTimeout(3000);
        
        // Is there an "Iniciar Misión" button?
        let startBtn = await page.$('button:has-text("Iniciar Misión"), button:has-text("INICIAR MISIÓN")');
        
        if (!startBtn) {
            console.log("⚠️ No visits found. Creating one via QuickScheduleWizard...");
            // Click the floating action button or "Programar Primera Visita"
            const addBtn = await page.$('button:has-text("Programar Primera Visita"), .fixed.bottom-8 button');
            if (addBtn) {
                await addBtn.click();
                await page.waitForTimeout(2000);
                
                // Inside wizard, we might need to select a contact
                // We'll just try to hit Enter or click the first item in dropdowns, then Save
                // Actually, if it's too complex to automate the wizard perfectly, we'll wait 30 seconds 
                // so the user can see there are no visits and they can manually create one.
                console.log("Wizard opened. Since we don't have mock data details, waiting 30 seconds for user to manually interact if they want.");
                await page.waitForTimeout(30000);
            }
        }
        
        startBtn = await page.$('button:has-text("Iniciar Misión"), button:has-text("INICIAR MISIÓN")');
        
        if (startBtn) {
            console.log("4️⃣ Opening a Visit Execution...");
            await startBtn.click();
            await page.waitForTimeout(3000); // Wait for transition
            
            // Check-in
            console.log("5️⃣ Executing Check-in...");
            const checkinBtn = await page.$('button:has-text("INICIAR VISITA"), button:has-text("Check-in")');
            if (checkinBtn) {
                await checkinBtn.click();
                await page.waitForTimeout(3000);
            }

            // Click through tabs
            const devTab = await page.$('button[value="development"], [role="tab"]:has-text("Desarrollo")');
            if (devTab) {
                await devTab.click();
                await page.waitForTimeout(3000);
            }

            const closeTab = await page.$('button[value="closing"], [role="tab"]:has-text("Cierre")');
            if (closeTab) {
                await closeTab.click();
                console.log("Waiting 15 seconds for user observation...");
                await page.waitForTimeout(15000);
            }
        } else {
            console.log("⚠️ Still no 'Iniciar Misión' button found. Leaving browser open for 30 seconds so user can inspect.");
            await page.waitForTimeout(30000);
        }

    } catch (error) {
        console.error("❌ Error during UI flow:", error);
        await page.waitForTimeout(5000); // Wait so user sees the error on screen
    } finally {
        await browser.close();
        console.log("✅ Playwright flow finished.");
    }
})();
