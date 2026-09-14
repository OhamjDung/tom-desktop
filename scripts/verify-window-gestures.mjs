import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/Hi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true,args:['--autoplay-policy=no-user-gesture-required']});
const page=await browser.newPage({viewport:{width:1440,height:900}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const read=locator=>locator.evaluate(el=>{
  const style=getComputedStyle(el),m=new DOMMatrix(style.transform),r=el.getBoundingClientRect();
  return {pivot:style.transformOrigin,x:m.m41,y:m.m42,yaw:m.m13,pitch:m.m23,left:r.left,top:r.top};
});
try {
  await page.goto('http://localhost:5173');
  await page.getByRole('button',{name:'Open desktop',exact:true}).click();
  await page.waitForSelector('.boot',{state:'detached'});
  await page.waitForTimeout(800);
  const win=page.locator('[data-window="about"]');
  const title=await win.locator('.titlebar').boundingBox();
  await page.mouse.move(title.x+130,title.y+14);await page.mouse.down();
  await page.mouse.move(title.x+210,title.y+64,{steps:10});await page.mouse.up();
  await page.waitForTimeout(900);
  const parked=await read(win);
  assert.ok(Math.abs(parked.x-80)<1&&Math.abs(parked.y-50)<1,JSON.stringify(parked));
  await page.mouse.click(1320,780);await page.waitForTimeout(10500);
  assert.deepEqual(await read(win),parked,'Click-away and inactivity preserve normal dragging');
  for(const cornerName of ['bottom-left','bottom-right']) {
    for(const [dx,dy] of [[-70,0],[-220,0],[0,-120],[130,-80]]) {
      const corner=await win.locator(`.${cornerName}`).boundingBox();
      await page.mouse.move(corner.x+5,corner.y+5);await page.mouse.down();
      await page.mouse.move(corner.x+5+dx,corner.y+5+dy,{steps:12});await page.waitForTimeout(120);
      const held=await read(win);
      assert.ok(Math.abs(held.yaw)>.1||Math.abs(held.pitch)>.1,'Corner visibly rotates');
      await page.mouse.up();
      const released=await read(win);
      assert.equal(released.pivot,held.pivot,'Return retains the release hinge');
      assert.ok(Math.abs(released.yaw-held.yaw)<.2&&Math.abs(released.pitch-held.pitch)<.2,'Return starts at the released rotation');
      assert.ok(Math.hypot(released.left-held.left,released.top-held.top)<40,'No pivot jump on release');
      await page.waitForTimeout(900);
      const flat=await read(win);
      assert.ok(Math.abs(flat.yaw)<.001&&Math.abs(flat.pitch)<.001,'Returns flat');
      assert.ok(Math.abs(flat.x-parked.x)<1&&Math.abs(flat.y-parked.y)<1,'Corner return preserves dragged placement');
    }
  }
  await page.screenshot({path:'qa/window-drag-desktop.png'});
  await win.locator('.bottom-right').focus();await page.keyboard.press('Escape');await page.waitForTimeout(900);
  const reset=await read(win);assert.equal(reset.x,0);assert.equal(reset.y,0);
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(300);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Mobile has no horizontal overflow');
  await page.screenshot({path:'qa/window-drag-mobile.png'});
  assert.deepEqual(errors,[]);
  console.log('PASS: persistent title dragging, click-away/inactivity, eight corner release poses with continuous hinges, parked-position return, Escape reset, mobile layout.');
}finally{await browser.close();}
