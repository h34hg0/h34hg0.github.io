/* Blog interaction effects (cursor, click ripple, trail, progress bar,
 * typing subtitle, card reveal, background particles, sidebar power trace,
 * Usagi buddy that looks at the cursor).
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


    /* 10. Usagi buddy (bottom-right): face looks toward the cursor, paws swap on key press,
       falls asleep after 25s without input, reacts + talks on click. */
    if (innerWidth >= 768) {
      const IMG = '/assets/img/buddy/';
      const b = el('div', 'fx-buddy');
      b.innerHTML = `<div class="fx-bubble"><span></span></div>
        <img class="fx-body" src="${IMG}body_base_1.webp" alt="">
        <img class="fx-face" src="${IMG}face_default.webp" alt="">`;
      const body = b.querySelector('.fx-body'), face = b.querySelector('.fx-face'), say = b.querySelector('.fx-bubble span');
      ['body_base_2', 'body_base_sleep_1', 'face_angry', 'face_sleep'].forEach((n) => { new Image().src = IMG + n + '.webp'; });
      let mood = 'idle', frame = 0, lastInput = Date.now(), moodTimer, hide;
      const setFace = (n) => { face.src = IMG + n + '.webp'; };
      const wake = () => { lastInput = Date.now(); if (mood === 'sleep') { mood = 'idle'; setFace('face_default'); body.src = IMG + (frame ? 'body_base_2' : 'body_base_1') + '.webp'; b.classList.remove('fx-sleep'); } };
      addEventListener('mousemove', (e) => {
        wake();
        const r = b.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height * 0.55;
        const a = Math.atan2(e.clientY - cy, e.clientX - cx), d = Math.min(1, Math.hypot(e.clientX - cx, e.clientY - cy) / 300);
        face.style.transform = `translate(${(Math.cos(a) * 5 * d).toFixed(1)}px, ${(Math.sin(a) * 4 * d).toFixed(1)}px)`;
      });
      /* typing: each key press swaps the paws (body_base_1 <-> body_base_2), like the desktop pet */
      addEventListener('keydown', () => {
        wake(); frame ^= 1; body.src = IMG + (frame ? 'body_base_2' : 'body_base_1') + '.webp';
        b.classList.remove('fx-tap'); void b.offsetWidth; b.classList.add('fx-tap');
      });
      addEventListener('scroll', wake, { passive: true });
      setInterval(() => {
        if (mood !== 'sleep' && Date.now() - lastInput > 25000) {
          mood = 'sleep'; setFace('face_sleep'); body.src = IMG + 'body_base_sleep_1.webp'; face.style.transform = ''; b.classList.add('fx-sleep');
        }
      }, 1000);
      b.addEventListener('click', (e) => {
        e.stopPropagation(); wake();
        const poke = Math.random() < 0.3;
        mood = poke ? 'angry' : 'idle'; setFace(poke ? 'face_angry' : 'face_default');
        say.textContent = poke ? '하아?' : '허리 펴! 우라!';  /* same lines as the desktop pet app */
        b.classList.remove('fx-hop'); void b.offsetWidth; b.classList.add('fx-hop', 'fx-talk');
        clearTimeout(hide); hide = setTimeout(() => b.classList.remove('fx-talk'), 2400);
        clearTimeout(moodTimer); moodTimer = setTimeout(() => { if (mood === 'angry') { mood = 'idle'; setFace('face_default'); } }, 1500);
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
