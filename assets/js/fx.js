/* Blog interaction effects (cursor, click ripple, trail, progress bar,
 * typing subtitle, card reveal, background particles, sidebar power trace).
 * Motion effects are skipped when the OS asks for reduced motion;
 * cursor effects only run on devices with a fine pointer (mouse). */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#e879b9';
  const el = (tag, cls, parent = document.body) => { const e = document.createElement(tag); if (cls) e.className = cls; parent.appendChild(e); return e; };

  /* 1. custom cursor: dot + lagging ring that grows over links */
  if (fine && !reduce) {
    document.documentElement.classList.add('fx-cursor');
    const dot = el('div', 'fx-dot'), ring = el('div', 'fx-ring');
    let x = -100, y = -100, rx = x, ry = y;
    addEventListener('mousemove', (e) => {
      x = e.clientX; y = e.clientY;
      dot.style.transform = `translate(${x}px, ${y}px)`;
      ring.classList.toggle('fx-big', !!e.target.closest('a, button, input, label, [role="button"], .card-wrapper'));
    });
    document.addEventListener('mouseleave', () => { dot.style.opacity = ring.style.opacity = 0; });
    document.addEventListener('mouseenter', () => { dot.style.opacity = ring.style.opacity = 1; });
    (function loop() {
      rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(loop);
    })();

    /* 2. sparkle trail */
    let last = 0;
    addEventListener('mousemove', (e) => {
      const now = performance.now(); if (now - last < 40) return; last = now;
      const s = el('span', 'fx-spark'); s.textContent = Math.random() < 0.5 ? '✦' : '•';
      s.style.left = e.clientX + 'px'; s.style.top = e.clientY + 'px';
      s.style.color = Math.random() < 0.5 ? css('--link-color') : '#b794f6';
      setTimeout(() => s.remove(), 800);
    });
  }

  /* 3. click ripple */
  if (!reduce) {
    addEventListener('click', (e) => {
      const r = el('span', 'fx-ripple');
      r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px';
      setTimeout(() => r.remove(), 600);
    });
  }

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
        wg.clearRect(0, 0, 260, 70);
        ['rgba(255,255,255,.75)', 'rgba(255,255,255,.35)'].forEach((s, k) => {
          wg.strokeStyle = s; wg.lineWidth = 1.2; wg.beginPath();
          for (let x = 0; x <= 260; x += 2) {
            const q = x + t * 1.2 + k * 40, spike = Math.floor(q / 37) % 5 === 0 ? Math.sin(q * 1.3) * 18 : 0;
            const y = 38 + k * 8 + Math.sin(q * 0.08) * 6 + Math.sin(q * 0.31) * 3 + spike;
            x ? wg.lineTo(x, y) : wg.moveTo(x, y);
          }
          wg.stroke();
        });
      }
      requestAnimationFrame(loop);
    })();
  });
})();
