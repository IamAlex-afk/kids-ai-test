/* Temporary power-ups. Clock advances only while the run is active, using
   real elapsed play time rather than the physics/camera time scale. */
(function () {
  'use strict';
  const durations=Object.freeze({shield:12000,jump:10000,magnet:8000});
  function create() {
    let elapsed=0;
    const until={shield:0,jump:0,magnet:0};
    const active=kind=>Number.isFinite(until[kind]) && until[kind]>elapsed;
    return Object.freeze({
      tick(ms) {if(Number.isFinite(ms)&&ms>0)elapsed+=ms;},
      activate(kind) {if(!Object.hasOwn(durations,kind))return false;until[kind]=elapsed+durations[kind];return true;},
      active,
      remaining(kind) {return active(kind)?Math.ceil((until[kind]-elapsed)/1000):0;},
      absorbHit() {if(!active('shield'))return false;until.shield=0;return true;},
      jumpVelocity(base) {return base*(active('jump')?1.2:1);},
      clear() {for(const kind of Object.keys(until))until[kind]=0;},
    });
  }
  window.KAT_Effects=Object.freeze({create,durations});
})();
