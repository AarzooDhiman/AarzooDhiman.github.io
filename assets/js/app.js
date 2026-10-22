/* Aarzoo Dhiman · shared behaviour for every page.
   Personalised links, copy email, motion switch, Lenis, text reveals,
   one render loop for canvas scenes, the contact close. Page scripts use window.AD.
   Rule kept throughout: every number on screen comes from Aarzoo's papers or CV facts. */
(() => {
  'use strict';
  const D = document, H = D.documentElement;
  const $ = (s, r = D) => r.querySelector(s);
  const $$ = (s, r = D) => [...r.querySelectorAll(s)];
  const STATIC = H.classList.contains('static');
  const coarse = matchMedia('(pointer: coarse)').matches;
  const LITE = coarse || (navigator.hardwareConcurrency || 8) <= 4;
  const DESK = innerWidth >= 900;
  const DPR = Math.min(LITE ? 1.5 : 2, window.devicePixelRatio || 1);
  const SIGNAL = '#ff5b2e', PAPER = '#f1eee6';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const expoOut = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
  const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);
  const fontsReady = () => (D.fonts ? D.fonts.ready : Promise.resolve());

  /* ---------- 0. Personalised link: ?for=Company, carried across pages ---------- */
  const q = new URLSearchParams(location.search);
  const org = (q.get('for') || '').replace(/[^\p{L}\p{N} &.'’-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 40);
  if (org) {
    const hello = $('#hello'), th = $('#talkH');
    if (hello) hello.textContent = `Hello, ${org} team.`;
    if (th) th.textContent = `Let’s find the signal in ${org}’s data.`;
    const subj = encodeURIComponent(`Research scientist role at ${org}`);
    $$('a[href^="mailto:"]').forEach((a) => { a.href = `mailto:aarzoodhiman@gmail.com?subject=${subj}`; });
    D.title = `${D.title} · for ${org}`;
  }
  const carry = () => {
    if (!org) return;
    $$('a[href]').forEach((a) => {
      const raw = a.getAttribute('href');
      if (/^([a-z]+:|#|\/\/)/i.test(raw)) return;
      const u = new URL(raw, location.href);
      if (u.origin !== location.origin || !/(\.html|\/)$/.test(u.pathname)) return;
      u.searchParams.set('for', org);
      a.setAttribute('href', raw.split(/[?#]/)[0] + u.search + u.hash);
    });
  };
  carry();

  /* ---------- 2. Copy email ---------- */
  $$('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
    let ok = false;
    try { await navigator.clipboard.writeText(b.dataset.copy); ok = true; } catch (e) { /* clipboard blocked */ }
    const out = b.parentElement.querySelector('.copied');
    if (out) { out.textContent = ok ? 'Copied.' : b.dataset.copy; setTimeout(() => { out.textContent = ''; }, 2600); }
  }));

  /* ---------- 3. Motion switch (persisted, reloads into the chosen mode) ---------- */
  const mb = $('#motionBtn');
  if (mb) {
    mb.textContent = STATIC ? 'Turn motion on' : 'Turn motion off';
    mb.addEventListener('click', () => { try { localStorage.setItem('ad-motion', STATIC ? 'on' : 'off'); } catch (e) { /* storage blocked */ } location.reload(); });
  }

  /* ---------- 4. Smooth scroll (Lenis) wired to ScrollTrigger ---------- */
  let lenis = null;
  if (!STATIC && !coarse && window.Lenis) {
    lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
    if (hasGSAP) { lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
    else { const r = (t) => { lenis.raf(t); requestAnimationFrame(r); }; requestAnimationFrame(r); }
  }
  const goTo = (t) => { if (lenis) lenis.scrollTo(t, { duration: 1.4, offset: -($('#bar') ? $('#bar').offsetHeight : 0) }); else t.scrollIntoView({ behavior: STATIC ? 'auto' : 'smooth' }); };
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const t = $(id);
    if (!t) return;
    e.preventDefault();
    goTo(t);
    history.replaceState(null, '', id);
  }));
  // arriving from another page with #papers or #contact
  if (location.hash.length > 1) addEventListener('load', () => { const t = $(decodeURIComponent(location.hash)); if (t) setTimeout(() => goTo(t), 250); });

  /* ---------- 5. One render loop; scenes run only while on screen ---------- */
  const scenes = [];
  let raf = 0;
  const loop = (t) => {
    raf = 0;
    let any = false;
    for (const s of scenes) if (s.on) { s.draw(t); any = true; }
    if (any && !D.hidden && !STATIC) raf = requestAnimationFrame(loop);
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
  const sio = new IntersectionObserver((es) => {
    for (const e of es) { const s = scenes.find((x) => x.el === e.target); if (s) { s.on = e.isIntersecting; if (s.on) kick(); } }
  }, { rootMargin: '120px 0px' });
  const addScene = (el, draw) => { const s = { el, draw, on: false }; scenes.push(s); sio.observe(el); return s; };
  D.addEventListener('visibilitychange', () => { if (!D.hidden) kick(); });
  const fit = (cv) => {
    const w = Math.max(1, cv.clientWidth), h = Math.max(1, cv.clientHeight);
    cv.width = Math.round(w * DPR); cv.height = Math.round(h * DPR);
    const c = cv.getContext('2d'); c.setTransform(DPR, 0, 0, DPR, 0, 0);
    return { c, w, h };
  };
  const onResize = (fn) => { let lw = innerWidth, lh = innerHeight, t; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => { if (innerWidth === lw && Math.abs(innerHeight - lh) < 120) return; lw = innerWidth; lh = innerHeight; fn(); }, 160); }); };

  /* count-up for figures (the real value is already in the HTML) */
  const fmt = (v, dec) => (dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-GB'));
  const countUp = (el, ms = 1100) => {
    if (STATIC || !el || !el.dataset.count) return;
    const to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    const t0 = performance.now();
    const step = (t) => { const k = clamp((t - t0) / ms, 0, 1); el.textContent = pre + fmt(to * expoOut(k), dec) + suf; if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };

  /* ---------- 6. Text reveals: masked lines for headings, rises for blocks ---------- */
  const splitLines = (el) => {
    const text = el.textContent.trim().replace(/\s+/g, ' ');
    el.textContent = '';
    const spans = text.split(' ').map((wd) => { const s = D.createElement('span'); s.style.display = 'inline-block'; s.textContent = wd; el.append(s, ' '); return s; });
    const lines = [];
    for (const s of spans) { const last = lines.at(-1); if (last && Math.abs(last.top - s.offsetTop) < 4) last.words.push(s.textContent); else lines.push({ top: s.offsetTop, words: [s.textContent] }); }
    el.textContent = '';
    lines.forEach((l, i) => { const m = D.createElement('span'); m.className = 'mask'; const inner = D.createElement('span'); inner.style.setProperty('--i', i); inner.textContent = l.words.join(' '); m.append(inner); el.append(m); });
  };
  const rio = new IntersectionObserver((es) => { for (const e of es) if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }, { rootMargin: '0px 0px -6% 0px' });
  fontsReady().then(() => {
    if (!STATIC) $$('[data-lines]').forEach((el) => { el.setAttribute('aria-label', el.textContent.trim()); splitLines(el); rio.observe(el); });
    $$('[data-rise]').forEach((el) => rio.observe(el));
  });

  /* phone dock appears once the first screen has scrolled away */
  const dock = $('#dock'), top = $('#top');
  if (dock && top) { dock.classList.add('is-hidden'); new IntersectionObserver((es) => dock.classList.toggle('is-hidden', es[0].isIntersecting), { threshold: 0.25 }).observe(top); }

  /* ---------- 7. Accordions: tap a role or skill group to expand ---------- */
  $$('.acc').forEach((acc) => {
    const btn = $('.acc__btn', acc);
    btn.addEventListener('click', () => { const open = !acc.classList.contains('open'); acc.classList.toggle('open', open); btn.setAttribute('aria-expanded', String(open)); if (hasGSAP) setTimeout(() => ScrollTrigger.refresh(), 450); });
  });

  /* ---------- 8. CONTACT: the noise settles into one signal ---------- */
  (() => {
    const sec = $('#contact'), cv = $('#talkCanvas');
    if (!sec || !cv) return;
    let c, w, h, n, P, t0 = 0, seen = false;
    const draw = (t) => {
      if (!seen && !STATIC) return;
      if (!t0) t0 = t;
      const k = STATIC ? 1 : ease(clamp((t - t0) / 2600, 0, 1));
      c.clearRect(0, 0, w, h);
      const x0 = DESK ? w * 0.58 : w * 0.05, x1 = DESK ? w * 0.97 : w * 0.95, base = DESK ? h * 0.46 : 92, amp = DESK ? 1 : 0.55;
      for (let i = 0; i < n; i++) {
        const fx = lerp(x0, x1, i / n), fy = base + (Math.sin(fx * 0.018 + t * 0.0016) * 12 + Math.sin(fx * 0.006 - t * 0.0009) * 22) * amp * Math.sin(Math.PI * i / n);
        const x = lerp(P[i * 3], fx, k), y = lerp(P[i * 3 + 1], fy, k);
        c.globalAlpha = 0.25 + k * 0.75; c.fillStyle = k > 0.6 ? SIGNAL : PAPER; c.fillRect(x, y, 2, 2);
      }
      c.globalAlpha = 1;
    };
    const build = () => { ({ c, w, h } = fit(cv)); n = LITE ? 500 : 1000; const r = rng(21); P = new Float32Array(n * 3); for (let i = 0; i < n; i++) { P[i * 3] = r() * w; P[i * 3 + 1] = r() * h; P[i * 3 + 2] = r(); } if (STATIC) draw(1e9); };
    build(); onResize(build);
    if (!STATIC) { addScene(sec, draw); new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { seen = true; kick(); o.disconnect(); } }, { threshold: 0.4 }).observe(sec); }
  })();

  window.AD = { D, H, $, $$, STATIC, coarse, LITE, DESK, DPR, SIGNAL, PAPER, clamp, lerp, ease, expoOut, rng, hasGSAP, addScene, kick, fit, onResize, countUp, fontsReady, get lenis() { return lenis; } };
  D.dispatchEvent(new Event('ad:ready'));

  fontsReady().then(() => { if (hasGSAP) ScrollTrigger.refresh(); });
  addEventListener('load', () => { if (hasGSAP) ScrollTrigger.refresh(); });
  let wasDesk = DESK; addEventListener('resize', () => { if ((innerWidth >= 900) !== wasDesk) { wasDesk = !wasDesk; location.reload(); } });
})();
