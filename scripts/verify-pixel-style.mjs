import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/Hi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true,args:['--autoplay-policy=no-user-gesture-required']});
const page=await browser.newPage({viewport:{width:1440,height:900}});
const errors=[];page.on('pageerror',error=>errors.push(error.message));
try {
  await page.goto('http://localhost:5173');
  await page.getByRole('button',{name:'Skip intro',exact:true}).click();
  await page.waitForSelector('.boot',{state:'detached'});
  await page.evaluate(()=>document.fonts.ready);
  for(const weight of [400,700])assert.ok(await page.evaluate(w=>document.fonts.check(`${w} 11px "Desktop Pixel"`),weight));
  assert.ok(await page.locator('.titlebar').first().evaluate(el=>getComputedStyle(el).fontFamily.includes('Desktop Pixel')));
  for(const viewport of [{width:1440,height:900},{width:390,height:844},{width:320,height:568}]) {
    await page.setViewportSize(viewport);
    for(const section of ['about','projects','contact']) {
      await page.locator(`[data-task="${section}"]`).click();await page.waitForTimeout(800);
      const invalid=await page.locator('.pixel-icon').evaluateAll(images=>images.filter(img=>!img.complete||!img.naturalWidth||getComputedStyle(img).imageRendering!=='pixelated').map(img=>img.src));
      assert.deepEqual(invalid,[],'All pixel icons load and use nearest-neighbor rendering');
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No page overflow');
      const clipped=await page.locator('.task-button span,.desktop-icons span').evaluateAll(labels=>labels.filter(el=>el.scrollWidth>el.clientWidth).map(el=>el.textContent));
      assert.deepEqual(clipped,[],'Navigation labels fit');
      await page.screenshot({path:`qa/pixel-${section}-${viewport.width}.png`});
    }
  }
  await page.getByRole('button',{name:'Start menu'}).click();
  assert.ok(await page.locator('.start-menu').evaluate(el=>getComputedStyle(el).fontFamily.includes('Desktop Pixel')));
  await page.screenshot({path:'qa/pixel-start-menu.png'});
  assert.deepEqual(errors,[]);
  console.log('PASS: both local pixel font weights, all icons, desktop/mobile sections, navigation fit and menu typography.');
}finally{await browser.close();}
