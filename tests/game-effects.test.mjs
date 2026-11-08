import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
const window={};vm.runInNewContext(fs.readFileSync(new URL('../js/game-effects.js',import.meta.url),'utf8'),{window});
const create=window.KAT_Effects.create;
test('armor blocks exactly one hit and otherwise expires after 12 active seconds',()=>{
 const e=create();assert.equal(e.absorbHit(),false);e.activate('shield');assert.equal(e.remaining('shield'),12);
 assert.equal(e.absorbHit(),true);assert.equal(e.absorbHit(),false);
 e.activate('shield');e.tick(11999);assert.equal(e.active('shield'),true);e.tick(1);assert.equal(e.absorbHit(),false);
});
test('high jump changes velocity, lasts 10 active seconds and then returns to normal',()=>{
 const e=create();assert.equal(e.jumpVelocity(-10),-10);e.activate('jump');assert.equal(e.jumpVelocity(-10),-12);
 e.tick(9999);assert.equal(e.jumpVelocity(-10),-12);e.tick(1);assert.equal(e.jumpVelocity(-10),-10);
});
test('bonus clocks are independent, pause is omission of tick, refresh does not stack strength',()=>{
 const e=create();e.activate('jump');e.activate('magnet');e.tick(4000);
 assert.equal(e.remaining('jump'),6);assert.equal(e.remaining('magnet'),4);
 for(let i=0;i<100;i++)assert.equal(e.remaining('magnet'),4);
 e.activate('jump');assert.equal(e.remaining('jump'),10);assert.equal(e.jumpVelocity(-10),-12);
 e.tick(4000);assert.equal(e.active('magnet'),false);assert.equal(e.active('jump'),true);
 e.clear();assert.equal(e.active('jump'),false);
});
test('invalid inputs cannot create permanent or NaN bonuses',()=>{
 const e=create();for(const kind of ['unknown','toString','__proto__'])assert.equal(e.activate(kind),false);e.activate('shield');
 for(const n of [-1,NaN,Infinity])e.tick(n);assert.equal(e.remaining('shield'),12);
});
