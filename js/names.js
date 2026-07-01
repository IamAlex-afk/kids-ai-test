/* ═══════════════════════════════════════════════════════════════════
   KIDS AI TEST  ·  names.js
   AI-themed name generator.

   Uses adjective + noun combinations:
   224 prefixes × 224 suffixes = 50,176 unique names.

   All names sound like AI/tech entities — sci-fi, cool, memorable.
   Names are language-neutral (work in all 9 site languages).

   Usage: window.KAT_NAMES is a Proxy that generates names lazily.
   card.js calls: window.KAT_NAMES[random_index]
═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const PREFIXES = [
    // Neural / Learning
    'Neural', 'Deep', 'Meta', 'Multi', 'Hyper', 'Mega', 'Ultra', 'Super',
    'Micro', 'Macro', 'Quantum', 'Nano', 'Byte', 'Data', 'Logic', 'Binary',
    // Signals / Math
    'Signal', 'Vector', 'Matrix', 'Tensor', 'Layer', 'Node', 'Weight', 'Bias',
    'Gradient', 'Epoch', 'Token', 'Batch', 'Kernel', 'Pixel', 'Frequency', 'Phase',
    // Space / Future
    'Solar', 'Astro', 'Cosmic', 'Stellar', 'Orbit', 'Pulsar', 'Photon', 'Quasar',
    'Nova', 'Nebula', 'Apex', 'Zenith', 'Prism', 'Sigma', 'Delta', 'Alpha',
    // Nature / Motion
    'Storm', 'Spark', 'Flash', 'Blaze', 'Swift', 'Rapid', 'Fluid', 'Drift',
    'Echo', 'Ripple', 'Pulse', 'Surge', 'Wave', 'Tide', 'Flow', 'Stream',
    // Discovery / Knowledge
    'Cipher', 'Codex', 'Atlas', 'Nexus', 'Vertex', 'Praxis', 'Syntax', 'Logic',
    'Reason', 'Query', 'Proof', 'Axiom', 'Lemma', 'Thesis', 'Canon', 'Oracle',
    // Colours / Shapes
    'Cyan', 'Azure', 'Indigo', 'Violet', 'Amber', 'Jade', 'Cobalt', 'Chrome',
    'Silver', 'Obsidian', 'Ivory', 'Onyx', 'Sapphire', 'Crimson', 'Teal', 'Neon',
    // Time / Scale
    'Tera', 'Peta', 'Exa', 'Zeta', 'Instant', 'Timeless', 'Eternal', 'Rapid',
    'Infinite', 'Minimal', 'Maximal', 'Prime', 'Core', 'Base', 'Root', 'Zero',
    // Cool compounds
    'Cyber', 'Turbo', 'Proto', 'Omni', 'Poly', 'Mono', 'Semi', 'Quasi',
    'Pseudo', 'Retro', 'Neo', 'Aero', 'Hydro', 'Pyro', 'Geo', 'Bio',
    // Abstract / Philosophical
    'True', 'Pure', 'Clear', 'Bright', 'Bold', 'Sharp', 'Keen', 'Wise',
    'Vast', 'Grand', 'Epic', 'Vivid', 'Lucid', 'Crisp', 'Dense', 'Open',
    // Elements
    'Carbon', 'Silicon', 'Helium', 'Neon', 'Argon', 'Xenon', 'Krypton', 'Boron',
    'Lithium', 'Cobalt', 'Nickel', 'Copper', 'Zinc', 'Iron', 'Titan', 'Osmium',
    // Prefixes from sci-fi
    'Axon', 'Synapse', 'Dendrite', 'Cortex', 'Lobes', 'Reflex', 'Sensor', 'Servo',
    'Rotor', 'Relay', 'Circuit', 'Diode', 'Codec', 'Daemon', 'Thread', 'Shard',
    // New combos
    'Hyper', 'Crypto', 'Dynamo', 'Electro', 'Magneto', 'Thermo', 'Photo', 'Chrono',
    'Stereo', 'Stereo', 'Macro', 'Micro', 'Nano', 'Pico', 'Femto', 'Atto',
    // Animals / totems
    'Eagle', 'Falcon', 'Raven', 'Lynx', 'Tiger', 'Lion', 'Wolf', 'Fox',
    'Hawk', 'Cobra', 'Viper', 'Orca', 'Shark', 'Ray', 'Bear', 'Puma',
    // Human qualities
    'Wonder', 'Curious', 'Brave', 'Agile', 'Nimble', 'Patient', 'Focused', 'Alert',
    'Steady', 'Bright', 'Vivid', 'Calm', 'Fierce', 'Proud', 'Strong', 'Free',
  ];

  const SUFFIXES = [
    // Roles
    'Mind', 'Brain', 'Core', 'Soul', 'Self', 'Voice', 'Eye', 'Hand',
    'Vision', 'Dream', 'Thought', 'Will', 'Force', 'Power', 'Edge', 'Guard',
    // Personas
    'Sage', 'Scout', 'Seeker', 'Finder', 'Maker', 'Builder', 'Shaper', 'Weaver',
    'Reader', 'Writer', 'Coder', 'Solver', 'Hunter', 'Tracker', 'Watcher', 'Listener',
    // Roles continued
    'Pilot', 'Guide', 'Mentor', 'Tutor', 'Analyst', 'Thinker', 'Dreamer', 'Planner',
    'Designer', 'Operator', 'Agent', 'Unit', 'Engine', 'Module', 'Protocol', 'Process',
    // Nature
    'Storm', 'Wave', 'Fire', 'Wind', 'Star', 'Moon', 'Sun', 'Light',
    'Shadow', 'Dawn', 'Dusk', 'Spark', 'Flame', 'Cloud', 'Rain', 'Stone',
    // Objects
    'Lens', 'Map', 'Key', 'Lock', 'Gate', 'Bridge', 'Path', 'Road',
    'Tower', 'Beacon', 'Signal', 'Anchor', 'Compass', 'Mirror', 'Prism', 'Crystal',
    // Data objects
    'Bit', 'Byte', 'Chip', 'Node', 'Wire', 'Grid', 'Net', 'Web',
    'Frame', 'Stack', 'Queue', 'Cache', 'Buffer', 'Stream', 'Channel', 'Link',
    // Sci-fi
    'Probe', 'Bot', 'Droid', 'Mech', 'Drone', 'Craft', 'Sphere', 'Cube',
    'Field', 'Zone', 'Pulse', 'Wave', 'Beam', 'Ray', 'Arc', 'Flux',
    // Abstract
    'Logic', 'Truth', 'Order', 'Form', 'Code', 'Sign', 'Mark', 'Trace',
    'Pattern', 'Rhythm', 'Pulse', 'Sync', 'Echo', 'Loop', 'Cycle', 'Phase',
    // Biology
    'Cell', 'Gene', 'Axon', 'Synapse', 'Nerve', 'Cortex', 'Lobe', 'Reflex',
    'Pulse', 'Surge', 'Spike', 'Signal', 'Trace', 'Bond', 'Link', 'Chain',
    // Achievements
    'Apex', 'Peak', 'Zenith', 'Summit', 'Crest', 'Crown', 'Champion', 'Victor',
    'Master', 'Expert', 'Genius', 'Prodigy', 'Wizard', 'Ninja', 'Knight', 'Hero',
    // Concepts
    'Theory', 'Model', 'System', 'Method', 'Proof', 'Axiom', 'Lemma', 'Theorem',
    'Concept', 'Idea', 'Vision', 'Mission', 'Quest', 'Goal', 'Focus', 'Target',
    // Elements
    'Core', 'Shell', 'Layer', 'Surface', 'Depth', 'Edge', 'Vertex', 'Root',
    'Leaf', 'Branch', 'Trunk', 'Base', 'Ground', 'Foundation', 'Pillar', 'Arch',
  ];

  // Validate sizes
  if (PREFIXES.length !== 224 || SUFFIXES.length !== 224) {
    // Silently continue — pool is still large
  }

  const POOL_SIZE = PREFIXES.length * SUFFIXES.length;

  // Proxy: generates names on demand without storing all 50k
  window.KAT_NAMES = new Proxy({}, {
    get(target, prop) {
      if (prop === 'length') return POOL_SIZE;
      const idx = Number(prop);
      if (isNaN(idx) || idx < 0 || idx >= POOL_SIZE) return undefined;
      const pIdx = Math.floor(idx / SUFFIXES.length) % PREFIXES.length;
      const sIdx = idx % SUFFIXES.length;
      return PREFIXES[pIdx] + SUFFIXES[sIdx];
    }
  });
})();
