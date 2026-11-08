import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const root=new URL('../',import.meta.url);
function fixture(imagesLoaded=false) {
  const calls=[];
  const ctx=new Proxy({}, {get:(o,key)=>{
    if(key==='measureText') return text=>({width:Array.from(String(text)).length*10});
    if(String(key).startsWith('create')) return ()=>({addColorStop(){}});
    if(key in o) return o[key];
    return (...args)=>{for(const a of args) if(typeof a==='number') assert.ok(Number.isFinite(a),'finite '+String(key));calls.push([key,...args]);};
  },set:(o,k,v)=>(o[k]=v,true)});
  const buttons=[];
  const document={currentScript:{src:'https://example.test/kids-ai-test/js/game-worlds.js'},createElement(tag){
    if(tag==='canvas') return {getContext:()=>ctx};
    const listeners={},attributes={};
    const button={setAttribute:(k,v)=>attributes[k]=v,addEventListener:(k,v)=>listeners[k]=v,removeEventListener:k=>delete listeners[k],remove(){this.removed=true;},listeners,attributes};buttons.push(button);return button;
  }};
  const window={matchMedia:()=>({matches:false})};
  class Image { complete=imagesLoaded; naturalWidth=imagesLoaded?1254:0; naturalHeight=imagesLoaded?1254:0; addEventListener(){} }
  vm.runInNewContext(fs.readFileSync(new URL('js/game-worlds.js',root),'utf8'),{window,document,Image,URL});
  return {world:window.KAT_Worlds,ctx,calls,buttons};
}
test('robot renderer selects the armor or base asset from current shield state',()=>{
 const {world,ctx,calls}=fixture(true);
 for(const shielded of [false,true,false])world.robot(ctx,100,200,46,{shielded});
 const images=calls.filter(c=>c[0]==='drawImage').map(c=>c[1].src);
 assert.deepEqual(images,[
  'https://example.test/kids-ai-test/assets/robot-explorer-v2.png',
  'https://example.test/kids-ai-test/assets/robot-armor-v2.png',
  'https://example.test/kids-ai-test/assets/robot-explorer-v2.png',
 ]);
});
test('racing projection preserves lane order and aligns collision plane at every viewport',()=>{
 const {world}=fixture();
 for(const W of [280,390,680]) for(const H of [240,540,760]) {
   const at=lane=>world.project(W,H,3,lane,H*.78);
   assert.ok(at(0).x<at(1).x && at(1).x<at(2).x);
   assert.equal(at(1).x,W/2);
   const player=at(1), item=world.project(W,H,3,1,H*.78);
   assert.deepEqual(player,item);
   assert.ok(world.project(W,H,3,1,0).scale<player.scale);
   assert.ok(world.project(W,H,3,1,H*.78-22).y<player.y);
 }
});
test('curved road keeps the player collision plane centered and depth remains ordered',()=>{
 const {world}=fixture();
 for(const W of [240,500,900])for(const H of [300,600])for(const bend of [-W*.085,0,W*.085]){
  assert.ok(Math.abs(world.project(W,H,3,1,H*.78,bend).x-W/2)<.001);
  let previous=-Infinity;
  for(let y=0;y<=H;y+=H/20){const p=world.project(W,H,3,1,y,bend);assert.ok(p.y>previous);previous=p.y;}
  const a=world.project(W,H,3,0,H*.78,bend),b=world.project(W,H,3,2,H*.78,bend);assert.ok(a.x<b.x);
 }
});
test('snake joins adjacent body parts without drawing a bridge across wrapped edges',()=>{
 const {world,ctx}=fixture();
 const points=[{cx:15,cy:45},{cx:285,cy:45},{cx:255,cy:45},{cx:255,cy:75}];
 const links=world.snakeLinks(points,30);assert.equal(links.length,2);
 assert.ok(links.every(({a,b})=>Math.hypot(a.cx-b.cx,a.cy-b.cy)<=30));
 for(const direction of [{x:1,y:0},{x:0,y:1},{x:-1,y:0},{x:0,y:-1}])world.serpent(ctx,points,30,direction,{eating:true});
});
test('all scenes render finite geometry when the image is unavailable',()=>{
 const {world,ctx}=fixture();
 for(const W of [280,390,680,1200]) {
   world.board(W,400,35,12,12,0);
   world.background(ctx,W,400,2);
   world.ground(ctx,W,400,280,135,2);
   for(const text of ['ИИ','ИНФОРМАЦИЯ','ज्ञान','Trí tuệ nhân tạo']) world.token(ctx,35,35,text,'letter',18,120);
   world.race(ctx,W,400,{roadY:125,carY:312,laneVisual:1,parts:4,spawned:[{kind:'letter',text:'A',y:150,lane:0},{kind:'hazard',glyph:'!',y:300,lane:2},{kind:'shield',y:-30,lane:1}]},{lanes:3},1,1000);
 }
});
test('pause toggles accessibly in every supported language and detaches its listener',()=>{
 const {world,buttons}=fixture();
 for(const lang of ['en','ru','de','es','fr','hi','id','pt','tr','vi']) {
   const values=[],container={querySelector:()=>({append(){}})};
   const dispose=world.pauseControl(container,lang,v=>values.push(v)),button=buttons.at(-1),label=button.textContent;
   button.listeners.click();assert.equal(button.attributes['aria-pressed'],'true');assert.notEqual(button.textContent,label);
   button.listeners.click();assert.equal(button.attributes['aria-pressed'],'false');assert.equal(button.textContent,label);assert.deepEqual(values,[true,false]);
   dispose();assert.equal(button.listeners.click,undefined);assert.ok(button.removed);
 }
});
test('every entry point loads the shared renderer before game modules',()=>{
 for(const lang of ['index','ru','de','es','fr','hi','id','pt','tr','vi']) {
   const html=fs.readFileSync(new URL(lang+'.html',root),'utf8');
   assert.ok(html.includes('src="js/game-effects.js"'));
   for(const game of ['snake','platformer','racing']) assert.ok(html.indexOf('src="js/game-worlds.js"')<html.indexOf('src="js/'+game+'.js"'));
   assert.ok(html.includes('href="css/game-worlds.css"'));
 }
});

test('large-scene framing preserves room for jumps at all supported ages and orientations',()=>{
 const {world}=fixture();
 for(const age of ['tiny','child','teen','adult'])for(const [W,H] of [[366,540],[620,368],[1337,660]]){
  const size=world.sceneSize(W,H,age);assert.ok(size.width>=239.99);assert.ok(size.height>=299.99);
  assert.ok(Math.abs(size.width*size.scale-W)<.01);assert.ok(Math.abs(size.height*size.scale-H)<.01);
 }
 assert.ok(world.sceneSize(1337,660,'tiny').scale>world.sceneSize(1337,660,'adult').scale);
});

test('all four locations have translated names and safe fallback indices',()=>{
 const {world}=fixture();
 for(const lang of ['en','ru','de','es','fr','hi','id','pt','tr','vi']){
  const names=Array.from({length:4},(_,i)=>world.location(i,lang).name);
  assert.equal(new Set(names).size,4);assert.ok(names.every(n=>typeof n==='string'&&n.length>2));
  for(let i=4;i<14;i++)assert.equal(typeof world.expeditionText(lang,i),'string');
 }
 for(const index of [NaN,Infinity,undefined,'bad'])assert.equal(world.location(index).id,'forest');
 assert.equal(world.location(4).id,'forest');assert.equal(world.location(-1).id,'orbit');
});

test('atlas crops stay within their own quadrant at portrait and landscape aspect ratios',()=>{
 const {world,ctx,calls}=fixture(true);
 for(let i=0;i<4;i++)for(const [w,h] of [[390,844],[844,390],[480,240]]){
  calls.length=0;world.locationBackdrop(ctx,w,h,i);
  const draw=calls.find(c=>c[0]==='drawImage');assert.ok(draw,'loaded atlas is drawn');
  const [,img,sx,sy,sw,sh]=draw,half=img.naturalWidth/2,x=(i%2)*half,y=Math.floor(i/2)*half;
  assert.ok(sx>=x-.001&&sy>=y-.001&&sx+sw<=x+half+.001&&sy+sh<=y+half+.001);
 }
});

test('every vehicle and location renders finite geometry with and without loaded assets',()=>{
 for(const loaded of [false,true]){
  const {world,ctx}=fixture(loaded);
  for(let index=0;index<4;index++)for(const vehicle of ['cyan','red','gold']){
   world.board(390,540,48,8,11,index);
   world.race(ctx,390,540,{vehicle,roadY:170,carY:421.2,lane:1,laneVisual:.8,parts:4,shield:true,boostUntil:3000,spawned:[{kind:'letter',text:'Ж',lane:2,y:400}]},{lanes:3},index,1000,'#22c4c9');
  }
  for(const value of ['__proto__','constructor',null,{},42])assert.equal(world.vehicleId(value),'cyan');
 }
});
