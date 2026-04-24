const { chromium } = require('playwright');
(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    const html = `
  <html><body>
    <div id='sig-mode-draw' style='display:block;'>
        <div style='width:300px; height:110px; position:relative;'>
            <canvas id='sig-canvas' style='width:100%; height:100%; touch-action:none;'></canvas>
            <div id='sig-placeholder' style='position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); pointer-events:none;'>Sign above</div>
        </div>
    </div>
    <script>
      let isDrawing = false;
      let hasDrawn = false;
      let sigPadCanvas = document.getElementById('sig-canvas');
      let sigPadCtx = sigPadCanvas.getContext('2d');
      const rect = sigPadCanvas.parentElement.getBoundingClientRect();
      sigPadCanvas.width = rect.width || 300;
      sigPadCanvas.height = Math.max(rect.height, 100);

      const startPosition = (e) => {
          console.log('startPosition triggered');
          isDrawing = true;
          hasDrawn = true;
          const ph = document.getElementById('sig-placeholder');
          if (ph) ph.style.display = 'none';
          draw(e);
      };
      const endPosition = () => { isDrawing = false; sigPadCtx.beginPath(); };
      const draw = (e) => {
          if (!isDrawing) return;
          e.preventDefault();
          let clientX = e.clientX; let clientY = e.clientY;
          if (e.touches && e.touches.length > 0) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; }
          const rect = sigPadCanvas.getBoundingClientRect();
          const scaleX = sigPadCanvas.width / rect.width;
          const scaleY = sigPadCanvas.height / rect.height;
          const x = (clientX - rect.left) * scaleX;
          const y = (clientY - rect.top) * scaleY;
          console.log('Drawing at', x, y);
          sigPadCtx.lineWidth = 3; sigPadCtx.lineCap = 'round'; sigPadCtx.strokeStyle = '#000';
          sigPadCtx.lineTo(x, y); sigPadCtx.stroke(); sigPadCtx.beginPath(); sigPadCtx.moveTo(x, y);
      };
      
      sigPadCanvas.addEventListener('mousedown', startPosition);
      sigPadCanvas.addEventListener('mouseup', endPosition);
      sigPadCanvas.addEventListener('mouseout', endPosition);
      sigPadCanvas.addEventListener('mousemove', draw);
    </script>
  </body></html>
  `;

    await page.setContent(html);
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    const box = await page.locator('#sig-canvas').boundingBox();
    console.log('Canvas box:', box);

    await page.mouse.move(box.x + 10, box.y + 10);
    await page.mouse.down();
    await page.mouse.move(box.x + 50, box.y + 50);
    await page.mouse.up();

    const display = await page.locator('#sig-placeholder').evaluate((node) => node.style.display);
    console.log('Placeholder display style:', display);

    await browser.close();
})();
