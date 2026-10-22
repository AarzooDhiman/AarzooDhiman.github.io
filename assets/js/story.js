/* Aarzoo Dhiman · scroll stories: one pinned stage, one canvas of dots, one step of text at a time.
   Shared by the npj funnel and the MDT story so the two behave identically.
   scrollStory({ stage, canvas, steps, prog, makeRenderer })
     makeRenderer(w, h, still) returns draw(ctx, cur, t): paint the dots for step position `cur` (0 .. steps-1, fractional while scrubbing). */
(() => {
  'use strict';
  const { $, STATIC, SIGNAL, PAPER, clamp, lerp, ease, hasGSAP, addScene, kick, fit, onResize, countUp } = window.AD;

  /* A set of S formations over n dots. set() records where dot i sits (and how it looks) in formation s;
     draw() morphs between neighbouring formations, each dot a little later than the last. */
  const formations = (n, S) => {
    const X = new Float32Array(S * n), Y = new Float32Array(S * n), A = new Float32Array(S * n), Z = new Float32Array(S * n), C = new Uint8Array(S * n);
    const set = (s, i, x, y, a, z, col) => { const k = s * n + i; X[k] = x; Y[k] = y; A[k] = a; Z[k] = z; C[k] = col; };
    const draw = (c, cur) => {
      const a = clamp(Math.floor(cur), 0, S - 1), b = Math.min(S - 1, a + 1), f = cur - a;
      for (let col = 0; col < 2; col++) {
        c.fillStyle = col ? SIGNAL : PAPER;
        for (let i = 0; i < n; i++) {
          const d = ((i * 2654435761) % 1000) / 1000 * 0.35;
          const e = ease(clamp((f - d) / 0.65, 0, 1));
          const ka = a * n + i, kb = b * n + i;
          if ((e < 0.5 ? C[ka] : C[kb]) !== col) continue;
          const al = lerp(A[ka], A[kb], e); if (al < 0.02) continue;
          const x = lerp(X[ka], X[kb], e), y = lerp(Y[ka], Y[kb], e), z = lerp(Z[ka], Z[kb], e);
          c.globalAlpha = al;
          if (z > 3.2) { c.beginPath(); c.arc(x, y, z, 0, 6.2832); c.fill(); } else c.fillRect(x - z / 2, y - z / 2, z, z);
        }
      }
      c.globalAlpha = 1;
    };
    return { set, draw };
  };

  const scrollStory = ({ stage, canvas, steps, prog, makeRenderer }) => {
    const S = steps.length, barH = () => $('#bar').offsetHeight;
    let c, w, h, render, cur = STATIC ? S - 1 : 0, target = cur, shown = -1;
    const showStep = (k) => {
      if (k === shown) return;
      shown = k;
      steps.forEach((s, i) => s.classList.toggle('on', i === k));
      prog.textContent = `${k + 1} of ${S}`;
      countUp($('.num', steps[k]), 900);
    };
    // reduced motion: every step is a plain list item with its own still frame
    const stills = () => steps.forEach((li, i) => {
      let cv = $('.story__still', li);
      if (!cv) { cv = document.createElement('canvas'); cv.className = 'story__still'; cv.setAttribute('aria-hidden', 'true'); li.append(cv); }
      const m = fit(cv);
      makeRenderer(m.w, m.h, true)(m.c, i, 0);
    });
    const build = () => { ({ c, w, h } = fit(canvas)); render = makeRenderer(w, h, false); if (STATIC) stills(); };
    const draw = (t) => {
      cur = STATIC ? S - 1 : cur + (target - cur) * 0.14;
      c.clearRect(0, 0, w, h);
      render(c, cur, t);
      showStep(Math.round(cur));
    };
    build();
    if (STATIC) { steps.forEach((s) => s.classList.add('on')); return; }
    addScene(stage, draw);
    onResize(() => { build(); if (hasGSAP) ScrollTrigger.refresh(); });
    if (hasGSAP) {
      ScrollTrigger.create({ trigger: stage, start: () => 'top ' + barH(), end: () => '+=' + Math.round(innerHeight * (S - 1) * 0.8), pin: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true, onUpdate: (s) => { target = s.progress * (S - 1); kick(); } });
    } else {
      new IntersectionObserver((es) => { for (const e of es) if (e.isIntersecting) target = S - 1; }, { threshold: 0.5 }).observe(stage);
    }
  };

  window.AD.formations = formations;
  window.AD.scrollStory = scrollStory;
})();
