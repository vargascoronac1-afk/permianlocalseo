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

  /* mapa de Google: se carga al pulsar (sin cookies ni avisos de rastreo antes) */
  (function () {
    var box = $('#gmap'), btn = $('#gmapBtn'); if (!btn) return;
    btn.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.title = lang === 'es' ? 'Mapa de Odessa, TX' : 'Map of Odessa, TX'; f.setAttribute('data-title-en', 'Map of Odessa, TX'); f.setAttribute('data-title-es', 'Mapa de Odessa, TX');
      f.referrerPolicy = 'no-referrer-when-downgrade'; f.src = 'https://www.google.com/maps?q=Odessa,+TX&output=embed';
      box.appendChild(f); box.hidden = false; btn.setAttribute('aria-expanded', 'true'); btn.remove();
    });
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
  function scrollToY(y) { if (lenis) lenis.scrollTo(y, { duration: 1 }); else window.scrollTo({ top: y, behavior: 'smooth' }); }
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href'), t = $(id); if (!t) return; e.preventDefault();
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

  /* ---------- panel: secuencias de fotogramas en UN canvas; el scroll avanza y se PARA en cada hotspot ---------- */
  (function () {
    var track = $('#pnTrack'), cv = $('#pnCv'); if (!track || !cv) return;
    var ctx = cv.getContext('2d', { alpha: false });
    var CNT = { caja: 64, breaker: 72, varilla: 72 };
    /* cada parada: de que fotograma a cual (el ultimo es donde se queda) */
    var STOPS = [{ set: 'caja', a: 0, b: 12 }, { set: 'caja', a: 12, b: 46 }, { set: 'breaker', a: 0, b: 71 }, { set: 'varilla', a: 0, b: 38 }];
    var imgs = {}, st = {}, queue = [], started = false, drawnKey = '', dirty = true, raf = 0, want = { set: 'caja', i: 0 }, lastSet = 'caja', arrived = true, curStop = -1;
    function dir(set) { return FR + set + (small.matches ? '-720' : ''); }
    function key(set, i) { return set + i; }
    function load(set, i) {
      var k = key(set, i); if (st[k]) return; st[k] = 1;
      var im = new Image(); im.decoding = 'async'; imgs[k] = im;
      function ok() { st[k] = 2; if (want.set === set) schedule(); }
      im.onload = function () { if (im.decode) im.decode().then(ok, ok); else ok(); };
      im.onerror = function () { st[k] = 3; };
      im.src = dir(set) + '/f' + pad3(i) + '.webp';
    }
    function nearest(set, i) {
      for (var a = i; a >= 0; a--) if (st[key(set, a)] === 2) return a;
      for (var b = i + 1; b < CNT[set]; b++) if (st[key(set, b)] === 2) return b;
      return -1;
    }
    function build() { /* orden de carga: fotogramas de parada primero, luego el resto en orden de uso */
      var seen = {}; function add(set, i) { var k = key(set, i); if (!seen[k]) { seen[k] = 1; queue.push([set, i]); } }
      STOPS.forEach(function (s) { add(s.set, s.a); add(s.set, s.b); });
      STOPS.forEach(function (s) { for (var i = s.a; i <= s.b; i++) add(s.set, i); });
    }
    function pump() { var n = 0; while (queue.length && n < 4) { var q = queue.shift(); if (!st[key(q[0], q[1])]) { load(q[0], q[1]); n++; } } if (queue.length) setTimeout(pump, 80); }
    function start() { if (started) return; started = true; build(); setTimeout(pump, 20); }
    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2), w = Math.round(cv.clientWidth * dpr), h = Math.round(cv.clientHeight * dpr);
      if (!w || !h) return false; if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; dirty = true; } return true;
    }
    function draw() {
      raf = 0; if (!size()) return;
      var set = want.set, i = clamp(Math.round(want.i), 0, CNT[set] - 1); if (!st[key(set, i)]) load(set, i);
      var f = nearest(set, i); if (f < 0) return;
      var k = key(set, f); if (k === drawnKey && !dirty) return;
      var im = imgs[k], iw = im.naturalWidth, ih = im.naturalHeight, w = cv.width, h = cv.height; if (!iw) return;
      var sc = Math.max(w / iw, h / ih), dw = iw * sc, dh = ih * sc;
      ctx.drawImage(im, (w - dw) / 2, (h - dh) / 2, dw, dh); drawnKey = k; dirty = false;
      if (!cv.classList.contains('is-ready')) cv.classList.add('is-ready');
    }
    function schedule() { if (!raf) raf = requestAnimationFrame(draw); }
    if (window.ResizeObserver) new ResizeObserver(function () { dirty = true; schedule(); }).observe(cv);
    if (small.addEventListener) small.addEventListener('change', function () { imgs = {}; st = {}; queue = []; started = false; drawnKey = ''; dirty = true; start(); });

    var ST = ScrollTrigger.create({
      trigger: track, start: function () { return 'top top+=' + HH(); }, end: 'bottom bottom',
      onUpdate: function (self) {
        var p = clamp(self.progress, 0, .9999) * 4, i = Math.floor(p), u = p - i, S = STOPS[i], m = clamp(u / .5, 0, 1);
        want.set = S.set; want.i = S.a + (S.b - S.a) * m;
        if (S.set !== lastSet) { lastSet = S.set; gsap.fromTo(cv, { opacity: .15 }, { opacity: 1, duration: .35, ease: 'power2.out', overwrite: true }); }
        panel.set(i); var ar = m >= 1; if (ar !== arrived) { arrived = ar; panel.arrive(ar); }
        schedule();
      }
    });
    ScrollTrigger.create({ trigger: track, start: 'top bottom+=1400', once: true, onEnter: start });
    if (ST.progress > 0) start();
    panel.set(0); panel.arrive(true);
    function go(i) { scrollToY(ST.start + (ST.end - ST.start) * ((i + .75) / 4)); }
    panel.bind(go);
    gsap.fromTo('#pnStage', { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1, ease: 'power3.inOut', scrollTrigger: { trigger: '#pnTrack', start: 'top 85%', once: true } });
    window.__pn = { st: ST, want: want };
  })();

  /* ---------- zona: mapa estilizado; el radio de servicio crece con el scroll y enciende los pueblos ---------- */
  (function () {
    var map = $('#areaMap'); if (!map) return;
    var fill = $('#mapFill'), ring = $('#mapRing'), road = $('#mapI20'), pts = $$('.pt', map), R = 172, len = road.getTotalLength();
    road.style.strokeDasharray = len; road.style.strokeDashoffset = len;
    function upd(p) {
      var r = clamp((p - .12) / .8, 0, 1) * R;
      fill.setAttribute('r', r.toFixed(1)); ring.setAttribute('r', r.toFixed(1));
      road.style.strokeDashoffset = (len * (1 - clamp(p / .45, 0, 1))).toFixed(1);
      pts.forEach(function (g) { g.classList.toggle('is-lit', r >= +g.getAttribute('data-d')); });
    }
    upd(0);
    ScrollTrigger.create({ trigger: map, start: 'top 85%', end: 'center 52%', scrub: .4, onUpdate: function (self) { upd(self.progress); } });
  })();

  /* ---------- proceso: la orden de trabajo se imprime ---------- */
  (function () {
    var slip = $('#slip'); if (!slip) return;
    gsap.fromTo('#slipIn', { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', ease: 'none', scrollTrigger: { trigger: slip, start: 'top 80%', end: 'bottom 65%', scrub: .5 } });
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
