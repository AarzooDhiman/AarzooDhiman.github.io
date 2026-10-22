/* Aarzoo Dhiman · Profile page: the drifting hero field, photos, and the education and experience globe. */
(() => {
  'use strict';
  const { $, $$, STATIC, LITE, DESK, SIGNAL, PAPER, clamp, lerp, ease, rng, hasGSAP, addScene, kick, fit, onResize, fontsReady } = window.AD;

  /* photos the owner has supplied (assets/data/photos.json is written by site-source/make-images.mjs) */
  const photos = fetch('assets/data/photos.json').then((r) => (r.ok ? r.json() : {})).catch(() => ({}));
  const imgFor = (name, ph, alt, sizes) => {
    const im = new Image();
    im.src = `assets/img/${name}-800.webp`; im.srcset = `assets/img/${name}-800.webp 800w, assets/img/${name}-1600.webp 1600w`;
    im.sizes = sizes; im.alt = alt; im.loading = 'lazy'; im.decoding = 'async'; im.width = 800; im.height = ph.h || 533;
    return im;
  };

  /* ---------- HERO: the name is solid text; a slowly drifting dot field fades out around it ---------- */
  const nameEl = $('#heroName');
  const fitName = () => {
    nameEl.style.fontSize = '100px';
    const words = $$('.w', nameEl), host = nameEl.parentElement, cs = getComputedStyle(host);
    const avail = host.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const need = DESK ? words.at(-1).getBoundingClientRect().right - words[0].getBoundingClientRect().left : Math.max(...words.map((w) => w.offsetWidth));
    if (need) nameEl.style.fontSize = (100 * avail / need * 0.985).toFixed(2) + 'px';
  };
  let rebuildHero = () => {};
  (() => {
    const sec = $('#top'), cv = $('#heroCanvas'), PAD = 22, FADE = 44;
    // a slow flow field: every dot drifts on its own (6 to 14 px a second), wraps at the edges, and fades out as it nears the box around the name and text. No pointer input.
    let c, w, h, n, X, Y, SP, boxes = [], last = 0;
    const build = () => {
      fitName();
      ({ c, w, h } = fit(cv));
      const r0 = cv.getBoundingClientRect();
      boxes = $$('[data-clear]', sec).filter((el) => el.offsetParent).map((el) => { const r = el.getBoundingClientRect(); return [r.left - r0.left - PAD, r.top - r0.top - PAD, r.right - r0.left + PAD, r.bottom - r0.top + PAD]; });
      n = clamp(Math.round(w * h / 1500), 300, DESK ? 1200 : 500);
      X = new Float32Array(n); Y = new Float32Array(n); SP = new Float32Array(n);
      const r = rng(3);
      for (let i = 0; i < n; i++) { X[i] = r() * w; Y[i] = r() * h; SP[i] = r(); }
      draw(0);
    };
    const draw = (t) => {
      const dt = last && t ? Math.min(64, t - last) / 1000 : 0; last = t;
      const T = t * 0.00008, move = !STATIC && dt > 0;
      c.clearRect(0, 0, w, h);
      for (let pass = 0; pass < 2; pass++) {
        c.fillStyle = pass ? SIGNAL : PAPER;
        for (let i = 0; i < n; i++) {
          if ((i % 9 === 0) !== (pass === 1)) continue;
          let x = X[i], y = Y[i];
          if (move) {
            const a = (Math.sin(x * 0.0031 + T * 3) + Math.cos(y * 0.0037 - T * 2)) * 1.6 + T * 2, v = 6 + SP[i] * 8;
            x += Math.cos(a) * v * dt; y += Math.sin(a) * v * dt;
            if (x > w + 4) x -= w + 8; else if (x < -4) x += w + 8;
            if (y > h + 4) y -= h + 8; else if (y < -4) y += h + 8;
            X[i] = x; Y[i] = y;
          }
          let d = 1e9;
          for (const b of boxes) { const dx = Math.max(b[0] - x, 0, x - b[2]), dy = Math.max(b[1] - y, 0, y - b[3]); d = Math.min(d, Math.hypot(dx, dy)); }
          const k = clamp(d / FADE, 0, 1);
          if (k <= 0) continue;
          c.globalAlpha = (pass ? 0.7 : 0.24) * k * k * (3 - 2 * k);
          const s = 0.7 + SP[i] * 1.3; c.fillRect(x, y, s, s);
        }
      }
      c.globalAlpha = 1;
    };
    rebuildHero = build;
    fontsReady().then(() => { build(); if (!STATIC) addScene(sec, draw); });
    onResize(build);
  })();

  photos.then((m) => {
    const hs = m.headshot, fig = $('#portrait');
    if (hs && fig) {
      const im = imgFor('headshot', hs, hs.alt || 'Dr Aarzoo Dhiman', '(max-width:899px) 220px, 30vw');
      im.loading = 'eager';
      fig.append(im); fig.hidden = false;
      const relayout = () => { rebuildHero(); if (hasGSAP) ScrollTrigger.refresh(); };
      im.addEventListener('load', relayout);
      relayout();
    }
  });

  /* ---------- EDUCATION AND EXPERIENCE: a camera over a dotted globe, driven by the stop cards ---------- */
  (() => {
    const cv = $('#globe'), stage = $('#jstage'), cards = $$('#jcards > li'), dotsEl = $('#jdots'), numEl = $('#jnum');
    const rad = Math.PI / 180;
    const vec = (lat, lon) => [Math.cos(lat * rad) * Math.cos(lon * rad), Math.cos(lat * rad) * Math.sin(lon * rad), Math.sin(lat * rad)];
    const dot3 = (a, b) => clamp(a[0] * b[0] + a[1] * b[1] + a[2] * b[2], -1, 1);
    const slerp = (a, b, t) => { const om = Math.acos(dot3(a, b)); if (om < 1e-6) return a; const s = Math.sin(om), s1 = Math.sin((1 - t) * om) / s, s2 = Math.sin(t * om) / s; return [a[0] * s1 + b[0] * s2, a[1] * s1 + b[1] * s2, a[2] * s1 + b[2] * s2]; };
    const PL = { kur: ['Kurukshetra', 29.97, 76.88], roo: ['Roorkee', 29.87, 77.89], lon: ['London', 51.51, -0.13], hul: ['Hull', 53.74, -0.33] };
    const PV = Object.fromEntries(Object.entries(PL).map(([k, [, la, lo]]) => [k, vec(la, lo)]));
    // one stop per card. zoom multiplies the globe radius.
    const STOPS = [
      { v: PV.kur, zoom: 9, focus: 'kur' },
      { v: PV.kur, zoom: 11, focus: 'kur' },
      { v: PV.roo, zoom: 9, focus: 'roo' },
      { v: slerp(PV.roo, PV.lon, 0.5), zoom: 1, focus: 'lon' },
      { v: PV.lon, zoom: 17, focus: 'lon' },
      { v: PV.hul, zoom: 17, focus: 'hul' },
    ];
    const N = STOPS.length;
    // arcs appear as the camera arrives at `at`
    const ARCS = [{ a: 'kur', b: 'roo', at: 2 }, { a: 'roo', b: 'lon', at: 3 }, { a: 'lon', b: 'hul', at: 5 }];
    const PIN_AT = { kur: 0, roo: 2, lon: 3, hul: 4 };

    /* camera: far-apart stops zoom out first, pan, then zoom in */
    const cam = (s) => {
      s = clamp(s, 0, N - 1);
      const i = Math.min(N - 2, Math.floor(s)), f = s - i, A = STOPS[i], B = STOPS[i + 1];
      const dist = Math.acos(dot3(A.v, B.v)), la = Math.log(A.zoom), lb = Math.log(B.zoom);
      let ez = ease(f), ep = ez;
      if (dist > 0.05) { if (A.zoom > B.zoom) { ez = ease(clamp(f / 0.7, 0, 1)); ep = ease(clamp((f - 0.25) / 0.75, 0, 1)); } else { ep = ease(clamp(f / 0.7, 0, 1)); ez = ease(clamp((f - 0.3) / 0.7, 0, 1)); } }
      const v = slerp(A.v, B.v, ep), zoom = Math.exp(lerp(la, lb, ez));
      return { lat: Math.asin(clamp(v[2], -1, 1)), lon: Math.atan2(v[1], v[0]), zoom, s };
    };

    /* data: coarse world dots always; detailed dots and outlines fade in above zoom 3 */
    const toVecs = (arr, div) => { const out = []; for (let i = 0; i < arr.length; i += 2) out.push(vec(arr[i] / div, arr[i + 1] / div)); return out; };
    // minimal TopoJSON reader: returns [{ name, rings: [[vec, ...]] }]
    const readTopo = (t) => {
      const T = t.transform;
      const arcs = t.arcs.map((a) => { let x = 0, y = 0; return a.map(([px, py]) => { if (T) { x += px; y += py; return [x * T.scale[0] + T.translate[0], y * T.scale[1] + T.translate[1]]; } return [px, py]; }); });
      const arc = (i) => (i >= 0 ? arcs[i] : arcs[~i].slice().reverse());
      const ring = (idx) => idx.flatMap((i, k) => (k ? arc(i).slice(1) : arc(i))).map(([lo, la]) => vec(la, lo));
      return Object.values(t.objects).flatMap((o) => o.geometries || [o]).map((g) => ({
        name: g.properties && g.properties.name,
        rings: g.type === 'Polygon' ? g.arcs.map(ring) : g.type === 'MultiPolygon' ? g.arcs.flatMap((p) => p.map(ring)) : [],
      }));
    };
    const layers = { land: [], india: [], uk: [] }, shapes = { india: [], states: [], uk: [], regions: [] };
    let onData = kick;
    const get = (u) => fetch(u).then((r) => r.json());
    const ok = (p) => p.then(() => onData()).catch(() => {});
    ok(get('assets/data/land.json').then((j) => { layers.land = toVecs(j, 10); }));
    ok(get('assets/data/india-detail.json').then((j) => { layers.india = toVecs(j, 100); }));
    ok(get('assets/data/uk-detail.json').then((j) => { layers.uk = toVecs(j, 100); }));
    ok(get('assets/data/india.json').then((j) => { shapes.india = readTopo(j); }));
    ok(get('assets/data/india-states.json').then((j) => { shapes.states = readTopo(j); }));
    ok(get('assets/data/uk.json').then((j) => { shapes.uk = readTopo(j); }));
    ok(get('assets/data/uk-regions.json').then((j) => { shapes.regions = readTopo(j); }));
    // where each state label sits (middle of its largest ring)
    const labelAt = (sh) => { const r = sh.rings.reduce((m, x) => (x.length > m.length ? x : m), []); const s = r.reduce((a, v) => [a[0] + v[0], a[1] + v[1], a[2] + v[2]], [0, 0, 0]); const L = Math.hypot(...s) || 1; return [s[0] / L, s[1] / L, s[2] / L]; };

    /* draw the globe for camera `k` into any canvas context */
    const render = (c, w, h, k, t, o) => {
      const cx = o.cx, cy = h / 2, base = o.base, R = base * k.zoom;
      const cl = Math.cos(-k.lon), sl = Math.sin(-k.lon), cp = Math.cos(k.lat), sp = -Math.sin(k.lat); // phi = -lat
      const proj = (v, lift = 1) => {
        const x1 = v[0] * cl - v[1] * sl, y1 = v[0] * sl + v[1] * cl, z1 = v[2];
        const x2 = x1 * cp - z1 * sp, z2 = x1 * sp + z1 * cp, r = R * lift;
        return { x: cx + y1 * r, y: cy - z2 * r, front: x2 };
      };
      c.clearRect(0, 0, w, h);
      c.fillStyle = '#151715';
      if (R > Math.max(w, h) * 6) c.fillRect(0, 0, w, h); else { c.beginPath(); c.arc(cx, cy, R, 0, 6.2832); c.fill(); }
      // graticule, only while the whole globe is in view
      const gz = clamp((3.2 - k.zoom) / 2, 0, 1);
      if (gz > 0.02) {
        c.strokeStyle = `rgba(241,238,230,${0.07 * gz})`; c.lineWidth = 1; c.beginPath();
        for (let la = -60; la <= 60; la += 30) { let on = false; for (let lo = -180; lo <= 180; lo += 6) { const p = proj(vec(la, lo)); if (p.front > 0) { on ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y); on = true; } else on = false; } }
        for (let lo = -180; lo < 180; lo += 30) { let on = false; for (let la = -84; la <= 84; la += 6) { const p = proj(vec(la, lo)); if (p.front > 0) { on ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y); on = true; } else on = false; } }
        c.stroke();
      }
      const dz = clamp((k.zoom - 3) / 2, 0, 1), ds = 2 * Math.pow(k.zoom, 0.17) * clamp(base / 360, 0.4, 1), m = 40;
      c.fillStyle = PAPER;
      const paint = (list, amul, size) => {
        for (const v of list) {
          const p = proj(v);
          if (p.front <= 0 || p.x < -m || p.x > w + m || p.y < -m || p.y > h + m) continue;
          c.globalAlpha = (0.18 + p.front * 0.55) * amul; c.fillRect(p.x - size / 2, p.y - size / 2, size, size);
        }
      };
      paint(layers.land, 1 - 0.72 * dz, ds);
      // detail dots are sized from their own spacing so India (0.18 degrees) and Britain (0.05) look alike
      const dsz = (stepDeg) => clamp(0.45 * stepDeg * rad * R, 1.1, 3.2);
      if (dz > 0.02) { paint(layers.india, dz, dsz(0.18)); paint(layers.uk, dz, dsz(0.05)); }
      c.globalAlpha = 1;
      // outlines: India (official boundary), the UK, and the two state outlines
      const outline = (list, alpha, lw) => {
        c.strokeStyle = PAPER; c.lineWidth = lw; c.globalAlpha = alpha; c.beginPath();
        for (const sh of list) for (const ring of sh.rings) {
          let on = false;
          for (const v of ring) { const p = proj(v); if (p.front <= 0) { on = false; continue; } on ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y); on = true; }
        }
        c.stroke(); c.globalAlpha = 1;
      };
      if (dz > 0.02) { outline(shapes.india, 0.5 * dz, 1.5); outline(shapes.uk, 0.5 * dz, 1.5); }
      const sz = clamp((k.zoom - 5.5) / 2.5, 0, 1);
      if (sz > 0.02) { outline(shapes.states, 0.4 * sz, 1); outline(shapes.regions, 0.4 * sz, 1); }
      // arcs: drawn as the camera approaches each stop, then kept
      for (const a of ARCS) {
        const pr = clamp(k.s - (a.at - 1), 0, 1);
        if (pr <= 0) continue;
        const dist = Math.acos(dot3(PV[a.a], PV[a.b])), amp = 0.16 * clamp(dist / 0.5, 0.1, 1);
        // an arc whose end is off screen fades back so it never streaks across a close-up
        const away = [a.a, a.b].map((key) => { const p = proj(PV[key]); return p.front <= 0 ? 400 : Math.max(0, -p.x, p.x - w, -p.y, p.y - h); });
        c.globalAlpha = 1 - 0.82 * clamp(Math.max(...away) / 260, 0, 1);
        c.strokeStyle = SIGNAL; c.lineWidth = 2.5; c.setLineDash(a.dash ? [6, 7] : []); c.beginPath();
        const S = 70, mEnd = Math.round(S * ease(pr)); let started = false;
        for (let j = 0; j <= mEnd; j++) { const u = j / S, p = proj(slerp(PV[a.a], PV[a.b], u), 1 + amp * Math.sin(Math.PI * u)); if (p.front < -0.1) { started = false; continue; } started ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y); started = true; }
        c.stroke(); c.setLineDash([]); c.globalAlpha = 1;
      }
      // pins (they pulse softly) and labels that never overlap
      const focus = STOPS[Math.round(k.s)].focus, placed = [];
      c.font = `600 ${w > 520 ? 15 : 13}px "Instrument Sans", sans-serif`;
      const order = Object.keys(PL).sort((x, y) => (x === focus ? -1 : y === focus ? 1 : PIN_AT[y] - PIN_AT[x])), drawn = [];
      for (const key of order) {
        const al = clamp(k.s - PIN_AT[key] + 1, 0, 1); if (al <= 0) continue;
        const p = proj(PV[key]); if (p.front <= 0 || p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20) continue;
        const isF = key === focus, pulse = ((t || 0) % 2200) / 2200;
        c.globalAlpha = al;
        if (!o.still) { c.strokeStyle = SIGNAL; c.globalAlpha = al * (1 - pulse) * 0.7; c.lineWidth = 2; c.beginPath(); c.arc(p.x, p.y, 7 + pulse * 16, 0, 6.2832); c.stroke(); c.globalAlpha = al; }
        c.fillStyle = isF ? SIGNAL : PAPER; c.beginPath(); c.arc(p.x, p.y, isF ? 6.5 : 4.5, 0, 6.2832); c.fill();
        const crowded = drawn.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < 34);
        drawn.push(p);
        if (crowded) { c.globalAlpha = 1; continue; }
        const name = PL[key][0], tw = c.measureText(name).width;
        for (const [dx, dy, al2] of [[11, 5, 'left'], [-11, 5, 'right'], [0, -14, 'center'], [0, 22, 'center']]) {
          const x = al2 === 'left' ? p.x + dx : al2 === 'right' ? p.x + dx - tw : p.x - tw / 2, y = p.y + dy, box = [x - 4, y - 14, x + tw + 4, y + 5];
          if (box[0] < 4 || box[2] > w - 4 || box[1] < 4 || box[3] > h - 4) continue;
          if (placed.some((b) => box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1])) continue;
          placed.push(box); c.fillStyle = PAPER; c.textAlign = 'left'; c.fillText(name, x, y); break;
        }
        c.globalAlpha = 1;
      }
      // state names, lighter than the city labels, in the same face
      if (sz > 0.02) {
        c.font = `500 ${w > 520 ? 13 : 12}px "Instrument Sans", sans-serif`;
        for (const sh of [...shapes.states, ...shapes.regions]) {
          if (sh.name === 'Kingston upon Hull') continue; // too small to label; the Hull pin names it
          const p = proj(labelAt(sh)); if (p.front <= 0) continue;
          const tw = c.measureText(sh.name).width;
          for (const dy of [0, -30, 30, -56]) {
            const x = p.x - tw / 2, y = p.y + dy, box = [x - 4, y - 13, x + tw + 4, y + 5];
            if (box[0] < 4 || box[2] > w - 4 || box[1] < 4 || box[3] > h - 4) continue;
            if (placed.some((b) => box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1])) continue;
            placed.push(box); c.globalAlpha = 0.75 * sz; c.lineJoin = 'round'; c.lineWidth = 4; c.strokeStyle = '#151715'; c.strokeText(sh.name, x, y); c.fillStyle = PAPER; c.fillText(sh.name, x, y); c.globalAlpha = 1; break;
          }
        }
      }
    };

    /* ---- layout state ---- */
    let c, w, h, geo, bar = 68, drawMaps = () => {};
    const layout = () => { ({ c, w, h } = fit(cv)); geo = { cx: w / 2, base: DESK ? Math.min(h * 0.4, w * 0.4) : Math.min(w, h) * 0.42 }; bar = ($('#bar') || { offsetHeight: 68 }).offsetHeight; };
    layout();

    /* progress dots */
    dotsEl.innerHTML = '<i></i>'.repeat(N);
    const pdots = $$('i', dotsEl);
    let active = -1;
    const setActive = (i) => {
      if (i === active) return;
      active = i;
      cards.forEach((li, j) => li.classList.toggle('on', j === i));
      pdots.forEach((d, j) => d.classList.toggle('on', j === i));
      numEl.textContent = `${i + 1} of ${N}`;
    };

    /* photos and credits */
    photos.then((m) => cards.forEach((li) => {
      const e = m[li.dataset.photo]; if (!e) return;
      $('.pcard__media', li).prepend(imgFor(li.dataset.photo, e, li.dataset.alt, '(max-width:899px) 82vw, 540px'));
      $('.pcard__ph', li).remove(); li.classList.add('has-photo');
      if (e.credit) $('.cr', li).textContent = 'Photo: ' + e.credit;
    }));

    if (STATIC) {
      // reduced motion: the list as it is, each stop with a small still map
      drawMaps = () => cards.forEach((li, i) => {
        const m = fit($('.pcard__map', li));
        render(m.c, m.w, m.h, cam(i), 0, { cx: m.w / 2, base: Math.min(m.w, m.h) * 0.42, still: true });
      });
      onData = () => drawMaps();
      onResize(drawMaps);
      fontsReady().then(drawMaps);
      setActive(0); cards.forEach((li) => li.classList.add('on'));
      return;
    }

    /* camera follows `target`, eased */
    let cur = 0, target = 0;
    addScene(stage, (t) => {
      cur += (target - cur) * (DESK ? 0.2 : 0.07);
      if (Math.abs(target - cur) < 0.0008) cur = target;
      render(c, w, h, cam(cur), t, geo);
    });

    if (DESK) {
      // the card at the middle of the screen sets the stop: the camera holds on it, then flies to the next as the next card comes up
      const update = () => {
        const mid = bar + (innerHeight - bar) / 2, ctr = cards.map((li) => { const r = li.getBoundingClientRect(); return r.top + r.height / 2; });
        if (mid <= ctr[0]) { target = 0; setActive(0); }
        else if (mid >= ctr[N - 1]) { target = N - 1; setActive(N - 1); }
        else {
          let i = 0; while (ctr[i + 1] < mid) i++;
          const u = (mid - ctr[i]) / (ctr[i + 1] - ctr[i]);
          target = i + clamp((u - 0.3) / 0.5, 0, 1); setActive(u < 0.5 ? i : i + 1);
        }
        kick();
      };
      addEventListener('scroll', update, { passive: true });
      onResize(() => { layout(); update(); });
      update();
    } else {
      // phones: swipe the cards, the camera flies to the stop in view
      onResize(() => { layout(); kick(); });
      const io = new IntersectionObserver((es) => { for (const e of es) if (e.isIntersecting) { const i = cards.indexOf(e.target); target = i; setActive(i); kick(); } }, { root: $('#jcards'), threshold: 0.6 });
      cards.forEach((li) => io.observe(li));
      setActive(0);
    }
  })();
})();
