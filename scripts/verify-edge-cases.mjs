import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/Hi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true,args:['--autoplay-policy=no-user-gesture-required']});
const page=await browser.newPage({viewport:{width:1440,height:900}});
try {
  await page.goto('http://localhost:5173');await page.getByRole('button',{name:'Open desktop'}).click();await page.waitForSelector('.boot',{state:'detached'});await page.waitForTimeout(900);
  const win=page.locator('[data-window="about"]');
  const title=await win.locator('.titlebar').boundingBox();
  await page.mouse.move(title.x+70,title.y+15);await page.mouse.down();await page.mouse.move(title.x+150,title.y+55,{steps:8});await page.waitForTimeout(400);
  assert.notEqual(await win.evaluate(el=>getComputedStyle(el).transform),'none');
  await page.mouse.up();await page.waitForTimeout(900);
  const parked=await win.evaluate(el=>getComputedStyle(el).transform);
  await win.locator('.bottom-left').focus();await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(11200);
  const transform=await win.evaluate(el=>getComputedStyle(el).transform);
  assert.equal(transform,parked,'Ten-second rotation reset preserves dragged placement');
  const assets=await page.locator('img').evaluateAll(imgs=>imgs.map(img=>({src:img.getAttribute('src'),ok:img.complete&&img.naturalWidth>0})));
  assert.ok(assets.every(img=>img.ok),JSON.stringify(assets));
  assert.equal(await page.locator('.ambient,.aero-shards,.crt-overlay').count(),0,'Archived effects and CRT overlay are not mounted');
  await page.setViewportSize({width:320,height:568});
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const section of ['projects','contact','about']) {
    await page.locator(`[data-task="${section}"]`).click();
    await page.waitForTimeout(200);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth),false);
  }
  console.log(JSON.stringify({passed:true,checks:['persistent title drag','ten-second rotation reset','local assets loaded','320px narrow viewport','effects archived']}));
} finally {await browser.close();}
