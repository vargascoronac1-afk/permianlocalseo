/* Permian Pro Electric v2 (demo). Idioma EN/ES, hero de apagon por scroll (fotogramas en canvas), hotspots del panel, servicios,
   zona, orden de trabajo y entradas. createScrubber es copia local y reducida de v9e.js (canvas + drawImage cover, precarga,
   carpeta -720 en movil, salto de fotogramas con "step"). Mejora progresiva: sin JS o con reduced-motion queda todo visible. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var small = window.matchMedia('(max-width:768px)');
  var wide = window.matchMedia('(min-width:900px)');
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function pad3(i) { return ('000' + i).slice(-3); }
  var FR = '../../img/v9/frames/';
  var HH = function () { return small.matches ? 56 : 64; };
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (!hasGsap) root.classList.remove('js-anim');
  var anim = hasGsap && !reduce;

  /* ---------- idioma ---------- */
  var lang = 'en';
  (function () {
    var KEY = 'ppe-lang2', btn = $('#lang');
    try { var s = localStorage.getItem(KEY); if (s === 'en' || s === 'es') lang = s; } catch (e) {}
    var T = {
      title: { en: 'Permian Pro Electric | Electricians in Odessa & Midland, TX (Demo)', es: 'Permian Pro Electric | Electricistas en Odessa y Midland, TX (Demo)' },
      desc: { en: 'Demo site: licensed electricians in Odessa and Midland, Texas. 24/7 emergency service, panels, EV chargers, lighting. Fictional business. Built by Permian Local.', es: 'Sitio de demostración: electricistas con licencia en Odessa y Midland, Texas. Emergencias 24/7, paneles, cargadores EV, iluminación. Negocio ficticio. Hecho por Permian Local.' },
      toggle: { en: ['ES', 'Cambiar a español'], es: ['EN', 'Switch to English'] },
      demo: { en: 'Demo: form disabled', es: 'Demo: formulario desactivado' }
    };
    function apply(l) {
      lang = l; root.lang = l;
      $$('[data-en]').forEach(function (el) { var v = el.getAttribute('data-' + l); if (v !== null) el.textContent = v; });
      $$('[data-en-ph]').forEach(function (el) { el.placeholder = el.getAttribute('data-' + l + '-ph'); });
      $$('[data-alt-en]').forEach(function (el) { el.setAttribute('alt', el.getAttribute('data-alt-' + l)); });
      $$('[data-aria-en]').forEach(function (el) { el.setAttribute('aria-label', el.getAttribute('data-aria-' + l)); });
      $$('[data-title-en]').forEach(function (el) { el.setAttribute('title', el.getAttribute('data-title-' + l)); });
      document.title = T.title[l];
      var m = $('meta[name=description]'); if (m) m.setAttribute('content', T.desc[l]);
      var og = $('meta[property="og:title"]'); if (og) og.setAttribute('content', T.title[l]);
      btn.textContent = T.toggle[l][0]; btn.setAttribute('aria-label', T.toggle[l][1]);
      var send = $('#send'); if (send.disabled) send.textContent = T.demo[l];
    }
    btn.addEventListener('click', function () { var n = lang === 'en' ? 'es' : 'en'; try { localStorage.setItem(KEY, n); } catch (e) {} apply(n); });
    $('#form').addEventListener('submit', function (e) { e.preventDefault(); var b = $('#send'); b.disabled = true; b.textContent = T.demo[lang]; });
    apply(lang);
  })();

  /* altura real del dock (movil) */
  (function () {
    var dock = $('#dock');
    function set() { root.style.setProperty('--dockh', (getComputedStyle(dock).display === 'none' ? 0 : dock.offsetHeight) + 'px'); }
    set(); addEventListener('resize', set);
  })();

  /* ---------- servicios: fila <-> foto ---------- */
  (function () {
    var rows = $$('.mi'), pics = $$('#svcPic img'), cur = 0;
    function set(i) {
      if (i === cur || i < 0) return; cur = i;
      rows.forEach(function (r, k) { r.classList.toggle('is-on', k === i); });
      pics.forEach(function (p, k) { p.classList.toggle('on', k === i); });
    }
    rows.forEach(function (r, i) {
      r.addEventListener('mouseenter', function () { if (wide.matches) set(i); });
      r.addEventListener('focusin', function () { if (wide.matches) set(i); });
    });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) {
        en.forEach(function (e) { if (e.isIntersecting && wide.matches) set(rows.indexOf(e.target)); });
      }, { rootMargin: '-40% 0px -52% 0px' });
      rows.forEach(function (r) { io.observe(r); });
    }
  })();

  /* ---------- panel: hotspots + hoja de circuitos (estado; el movimiento lo pone el bloque GSAP) ---------- */
  var panel = (function () {
    var stage = $('#pnStage'), hs = $$('.hs'), rows = $$('.ps__row'), stepN = $('#pnStep b'), cur = -1;
    if (!stage) return { set: function () {}, arrive: function () {}, bind: function () {} };
    function set(i) {
      i = clamp(i, 0, 3); if (i === cur) return; cur = i;
      rows.forEach(function (r, k) { r.classList.toggle('is-on', k === i); });
      hs.forEach(function (h, k) { h.classList.toggle('is-on', k === i); h.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
      if (stepN) stepN.textContent = i + 1;
      if (anim) { var d = rows[i].querySelector('.ps__d'); if (d) gsap.fromTo(d, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .45, ease: 'power3.out', delay: .1 }); }
    }
    function arrive(v) { stage.classList.toggle('is-move', !v); }
    function bind(go) {
      hs.forEach(function (h) { h.addEventListener('click', function () { go(+h.getAttribute('data-i')); }); });
      rows.forEach(function (r) { r.querySelector('.ps__b').addEventListener('click', function () { go(+r.getAttribute('data-i')); }); });
    }
    bind(function (i) { set(i); });
    return { set: set, arrive: arrive, bind: bind };
  })();

  /* ---------- FAQ: despliegue corto (ease-out, < 300 ms) ---------- */
  $$('.faq details').forEach(function (d) {
    var sum = d.querySelector('summary'), ans = d.querySelector('.ans');
    sum.addEventListener('click', function (e) {
      if (!anim) return;
      e.preventDefault();
      if (d.open) {
        gsap.to(ans, { height: 0, duration: .22, ease: 'power2.inOut', overwrite: true, onComplete: function () { d.open = false; ans.style.height = ''; } });
      } else {
        d.open = true;
        gsap.fromTo(ans, { height: 0 }, { height: 'auto', duration: .28, ease: 'power3.out', overwrite: true, onComplete: function () { ans.style.height = ''; } });
      }
    });
  });

  /* ---------- sin movimiento: estado final visible ---------- */
  function staticState() {
    panel.set(2);
    $$('[data-count]').forEach(function (n) { n.textContent = n.getAttribute('data-count'); });
    var poster = $('#heroPoster');
    if (poster) {
      var src = poster.previousElementSibling; if (src && src.tagName === 'SOURCE') src.remove();
      poster.src = FR + 'breaker/f071.webp';
      var st = $('#heroState'); if (st) { st.setAttribute('data-en', 'ON'); st.setAttribute('data-es', 'ENCENDIDO'); st.textContent = lang === 'es' ? 'ENCENDIDO' : 'ON'; }
    }
  }
  if (!anim) { staticState(); return; }

  /* cortina del pie: fijo debajo; se muestra cuando el contenido ya termina */
  (function () {
    var foot = $('#foot'); if (!foot) return;
    root.classList.add('js-curtain');
    function measure() { root.style.setProperty('--footh', foot.offsetHeight + 'px'); chk(); }
    var force = false;
    function chk() { root.classList.toggle('foot-on', force || window.pageYOffset + window.innerHeight >= document.documentElement.scrollHeight - foot.offsetHeight - 4); }
    /* teclado: el ultimo control del formulario despliega el pie para poder llegar a sus enlaces */
    document.addEventListener('focusin', function (e) { var f = !!e.target.closest('#foot') || e.target.id === 'send'; if (f !== force) { force = f; chk(); } });
    measure(); addEventListener('resize', measure); addEventListener('scroll', chk, { passive: true }); addEventListener('load', measure);
  })();

  /* ================= desde aqui: GSAP ================= */
  gsap.registerPlugin(ScrollTrigger);

  /* reveals: una tapa AZUL (la de la franja superior de la v1) cubre el bloque y se retira al entrar */
  function cover(el) {
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    var c = document.createElement('i'); c.className = 'rvc'; c.setAttribute('aria-hidden', 'true'); el.appendChild(c); return c;
  }
  function prime(sel, props) { var els = $$(sel); if (!els.length) return; els.forEach(function (e) { e.classList.add('is-primed'); }); gsap.set(els, props); }
  function primeCover(sel) { $$(sel).forEach(function (e) { e.classList.add('is-primed'); e._c = cover(e); }); }
  prime('.mask>span', { yPercent: 108 }); prime('h1 .ln>span', { yPercent: 108 });
  primeCover('.up'); primeCover('.pop'); primeCover('.hv'); primeCover('.wipe');
  gsap.set('.up,.pop,.hv', { opacity: 1, y: 0, scale: 1 });
  gsap.set('.wipe', { clipPath: 'none' });
  gsap.set('.quote__bg img', { scale: 1.08 });
  function unveil(b, o) {
    o = o || {};
    b.forEach(function (e, k) {
      var c = e._c; if (!c) return;
      gsap.fromTo(c, { scaleX: 1, transformOrigin: o.up ? '50% 0' : '100% 50%', scaleY: 1 }, o.up ? { scaleY: 0, duration: 1, ease: 'power3.inOut', delay: k * .08 } : { scaleX: 0, duration: .85, ease: 'power3.inOut', delay: k * .09 });
      gsap.fromTo(e, { y: o.y || 18 }, { y: 0, duration: .9, ease: 'power3.out', delay: k * .09, overwrite: 'auto' });
    });
  }

  /* scroll suave (Lenis) */
  var lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ lerp: .1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  /* desplazamiento propio: parte SIEMPRE de la posicion real de la ventana (no de la cache de Lenis) y se cancela si el usuario toca o gira la rueda */
  var scrollTw = null;
  function stopScroll() { if (scrollTw) { scrollTw.kill(); scrollTw = null; } }
  ['wheel', 'touchstart', 'keydown'].forEach(function (ev) { addEventListener(ev, stopScroll, { passive: true }); });
  function scrollToY(y, cb) {
    stopScroll();
    var max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    y = clamp(Math.round(y), 0, max);
    var o = { v: window.pageYOffset }, dist = Math.abs(y - o.v);
    if (dist < 2) { if (cb) cb(); return; }
    scrollTw = gsap.to(o, { v: y, duration: clamp(.45 + dist / 3500, .5, 1.3), ease: 'power3.inOut',
      onUpdate: function () { if (lenis) lenis.scrollTo(o.v, { immediate: true, force: true }); else window.scrollTo({ top: o.v, behavior: 'instant' }); },
      onComplete: function () { scrollTw = null; if (cb) cb(); } });
  }
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href'); if (id === '#') { e.preventDefault(); return; } var t = $(id); if (!t) return; e.preventDefault();
      if (id === '#top') return scrollToY(0);
      var y = t.getBoundingClientRect().top + window.pageYOffset - (id === '#panel' ? 0 : 0);
      scrollToY(y + 2);
    });
  });

  /* scrubber (canvas) */
  function createScrubber(o) {
    var canvas = o.canvas, ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: !!o.onFrame });
    var count = o.count, step = o.step || 1, cur = -1, target = 0, drawn = -1, dirty = true, rafId = 0, started = false, bgTimer = 0;
    var imgs = [], state = [], eager = Math.min(o.eager || 6, count);
    function base() { return small.matches ? o.mobileDir : o.dir; }
    var dir = base();
    function url(i) { return dir + '/f' + pad3(i * step) + '.webp'; }
    function load(i) {
      if (i < 0 || i >= count || state[i]) return;
      state[i] = 1; var im = new Image(); im.decoding = 'async'; imgs[i] = im;
      var fin = function (ok) { state[i] = ok ? 2 : 3; if (ok && (i === cur || drawn < 0)) schedule(); };
      im.onload = function () { if (im.decode) im.decode().then(function () { fin(true); }, function () { fin(true); }); else fin(true); };
      im.onerror = function () { fin(false); };
      im.src = url(i); return im;
    }
    function nearest(i) { for (var a = i; a >= 0; a--) if (state[a] === 2) return a; for (var b = i + 1; b < count; b++) if (state[b] === 2) return b; return -1; }
    function background() { var n = 0; for (var i = 0; i < count && n < 3; i++) if (!state[i]) { load(i); n++; } bgTimer = n ? setTimeout(background, 70) : 0; }
    function start() {
      if (started) return; started = true;
      var left = eager;
      for (var i = 0; i < eager; i++) (function (k) { var im = load(k); var chk = setInterval(function () { if (state[k] > 1) { clearInterval(chk); if (--left === 0) { canvas.classList.add('is-ready'); schedule(); bgTimer = setTimeout(background, 80); } } }, 30); })(i);
    }
    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2), w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
      if (!w || !h) return false;
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; dirty = true; }
      return true;
    }
    function draw() {
      rafId = 0; if (!size()) return;
      cur = clamp(Math.round(target * (count - 1)), 0, count - 1);
      if (!state[cur]) load(cur);
      var f = nearest(cur); if (f < 0) return;
      if (f === drawn && !dirty) return;
      var im = imgs[f], iw = im.naturalWidth, ih = im.naturalHeight, w = canvas.width, h = canvas.height; if (!iw) return;
      var s = Math.max(w / iw, h / ih), dw = iw * s, dh = ih * s;
      ctx.drawImage(im, (w - dw) / 2, (h - dh) / 2, dw, dh);
      drawn = f; dirty = false;
      if (o.onFrame) o.onFrame(ctx, w, h, f);
    }
    function schedule() { if (!rafId) rafId = requestAnimationFrame(draw); }
    function setProgress(p) { target = clamp(+p || 0, 0, 1); schedule(); }
    function rebase() { var nb = base(); if (nb === dir) return; dir = nb; imgs = []; state = []; drawn = -1; dirty = true; clearTimeout(bgTimer); if (started) { started = false; start(); } }
    if (small.addEventListener) small.addEventListener('change', rebase);
    if (window.ResizeObserver) new ResizeObserver(function () { dirty = true; schedule(); }).observe(canvas);
    return { start: start, setProgress: setProgress };
  }

  /* ---------- hero: apagon -> se sube el principal ---------- */
  (function () {
    var hero = $('#hero'), pin = $('#heroPin'); if (!hero) return;
    var state = $('#heroState'), on = false, sample = true;
    var A = [31, 37, 42], B = [99, 77, 59];
    var sc = createScrubber({
      canvas: $('#heroCv'), dir: FR + 'breaker', mobileDir: FR + 'breaker-720', count: 36, step: 2, eager: 6,
      onFrame: function (ctx, w, h) {
        if (!sample) return;
        try {
          var px = small.matches ? ctx.getImageData(Math.round(w / 2), 2, 1, 1).data : ctx.getImageData(2, Math.round(h / 2), 1, 1).data;
          pin.style.setProperty('--hbg', 'rgb(' + px[0] + ',' + px[1] + ',' + px[2] + ')');
          pin.style.background = 'rgb(' + px[0] + ',' + px[1] + ',' + px[2] + ')';
        } catch (e) { sample = false; }
      }
    });
    sc.start();
    function setState(v) {
      if (v === on) return; on = v;
      state.setAttribute('data-en', v ? 'ON' : 'OFF'); state.setAttribute('data-es', v ? 'ENCENDIDO' : 'APAGADO');
      state.textContent = lang === 'es' ? (v ? 'ENCENDIDO' : 'APAGADO') : (v ? 'ON' : 'OFF');
    }
    ScrollTrigger.create({
      trigger: hero, start: 'top top', end: 'bottom bottom', scrub: true,
      onUpdate: function (self) {
        var p = self.progress, t = clamp((p - .10) / .66, 0, 1);
        sc.setProgress(t); setState(t > .3);
        if (!sample) { var k = clamp(t * 1.3, 0, 1); pin.style.background = 'rgb(' + Math.round(A[0] + (B[0] - A[0]) * k) + ',' + Math.round(A[1] + (B[1] - A[1]) * k) + ',' + Math.round(A[2] + (B[2] - A[2]) * k) + ')'; }
        var cue = $('#heroCue'); if (cue) cue.style.opacity = p > .04 ? 0 : 1;
      }
    });
    /* entrada al cargar: lineas del titular enmascaradas, luego el resto */
    gsap.fromTo('#h1 .ln>span', { yPercent: 108 }, { yPercent: 0, duration: 1, stagger: .12, ease: 'power4.out', delay: .1 });
    unveil($$('.hv'), { y: 20 });
  })();

  /* ---------- E1: el breaker sube y CAE UN RAYO; del rayo sale el titular y, al lado, las ofertas ---------- */
  (function () {
    var head = $('#svcHead'), boltD = $('#bolt'), boltM = $('#boltM'), bolt = boltD, flash = $('#flash'), zap = $('#heroZap'); if (!head || !bolt) return;
    var paths = [], h2 = $('#svc-h'), sub = $('#svcSub'), cards = $$('#offers li'), tl = null, played = false;
    var lens = [];
    function strike() {
      played = true;
      bolt = getComputedStyle(boltD).display === 'none' ? boltM : boltD;
      gsap.set([boltD, boltM], { opacity: 0 });
      paths = $$('.bolt__p', bolt); lens = paths.map(function (p) { return p.getTotalLength(); });
      if (tl) tl.kill();
      gsap.killTweensOf([h2, sub, flash, boltD, boltM].concat(cards));
      paths.forEach(function (p, i) { p.style.strokeDasharray = lens[i]; p.style.strokeDashoffset = lens[i]; });
      gsap.set(bolt, { opacity: 1 }); gsap.set(flash, { opacity: 0 });
      gsap.set(h2, { opacity: 0, scale: 1.08, transformOrigin: '0% 60%' }); gsap.set(sub, { opacity: 0, y: 10 }); gsap.set(cards, { opacity: 0, y: 16 });
      tl = gsap.timeline();
      tl.to(paths[0], { strokeDashoffset: 0, duration: .35, ease: 'power2.in' }, 0)
        .to(paths.slice(1), { strokeDashoffset: 0, duration: .28, ease: 'power1.in', stagger: .05 }, .1)
        .to(flash, { opacity: .85, duration: .05, ease: 'none' }, .35).to(flash, { opacity: 0, duration: .4, ease: 'power2.out' }, .4)
        .to(bolt, { opacity: .35, duration: .045, repeat: 3, yoyo: true, ease: 'none' }, .38)
        .to(h2, { opacity: 1, scale: 1, duration: .36, ease: 'power3.out' }, .6)
        .to(sub, { opacity: 1, y: 0, duration: .35, ease: 'power3.out' }, .8)
        .to(cards, { opacity: 1, y: 0, duration: .34, ease: 'power3.out', stagger: .08 }, 1)
        .to(bolt, { opacity: 0, duration: .45, ease: 'power1.out' }, .95);
    }
    ScrollTrigger.create({ trigger: head, start: 'top 15%', once: true, onEnter: function () { if (!played) strike(); } });
    /* repetible: el boton junto al breaker lo sube otra vez y vuelve a caer el rayo */
    if (zap) {
      zap.hidden = false;
      zap.addEventListener('click', function () {
        played = true;
        var y = head.getBoundingClientRect().top + window.pageYOffset;
        if (Math.abs(window.pageYOffset - y) < 40) return strike();
        scrollToY(y - window.innerHeight * .08, strike);
      });
    }
  })();

  /* ---------- panel: secuencias de fotogramas en UN canvas; el scroll avanza y se PARA en cada hotspot ----------
     Misma mecanica que el taller v2: la imagen mostrada persigue al objetivo (indice decimal) como mucho 2 indices por tick
     y SOLO por fotogramas ya cargados; nunca se dibuja uno sin cargar ni se sustituye por el vecino (antes: parpadeo).
     El hotspot se marca cuando la imagen HA LLEGADO al fotograma de parada, no por el progreso del scroll. */
  (function () {
    var track = $('#pnTrack'), cv = $('#pnCv'); if (!track || !cv) return;
    var ctx = cv.getContext('2d', { alpha: false });
    var CNT = { caja: 64, breaker: 72, varilla: 72 };
    /* cada parada: de que fotograma a cual (el ultimo es donde se queda) */
    var STOPS = [{ set: 'caja', a: 0, b: 12 }, { set: 'caja', a: 12, b: 46 }, { set: 'breaker', a: 0, b: 71 }, { set: 'varilla', a: 0, b: 38 }];
    var TRAVEL = .5;
    var imgs = {}, st = {}, queue = [], started = false, kicked = false, gen = 0, cw = 0, ch = 0, dirty = true, shownKey = '';
    var cur = { set: 'caja', f: 0, stop: 0 }, arrived = false, T = { i: 0, set: 'caja', f: 0, hold: true };
    function dir(set) { return FR + set + (small.matches ? '-720' : ''); }
    function key(set, i) { return set + i; }
    function ok(set, i) { return st[key(set, i)] === 2; }
    function load(set, i) {
      var k = key(set, i); if (st[k]) return; st[k] = 1;
      var g = gen, im = new Image(); im.decoding = 'async'; imgs[k] = im;
      function done() { if (g === gen) { st[k] = 2; if (cur.set === set && Math.round(cur.f) === i) dirty = true; } }
      im.onload = function () { if (im.decode) im.decode().then(done, done); else done(); };
      im.onerror = function () { if (g === gen) st[k] = 3; };
      im.src = dir(set) + '/f' + pad3(i) + '.webp';
    }
    function build() { /* orden de carga: fotogramas de parada primero, luego el resto de cada tramo en orden de uso */
      var seen = {}; function add(set, i) { var k = key(set, i); if (!seen[k]) { seen[k] = 1; queue.push([set, i]); } }
      STOPS.forEach(function (s) { add(s.set, s.a); add(s.set, s.b); });
      STOPS.forEach(function (s) { for (var i = s.a; i <= s.b; i++) add(s.set, i); });
    }
    function pump() { var c = 0; while (queue.length && c < 6) { var q = queue.shift(); if (!st[key(q[0], q[1])]) { load(q[0], q[1]); c++; } } if (queue.length) setTimeout(pump, 60); }
    function start() { if (started) return; started = true; build(); pump(); }
    /* tamano del canvas: se fija aqui, solo cuando cambia el tamano real (ResizeObserver / cambio de pantalla) */
    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2), w = Math.round(cv.clientWidth * dpr), h = Math.round(cv.clientHeight * dpr);
      if (w && h && (w !== cw || h !== ch)) { cw = w; ch = h; cv.width = w; cv.height = h; dirty = true; }
    }
    function draw() {
      var n = clamp(Math.round(cur.f), 0, CNT[cur.set] - 1), k = key(cur.set, n);
      if (!ok(cur.set, n) || !cw) return;
      if (k === shownKey && !dirty) return;
      var im = imgs[k], iw = im.naturalWidth, ih = im.naturalHeight; if (!iw) return;
      var sc = Math.max(cw / iw, ch / ih), dw = iw * sc, dh = ih * sc;
      ctx.drawImage(im, (cw - dw) / 2, (ch - dh) / 2, dw, dh); shownKey = k; dirty = false;
      if (!cv.classList.contains('is-ready')) cv.classList.add('is-ready');
    }
    /* avanza hacia el objetivo (indice decimal), maximo 2 indices por tick y solo por fotogramas ya cargados */
    function chase(target) {
      var d = target - cur.f; if (Math.abs(d) < .001) return;
      var step = clamp(d * .35, -2, 2);
      if (Math.abs(step) < .25) step = d < 0 ? -Math.min(.25, -d) : Math.min(.25, d);
      var nf = cur.f + step, n = Math.round(nf), c = Math.round(cur.f);
      if (n !== c) {
        var dr = n > c ? 1 : -1;
        for (var k = c + dr; k !== n + dr; k += dr) { if (!ok(cur.set, k)) { nf = k - dr; break; } }
      }
      cur.f = nf; draw();
    }
    function target(p) {
      var s = clamp(p, 0, .9999) * 4, i = Math.floor(s), u = s - i, S = STOPS[i];
      if (u >= TRAVEL) return { i: i, set: S.set, f: S.b, hold: true };
      var k = u / TRAVEL; k = k * k * (3 - 2 * k);
      return { i: i, set: S.set, f: S.a + (S.b - S.a) * k, hold: false };
    }
    function tick() {
      if (!cw) { size(); if (!cw) return; }
      if (dirty) draw();
      T = target(ST.progress);
      if (T.set !== cur.set) { /* cambio de secuencia: se entra por el extremo mas cercano (si ya esta cargado) y se funde la opacidad */
        var e = T.i > cur.stop ? STOPS[T.i].a : STOPS[T.i].b;
        if (!ok(T.set, e)) { return; }
        cur.set = T.set; cur.f = e; draw();
        gsap.fromTo(cv, { opacity: .15 }, { opacity: 1, duration: .35, ease: 'power2.out', overwrite: true });
      }
      cur.stop = T.i;
      chase(T.f);
      var ar = T.hold && Math.abs(cur.f - T.f) < .5;
      if (ar) panel.set(T.i);
      if (ar !== arrived) { arrived = ar; panel.arrive(ar); }
    }
    if (window.ResizeObserver) new ResizeObserver(size).observe(cv); else addEventListener('resize', size);
    if (small.addEventListener) small.addEventListener('change', function () { gen++; imgs = {}; st = {}; queue = []; started = false; shownKey = ''; dirty = true; size(); load(cur.set, Math.round(cur.f)); if (kicked) start(); });

    var ST = ScrollTrigger.create({ trigger: track, start: function () { return 'top top+=' + HH(); }, end: 'bottom bottom' });
    /* los fotogramas empiezan a bajar con la primera intencion de scroll; el primero se pide ya para que el canvas no nazca vacio */
    var evs = ['wheel', 'touchstart', 'keydown', 'scroll'];
    function kick() { if (kicked) return; kicked = true; start(); evs.forEach(function (ev) { removeEventListener(ev, kick); }); }
    evs.forEach(function (ev) { addEventListener(ev, kick, { passive: true }); });
    load('caja', 0); size();
    if (ST.progress > 0) kick();
    panel.set(0); panel.arrive(false); /* hasta que la imagen llegue a la parada no hay hotspot */
    gsap.ticker.add(tick);
    function go(i) { scrollToY(ST.start + (ST.end - ST.start) * ((i + TRAVEL + .25) / 4)); }
    panel.bind(go);
    gsap.fromTo('#pnStage', { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1, ease: 'power3.inOut', scrollTrigger: { trigger: '#pnTrack', start: 'top 85%', once: true } });
    window.__pn = { st: ST, get shown() { return cur.f; }, get set() { return cur.set; }, get target() { return T.f; }, get hold() { return T.hold; }, get arrived() { return arrived; },
      get loaded() { var c = 0; for (var k in st) if (st[k] === 2) c++; return c; } };
  })();

  /* ---------- zona: mapa real (teselas OSM); la ruta se dibuja con el scroll y los pueblos se encienden ---------- */
  (function () {
    var map = $('#mapSvg'); if (!map) return;
    var road = $('#mapI20'), rads = $$('.map__rad', map), pts = $$('.pt', map), P = {};
    pts.forEach(function (g) { P[g.getAttribute('data-n')] = g; });
    var all = [road].concat(rads), L = all.map(function (p) { return p.getTotalLength(); });
    all.forEach(function (p, i) { p.style.strokeDasharray = L[i]; p.style.strokeDashoffset = L[i]; });
    /* fraccion de la ruta en la que esta Midland (suma de tramos hasta ese vertice) */
    var nums = road.getAttribute('d').match(/-?\d+(\.\d+)?/g).map(Number), mid = P.Midland.getAttribute('transform').match(/-?\d+(\.\d+)?/g).map(Number), acc = 0, fMid = .5;
    for (var k = 2; k < nums.length; k += 2) {
      acc += Math.hypot(nums[k] - nums[k - 2], nums[k + 1] - nums[k - 1]);
      if (Math.abs(nums[k] - mid[0]) < 1 && Math.abs(nums[k + 1] - mid[1]) < 1) { fMid = acc / L[0]; break; }
    }
    function lit(n, v) { P[n].classList.toggle('is-lit', v); }
    function upd(p) {
      var f = clamp(p / .6, 0, 1);
      road.style.strokeDashoffset = (L[0] * (1 - f)).toFixed(1);
      var r = rads.map(function (el, i) { var q = clamp((p - .55 - i * .1) / .25, 0, 1); el.style.strokeDashoffset = (L[i + 1] * (1 - q)).toFixed(1); return q; });
      lit('Odessa', f > .01); lit('Midland', f >= fMid); lit('Stanton', f > .985);
      lit('Goldsmith', r[0] > .95); lit('Gardendale', r[1] > .95); lit('Greenwood', r[2] > .95);
    }
    upd(0);
    ScrollTrigger.create({ trigger: '#areaMap', start: 'top 80%', end: 'center 42%', scrub: .4, onUpdate: function (self) { upd(self.progress); } });
  })();

  /* ---------- proceso: la orden de trabajo se imprime ---------- */
  (function () {
    var slip = $('#slip'); if (!slip) return;
    gsap.fromTo('#slipIn', { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', ease: 'none', scrollTrigger: { trigger: slip, start: 'top 85%', end: 'center 55%', scrub: .5 } });
    $$('[data-count]').forEach(function (n) {
      var end = +n.getAttribute('data-count'), o = { v: 0 };
      n.textContent = '0';
      ScrollTrigger.create({ trigger: n, start: 'top 92%', once: true, onEnter: function () { gsap.to(o, { v: end, duration: 1.4, ease: 'power2.out', onUpdate: function () { n.textContent = Math.round(o.v); } }); } });
    });
  })();

  /* ---------- entradas ---------- */
  $$('.mask').forEach(function (m) {
    var sp = m.firstElementChild;
    ScrollTrigger.create({ trigger: m, start: 'top 90%', once: true, onEnter: function () { gsap.fromTo(sp, { yPercent: 108 }, { yPercent: 0, duration: .95, ease: 'power4.out' }); } });
  });
  ScrollTrigger.batch('.up', { start: 'top 90%', once: true, onEnter: function (b) { unveil(b); } });
  ScrollTrigger.batch('.pop', { start: 'top 88%', once: true, onEnter: function (b) { unveil(b, { y: 24 }); } });
  $$('.wipe').forEach(function (w) {
    var im = w.querySelector('img');
    ScrollTrigger.create({ trigger: w, start: 'top 85%', once: true, onEnter: function () {
      gsap.fromTo(w._c, { scaleY: 1, transformOrigin: '50% 0' }, { scaleY: 0, duration: 1.1, ease: 'power3.inOut' });
      gsap.fromTo(im, { scale: 1.18 }, { scale: 1, duration: 1.5, ease: 'power3.out' });
    } });
  });
  gsap.to('.quote__bg img', { scale: 1, ease: 'none', scrollTrigger: { trigger: '#quote', start: 'top bottom', end: 'center center', scrub: true } });

  addEventListener('load', function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
})();
