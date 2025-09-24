import puppeteer, { Browser, Page } from 'puppeteer';
import { promises as fs } from 'fs';
import path from 'path';

// Configuration
const CONFIG = {
    baseUrl: 'http://localhost:5173', // Vite default dev server
    screenshotDir: './screenshots',
    viewport: { width: 1080, height: 1920 }, // Portrait orientation
    delays: {
        short: 500,
        medium: 1000,
        long: 2000
    },
    headless: process.env.HEADLESS === 'true'
};

class HabitTrackerScreenshotter {
    private browser: Browser | null = null;
    private page: Page | null = null;
    private screenshotCounter: number = 1;

    constructor() {
        // Properties are now initialized above
    }

    async initialize(): Promise<void> {
        // Create screenshots directory
        await fs.mkdir(CONFIG.screenshotDir, { recursive: true });

        // Launch browser
        this.browser = await puppeteer.launch({
            headless: CONFIG.headless,
            slowMo: CONFIG.headless ? 0 : 100, // Slow down interactions for better visibility in non-headless mode
            defaultViewport: CONFIG.viewport
        });

        this.page = await this.browser.newPage();
        await this.page.setViewport(CONFIG.viewport);
        
        // Navigate to the app
        await this.page.goto(CONFIG.baseUrl);
        await this.page.waitForSelector('body');
        await this.delay(CONFIG.delays.medium);
    }

    async takeScreenshot(description: string): Promise<void> {
        if (!this.page) throw new Error('Page not initialized');
        
        const filename = `${String(this.screenshotCounter).padStart(2, '0')}-${description}.png`;
        const filepath = path.join(CONFIG.screenshotDir, filename) as `${string}.png`;
        
        await this.page.screenshot({
            path: filepath,
            fullPage: true
        });
        
        console.log(`📸 Screenshot taken: ${filename}`);
        this.screenshotCounter++;
        await this.delay(CONFIG.delays.short);
    }

    async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async interactWithDateControls(): Promise<void> {
        if (!this.page) throw new Error('Page not initialized');
        
        console.log('🗓️ Testing date controls...');
        
        // Take initial screenshot
        await this.takeScreenshot('initial-load');

        // Wait for date controls to be available
        await this.page.waitForSelector('.date-controls', { timeout: 5000 });

        // Click previous day button (arrow left)
        const prevButton = await this.page.$('.date-controls svg:first-child');
        if (prevButton) {
            await prevButton.click();
            await this.delay(CONFIG.delays.medium);
            await this.takeScreenshot('previous-day');
        }

        // Click next day button (arrow right)
        const nextButton = await this.page.$('.date-controls svg:last-child');
        if (nextButton) {
            await nextButton.click();
            await this.delay(CONFIG.delays.medium);
            await this.takeScreenshot('next-day');
        }

        // Click clock icon to reset to today
        const clockIcon = await this.page.$('.date-display svg:first-child');
        if (clockIcon) {
            await clockIcon.click();
            await this.delay(CONFIG.delays.medium);
            await this.takeScreenshot('reset-to-today');
        }
    }

    async interactWithTabs(): Promise<void> {
        if (!this.page) throw new Error('Page not initialized');
        
        console.log('📋 Testing table tabs...');

        // Wait for tabs to load
        await this.page.waitForSelector('.tabs', { timeout: 5000 });

        // Click on Entry Log tab using evaluate to find by text
        await this.page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const entryButton = buttons.find(btn => btn.textContent?.includes('Entry Log'));
            if (entryButton) entryButton.click();
        });
        await this.delay(CONFIG.delays.medium);
        await this.takeScreenshot('entry-log-tab');

        // Click on Medicine Log tab using evaluate to find by text
        await this.page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const medicineButton = buttons.find(btn => btn.textContent?.includes('Medicine Log'));
            if (medicineButton) medicineButton.click();
        });
        await this.delay(CONFIG.delays.medium);
        await this.takeScreenshot('medicine-log-tab');

        // Click on All Logs tab using evaluate to find by text
        await this.page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const allButton = buttons.find(btn => btn.textContent?.includes('All Logs'));
            if (allButton) allButton.click();
        });
        await this.delay(CONFIG.delays.medium);
        await this.takeScreenshot('all-logs-tab');
    }

    async interactWithTerminal(): Promise<void> {
        if (!this.page) throw new Error('Page not initialized');
        
        console.log('💻 Testing entry terminal...');

        // Click on terminal input to expand
        await this.page.click('input[placeholder="input command"]');
        await this.delay(CONFIG.delays.medium);
        await this.takeScreenshot('terminal-expanded');

        // Type a medicine command
        await this.page.type('input[placeholder="input command"]', 'add caffeine 100');
        await this.delay(CONFIG.delays.short);
        await this.takeScreenshot('terminal-medicine-command');

        // Submit the command
        await this.page.keyboard.press('Enter');
        await this.delay(CONFIG.delays.medium);
        await this.takeScreenshot('terminal-medicine-submitted');

        // Clear and type an entry command
        await this.page.evaluate(() => {
            const input = document.querySelector('input[placeholder="input command"]') as HTMLInputElement;
            if (input) input.value = '';
        });
        await this.page.type('input[placeholder="input command"]', 'add entry Complete morning routine complete');
        await this.delay(CONFIG.delays.short);
        await this.takeScreenshot('terminal-entry-command');

        // Submit the entry command
        await this.page.keyboard.press('Enter');
        await this.delay(CONFIG.delays.medium);
        await this.takeScreenshot('terminal-entry-submitted');

        // Click outside to collapse terminal
        await this.page.click('body');
        await this.delay(CONFIG.delays.medium);
        await this.takeScreenshot('terminal-collapsed');
    }

    async interactWithStats(): Promise<void> {
        if (!this.page) throw new Error('Page not initialized');
        
        console.log('📊 Testing statistics views...');

        // Click on Medicine Log tab to view stats
        await this.page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const medicineButton = buttons.find(btn => btn.textContent?.includes('Medicine Log'));
            if (medicineButton) medicineButton.click();
        });
        await this.delay(CONFIG.delays.medium);
        await this.takeScreenshot('medicine-stats-view');

        // Test substance chart selection if available
        const chartButtons = await this.page.$$('.chart-button');
        if (chartButtons.length > 0) {
            await chartButtons[0].click();
            await this.delay(CONFIG.delays.medium);
            await this.takeScreenshot('chart-substance-selected');
        }

        // Switch to Entry Log for entry stats
        await this.page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const entryButton = buttons.find(btn => btn.textContent?.includes('Entry Log'));
            if (entryButton) entryButton.click();
        });
        await this.delay(CONFIG.delays.medium);
        await this.takeScreenshot('entry-stats-view');
    }

    async testResponsiveDesign(): Promise<void> {
        if (!this.page) throw new Error('Page not initialized');
        
        console.log('📱 Testing responsive design...');

        // Test tablet size (portrait)
        await this.page.setViewport({ width: 768, height: 1024 });
        await this.delay(CONFIG.delays.medium);
        await this.takeScreenshot('tablet-view');

        // Test mobile size (portrait)
        await this.page.setViewport({ width: 375, height: 812 });
        await this.delay(CONFIG.delays.medium);
        await this.takeScreenshot('mobile-view');

        // Reset to desktop
        await this.page.setViewport(CONFIG.viewport);
        await this.delay(CONFIG.delays.medium);
        await this.takeScreenshot('desktop-restored');
    }

    async testContextMenu(): Promise<void> {
        if (!this.page) throw new Error('Page not initialized');
        
        console.log('🖱️ Testing context menu...');

        // Right-click on a table row (if any exist)
        const tableRows = await this.page.$$('tbody tr');
        if (tableRows.length > 0) {
            await tableRows[0].click({ button: 'right' });
            await this.delay(CONFIG.delays.short);
            await this.takeScreenshot('context-menu-open');

            // Click elsewhere to close
            await this.page.click('body');
            await this.delay(CONFIG.delays.short);
            await this.takeScreenshot('context-menu-closed');
        }
    }

    async run(): Promise<void> {
        try {
            console.log('🚀 Starting screenshot automation...');
            await this.initialize();

            // Run all interaction tests
            await this.interactWithDateControls();
            await this.interactWithTabs();
            await this.interactWithTerminal();
            await this.interactWithStats();
            await this.testContextMenu();
            await this.testResponsiveDesign();

            console.log('✅ Screenshot automation completed successfully!');
            console.log(`📁 Screenshots saved to: ${CONFIG.screenshotDir}`);

        } catch (error) {
            console.error('❌ Error during screenshot automation:', error);
        } finally {
            if (this.browser) {
                await this.browser.close();
            }
        }
    }
}

// Run the automation
const screenshotter = new HabitTrackerScreenshotter();
screenshotter.run();
