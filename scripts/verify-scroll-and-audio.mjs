import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/Hi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true,args:['--autoplay-policy=no-user-gesture-required']});
const page=await browser.newPage({viewport:{width:1440,height:900}});
try {
  await page.goto('http://localhost:5173');
  await page.getByRole('button',{name:'Skip intro',exact:true}).click();
  await page.waitForSelector('.boot',{state:'detached'});
  await page.locator('[data-task="projects"]').click();await page.waitForTimeout(800);
  await page.getByRole('button',{name:/Personal Desktop/}).click();
  const scroller=page.locator('.project-content');
  const bounds=await scroller.boundingBox();
  await page.mouse.move(bounds.x+100,bounds.y+100);
  await scroller.evaluate(el=>el.scrollTop=0);await page.mouse.wheel(0,150);await page.waitForTimeout(800);
  assert.ok(await scroller.evaluate(el=>el.scrollTop)>0,'Window content scrolls normally');
  await scroller.evaluate(el=>el.scrollTop=el.scrollHeight);
  await page.mouse.wheel(0,500);await page.waitForTimeout(800);
  assert.equal(await page.locator('main').getAttribute('data-section'),'projects','Bottom boundary must not advance');
  await scroller.evaluate(el=>el.scrollTop=0);await page.mouse.wheel(0,-500);await page.waitForTimeout(800);
  assert.equal(await page.locator('main').getAttribute('data-section'),'projects','Top boundary must not navigate');
  const title=await page.locator('[data-window="projects"] .titlebar').boundingBox();
  await page.mouse.move(title.x+100,title.y+10);await page.mouse.wheel(0,500);await page.waitForTimeout(800);
  assert.equal(await page.locator('main').getAttribute('data-section'),'projects','Window chrome must not navigate');
  await page.mouse.down();await page.mouse.move(title.x+160,title.y+50,{steps:10});await page.mouse.up();await page.waitForTimeout(900);
  assert.equal(await page.locator('[data-window="projects"]').evaluate(el=>getComputedStyle(el).transform),'none','Title drag resets on release');
  await page.mouse.move(1300,800);await page.mouse.wheel(0,150);await page.waitForTimeout(800);
  assert.equal(await page.locator('main').getAttribute('data-section'),'contact','Background still advances');
  await page.getByRole('button',{name:'Start menu'}).click();await page.getByRole('menuitem',{name:'Replay intro'}).click();
  await page.waitForSelector('.boot[data-intro="long"]');
  await page.getByRole('button',{name:'Skip intro',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('.short-intro').currentTime>0);
  await page.getByRole('button',{name:'Open desktop',exact:true}).click();
  await page.waitForSelector('.boot[data-revealed="true"]',{state:'attached'});
  assert.equal(await page.locator('.short-intro').evaluate(v=>v.paused||v.muted),false);
  console.log('PASS: content/boundary/chrome scrolling, background navigation, drag-release reset, replay and button second-skip audio.');
}finally{await browser.close();}

// Simulate an autoplay rejection, then use real playback after a trusted click.
const restricted=await chromium.launch({headless:true,args:['--autoplay-policy=user-gesture-required']});
try {
  const p=await restricted.newPage();
  await p.addInitScript(()=>{
    const play=HTMLMediaElement.prototype.play;
    let clicked=false;
    document.addEventListener('click',event=>{if(event.isTrusted)clicked=true;},true);
    HTMLMediaElement.prototype.play=function(){
      if(!clicked)return Promise.reject(new DOMException('User activation required','NotAllowedError'));
      return play.call(this);
    };
  });
  await p.goto('http://localhost:5173');
  await p.getByRole('button',{name:'Play intro',exact:true}).waitFor();
  assert.equal(await p.locator('.intro-video').first().evaluate(v=>v.muted),false);
  await p.getByRole('button',{name:'Play intro',exact:true}).click();
  await p.waitForFunction(()=>{const v=document.querySelector('.intro-video');return !v.paused&&v.currentTime>0&&!v.muted;});
  console.log('PASS: blocked audible autoplay offers Play intro and starts with sound after click.');
}finally{await restricted.close();}
