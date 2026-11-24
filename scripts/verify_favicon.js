const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function verifyFavicon() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

  // Get favicon link elements
  const favicons = await page.$$eval('link[rel*="icon"]', elements =>
    elements.map(el => ({
      rel: el.getAttribute('rel'),
      href: el.getAttribute('href'),
      type: el.getAttribute('type')
    }))
  );

  console.log('Detected Favicons in DOM:', JSON.stringify(favicons, null, 2));

  // Render a simulated browser tab preview to verify how it looks next to "Careers at TBM"
  const tabPreviewHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          margin: 0;
          padding: 40px;
          background: #202124;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          display: flex;
          flex-direction: column;
          gap: 30px;
          align-items: center;
        }
        .container {
          background: #2b2a33;
          padding: 24px 32px;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .heading {
          color: #f1f1f1;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .tab-bar-light {
          background: #f1f3f4;
          padding: 8px 12px 0;
          border-radius: 8px;
          display: flex;
          align-items: center;
          width: 380px;
        }
        .tab-light {
          background: #ffffff;
          border-radius: 8px 8px 0 0;
          padding: 8px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 -1px 3px rgba(0,0,0,0.06);
          flex: 1;
        }
        .tab-light img {
          width: 16px;
          height: 16px;
          border-radius: 3px;
          object-fit: contain;
        }
        .tab-light span {
          color: #1f1f1f;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .tab-bar-dark {
          background: #1f1f1f;
          padding: 8px 12px 0;
          border-radius: 8px;
          display: flex;
          align-items: center;
          width: 380px;
        }
        .tab-dark {
          background: #2d2e30;
          border-radius: 8px 8px 0 0;
          padding: 8px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 -1px 3px rgba(0,0,0,0.3);
          flex: 1;
        }
        .tab-dark img {
          width: 16px;
          height: 16px;
          border-radius: 3px;
          object-fit: contain;
        }
        .tab-dark span {
          color: #e8eaed;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .badge-preview {
          display: flex;
          align-items: center;
          gap: 20px;
          background: #ffffff;
          padding: 16px 24px;
          border-radius: 8px;
        }
        .badge-preview img {
          width: 64px;
          height: 64px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .badge-preview .info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .badge-preview .title {
          font-weight: 700;
          font-size: 16px;
          color: #050608;
        }
        .badge-preview .subtitle {
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="heading">Updated Browser Tab Favicon Preview</div>
        
        <div class="tab-bar-light">
          <div class="tab-light">
            <img src="http://localhost:3000/theboredmonkey-tbm-badge.png" alt="TBM" />
            <span>Careers at TBM</span>
          </div>
        </div>

        <div class="tab-bar-dark">
          <div class="tab-dark">
            <img src="http://localhost:3000/theboredmonkey-tbm-badge.png" alt="TBM" />
            <span>Careers at TBM</span>
          </div>
        </div>

        <div class="badge-preview">
          <img src="http://localhost:3000/theboredmonkey-tbm-badge.png" alt="TBM Badge" />
          <div class="info">
            <span class="title">Official TBM Icon Badge</span>
            <span class="subtitle">192x192 PNG &bull; Crisp tile with brand logo &bull; Perfect clarity at 16px</span>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const previewPage = await context.newPage();
  await previewPage.setContent(tabPreviewHtml, { waitUntil: 'networkidle' });

  const artifactDir = 'C:/Users/sarve/.gemini/antigravity/brain/512a23dc-79b7-46bb-80e1-5c7e471e995a';
  const previewPath = path.join(artifactDir, 'favicon_browser_tab_preview.png');
  await previewPage.screenshot({ path: previewPath });
  console.log('Saved preview screenshot to:', previewPath);

  await browser.close();
}

verifyFavicon().catch(err => {
  console.error(err);
  process.exit(1);
});
