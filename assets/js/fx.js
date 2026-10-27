/* Blog interaction effects (progress bar, typing subtitle, card reveal, background particles, sidebar power trace).
 * Motion effects are skipped when the OS asks for reduced motion. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#e879b9';
  const el = (tag, cls, parent = document.body) => { const e = document.createElement(tag); if (cls) e.className = cls; parent.appendChild(e); return e; };

  /* 1-3. cursor: plain pink arrow, pure CSS (see .scss) */

  document.addEventListener('DOMContentLoaded', () => {
    /* 4. reading progress bar (post pages only) */
    if (location.pathname.includes('/posts/')) {
      const bar = el('div', 'fx-progress');
      const upd = () => { const h = document.documentElement; bar.style.width = (h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)) * 100 + '%'; };
      addEventListener('scroll', upd, { passive: true }); upd();
    }

    /* 5. typing subtitle */
    const sub = document.querySelector('#sidebar .site-subtitle');
    if (sub && !reduce) {
      const txt = sub.textContent.trim(); sub.textContent = '';
      const t = el('span', '', sub); el('span', 'fx-caret', sub);
      let i = 0; const iv = setInterval(() => { t.textContent = txt.slice(0, ++i); if (i >= txt.length) clearInterval(iv); }, 60);
    }

    /* 6. card reveal on scroll */
    const cards = document.querySelectorAll('#post-list .card-wrapper, #post-list > .card-wrapper');
    if (cards.length && !reduce && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('fx-in'); io.unobserve(e.target); } }), { threshold: 0.15 });
      cards.forEach((c, i) => { c.classList.add('fx-reveal'); c.style.transitionDelay = Math.min(i, 4) * 60 + 'ms'; io.observe(c); });
    }


    if (reduce) return;

    /* 9a. background particle network */
    const cv = el('canvas', 'fx-particles'), g = cv.getContext('2d');
    let W, H; const N = Math.min(60, Math.floor(innerWidth / 25));
    const resize = () => { W = cv.width = innerWidth; H = cv.height = innerHeight; };
    resize(); addEventListener('resize', resize);
    const P = Array.from({ length: N }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35 }));
    const rgb = (hex) => { const c = document.createElement('canvas').getContext('2d'); c.fillStyle = hex; const v = c.fillStyle; return v.startsWith('#') ? [1, 3, 5].map((k) => parseInt(v.slice(k, k + 2), 16)).join(',') : '232,121,185'; };

    /* 9b. power-trace wave at the bottom of the sidebar */
    const sb = document.getElementById('sidebar');
    const wv = sb ? el('canvas', 'fx-wave', sb) : null, wg = wv && wv.getContext('2d');
    if (wv) { wv.width = 260; wv.height = 70; }
    /* streaming power trace that never repeats: a random "program" of segments
       (idle / AES round: SubBytes, ShiftRows, MixColumns, AddRoundKey / memcpy / branchy code),
       clock jitter, data-dependent heavy-tailed spike heights, ringing, occasional big
       peaks, baseline wander and noise. */
    const makeStream = (seed) => {
      let s = seed >>> 0 || 1;
      const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
      const gauss = () => { let u = 0; for (let i = 0; i < 6; i++) u += rnd(); return u - 3; };
      const pick = (o) => { let r = rnd() * o.reduce((a, b) => a + b[1], 0); for (const [k, w] of o) if ((r -= w) <= 0) return k; return o[0][0]; };
      const buf = []; let wander = 0, seg = null, left = 0;
      const SEG = {
        idle:  { cyc: [20, 90],  amp: 0.15, dens: 0.35 },
        sbox:  { cyc: [16, 16],  amp: 1.0,  dens: 1.0 },
        shift: { cyc: [4, 6],    amp: 0.45, dens: 0.8 },
        mix:   { cyc: [16, 20],  amp: 1.3,  dens: 1.0 },
        ark:   { cyc: [8, 10],   amp: 0.75, dens: 0.9 },
        mem:   { cyc: [10, 40],  amp: 0.6,  dens: 0.95 },
        branch:{ cyc: [6, 24],   amp: 0.9,  dens: 0.55 },
      };
      const ROUND = ['sbox', 'shift', 'mix', 'ark'];
      let roundStep = -1;
      const nextSeg = () => {
        if (roundStep >= 0 && roundStep < ROUND.length - 1 && rnd() < 0.9) { roundStep++; return ROUND[roundStep]; }
        roundStep = -1;
        const k = pick([['sbox', 4], ['idle', 3], ['mem', 2], ['branch', 2]]);
        if (k === 'sbox') roundStep = 0;
        return k;
      };
      const cycle = () => {
        if (left <= 0) { seg = nextSeg(); const c = SEG[seg].cyc; left = c[0] + Math.floor(rnd() * (c[1] - c[0] + 1)); }
        left--;
        const S = SEG[seg], per = 4 + Math.floor(rnd() * 3);              // clock jitter: 4..6 samples
        const fire = rnd() < S.dens;
        const hw = rnd() ** 0.7;                                          // data-dependent
        let A = fire ? S.amp * (0.35 + 0.9 * hw) : 0.05;
        if (rnd() < 0.015) A *= 2.2 + rnd();                              // rare big peak
        for (let k = 0; k < per; k++) {
          const v = k === 0 ? -A : k === 1 ? A * (0.4 + 0.3 * rnd()) : A * 0.3 * Math.exp(-k * 0.8) * Math.cos(k * 2.1 + rnd());
          wander = (wander + 0.025 * (rnd() - 0.5)) * 0.996;
          buf.push(v + wander + 0.05 * gauss());
        }
      };
      return () => { if (!buf.length) cycle(); return buf.shift(); };
    };
    const TN = 380, mkLine = (seed) => { const next = makeStream(seed), a = new Float32Array(TN); for (let i = 0; i < TN; i++) a[i] = next(); return { a, next, acc: 0 }; };
    const L1 = mkLine(Date.now() & 0xffff), L2 = mkLine((Date.now() >> 7) & 0xffff ^ 0x5bd1);
    const advance = (L, n) => { for (let i = 0; i < n; i++) { L.a.copyWithin(0, 1); L.a[TN - 1] = L.next(); } };

    let t = 0;
    (function loop() {
      t++;
      const col = rgb(css('--link-color'));
      g.clearRect(0, 0, W, H);
      for (const p of P) { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1; }
      for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
        const d = Math.hypot(P[i].x - P[j].x, P[i].y - P[j].y);
        if (d < 120) { g.strokeStyle = `rgba(${col},${(1 - d / 120) * 0.5})`; g.lineWidth = 0.6; g.beginPath(); g.moveTo(P[i].x, P[i].y); g.lineTo(P[j].x, P[j].y); g.stroke(); }
      }
      g.fillStyle = `rgba(${col},0.7)`; for (const p of P) { g.beginPath(); g.arc(p.x, p.y, 1.6, 0, 7); g.fill(); }

      if (wg) {
        advance(L1, 2); advance(L2, 2);
        wg.clearRect(0, 0, 260, 70);
        [[L2, '#3b9bff', 41, 20], [L1, '#ff3355', 35, 24]].forEach(([L, c, mid, amp]) => {
          wg.strokeStyle = c; wg.lineWidth = 1.2; wg.shadowColor = 'rgba(0,0,0,.45)'; wg.shadowBlur = 3; wg.beginPath();
          for (let x = 0; x <= 260; x++) {
            const y = mid + L.a[Math.min(TN - 1, Math.floor(x * 1.4))] * amp;
            x ? wg.lineTo(x, y) : wg.moveTo(x, y);
          }
          wg.stroke();
        });
      }
      requestAnimationFrame(loop);
    })();
  });
})();
