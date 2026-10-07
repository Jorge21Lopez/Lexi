'use strict';
// Runs Lexi in a Node vm with a minimal document/localStorage stub.
// The scripts are loaded in the same order as index.html, so new files are picked up automatically.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const SCRIPTS = [...fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
const SOURCES = SCRIPTS.map(f => [f, fs.readFileSync(path.join(ROOT, f), 'utf8')]);

function el(id){
  const cls = new Set();
  return { id, innerHTML:'', textContent:'', value:'', style:{}, dataset:{}, children:[],
    classList:{ add:c=>cls.add(c), remove:c=>cls.delete(c), contains:c=>cls.has(c), toggle:(c,on)=>{ if(on===undefined) on=!cls.has(c); on?cls.add(c):cls.delete(c); return on; } },
    setAttribute(){}, removeAttribute(){}, getAttribute(){ return null; }, addEventListener(){}, appendChild(c){ this.children.push(c); return c; },
    remove(){}, focus(){}, select(){}, click(){}, scrollIntoView(){} };
}

// boot({ state, lang, now }) → helpers to drive the app
function boot(opts = {}){
  const store = new Map();
  if(opts.state) store.set('lexi:v1', JSON.stringify(opts.state));
  const toasts = [], listeners = {};
  const app = el('app'), tabs = el('tabs'), body = el('body');
  body.appendChild = c => { if(c.className === 'toast') toasts.push(c.textContent); return c; };
  const document = {
    documentElement:{ lang:'en', dataset:{} }, body,
    querySelector: s => s === '#app' ? app : s === '#tabs' ? tabs : null,
    querySelectorAll: () => [],
    createElement: () => el(),
    addEventListener: (type, fn) => { listeners[type] = fn; },
    execCommand: () => false,
  };
  const sandbox = {
    console, document, JSON, Math, Map, Set, Promise, URL, Blob: function(){},
    localStorage:{ getItem:k=>store.has(k)?store.get(k):null, setItem:(k,v)=>store.set(k,String(v)), removeItem:k=>store.delete(k) },
    navigator:{}, location:{ protocol:'file:' },
    setTimeout: () => 0, clearTimeout: () => {}, setInterval: () => 0,
    requestAnimationFrame: () => 0, confirm: () => true, prompt: () => null,
    scrollTo: () => {}, scrollY: 0,
  };
  sandbox.window = sandbox;
  const ctx = vm.createContext(sandbox);
  if(opts.now) vm.runInContext(`(()=>{ let __t=${+opts.now}; Date.now=()=>__t; globalThis.__setNow=t=>{ __t=t; }; })()`, ctx);
  for(const [f, src] of SOURCES) vm.runInContext(src, ctx, { filename:f });
  const run = code => vm.runInContext(code, ctx);
  if(opts.lang) run(`setLang(${JSON.stringify(opts.lang)}); render();`);
  // Simulates a tap on a button with these data-* attributes
  function click(ds){
    const target = { dataset:ds, disabled:false, closest(){ return this; } };
    return listeners.click({ target });
  }
  return { ctx, run, click, toasts, html:() => app.innerHTML, store, setNow:t => run(`__setNow(${+t})`) };
}

module.exports = { boot, ROOT };
