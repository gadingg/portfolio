const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync('public/assets/js/capabilities-motion.js', 'utf8');

function fixture({ reduced = false, preview = false, gsapAvailable = true } = {}) {
  const listeners = new Map(), pageEvents = new Map(), calls = [], observers = [];
  let cleanup, reverted = 0;
  const card = capability => ({
    isConnected: true,
    matches: () => capability,
    querySelectorAll: () => [{ style: {} }],
  });
  const first = card(true), project = card(false), cards = [first, project];
  const gsap = {
    matchMedia: () => ({ add(query, fn) { assert.match(query, /no-preference/); if (!reduced) cleanup = fn(); }, revert() { cleanup?.(); } }),
    context: () => ({ add: fn => fn(), revert: () => reverted++ }),
    from: (target, options) => calls.push({ target, options }),
  };
  class Observer {
    constructor(callback) { this.callback = callback; this.items = new Set(); observers.push(this); }
    observe(item) { this.items.add(item); }
    unobserve(item) { this.items.delete(item); }
    disconnect() { this.items.clear(); }
  }
  vm.runInNewContext(source, {
    window: { gsap: gsapAvailable ? gsap : undefined, IntersectionObserver: Observer, addEventListener: (name, fn) => pageEvents.set(name, fn) },
    IntersectionObserver: Observer,
    document: { body: { dataset: preview ? { cmsPreview: 'true' } : {} }, querySelectorAll: () => cards, addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: name => listeners.delete(name) },
  });
  return { first, project, cards, card, observers, listeners, calls, pageEvents, get reverted() { return reverted; } };
}

test('cards stay untouched until visible and animate only once, including horizontal entries', () => {
  const f = fixture(), observer = f.observers[0];
  assert.equal(f.calls.length, 0);
  observer.callback([{ target: f.first, isIntersecting: false, intersectionRatio: 0 }]);
  assert.equal(f.calls.length, 0);
  const entry = { target: f.first, isIntersecting: true, intersectionRatio: .5 };
  observer.callback([entry, entry]);
  assert.equal(f.calls.length, 2);
  assert.equal(observer.items.has(f.first), false);
  observer.callback([{ ...entry, target: f.project }]);
  assert.equal(f.calls.length, 3);
  assert.ok(f.calls.every(call => call.options.opacity !== 0 && !call.options.repeat));
});

test('replaced Works cards are disconnected and new cards get observed without replaying existing cards', () => {
  const f = fixture(), observer = f.observers[0];
  f.project.isConnected = false;
  f.cards.splice(1, 1, f.card(false));
  f.listeners.get('portfolio:works-ready')();
  assert.equal(observer.items.has(f.project), false);
  assert.equal(observer.items.size, 2);
});

test('reduced motion, preview and missing GSAP keep the page static and visible', () => {
  for (const options of [{ reduced: true }, { preview: true }, { gsapAvailable: false }]) {
    const f = fixture(options);
    assert.equal(f.observers.length, 0);
    assert.equal(f.calls.length, 0);
  }
});

test('page exit cleans animations and listeners; bfcache navigation retains its observer', () => {
  const f = fixture();
  f.pageEvents.get('pagehide')({ persisted: true });
  assert.equal(f.reverted, 0);
  f.pageEvents.get('pagehide')({ persisted: false });
  assert.equal(f.observers[0].items.size, 0);
  assert.equal(f.listeners.size, 0);
  assert.equal(f.reverted, 1);
});
