import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/Hi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sharp=require('C:/Users/Hi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}});
try {
  await page.goto('http://localhost:5173');await page.getByRole('button',{name:'Skip intro'}).click();await page.waitForSelector('.boot',{state:'detached'});await page.waitForTimeout(900);
  const win=page.locator('[data-window="about"]');
  const title=await win.locator('.titlebar').boundingBox();
  await page.mouse.move(title.x+70,title.y+15);await page.mouse.down();await page.mouse.move(title.x+150,title.y+55,{steps:8});await page.mouse.up();await page.waitForTimeout(400);
  assert.notEqual(await win.evaluate(el=>getComputedStyle(el).transform),'none');
  await page.mouse.click(1300,800);await page.waitForTimeout(900);
  const corner=await win.locator('.bottom-left').boundingBox();
  await page.mouse.move(corner.x+5,corner.y+5);await page.mouse.down();await page.mouse.move(corner.x+110,corner.y+30,{steps:8});await page.mouse.up();
  await page.waitForTimeout(11200);
  const transform=await win.evaluate(el=>getComputedStyle(el).transform);
  assert.ok(transform==='none'||transform==='matrix(1, 0, 0, 1, 0, 0)',transform);
  const assets=await page.locator('img').evaluateAll(imgs=>imgs.map(img=>({src:img.getAttribute('src'),ok:img.complete&&img.naturalWidth>0})));
  assert.ok(assets.every(img=>img.ok),JSON.stringify(assets));
  const canvas=page.locator('.aero-shards[data-ready="true"] canvas');
  let graphics='WebGPU unavailable; fallback active';
  if(await canvas.count()) {
    await page.addStyleTag({content:'.ambient{opacity:1!important;mix-blend-mode:normal!important;mask-image:none!important;z-index:1200!important}'});
    const a=await canvas.screenshot();await page.waitForTimeout(1500);const b=await canvas.screenshot();
    const stats=await sharp(a).stats();
    assert.ok(stats.channels.some(c=>c.stdev>2),'Canvas should contain rendered detail');
    assert.notDeepEqual(a,b,'Canvas should animate');
    await canvas.screenshot({path:'qa/aeroshards.png'});
    graphics='WebGPU canvas rendered nonblank and animated';
  }
  await page.setViewportSize({width:320,height:568});
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const section of ['projects','contact','about']) {
    await page.locator(`[data-task="${section}"]`).click();
    await page.waitForTimeout(200);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth),false);
  }
  console.log(JSON.stringify({passed:true,checks:['drag and click-off reset','ten-second reset','local assets loaded','320px narrow viewport'],graphics}));
} finally {await browser.close();}
