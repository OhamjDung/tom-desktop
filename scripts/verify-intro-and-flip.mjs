import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/Hi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const url='http://localhost:5173';
async function load(){await page.goto(url);await page.waitForFunction(()=>{const v=document.querySelector('video');return v&&v.readyState>=2&&v.currentTime>0;});}
async function finish(){await page.locator('.video-boot video').evaluateAll(videos=>{const v=videos.find(video=>!video.paused);if(v)v.currentTime=v.duration-.15;});await page.waitForSelector('.boot',{state:'detached'});}
try {
  await load();
  const metadata=await page.locator('.intro-video').evaluateAll(videos=>videos.map(v=>({src:v.getAttribute('src'),duration:v.duration,width:v.videoWidth,height:v.videoHeight})));
  console.log('Video metadata',JSON.stringify(metadata));
  assert.equal(await page.locator('.boot').getAttribute('data-intro'),'long');
  await page.waitForTimeout(3300);assert.equal(await page.locator('.boot').count(),1);
  await page.screenshot({path:'qa/intro-long.png'});
  await finish();assert.equal(await page.locator('main').getAttribute('data-section'),'about');
  await load();await page.getByRole('button',{name:'Skip intro',exact:true}).click();
  await page.waitForFunction(()=>{const v=document.querySelector('.short-intro');return v&&v.currentTime>0;});
  assert.equal(await page.locator('.boot').getAttribute('data-intro'),'short');
  await page.mouse.wheel(0,300);assert.equal(await page.locator('.boot').count(),1);
  await page.screenshot({path:'qa/intro-short.png'});
  await page.waitForSelector('.boot',{state:'detached'});
  assert.equal(await page.locator('main').getAttribute('data-section'),'about');
  await load();await page.mouse.wheel(0,120);
  await page.waitForSelector('[data-intro="short"]');
  await page.waitForSelector('.boot',{state:'detached'});
  await page.waitForTimeout(800);
  const win=page.locator('[data-window="about"]');
  for(const cornerName of ['bottom-left','bottom-right']) {
    const before=await win.boundingBox();
    const corner=await win.locator(`.${cornerName}`).boundingBox();
    await page.mouse.move(corner.x+5,corner.y+5);await page.mouse.down();await page.mouse.move(corner.x-200,corner.y+5,{steps:10});await page.mouse.up();await page.waitForTimeout(600);
    const matrix=await win.evaluate(el=>{const m=new DOMMatrix(getComputedStyle(el).transform);return {yUpright:m.m22,zRoll:m.m12,yaw:m.m13};});
    assert.ok(Math.abs(matrix.yUpright-1)<.01,JSON.stringify(matrix));
    assert.ok(Math.abs(matrix.zRoll)<.01,JSON.stringify(matrix));
    assert.ok(Math.abs(matrix.yaw)>.1,JSON.stringify(matrix));
    const after=await win.boundingBox();
    assert.ok(after.x+after.width<before.x+before.width-20,'Leftward page flip moves the free edge left');
    await page.screenshot({path:`qa/flip-${cornerName}.png`});
    await page.mouse.click(1300,800);await page.waitForTimeout(900);
  }
  const corner=await win.locator('.bottom-right').boundingBox();
  await page.mouse.move(corner.x+5,corner.y+5);await page.mouse.down();await page.mouse.move(corner.x+5,corner.y-110,{steps:8});await page.mouse.up();await page.waitForTimeout(600);
  const pitch=await win.evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).m23);
  assert.ok(pitch>.1,'Upward drag preserves backward pitch');
  await page.setViewportSize({width:390,height:844});await load();
  await page.screenshot({path:'qa/mobile-intro.png'});
  await page.evaluate(()=>{
    const target=document.querySelector('.boot');
    const initial=new Touch({identifier:1,target,clientX:180,clientY:500});
    const moved=new Touch({identifier:1,target,clientX:180,clientY:400});
    window.dispatchEvent(new TouchEvent('touchstart',{touches:[initial]}));
    window.dispatchEvent(new TouchEvent('touchmove',{touches:[moved]}));
  });
  await page.waitForSelector('[data-intro="short"]');await page.waitForSelector('.boot',{state:'detached'});
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({passed:true,checks:['long video autoplay','no timed early exit','natural long completion','skip switches to short','repeated skip does not bypass short','scroll switches to short','desktop enters About','both bottom corners yaw without roll','upward drag retains pitch','mobile swipe intro']}));
}finally{await browser.close();}
