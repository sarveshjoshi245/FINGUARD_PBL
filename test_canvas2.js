const { chromium } = require('playwright');
(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

    await page.goto('http://localhost:5501');

    // Inject script to force skip to step 4 and show pad
    await page.evaluate(() => {
        currentStep = 4;
        tempData = { panSignature: 'data:image/png;base64,iVBORw0KGgo' };
        renderStep();
    });

    // Wait a bit for DOM
    await page.waitForTimeout(1000);
    await page.evaluate(() => {
        toggleSignatureMode('draw');
    });
    await page.waitForTimeout(500);

    // Try to draw
    const box = await page.locator('#sig-canvas').boundingBox();
    console.log('sig-canvas bounds:', box);

    if (box) {
        // simulate mousedown explicitly 
        await page.mouse.move(box.x + 10, box.y + 10);
        await page.mouse.down();

        console.log('Mouse down at', box.x + 10, box.y + 10);

        const isDrawingVal = await page.evaluate(() => isDrawing);
        console.log('isDrawing after mousedown:', isDrawingVal);

        const hasDrawnVal = await page.evaluate(() => hasDrawn);
        console.log('hasDrawn after mousedown:', hasDrawnVal);

        await page.mouse.move(box.x + 100, box.y + 100, { steps: 10 });
        await page.mouse.up();

        const placeholderDisplay = await page.locator('#sig-placeholder').evaluate((el) => window.getComputedStyle(el).display);
        console.log('Placeholder display:', placeholderDisplay);

        // try to click Submit Pad
        await page.getByText('Submit Pad').click();
    }

    await browser.close();
})();
