import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
function fixture() {
  const nodes=[],timers=new Set();let active;
  class Element {
    children=[];listeners={};attributes={};textContent='';open=false;className='';
    classList={add(){},remove(){},toggle(){}};
    constructor(tag){this.tag=tag;nodes.push(this);}
    append(...nodes){this.children.push(...nodes);}
    insertBefore(node){this.append(node);}
    setAttribute(k,v){this.attributes[k]=v;}
    addEventListener(k,fn){(this.listeners[k]??=[]).push(fn);}
    removeEventListener(k,fn){this.listeners[k]=(this.listeners[k]||[]).filter(f=>f!==fn);}
    fire(k,e={}){return Promise.all((this.listeners[k]||[]).map(fn=>fn(e)));}
    focus(){active=this;}
    remove(){this.removed=true;}
    showModal(){this.open=true;}
    close(){this.open=false;this.fire('close');}
    querySelectorAll(){return [];}
  }
  const doc=new Element('document'), win=new Element('window'),container=new Element('main'),toolbar=new Element('nav'),canvas=new Element('canvas');
  doc.currentScript={src:'https://example.test/js/game-worlds.js'};
  doc.createElement=tag=>new Element(tag);doc.fullscreenEnabled=true;
  doc.exitFullscreen=async()=>{doc.fullscreenElement=null;await doc.fire('fullscreenchange');};
  container.requestFullscreen=async()=>{doc.fullscreenElement=container;await doc.fire('fullscreenchange');};
  container.closest=()=>container;
  container.querySelector=s=>s==='.pf-subhud'?toolbar:s==='canvas'?canvas:null;
  win.matchMedia=()=>({matches:false});win.stopSpeech=()=>{};
  vm.runInNewContext(fs.readFileSync(new URL('../js/game-worlds.js',import.meta.url),'utf8'),{window:win,document:doc,URL,Image:class{},setInterval:fn=>{timers.add(fn);return fn;},clearInterval:fn=>timers.delete(fn)});
  const values=[],paces=[];
  const dispose=win.KAT_Worlds.sessionControls(container,'ru',{hint:'Move with arrows',pause:v=>values.push(v),pace:v=>paces.push(v),goal:()=> 'A'});
  const find=cls=>nodes.find(n=>n.className.includes(cls));
  return {values,paces,doc,win,find,dispose,timers,canvas,get active(){return active;}};
}
test('help pauses and resumes; opening help on manual pause does not resume the run',async()=>{
  const f=fixture(),pause=f.find('gw-pause'),help=f.find('gw-help ' )||f.find('gw-help'),dialog=f.find('gw-help-dialog');
  await help.fire('click');assert.equal(f.values.at(-1),true);assert.equal(dialog.open,true);
  dialog.close();assert.equal(f.values.at(-1),false);
  await pause.fire('click');await help.fire('click');dialog.close();assert.equal(f.values.at(-1),true);
  await pause.fire('click');assert.equal(f.values.at(-1),false);assert.equal(f.active,f.canvas);
  f.dispose();
});
test('hiding the tab pauses until explicit resume and teardown removes handlers and timer',async()=>{
  const f=fixture();f.doc.hidden=true;await f.doc.fire('visibilitychange');assert.equal(f.values.at(-1),true);
  f.doc.hidden=false;await f.doc.fire('visibilitychange');assert.equal(f.values.at(-1),true);
  assert.equal(f.timers.size,1);f.dispose();assert.equal(f.timers.size,0);
  assert.equal(Object.values(f.doc.listeners).flat().length,0);assert.equal(Object.values(f.win.listeners).flat().length,0);
});
test('native fullscreen toggles and is exited on teardown',async()=>{
  const f=fixture(),full=f.find('gw-fullscreen');
  await full.fire('click');assert.ok(f.doc.fullscreenElement);assert.match(full.textContent,/Свернуть/);
  await full.fire('click');assert.equal(f.doc.fullscreenElement,null);
  await full.fire('click');f.dispose();assert.equal(f.doc.fullscreenElement,null);
});

test('gentle pace is explicit and reversible without resetting the session',async()=>{
  const f=fixture(),slow=f.find('gw-slow');
  assert.deepEqual(f.paces,[]);
  await slow.fire('click');assert.equal(slow.attributes['aria-pressed'],'true');assert.deepEqual(f.paces,[.65]);
  await slow.fire('click');assert.equal(slow.attributes['aria-pressed'],'false');assert.deepEqual(f.paces,[.65,1]);
  f.dispose();
});
