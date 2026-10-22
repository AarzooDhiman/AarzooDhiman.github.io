/* Aarzoo Dhiman · Funding & talks: the year rail draws in as you scroll, the amount counts up once, filter chips re-flow the cards. */
(() => {
  'use strict';
  const { $, $$, STATIC, hasGSAP, countUp } = window.AD;

  /* the rail draws in with the scroll (a still, full rail under reduced motion) */
  const rail = $('#rail');
  if (!STATIC && hasGSAP) {
    rail.style.setProperty('--p', 0);
    ScrollTrigger.create({ trigger: rail, start: 'top 75%', end: 'bottom 75%', scrub: true, onUpdate: (s) => rail.style.setProperty('--p', s.progress) });
  }

  /* the NHS award counts up once */
  const amount = $('#amount');
  if (amount && !STATIC) new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { countUp(amount, 1300); o.disconnect(); } }, { threshold: 0.6 }).observe(amount);

  /* filter chips: All, Funding, Awards, Talks. A short FLIP: cards that stay glide to their new place, new ones fade in. */
  const chips = $$('#ffilter button'), entries = $$('.entry'), secs = $$('.fsec');
  const apply = (f) => {
    const show = (el) => f === 'all' || el.dataset.kind === f;
    const first = new Map(entries.filter((e) => !e.hidden).map((e) => [e, e.getBoundingClientRect().top]));
    entries.forEach((e) => { e.hidden = !show(e); });
    secs.forEach((s) => { s.hidden = !show(s); });
    if (!STATIC && entries[0].animate) {
      const ease = 'cubic-bezier(.22,1,.36,1)';
      entries.forEach((e) => {
        if (e.hidden) return;
        const was = first.get(e);
        if (was === undefined) e.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 320, delay: 40, easing: ease, fill: 'backwards' });
        else { const dy = was - e.getBoundingClientRect().top; if (Math.abs(dy) > 1) e.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 320, easing: ease }); }
      });
    }
    if (hasGSAP) ScrollTrigger.refresh();
  };
  chips.forEach((b) => b.addEventListener('click', () => { chips.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); apply(b.dataset.f); }));
})();
