// publicar_pagina.js — BACKUP de publicación de una fila del Catálogo en Notion.
// Ejecutar en la página https://www.notion.so/<page_id> (logueado, workspace Expertos)
// como código async (top-level await). Sustituir __ID__ por el número de la influencer (solo log).
// Devuelve un string de log; debe terminar en "live-custom:true saved:true".
//
// Settings que aplica: dominio l.influencerviral.io, Duplicate as template OFF,
// Header custom = Breadcrumbs OFF / Search ON / Share ON / Duplicate OFF / Notion sign-up OFF,
// y pulsa "Publish changes".

window.__h = {
  leaf: (t) => [...document.querySelectorAll('div,span')]
    .filter(e => e.children.length === 0 && e.textContent.trim() === t),
  clickLeaf: (t) => {
    const el = __h.leaf(t)[0]; let cl = el;
    for (let i = 0; i < 5 && cl; i++) {
      const r = cl.getAttribute('role');
      if (r === 'button' || r === 'menuitem' || r === 'option' || r === 'tab' || getComputedStyle(cl).cursor === 'pointer') break;
      cl = cl.parentElement;
    }
    if (el) { (cl || el).click(); }
    return t + ':' + !!el;
  },
  clickBtn: (t) => {
    const c = [...document.querySelectorAll('[role="button"],button')].filter(e => e.textContent.trim() === t);
    if (c[0]) c[0].click();
    return t + ':' + c.length;
  },
  setToggle: (label, want) => {
    const lab = __h.leaf(label)[0]; if (!lab) return label + ':nolabel';
    let p = lab;
    for (let i = 0; i < 7 && p; i++) {
      const sw = p.querySelector('[role="switch"],input[type="checkbox"],[aria-checked]');
      if (sw) {
        const cur = (sw.getAttribute('aria-checked') === 'true') || sw.checked === true;
        if (cur !== want) { sw.click(); return label + ':' + cur + '->' + want; }
        return label + ':ok';
      }
      p = p.parentElement;
    }
    return label + ':noswitch';
  },
  headerRow: () => {
    for (const l of __h.leaf('Header')) {
      let p = l;
      for (let i = 0; i < 4 && p; i++) {
        if (p.textContent.includes('Custom') && p.textContent.trim().length < 40) { p.click(); return 'header:1'; }
        p = p.parentElement;
      }
    }
    return 'header:0';
  }
};

const L = [];
const S = ms => new Promise(r => setTimeout(r, ms));

// 1) Abrir Share (si el popup no está ya abierto)
if (!__h.leaf('Publish').length) {
  const sb = [...document.querySelectorAll('[role="button"]')].find(b => b.getAttribute('aria-label') === 'Share');
  if (sb) sb.click();
  L.push('share-btn:' + !!sb); await S(2000);
} else L.push('popup');

// 2) Pestaña Publish + 3) botón Publish
(__h.leaf('Publish')[0] || { click() {} }).click(); await S(1500);
L.push(__h.clickBtn('Publish')); await S(3000);

// 4) Dominio custom
L.push(__h.clickLeaf('expertoss.notion.site')); await S(1500);
L.push(__h.clickLeaf('l.influencerviral.io')); await S(2500);

// 5) Duplicate as template OFF
L.push(__h.setToggle('Duplicate as template', false)); await S(1000);

// 6) Header custom
L.push(__h.clickLeaf('Customize site styling')); await S(3000);
L.push(__h.headerRow()); await S(1500);
L.push([
  __h.setToggle('Breadcrumbs', false),
  __h.setToggle('Search', true),
  __h.setToggle('Share', true),
  __h.setToggle('Duplicate as template', false),
  __h.setToggle('Show Notion sign up button', false)
].join('|')); await S(1000);

// 7) Publish changes
L.push(__h.clickBtn('Publish changes')); await S(3000);

// 8) Resultado
const t = document.body.innerText;
L.push('RESULT __ID__ ' + document.title +
  ' live-custom:' + t.includes('This page is live on l.influencerviral.io') +
  ' saved:' + t.includes('Changes published'));
L.join(' ; ');
