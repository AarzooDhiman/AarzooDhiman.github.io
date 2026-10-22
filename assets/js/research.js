/* Aarzoo Dhiman · Research page: the funnel and MDT scroll stories, the simulator, more work, and paper filters.
   The two stories share scrollStory() from story.js. */
(() => {
  'use strict';
  const { $, $$, STATIC, LITE, DESK, SIGNAL, PAPER, clamp, lerp, ease, rng, hasGSAP, addScene, kick, fit, onResize, countUp, formations, scrollStory } = window.AD;
  const barH = () => $('#bar').offsetHeight;

  /* ---------- FUNNEL: 1,226,509 people to one number (pinned, scrubbed) ---------- */
  scrollStory({
    stage: $('#funnelStage'), canvas: $('#funnelCanvas'), steps: $$('#fsteps .story__step'), prog: $('#fprog'),
    makeRenderer: (w, h, still) => {
      const S = 7, AUC = [0.907, 0.934, 0.768], AUCN = ['Author infected', 'Household member infected', 'Household mentioned'];
      const R = still ? { x: w * 0.06, y: h * 0.08, w: w * 0.88, h: h * 0.84 } : w >= 900 ? { x: w * 0.42, y: h * 0.12, w: w * 0.54, h: h * 0.76 } : { x: w * 0.05, y: h * 0.1, w: w * 0.9, h: h * 0.44 };
      const n = still ? 700 : LITE ? 1300 : 2400, F = formations(n, S), set = F.set;
      const r = rng(11), cx = R.x + R.w / 2, cy = R.y + R.h / 2, rad = Math.min(R.w, R.h) * 0.47;
      const k1 = Math.round(n * 77016 / 1226509), k2 = Math.round(n * 58555 / 1226509);
      const g = 20, cell4 = Math.min(R.w, R.h) * 0.62 / g, cell6 = Math.min(R.w, R.h) * 0.8 / 10, rows = 30;
      for (let i = 0; i < n; i++) {
        const a0 = r() * 6.2832, r0 = Math.sqrt(r()) * rad, x0 = cx + Math.cos(a0) * r0, y0 = cy + Math.sin(a0) * r0 * 0.92;
        set(0, i, x0, y0, 0.55, 1.6, 0);
        let x1 = x0, y1 = y0;
        if (i < k1) { const a = r() * 6.2832, rr = Math.sqrt(r()) * rad * 0.34; x1 = cx + Math.cos(a) * rr; y1 = cy + Math.sin(a) * rr; set(1, i, x1, y1, 1, 2.2, 0); } else set(1, i, x0, y0, 0.07, 1.4, 0);
        if (i < k2) { const a = r() * 6.2832, rr = Math.sqrt(r()) * rad * 0.27; set(2, i, cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 1, 2.6, 1); }
        else if (i < k1) set(2, i, x1, y1, 0.25, 1.8, 0); else set(2, i, x0, y0, 0.04, 1.2, 0);
        const row = i % rows, x3 = R.x + r() * R.w, y3 = R.y + (row + 0.5) * R.h / rows;
        set(3, i, x3, y3, 0.5, 1.3, 0);
        if (i < g * g) { const gx = i % g, gy = (i / g) | 0; set(4, i, cx + (gx - g / 2 + 0.5) * cell4, cy + (gy - g / 2 + 0.5) * cell4, 1, cell4 * 0.62, 0); } else set(4, i, x3, y3, 0.05, 1.1, 0);
        const j = i % 3, L = R.w * 0.84 * AUC[j];
        set(5, i, R.x + R.w * 0.08 + r() * L, cy + (j - 1) * R.h * 0.24 + (r() - 0.5) * R.h * 0.07, 0.9, 1.6, j === 1 ? 1 : 0);
        if (i < 100) { const gx = i % 10, gy = (i / 10) | 0; set(6, i, cx + (gx - 4.5) * cell6, cy + (gy - 4.5) * cell6, 1, cell6 * 0.34, i < 16 ? 1 : 0); } else set(6, i, R.x + R.w * 0.08 + r() * R.w * 0.84 * AUC[j], cy + (j - 1) * R.h * 0.24, 0, 1, 0);
      }
      return (c, cur) => {
        F.draw(c, cur);
        const near5 = 1 - Math.min(1, Math.abs(cur - 5));
        if (near5 > 0.02) {
          c.globalAlpha = near5; c.fillStyle = PAPER; c.font = `500 ${w >= 900 ? 15 : 13}px "Instrument Sans", sans-serif`;
          AUC.forEach((v, j) => c.fillText(`${AUCN[j]} · AUC ${v.toFixed(3)}`, R.x + R.w * 0.08, cy + (j - 1) * R.h * 0.24 - R.h * 0.06));
          c.globalAlpha = 1;
        }
      };
    },
  });

  /* ---------- MDT: the meeting that never leaves the room (same story mechanics) ---------- */
  scrollStory({
    stage: $('#mdtStage'), canvas: $('#mdtCanvas'), steps: $$('#msteps .story__step'), prog: $('#mprog'),
    makeRenderer: (w, h, still) => {
      const S = 7;
      const R = still ? { x: w * 0.06, y: h * 0.08, w: w * 0.88, h: h * 0.84 } : w >= 900 ? { x: w * 0.42, y: h * 0.12, w: w * 0.54, h: h * 0.76 } : { x: w * 0.05, y: h * 0.1, w: w * 0.9, h: h * 0.44 };
      const n = still ? 240 : DESK ? 360 : 220, F = formations(n, S), set = F.set, r = rng(21);
      const cx = R.x + R.w / 2, cy = R.y + R.h / 2, hw = R.w / 2, hh = R.h / 2, small = w < 600;
      const LIT_ON = Math.round(0.318 * 66), LIT_CLOUD = Math.round(0.136 * 66); // 21 and 9 of the 66 decisions
      const seat = (i, m) => { const th = (i / m) * 6.2832; return [cx + Math.cos(th) * hw * 0.78, cy + Math.sin(th) * hh * 0.62]; };
      // 0 the meeting: a ring of seats round a table
      const home = [];
      for (let i = 0; i < n; i++) { const th = (i / n) * 6.2832 + r() * 0.2, rho = 0.8 + 0.2 * r(), x = cx + Math.cos(th) * hw * 0.92 * rho, y = cy + Math.sin(th) * hh * 0.78 * rho; home.push([x, y]); set(0, i, x, y, 0.85, 3, 0); }
      // 1 listen: a waveform, then a row of word blocks
      const nw = Math.round(n * 0.35), cols = Math.ceil(nw / 2);
      for (let i = 0; i < n; i++) {
        if (i < nw) { const col = i >> 1, amp = 0.05 + 0.17 * Math.abs(Math.sin(col * 0.5) * Math.sin(col * 0.17 + 1)); set(1, i, R.x + R.w * (0.05 + 0.9 * col / (cols - 1)), cy - 0.27 * R.h + (i % 2 ? 1 : -1) * amp * R.h, 0.95, 3, 0); }
        else if (i - nw < 112) { const j = i - nw, b = j >> 3, k = j & 7, row = b < 7 ? 0 : 1, bc = b % 7; set(1, i, R.x + R.w * (0.06 + bc * 0.13) + (k % 4) * R.w * 0.024, cy + R.h * (0.04 + row * 0.15) + (k >> 2) * R.h * 0.05, 0.95, 3.4, 0); }
        else set(1, i, home[i][0], home[i][1], 0.1, 2, 0);
      }
      // 2 retrieve: guideline pages in a grid; a query dot lights its three nearest pages
      const pages = [], qx = R.x + R.w * 0.1, qy = cy;
      for (let p = 0; p < 20; p++) pages.push([R.x + R.w * (0.36 + (p % 5) * 0.12), R.y + R.h * (0.1 + (p / 5 | 0) * 0.2)]);
      const near3 = pages.map((p, k) => [Math.hypot(p[0] + R.w * 0.03 - qx, p[1] + R.h * 0.04 - qy), k]).sort((a, b) => a[0] - b[0]).slice(0, 3).map((x) => x[1]);
      for (let i = 0; i < n; i++) {
        if (i < 120) { const p = i / 6 | 0, k = i % 6; set(2, i, pages[p][0] + (k % 2) * R.w * 0.026, pages[p][1] + (k >> 1) * R.h * 0.04, 0.95, 3, near3.includes(p) ? 1 : 0); }
        else if (i === 120) set(2, i, qx, qy, 1, 8, 1);
        else { const p = pages[i % 20]; set(2, i, p[0] + R.w * 0.013, p[1] + R.h * 0.04, 0, 2, 0); }
      }
      // 3 reason, on one device: every dot inside one rounded box
      const dw = R.w * 0.8, dh = R.h * 0.6, dev = [];
      for (let i = 0; i < n; i++) { const x = cx + (r() - 0.5) * dw * 0.9, y = cy + (r() - 0.5) * dh * 0.86; dev.push([x, y]); set(3, i, x, y, 0.9, 2.8, 0); }
      // 4 the test: exactly 66 dots in a grid; the rest fade
      const cell = Math.min(R.w * 0.6 / 11, R.h * 0.5 / 6), gx = (k, ox) => ox + ((k % 11) - 5) * cell, gy = (k) => cy + ((k / 11 | 0) - 2.5) * cell;
      for (let i = 0; i < n; i++) { if (i < 66) set(4, i, gx(i, cx), gy(i), 1, cell * 0.3, 0); else if (i < 132) set(4, i, gx(i - 66, cx), gy(i - 66), 0, cell * 0.3, 0); else set(4, i, dev[i][0], dev[i][1], 0, 2, 0); }
      // 5 the result: two copies of the 66; 21 lit on the left, 9 on the right
      const cell2 = Math.min(R.w * 0.38 / 11, R.h * 0.42 / 6), lx = cx - R.w * 0.25, rx = cx + R.w * 0.25, gy2 = (k) => cy + ((k / 11 | 0) - 2.5) * cell2;
      for (let i = 0; i < n; i++) {
        if (i < 66) set(5, i, lx + ((i % 11) - 5) * cell2, gy2(i), i < LIT_ON ? 1 : 0.5, cell2 * 0.3, i < LIT_ON ? 1 : 0);
        else if (i < 132) { const k = i - 66; set(5, i, rx + ((k % 11) - 5) * cell2, gy2(k), k < LIT_CLOUD ? 1 : 0.5, cell2 * 0.3, k < LIT_CLOUD ? 1 : 0); }
        else set(5, i, dev[i][0], dev[i][1], 0, 2, 0);
      }
      // 6 clinicians stay in charge: 14 seats, 12 in one tone and 2 in another
      for (let i = 0; i < n; i++) { if (i < 14) { const [x, y] = seat(i, 14); set(6, i, x, y, 1, 9, i >= 12 ? 1 : 0); } else set(6, i, home[i][0], home[i][1], 0, 2, 0); }

      const near = (cur, k) => clamp(1 - Math.abs(cur - k), 0, 1);
      const font = `500 ${small ? 12 : 14}px "Instrument Sans", sans-serif`;
      return (c, cur, t) => {
        // overlays sit under the dots
        const tab = clamp(near(cur, 0) + near(cur, 6), 0, 1);
        if (tab > 0.02) {
          c.strokeStyle = PAPER; c.lineWidth = 1.5; c.globalAlpha = 0.35 * tab; c.beginPath(); c.ellipse(cx, cy, hw * 0.5, hh * 0.36, 0, 0, 6.2832); c.stroke();
          const n0 = near(cur, 0);
          if (n0 > 0.02) for (let j = 0; j < 3; j++) { const ph = (((t || 1200) * 0.0004) + j / 3) % 1; c.globalAlpha = 0.28 * n0 * (1 - ph); c.beginPath(); c.ellipse(cx, cy, hw * (0.1 + 0.55 * ph), hh * (0.07 + 0.4 * ph), 0, 0, 6.2832); c.stroke(); }
        }
        // the word-error-rate bar shrinks to 75.6% of its length
        const wb = clamp(1 - Math.abs(cur - 1) * 1.7, 0, 1);
        if (wb > 0.02) {
          const bw = R.w * 0.8, bx = cx - bw / 2, by = cy + R.h * 0.38, k = lerp(1, 0.756, ease(clamp((cur - 0.7) / 0.3, 0, 1)));
          c.globalAlpha = wb; c.fillStyle = PAPER; c.font = font; c.fillText('word error rate', bx, by - 10);
          c.globalAlpha = 0.22 * wb; c.fillRect(bx, by, bw, 8);
          c.globalAlpha = wb; c.fillStyle = SIGNAL; c.fillRect(bx, by, bw * k, 8);
          c.fillStyle = PAPER; c.textAlign = 'right'; c.fillText(k < 0.999 ? `${(k * 100).toFixed(1)}%` : '100%', bx + bw, by - 10); c.textAlign = 'left';
        }
        const n2 = near(cur, 2);
        if (n2 > 0.02) { c.strokeStyle = SIGNAL; c.lineWidth = 1.5; c.globalAlpha = 0.7 * n2; c.beginPath(); for (const k of near3) { c.moveTo(qx, qy); c.lineTo(pages[k][0] + R.w * 0.013, pages[k][1] + R.h * 0.04); } c.stroke(); }
        const n3 = near(cur, 3);
        if (n3 > 0.02) {
          const x0 = cx - dw / 2, y0 = cy - dh / 2, pad = 16, rr = 22;
          c.strokeStyle = PAPER; c.lineWidth = 2; c.globalAlpha = 0.55 * n3; c.beginPath(); c.roundRect(x0, y0, dw, dh, rr); c.stroke();
          c.setLineDash([6, 7]); c.strokeStyle = SIGNAL; c.globalAlpha = 0.8 * n3; c.beginPath(); c.roundRect(x0 - pad, y0 - pad, dw + 2 * pad, dh + 2 * pad, rr + pad); c.stroke(); c.setLineDash([]);
          // a packet heads for the outside world and stops at the boundary
          const kk = ((t === 0 || t === undefined ? 3000 * 0.8 : t) % 3000) / 3000, e = ease(clamp(kk / 0.55, 0, 1)), px = lerp(cx, x0 + dw + pad, e), py = cy;
          c.globalAlpha = n3; c.fillStyle = SIGNAL; c.beginPath(); c.arc(px, py, 6, 0, 6.2832); c.fill();
          if (kk > 0.55) { c.fillStyle = PAPER; c.font = font; c.textAlign = 'center'; c.fillText('Stopped at the boundary', cx, y0 + dh + pad + 26); c.textAlign = 'left'; }
        }
        const n5 = near(cur, 5);
        if (n5 > 0.02) { c.globalAlpha = n5; c.fillStyle = PAPER; c.font = font; c.textAlign = 'center'; c.fillText('On-device MedGemma + RAG', lx, cy + 3.9 * cell2); c.fillText('Cloud chatbot baseline', rx, cy + 3.9 * cell2); c.textAlign = 'left'; }
        c.globalAlpha = 1;
        F.draw(c, cur);
      };
    },
  });

  /* ---------- 10. SIMULATOR: 100 homes, the paper's estimates ---------- */
  (() => {
    const cv = $('#simCanvas'), pctEl = $('#simPct'), textEl = $('#simText'), dayEl = $('#simDay');
    const VAR = { all: { sar: 0.16, si: 6.49, name: '', pct: '16%' }, alpha: { sar: 0.148, si: 6.67, name: 'Alpha', pct: '14.8%' }, delta: { sar: 0.154, si: 6.61, name: 'Delta', pct: '15.4%' }, omicron: { sar: 0.223, si: 6.1, name: 'Omicron', pct: '22.3%' } };
    const DAYS = 21, MSDAY = 170;
    let v = 'all', size = 4, homes = [], day = 0, t0 = 0, running = false, c, w, h, ran = false;
    const run = () => {
      const p = VAR[v];
      homes = Array.from({ length: 100 }, () => [0].concat(Array.from({ length: size - 1 }, () => (Math.random() < p.sar ? Math.max(1, Math.round(p.si + (Math.random() + Math.random() + Math.random() - 1.5) * 2.4)) : Infinity))));
      day = STATIC ? DAYS : 0; t0 = performance.now(); running = !STATIC; ran = true;
      if (STATIC) { draw(); finish(); } else kick();
    };
    const finish = () => {
      const contacts = 100 * (size - 1), inf = homes.reduce((s, hm) => s + hm.slice(1).filter((d) => d <= DAYS).length, 0);
      const p = VAR[v];
      pctEl.textContent = `${Math.round(inf / contacts * 100)}%`;
      textEl.textContent = `of ${contacts} household contacts infected by day ${DAYS}. The paper’s estimate${p.name ? ' for ' + p.name : ''}: ${p.pct}.`;
    };
    const draw = (t) => {
      if (!c) return;
      if (running) { day = Math.min(DAYS, (t - t0) / MSDAY); if (day >= DAYS) { running = false; finish(); } }
      dayEl.textContent = `Day ${Math.floor(day)}`;
      c.clearRect(0, 0, w, h);
      const cols = 10, rows = 10, pad = w * 0.035, cw = (w - pad * 2) / cols, ch = (h - pad * 2) / rows;
      const gx = size <= 3 ? size : 3, gy = Math.ceil(size / gx), dot = Math.min(cw / (gx + 1.4), ch / (gy + 1.4)) * 0.42;
      for (let k = 0; k < 100; k++) {
        const hx = pad + (k % cols) * cw, hy = pad + ((k / cols) | 0) * ch;
        c.fillStyle = '#1e211e'; c.beginPath(); c.roundRect ? c.roundRect(hx + cw * 0.08, hy + ch * 0.08, cw * 0.84, ch * 0.84, cw * 0.16) : c.rect(hx + cw * 0.08, hy + ch * 0.08, cw * 0.84, ch * 0.84); c.fill();
        const hm = homes[k];
        for (let j = 0; j < size; j++) {
          const px = hx + cw * 0.5 + ((j % gx) - (gx - 1) / 2) * dot * 2.6, py = hy + ch * 0.5 + (((j / gx) | 0) - (gy - 1) / 2) * dot * 2.6;
          const d = hm ? hm[j] : Infinity, lit = d <= day;
          const pop = lit && j > 0 ? clamp(1.6 - (day - d) * 0.6, 1, 1.6) : 1;
          c.fillStyle = lit ? SIGNAL : 'rgba(241,238,230,.28)';
          c.beginPath(); c.arc(px, py, dot * pop, 0, 6.2832); c.fill();
          if (j === 0 && hm) { c.strokeStyle = SIGNAL; c.lineWidth = 1.5; c.beginPath(); c.arc(px, py, dot * 1.7, 0, 6.2832); c.stroke(); }
        }
      }
    };
    const pick = (group, attr, cb) => $$(`#${group} button`).forEach((b) => b.addEventListener('click', () => { $$(`#${group} button`).forEach((x) => x.setAttribute('aria-pressed', String(x === b))); cb(b.dataset[attr]); run(); }));
    pick('segVar', 'v', (x) => { v = x; });
    pick('segSize', 'n', (x) => { size = +x; });
    $('#simRun').addEventListener('click', run);
    const build = () => { ({ c, w, h } = fit(cv)); draw(performance.now()); };
    build(); onResize(build);
    addScene(cv, (t) => draw(t));
    new IntersectionObserver((es, o) => { if (es[0].isIntersecting && !ran) { run(); o.disconnect(); } }, { threshold: 0.35 }).observe(cv);
  })();


  /* ---------- 12. MORE WORK: horizontal track with live illustrations ---------- */
  (() => {
    const VIZ = {
      sphere(c, w, h, t) {
        if (!this.p) { const r = rng(5); this.p = Array.from({ length: 420 }, (_, i) => { const y = 1 - (i / 419) * 2, rr = Math.sqrt(1 - y * y), th = i * 2.39996; const x = Math.cos(th) * rr, z = Math.sin(th) * rr; const j = r() * 0.25; return [x + j * 0.2, y, z, x * 0.6 + y * 0.8 + z * 0.1 > 0 ? 1 : 0]; }); }
        const a = t * 0.00035, cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.38;
        for (const [x, y, z, k] of this.p) { const X = x * Math.cos(a) - z * Math.sin(a), Z = x * Math.sin(a) + z * Math.cos(a); const s = 1.2 + (Z + 1) * 1.3; c.globalAlpha = 0.25 + (Z + 1) * 0.37; c.fillStyle = k ? SIGNAL : PAPER; c.fillRect(cx + X * R - s / 2, cy + y * R - s / 2, s, s); }
        c.globalAlpha = 1;
      },
      spikes(c, w, h, t) {
        const bw = 5, gap = 3, n = Math.ceil(w / (bw + gap)) + 1, off = (t * 0.03) % (bw + gap), base = h * 0.78;
        for (let i = 0; i < n; i++) {
          const k = Math.floor(t * 0.03 / (bw + gap)) + i;
          const v = 0.12 + 0.1 * Math.abs(Math.sin(k * 1.7)) + (k % 37 === 0 ? 0.62 : k % 37 === 1 || k % 37 === 36 ? 0.3 : 0);
          c.fillStyle = v > 0.4 ? SIGNAL : 'rgba(241,238,230,.45)';
          c.fillRect(i * (bw + gap) - off, base - v * h * 0.8, bw, v * h * 0.8);
        }
      },
      lines(c, w, h, t) {
        const T = t * 0.0006;
        const f = (x, ph) => Math.sin(x * 0.012 + T + ph) * 0.5 + Math.sin(x * 0.027 - T * 1.3 + ph) * 0.3;
        [[PAPER, 0, 0], [SIGNAL, 0.35, 0.12]].forEach(([col, ph, sh]) => { c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); for (let x = 0; x <= w; x += 6) { const y = h * 0.5 - f(x, ph) * h * 0.3 + sh * h; x ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); });
      },
      graph(c, w, h, t) {
        if (!this.g) { const r = rng(9); const nodes = Array.from({ length: 26 }, () => [0.08 + r() * 0.84, 0.1 + r() * 0.8]); const edges = []; nodes.forEach((a, i) => { nodes.map((b, j) => [j, (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2]).filter(([j]) => j !== i).sort((p, q) => p[1] - q[1]).slice(0, 2).forEach(([j]) => edges.push([i, j])); }); const order = [0]; const seen = new Set(order); for (let k = 0; k < order.length; k++) edges.forEach(([a, b]) => { if (a === order[k] && !seen.has(b)) { seen.add(b); order.push(b); } if (b === order[k] && !seen.has(a)) { seen.add(a); order.push(a); } }); this.g = { nodes, edges, order }; }
        const { nodes, edges, order } = this.g, hop = Math.floor((t * 0.0022) % (order.length + 6)), on = new Set(order.slice(0, hop));
        c.lineWidth = 1.5;
        edges.forEach(([a, b]) => { c.strokeStyle = on.has(a) && on.has(b) ? SIGNAL : 'rgba(241,238,230,.18)'; c.beginPath(); c.moveTo(nodes[a][0] * w, nodes[a][1] * h); c.lineTo(nodes[b][0] * w, nodes[b][1] * h); c.stroke(); });
        nodes.forEach(([x, y], i) => { c.fillStyle = on.has(i) ? SIGNAL : PAPER; c.beginPath(); c.arc(x * w, y * h, on.has(i) ? 6 : 4, 0, 6.2832); c.fill(); });
      },
      records(c, w, h, t) {
        const cols = 27, rows = Math.ceil(538 / cols), cell = Math.min(w * 0.86 / cols, h * 0.84 / rows), ox = (w - cols * cell) / 2, oy = (h - rows * cell) / 2;
        for (let i = 0; i < 538; i++) { const x = i % cols, y = (i / cols) | 0; c.globalAlpha = 0.35 + 0.5 * (0.5 + 0.5 * Math.sin(t * 0.002 - (x + y) * 0.35)); c.fillStyle = PAPER; c.beginPath(); c.arc(ox + (x + 0.5) * cell, oy + (y + 0.5) * cell, cell * 0.3, 0, 6.2832); c.fill(); }
        c.globalAlpha = 1;
      },
    };
    $$('[data-viz]').forEach((cv) => {
      const fn = VIZ[cv.dataset.viz]; const ctx = {};
      let c, w, h;
      const build = () => { ({ c, w, h } = fit(cv)); if (STATIC) { c.clearRect(0, 0, w, h); fn.call(ctx, c, w, h, 2400); } };
      build(); onResize(build);
      if (!STATIC) addScene(cv, (t) => { c.clearRect(0, 0, w, h); fn.call(ctx, c, w, h, t); });
    });
    if (!STATIC && hasGSAP && DESK) {
      const track = $('#moreTrack'), dist = () => Math.max(0, track.scrollWidth - innerWidth);
      gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '#moreView', start: () => 'center ' + (barH() + (innerHeight - barH()) / 2), end: () => '+=' + dist(), pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true } });
    }
  })();

  /* ---------- PAPERS: filter by type ---------- */
  (() => {
    const btns = $$('#pfilter button'), groups = $$('.pg[data-cat]');
    btns.forEach((b) => b.addEventListener('click', () => {
      btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      groups.forEach((g) => { g.hidden = b.dataset.f !== 'all' && g.dataset.cat !== b.dataset.f; });
      if (hasGSAP) ScrollTrigger.refresh();
    }));
  })();

  /* ---------- the iris into the light chapter ---------- */
  if (!STATIC && hasGSAP) {
    gsap.fromTo('#papers', { clipPath: 'circle(8% at 50% 0%)' }, { clipPath: 'circle(150% at 50% 0%)', ease: 'none', scrollTrigger: { trigger: '#papers', start: 'top bottom', end: 'top 25%', scrub: true } });
  }
})();
