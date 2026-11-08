import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';

// A minimal DOM/timer fixture for game state and menu wiring, not browser QA.
function fixture(initial={}) {
  const data=new Map(Object.entries(initial)),timeouts=new Map(),frames=new Map();let next=0;
  const ctx=new Proxy({}, {get(o,k){if(k==='measureText')return s=>({width:String(s).length*10});if(String(k).startsWith('create'))return ()=>({addColorStop(){}});if(k in o)return o[k];return ()=>{};},set:(o,k,v)=>(o[k]=v,true)});
  class Element {
    children=[];attributes={};listeners={};dataset={};style={};className='';textContent='';clientWidth=366;clientHeight=420;
    classList={add:()=>{},remove:()=>{},toggle:()=>{}};
    constructor(tag='div'){this.tagName=tag.toUpperCase();}
    append(...nodes){for(const node of nodes){node.parentElement=this;this.children.push(node);}}
    appendChild(node){this.append(node);return node;}
    prepend(node){node.parentElement=this;this.children.unshift(node);}
    after(node){const p=this.parentElement;node.parentElement=p;p.children.splice(p.children.indexOf(this)+1,0,node);}
    setAttribute(k,v){this.attributes[k]=String(v);if(k==='id')this.id=v;if(k==='class')this.className=v;if(k.startsWith('data-'))this.dataset[k.slice(5)]=v;}
    addEventListener(k,fn,opt={}){(this.listeners[k]??=[]).push({fn,once:opt.once});}
    removeEventListener(k,fn){this.listeners[k]=(this.listeners[k]||[]).filter(l=>l.fn!==fn);}
    click(){if(this.disabled)return;for(const l of [...(this.listeners.click||[])]){l.fn({detail:0,preventDefault(){},currentTarget:this,target:this});if(l.once)this.removeEventListener('click',l.fn);}}
    matches(s){return s.startsWith('#')?this.id===s.slice(1):s.startsWith('.')?this.className.split(/\s+/).includes(s.slice(1)):this.tagName===s.toUpperCase();}
    querySelectorAll(s){return this.children.flatMap(c=>[...(c.matches(s)?[c]:[]),...c.querySelectorAll(s)]);}
    querySelector(s){return this.querySelectorAll(s)[0]||null;}
    closest(s){return this.matches(s)?this:this.parentElement?.closest(s)||null;}
    getContext(){return ctx;}
    getBoundingClientRect(){return {width:this.clientWidth,height:this.clientHeight,top:0,bottom:this.clientHeight};}
    set innerHTML(html){this.children=[];const stack=[this];for(const m of html.matchAll(/<\/?([\w-]+)([^>]*)>/g)){if(m[0][1]==='/'){if(stack.length>1)stack.pop();continue;}const el=new Element(m[1]);for(const a of m[2].matchAll(/([\w-]+)="([^"]*)"/g))el.setAttribute(a[1],a[2]);stack.at(-1).append(el);if(!['input','br','img','hr'].includes(m[1]))stack.push(el);}}
  }
  const document=new Element('document'),window=new Element('window'),container=new Element('main');
  document.createElement=tag=>new Element(tag);document.currentScript={src:'https://example.test/js/game-worlds.js'};
  window.matchMedia=()=>({matches:false});window.KAT_Store={get:k=>data.get(k),set:(k,v)=>data.set(k,v),readJSON:(k,f)=>data.has(k)?data.get(k):f,writeJSON:(k,v)=>data.set(k,v)};
  const math=Object.create(Math);math.random=()=>0;
  const context={window,document,URL,Image:class{complete=false;addEventListener(){}},navigator:{},Math:math,performance:{now:()=>0},setTimeout:fn=>{const id=++next;timeouts.set(id,fn);return id;},clearTimeout:id=>timeouts.delete(id),requestAnimationFrame:fn=>{const id=++next;frames.set(id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id)};
  for(const file of ['game-worlds','game-effects'])vm.runInNewContext(fs.readFileSync(new URL('../js/'+file+'.js',import.meta.url),'utf8'),context);
  const rendered=[],resizers=[];
  window.KAT_Worlds={...window.KAT_Worlds,sessionControls:()=>()=>{},watchSize:(el,fn)=>{resizers.push({el,fn});return ()=>{};},effectStatus:()=>({update(){},dispose(){}}),race:(ctx,W,H,state,cfg,index)=>rendered.push({vehicle:state.vehicle,index,lanes:cfg.lanes})};
  for(const file of ['snake','racing'])vm.runInNewContext(fs.readFileSync(new URL('../js/'+file+'.js',import.meta.url),'utf8'),context);
  return {window,container,data,rendered,resizers,timeouts,frames,step(){const [id,fn]=timeouts.entries().next().value;timeouts.delete(id);fn();},frame(){const [id,fn]=frames.entries().next().value;frames.delete(id);fn();}};
}
const rounds=Array.from({length:4},(_,i)=>({targets:[String.fromCharCode(65+i)],unit:'letter',decoys:[],fact:'A fact'}));

test('Snake unlocks the next location only after collecting the target, survives menu return, and isolates ages',()=>{
  const f=fixture({kat_snake_muted:'1'});let back=0,finished=0;
  const options={age:'tiny',lang:'en',rounds,onExit:()=>back++,onRoundComplete:()=>finished++};
  f.window.KAT_Snake.start(f.container,options);
  let cards=f.container.querySelectorAll('.gw-level-card');assert.deepEqual(cards.map(c=>!!c.disabled),[false,true,true,true]);
  cards[1].click();assert.equal(f.container.querySelector('#sk-start-btn'),null);
  cards[0].click();f.container.querySelector('#sk-start-btn').click();
  // 7 columns, 8 rows. The initial move is right from (3,4) to (4,4).
  const direction=name=>f.container.querySelectorAll('.sk-dbtn').find(b=>b.dataset.dir===name).click();
  direction('up');for(let i=0;i<4;i++)f.step();direction('left');for(let i=0;i<4;i++)f.step();
  assert.equal(finished,1);assert.deepEqual([...f.data.get('kat_snake_levels')['en:tiny']],[0]);
  assert.ok(f.container.querySelector('#sk-cont-btn'));
  f.container.querySelector('#sk-cont-btn').click();assert.match(f.container.querySelector('#sk-round').textContent,/Coral bay/);
  f.container.querySelector('#sk-exit').click();cards=f.container.querySelectorAll('.gw-level-card');assert.deepEqual(cards.map(c=>!!c.disabled),[false,false,true,true]);
  f.container.querySelector('#sk-back-games').click();assert.equal(back,1);
  f.window.KAT_Snake.start(f.container,{...options,age:'child'});assert.equal(f.container.querySelectorAll('.gw-level-card')[1].disabled,true);
  f.window.KAT_Snake.start(f.container,options);assert.equal(f.container.querySelectorAll('.gw-level-card')[1].disabled,false);
});

test('Garage offers three models immediately, persists selection and passes it into the run',()=>{
  const f=fixture({kat_race_skin:'__proto__'});
  const options={age:'tiny',lang:'en',rounds,lessons:[{title:'Lesson A'},{title:'Lesson B'}],onBack(){}};
  f.window.KAT_Racing.startWorldSelect(f.container,options);
  let cars=f.container.querySelectorAll('.gw-vehicle-card');assert.equal(cars.length,3);assert.equal(cars[0].attributes['aria-pressed'],'true');
  cars[1].click();assert.equal(f.data.get('kat_race_skin'),'red');assert.deepEqual(cars.map(c=>c.attributes['aria-pressed']),['false','true','false']);
  f.container.querySelectorAll('.pf-world-card')[0].click();f.frame();assert.equal(f.rendered.at(-1).vehicle,'red');assert.equal(f.rendered.at(-1).index,0);
  f.container.querySelector('#rc-exit').click();cars=f.container.querySelectorAll('.gw-vehicle-card');assert.equal(cars[1].attributes['aria-pressed'],'true');
  cars[2].click();f.container.querySelectorAll('.pf-world-card')[0].click();f.frame();assert.equal(f.rendered.at(-1).vehicle,'gold');
});


test('Snake orientation preserves target collection and next-location progression',()=>{
 const f=fixture({kat_snake_muted:'1'});let completed=0;
 f.window.KAT_Snake.start(f.container,{age:'tiny',lang:'en',rounds,onRoundComplete:()=>completed++});
 f.container.querySelectorAll('.gw-level-card')[0].click();f.container.querySelector('#sk-start-btn').click();
 const direction=name=>f.container.querySelectorAll('.sk-dbtn').find(b=>b.dataset.dir===name).click();
 direction('up');f.step(); // head (4,3)
 const {el,fn}=f.resizers[0];el.clientWidth=620;el.clientHeight=368;fn();
 const canvas=f.container.querySelector('#sk-canvas');assert.ok(canvas.width>canvas.height);
 direction('up');for(let i=0;i<4;i++)f.step();direction('left');for(let i=0;i<3;i++)f.step();
 assert.equal(completed,1,'transposed target still collected by normal movement');
 f.container.querySelector('#sk-cont-btn').click();
 el.clientWidth=366;el.clientHeight=420;fn();assert.ok(canvas.height>canvas.width);
 assert.match(f.container.querySelector('#sk-round').textContent,/Coral bay/);
});
