const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const types = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpeg':'image/jpeg'};
async function main() {
  const server = http.createServer(async (req,res) => {
    try {
      const p = decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/welding-guide-502\//,'/');
      const file = path.resolve(root, '.' + p + (p.endsWith('/') ? 'index.html' : ''));
      if (!file.startsWith(root + path.sep)) throw Error('path');
      res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
      res.end(await fs.readFile(file));
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const base = process.env.CHECK_URL || `http://127.0.0.1:${server.address().port}/welding-guide-502/`;
  const browser = await chromium.launch({channel:'chrome',headless:true});
  const results = [];
  async function checkChillerImages(page) {
    const entries = page.locator('#fault-list details:nth-child(n+3)');
    await entries.last().waitFor();
    assert.equal(await entries.count(),2);
    for (const entry of await entries.all()) {
      await entry.locator('summary').click();
      const cards = entry.locator('.step-card');
      assert.equal(await cards.count(),7);
      assert.deepEqual(await cards.evaluateAll(nodes=>nodes.map(node=>node.querySelectorAll('img').length)),[0,1,1,1,1,1,0]);
      for (const img of await entry.locator('img').all()) {
        await img.scrollIntoViewIfNeeded();
        await img.evaluate(el=>el.decode());
      }
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'横向溢出');
    }
  }
  try {
    for (const viewport of [{width:390,height:844},{width:1440,height:1000}]) {
      const context = await browser.newContext({viewport,deviceScaleFactor:1,isMobile:viewport.width<500,hasTouch:viewport.width<500});
      const page = await context.newPage();
      const errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400&&!r.url().includes('/qa-missing-image.webp')) errors.push(`${r.status()} ${r.url()}`);});
      await page.goto(base+'#section=faults');
      await page.waitForFunction(()=>document.querySelectorAll('#fault-list details').length===4);
      await page.evaluate(()=>Array.from(document.querySelectorAll('#fault-list details')).slice(0,2).forEach(d=>d.open=true));
      const images=page.locator('#fault-list details:nth-child(-n+2) .step-card img');
      assert.equal(await images.count(),3);
      for (const img of await images.all()) {
        await img.scrollIntoViewIfNeeded();
        await img.evaluate(el=>el.decode());
        assert.ok(await img.evaluate(el=>el.naturalWidth>0 && el.getBoundingClientRect().width>0));
      }
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'横向溢出');
      await images.first().scrollIntoViewIfNeeded();
      await page.screenshot({path:path.join(root,`tests/qa-${viewport.width}.png`),fullPage:true});
      await images.first().evaluate(el=>el.addEventListener('click',()=>{window.openedAt=scrollY;},{capture:true,once:true}));
      await images.first().click();
      await page.locator('#modal-image').evaluate(el=>el.decode());
      await page.locator('[data-zoom="in"]').click();
      await page.locator('.image-modal__close').click();
      await page.waitForFunction(()=>document.querySelector('#image-modal').hidden);
      await page.waitForFunction(()=>Math.abs(window.openedAt-scrollY)<3);
      await images.first().focus();
      await page.keyboard.press('Enter');
      assert.equal(await page.locator('#image-modal').isVisible(),true);
      await page.keyboard.press('Escape');
      await page.waitForFunction(()=>document.querySelector('#image-modal').hidden);
      await images.first().evaluate(el=>{el.src=new URL('qa-missing-image.webp', location.href).href;});
      const retry=page.locator('.image-error:not([hidden]) button');
      await retry.waitFor();
      await retry.click();
      await images.first().evaluate(el=>el.decode());
      assert.equal(await page.locator('.image-error:not([hidden])').count(),0);
      await page.evaluate(()=>navigator.serviceWorker.ready);
      await page.reload();
      await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
      await page.evaluate(()=>Array.from(document.querySelectorAll('#fault-list details')).slice(0,2).forEach(d=>d.open=true));
      for(const img of await page.locator('#fault-list details:nth-child(-n+2) .step-card img').all()) {await img.scrollIntoViewIfNeeded();await img.evaluate(el=>el.decode());}
      // Wait until the worker's cache.put has completed before cutting the network.
      await checkChillerImages(page);
      await page.screenshot({path:path.join(root,`tests/qa-chiller-${viewport.width}.png`),fullPage:true});
      await page.waitForFunction(async()=>{const c=await caches.open('welding-guide-502-v24');return (await c.keys()).filter(r=>/guide-v1.svg|controls-v1.webp|qcds-v1.webp|chiller-.*-marked-v[234].svg/.test(r.url)).length===8;});
      await context.setOffline(true);
      await page.reload();
      await checkChillerImages(page);
      await page.locator('nav [data-section="faults"]:visible').first().click();
      await page.waitForFunction(()=>document.querySelectorAll('#fault-list details').length===4);
      await page.evaluate(()=>Array.from(document.querySelectorAll('#fault-list details')).slice(0,2).forEach(d=>d.open=true));
      for(const img of await page.locator('#fault-list details:nth-child(-n+2) .step-card img').all()) {await img.scrollIntoViewIfNeeded();await img.evaluate(el=>el.decode());}
      assert.deepEqual(errors,[]);
      results.push({viewport,faultImages:3,chillerImages:10,steps:[3,5,7,7],offline:true,modal:true,errors});
      await context.close();
    }
    console.log(JSON.stringify({base,results},null,2));
  } finally {await browser.close();server.close();}
}
main().catch(e=>{console.error(e);process.exit(1);});

