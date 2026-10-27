/* Usagi desktop pet — web port of UsagiDesktopPet (Pet.cs / PostureBubble.cs).
 * Same artwork crop, face-on-body compositing with the body safety mask,
 * cursor gaze math, typing paw swap, 3-minute auto sleep, drag to move,
 * right-click menu and the posture reminder bubble.
 * Settings mirror the owner's usagi_settings.json. */
(() => {
  if (!matchMedia('(pointer: fine)').matches || innerWidth < 768) return;

  const CFG = {
    scale: 126, faceX: 0, faceY: 115, tracking: 133, flip: false, angry: false,
    postureEnabled: true, postureMinutes: 37, postureMessage: '허리 펴! 우라!',
  };
  const IMG = '/assets/img/buddy/';
  const SW = 471, SH = 564;                       // cropped source size (Rectangle(64,18,471,564))
  const K = 0.47 * CFG.scale / 100;               // Pet.ResizeArt scale
  const W = Math.round(SW * K), H = Math.round(SH * K);
  const SLEEP_MS = 180000;                        // IsAutoSleep: 3 minutes without input
  const store = (() => { try { return localStorage; } catch { return null; } })();
  const saved = JSON.parse((store && store.getItem('usagi-pos')) || 'null');
  if (store && store.getItem('usagi-hidden') === '1') return;
  let flip = saved ? !!saved.flip : CFG.flip;

  const names = ['body_base_1', 'body_base_2', 'body_base_sleep_1', 'face_default', 'face_sleep', 'face_angry',
    'mask_body_base_1', 'mask_body_base_2', 'mask_body_base_sleep_1'];
  const img = {};
  const load = (n) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(); i.onerror = () => ok(); i.src = IMG + n + (n.startsWith('mask') ? '.png' : '.webp'); img[n] = i; });

  const start = () => {
    /* ---------- pet element ---------- */
    const pet = document.createElement('canvas');
    pet.className = 'usagi-pet'; pet.width = SW; pet.height = SH;
    pet.style.width = W + 'px'; pet.style.height = H + 'px';
    document.body.appendChild(pet);
    const g = pet.getContext('2d');
    const off = document.createElement('canvas'); off.width = SW; off.height = SH;
    const og = off.getContext('2d');

    let left, top;
    const clamp = () => {                          // Pet.ClampLocation
      left = Math.max(-W + 55, Math.min(innerWidth - 55, left));
      top = Math.max(0, Math.min(innerHeight - 45, top));
      pet.style.left = left + 'px'; pet.style.top = top + 'px';
    };
    const home = () => { left = innerWidth - W - 22; top = innerHeight - H + 2; };   // MoveBottomRight
    if (saved && saved.rx != null) { left = innerWidth - saved.rx; top = innerHeight - saved.by; } else home();
    clamp();
    const save = () => store && store.setItem('usagi-pos', JSON.stringify({ rx: innerWidth - left, by: innerHeight - top, flip }));
    addEventListener('resize', () => { clamp(); });

    /* ---------- input state ---------- */
    let frame = 0, keyPending = 0, lastActive = Date.now(), gazeX = 0, gazeY = 0;
    let cur = null, wasSleeping = false, angry = CFG.angry, lastRender = '';
    const held = new Set();
    const oneShot = (k) => ['Shift', 'Control', 'Alt', 'Meta', 'AltGraph'].includes(k);
    addEventListener('keydown', (e) => {          // KeyboardCallback
      const m = oneShot(e.key);
      if (!m || !held.has(e.key)) keyPending ^= 1;
      if (m) held.add(e.key);
      lastActive = Date.now();
    }, true);
    addEventListener('keyup', (e) => { if (oneShot(e.key)) held.delete(e.key); }, true);
    addEventListener('mousemove', (e) => { cur = { x: e.clientX, y: e.clientY }; lastActive = Date.now(); }, { passive: true });
    addEventListener('mousedown', () => { lastActive = Date.now(); }, true);

    /* ---------- render (Pet.Tick, every 30 ms) ---------- */
    const tick = () => {
      if (keyPending) { frame ^= 1; keyPending = 0; lastActive = Date.now(); }
      const sleeping = Date.now() - lastActive >= SLEEP_MS;
      if (wasSleeping && !sleeping) angry = false;
      wasSleeping = sleeping;
      if (sleeping) frame = 0;
      const body = sleeping ? 'body_base_sleep_1' : frame === 1 ? 'body_base_2' : 'body_base_1';
      const face = sleeping ? 'face_sleep' : angry ? 'face_angry' : 'face_default';

      let tx = 0, ty = 0;
      if (!sleeping && cur) {
        const cx = left + W * 0.51, cy = top + H * 0.64;
        const rx = cur.x >= cx ? innerWidth - cx : cx;
        const ry = cur.y >= cy ? innerHeight - cy : cy;
        const nx = Math.max(-1, Math.min(1, (cur.x - cx) / Math.max(1, rx)));
        let ny = Math.max(-1, Math.min(1, (cur.y - cy) / Math.max(1, ry)));
        if (ny < 0) ny = -Math.pow(-ny, 0.72);
        tx = (flip ? -1 : 1) * nx * 76 * K * CFG.tracking / 100;
        ty = ny * (ny < 0 ? 58 : 35) * K * CFG.tracking / 100;
      }
      gazeX += (tx - gazeX) * 0.33;
      gazeY += (ty - gazeY) * 0.33;
      const fx = !sleeping && frame === 1 ? Math.round(-14 * K) : 0;
      const fy = !sleeping && frame === 1 ? Math.round(-6 * K) : 0;
      const dx = Math.round(gazeX + (flip ? -CFG.faceX : CFG.faceX) * K) + fx;
      const dy = Math.round(CFG.faceY * K + gazeY) + fy;
      const key = `${body}|${face}|${dx}|${dy}|${flip}`;
      if (key === lastRender) return;
      lastRender = key;

      // Composite(): face drawn only inside the body's safety mask, then over the body
      og.globalCompositeOperation = 'source-over';
      og.clearRect(0, 0, SW, SH);
      og.drawImage(img[face], dx / K, dy / K);
      og.globalCompositeOperation = 'destination-in';
      og.drawImage(img['mask_' + body], 0, 0);
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, SW, SH);
      if (flip) g.setTransform(-1, 0, 0, 1, SW, 0);
      g.drawImage(img[body], 0, 0);
      g.drawImage(off, 0, 0);
    };
    setInterval(tick, 30); tick();

    /* ---------- drag (OnPetDown/Move/Up) ---------- */
    let drag = null;
    pet.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      drag = { sx: e.clientX, sy: e.clientY, l: left, t: top, moved: false };
      lastActive = Date.now();
    });
    addEventListener('mousemove', (e) => {
      if (!drag) return;
      const ddx = e.clientX - drag.sx, ddy = e.clientY - drag.sy;
      if (Math.abs(ddx) + Math.abs(ddy) >= 7) drag.moved = true;
      if (drag.moved) { left = drag.l + ddx; top = drag.t + ddy; pet.style.left = left + 'px'; pet.style.top = top + 'px'; }
    });
    addEventListener('mouseup', (e) => {
      if (!drag || e.button !== 0) return;
      if (drag.moved) { clamp(); save(); }
      drag = null;
    });

    /* ---------- right-click menu (MenuSetup) ---------- */
    const menu = document.createElement('div');
    menu.className = 'usagi-menu';
    menu.innerHTML = '<button data-a="flip">좌우 반전</button><hr><button data-a="quit">우사기 종료</button>';
    document.body.appendChild(menu);
    const showMenu = (e) => {
      e.preventDefault();
      menu.style.left = Math.min(e.clientX, innerWidth - 140) + 'px';
      menu.style.top = Math.min(e.clientY, innerHeight - 90) + 'px';
      menu.classList.add('on');
    };
    pet.addEventListener('contextmenu', showMenu);
    addEventListener('mousedown', (e) => { if (!menu.contains(e.target)) menu.classList.remove('on'); }, true);
    menu.addEventListener('click', (e) => {
      const a = e.target.dataset.a; if (!a) return;
      menu.classList.remove('on');
      if (a === 'flip') { flip = !flip; lastRender = ''; save(); tick(); }
      if (a === 'quit') { pet.remove(); closeBubble(); store && store.setItem('usagi-hidden', '1'); }
    });

    /* ---------- posture reminder bubble (PostureBubble) ---------- */
    let bubble = null, dismiss;
    const closeBubble = () => { if (bubble) { bubble.remove(); bubble = null; } clearTimeout(dismiss); };
    const showBubble = (msg) => {
      closeBubble();
      const base = msg.length > 70 ? 470 : msg.length > 32 ? 405 : 340;
      const bw = Math.min(innerWidth - 24, Math.max(180, Math.round(base * CFG.scale / 100)));
      const bh = Math.round(bw * 1063 / 1301);
      bubble = document.createElement('div');
      bubble.className = 'usagi-bubble';
      bubble.style.width = bw + 'px'; bubble.style.height = bh + 'px';
      bubble.innerHTML = '<div class="usagi-bubble-art"></div><div class="usagi-bubble-text"></div><button class="usagi-bubble-x" aria-label="닫기"></button>';
      bubble.querySelector('.usagi-bubble-text').textContent = msg;
      bubble.querySelector('.usagi-bubble-x').addEventListener('click', closeBubble);
      bubble.addEventListener('contextmenu', showMenu);
      document.body.appendChild(bubble);
      const place = () => {                       // PlaceNear()
        if (!bubble) return;
        const ax = left + W * 0.5, ay = top + H * 0.21;
        let x = (innerWidth - ax >= bw * 0.9 || innerWidth - ax > ax) ? ax - bw * 0.09 : ax - bw * 0.91;
        let y = ay - bh + bh * 0.02;
        x = Math.max(0, Math.min(innerWidth - bw, x)); y = Math.max(0, Math.min(innerHeight - bh, y));
        bubble.style.left = x + 'px'; bubble.style.top = y + 'px';
        bubble.classList.toggle('flipped', x + bw / 2 < ax);
        requestAnimationFrame(place);
      };
      place();
      dismiss = setTimeout(closeBubble, 15000);
    };
    if (CFG.postureEnabled) setInterval(() => showBubble(CFG.postureMessage || '허리 펴! 우라!'), CFG.postureMinutes * 60000);
    window.usagiSay = showBubble;                 // e.g. usagiSay('허리 펴! 우라!') from the console
  };

  Promise.all(names.map(load)).then(start);
})();
