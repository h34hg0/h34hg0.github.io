/* Blog interaction effects (cursor, click ripple, trail, progress bar,
 * typing subtitle, card reveal, background particles, sidebar power trace,
 * chip buddy whose eyes follow the cursor).
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
      ring.classList.toggle('fx-big', !!(e.target.closest && e.target.closest('a, button, input, label, [role="button"], .card-wrapper, .fx-buddy')));
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


    /* 10. chip buddy (bottom-right): eyes follow the cursor, blinks, talks on click */
    if (innerWidth >= 768) {
      const b = el('div', 'fx-buddy');
      b.innerHTML = `
        <div class="fx-bubble"></div>
        <svg viewBox="0 0 80 80" width="64" height="64" aria-hidden="true">
          <g fill="#c9ccd1">${[22, 34, 46, 58].map((y) => `<rect x="4" y="${y - 3}" width="8" height="6" rx="1"/><rect x="68" y="${y - 3}" width="8" height="6" rx="1"/>`).join('')}</g>
          <rect x="12" y="10" width="56" height="60" rx="9" fill="#1f1a2e" stroke="#e879b9" stroke-width="2.5"/>
          <circle cx="20" cy="18" r="2.2" fill="#e879b9"/>
          <g class="fx-eyes">
            <ellipse cx="30" cy="36" rx="8" ry="9" fill="#fff"/><ellipse cx="50" cy="36" rx="8" ry="9" fill="#fff"/>
            <g class="fx-pupils"><circle cx="30" cy="37" r="4" fill="#16131f"/><circle cx="50" cy="37" r="4" fill="#16131f"/>
              <circle cx="31.5" cy="35.5" r="1.3" fill="#fff"/><circle cx="51.5" cy="35.5" r="1.3" fill="#fff"/></g>
          </g>
          <ellipse cx="22" cy="49" rx="4" ry="2.3" fill="#e879b9" opacity=".45"/><ellipse cx="58" cy="49" rx="4" ry="2.3" fill="#e879b9" opacity=".45"/>
          <path class="fx-mouth" d="M34 52 Q40 57 46 52" stroke="#e879b9" stroke-width="2.4" fill="none" stroke-linecap="round"/>
          <text x="40" y="66" text-anchor="middle" font-size="7" font-family="monospace" fill="#b79ad6">h34</text>
        </svg>`;
      const pupils = b.querySelector('.fx-pupils'), eyes = b.querySelector('.fx-eyes'), bubble = b.querySelector('.fx-bubble');
      addEventListener('mousemove', (e) => {
        const r = b.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height * 0.45;
        const a = Math.atan2(e.clientY - cy, e.clientX - cx), d = Math.min(3.5, Math.hypot(e.clientX - cx, e.clientY - cy) / 40);
        pupils.setAttribute('transform', `translate(${(Math.cos(a) * d).toFixed(2)} ${(Math.sin(a) * d).toFixed(2)})`);
      });
      const blink = () => { eyes.classList.add('fx-blink'); setTimeout(() => eyes.classList.remove('fx-blink'), 140); setTimeout(blink, 2500 + Math.random() * 4000); };
      setTimeout(blink, 2000);
      const lines = ['트레이스 더 모아볼까?', '키 찾았다! 0x2B', 'TVLA |t| > 4.5 ⚠️', '해밍 가중치 몇이게?', '7.37 MHz로 달리는 중', 'CPA 돌리는 중...', '마스킹은 반칙이야'];
      let hide;
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        bubble.textContent = lines[(Math.random() * lines.length) | 0];
        b.classList.remove('fx-hop'); void b.offsetWidth; b.classList.add('fx-hop', 'fx-talk');
        clearTimeout(hide); hide = setTimeout(() => b.classList.remove('fx-talk'), 2200);
      });
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
    /* realistic power trace: a sharp spike + ringing decay every clock cycle,
       AES-like round envelope (SubBytes / ShiftRows / MixColumns / AddRoundKey),
       data-dependent (Hamming weight) amplitude, baseline wander and noise. */
    const makeTrace = (n, seed) => {
      let s = seed; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
      const gauss = () => { let u = 0; for (let i = 0; i < 6; i++) u += rnd(); return u - 3; };
      const spc = 5, roundLen = 46, out = new Float32Array(n);
      for (let c = 0; c * spc < n; c++) {
        const r = c % roundLen;
        const env = (r < 16 ? 1.0 : r < 20 ? 0.45 : r < 36 ? 1.25 : 0.7) * (c % (roundLen * 10) < roundLen * 9 ? 1 : 0.6);
        const A = (0.55 + 0.45 * ((rnd() * 9) | 0) / 8) * env;
        for (let k = 0; k < spc && c * spc + k < n; k++)
          out[c * spc + k] = (k === 0 ? -A : k === 1 ? A * 0.55 : A * 0.35 * Math.exp(-k * 0.9) * Math.cos(k * 2.2)) + 0.06 * gauss();
      }
      let w = 0; for (let i = 0; i < n; i++) { w = (w + 0.02 * (rnd() - 0.5)) * 0.995; out[i] += w; }
      return out;
    };
    const TR1 = makeTrace(6000, 11), TR2 = makeTrace(6000, 29);

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
        [[TR2, '#3b9bff', 300, 40, 22], [TR1, '#ff3355', 0, 35, 26]].forEach(([d, c, off, mid, amp]) => {
          wg.strokeStyle = c; wg.lineWidth = 1.2; wg.shadowColor = 'rgba(0,0,0,.45)'; wg.shadowBlur = 3; wg.beginPath();
          for (let x = 0; x <= 260; x++) {
            const y = mid + d[(Math.floor(x * 1.4) + t * 2 + off) % d.length] * amp;
            x ? wg.lineTo(x, y) : wg.moveTo(x, y);
          }
          wg.stroke();
        });
      }
      requestAnimationFrame(loop);
    })();
  });
})();
