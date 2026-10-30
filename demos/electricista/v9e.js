/* Permian Pro Electric (demo) - v9e: hero por scroll + "Inside your panel" animado.
   createScrubber es COPIA local de js/v9-intro.js (canvas + drawImage cover, precarga, carpeta -720 en movil); no se importa para
   no acoplar el demo a ese fichero. Rutas relativas (../../img/v9/...). Sin JS / reduced-motion: quedan los posters y los textos. */
(function () {
  'use strict';
  var doc = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var small = window.matchMedia('(max-width:768px)');
  var portraitMQ = window.matchMedia('(max-width:768px),(orientation:portrait)');
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function pad3(i) { return ('000' + i).slice(-3); }
  var FR = '../../img/v9/frames/';

  function createScrubber(o) {
    var canvas = o.canvas, alpha = !!o.alpha, ctx = canvas.getContext('2d', { alpha: alpha }) || canvas.getContext('2d');
    var contain = o.fit === 'contain', maxStep = o.maxStep || 0, cur = -1;
    var count = Math.max(1, o.count | 0), eager = Math.min(o.eager || 10, count);
    function pickBase() { return (o.portraitDir && portraitMQ.matches) ? o.portraitDir : ((small.matches || o.light) && o.mobileDir) ? o.mobileDir : o.dir; }
    var base = pickBase();
    var imgs = [], state = [], started = false, bgTimer = 0, rafId = 0, target = 0, drawn = -1, dirty = true;
    var readyRes, ready = new Promise(function (r) { readyRes = r; });
    var isReady = false, gen = 0;

    function url(i) { return base + '/f' + pad3(i) + '.webp'; }
    function load(i) {
      if (i < 0 || i >= count || state[i]) return;
      state[i] = 1; /* 1 cargando, 2 ok, 3 fallo */
      var im = new Image(); im.decoding = 'async'; imgs[i] = im;
      var g0 = gen, fin = function (ok) { if (g0 !== gen) return; state[i] = ok ? 2 : 3; if (ok && (i === target || drawn < 0)) schedule(); };
      im.onload = function () { if (im.decode) im.decode().then(function () { fin(true); }, function () { fin(true); }); else fin(true); };
      im.onerror = function () { fin(false); };
      im.src = url(i);
      return im;
    }
    function settled(i) { return new Promise(function (res) { var im = load(i) || imgs[i]; if (!im) return res(); if (state[i] > 1) return res(); var t = setInterval(function () { if (state[i] > 1) { clearInterval(t); res(); } }, 30); }); }
    function nearest(i) { /* el ultimo cargado anterior; si no hay ninguno antes, el primero cargado posterior */
      for (var a = Math.min(i, count - 1); a >= 0; a--) if (state[a] === 2) return a;
      for (var b = i + 1; b < count; b++) if (state[b] === 2) return b;
      return -1;
    }
    function background() {
      var n = 0;
      for (var i = 0; i < count && n < 4; i++) { if (!state[i]) { load(i); n++; } }
      if (n === 4 || (n > 0)) bgTimer = setTimeout(background, 60); else bgTimer = 0;
    }
    function start() {
      if (started) return ready; started = true;
      var p = []; for (var i = 0; i < eager; i++) p.push(settled(i));
      Promise.all(p).then(function () {
        isReady = true; canvas.classList.add('is-ready'); if (o.onShow) o.onShow(); schedule(); readyRes(api);
        bgTimer = setTimeout(background, 80);
        if (o.onReady) o.onReady(api);
      });
      return ready;
    }
    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2), w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
      if (!w || !h) return false;
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; dirty = true; }
      return true;
    }
    function draw() {
      rafId = 0;
      if (!size()) return;
      var want = clamp(Math.round(target * (count - 1)), 0, count - 1);
      if (maxStep && cur >= 0) { var dd = want - cur; cur += dd > maxStep ? maxStep : dd < -maxStep ? -maxStep : dd; } else cur = want; /* nunca mas de maxStep fotogramas por frame */
      if (state[cur] !== 2 && !state[cur]) load(cur);
      var f = nearest(cur);
      if (cur !== want) schedule();
      if (f < 0) return;
      if (f === drawn && !dirty) return;
      var im = imgs[f], iw = im.naturalWidth, ih = im.naturalHeight, w = canvas.width, h = canvas.height;
      if (!iw || !ih) return;
      var s = contain ? Math.min(w / iw, h / ih) : Math.max(w / iw, h / ih), dw = iw * s, dh = ih * s;
      if (alpha) ctx.clearRect(0, 0, w, h);
      ctx.drawImage(im, (w - dw) / 2, (h - dh) / 2, dw, dh);
      drawn = f; dirty = false;
    }
    function schedule() { if (!rafId) rafId = requestAnimationFrame(draw); }
    function setProgress(p) { target = clamp(+p || 0, 0, 1); schedule(); }
    function rebase() { /* cambio de orientacion: recarga la secuencia adecuada (solo si hay portraitDir) */
      var nb = pickBase(); if (nb === base) return;
      base = nb; gen++; imgs = []; state = []; cur = -1; drawn = -1; dirty = true; clearTimeout(bgTimer); bgTimer = 0;
      if (started) { var p = []; for (var i = 0; i < eager; i++) p.push(settled(i)); Promise.all(p).then(function () { bgTimer = setTimeout(background, 80); schedule(); }); }
      schedule();
    }
    if (o.portraitDir) { if (portraitMQ.addEventListener) portraitMQ.addEventListener('change', rebase); else if (portraitMQ.addListener) portraitMQ.addListener(rebase); }
    if (window.ResizeObserver) new ResizeObserver(function () { dirty = true; schedule(); }).observe(canvas);
    var api = {
      canvas: canvas, start: start, ready: ready, setProgress: setProgress,
      setCount: function (n) { n = n | 0; if (n > 0 && n !== count) { count = n; dirty = true; schedule(); } },
      get isReady() { return isReady; }, get loaded() { return state.filter(function (s) { return s === 2; }).length; },
      get count() { return count; }, get dir() { return base; },
      destroy: function () { clearTimeout(bgTimer); if (rafId) cancelAnimationFrame(rafId); }
    };
    return api;
  }

  /* ---------- labeling: pan horizontal sobre la fila de etiquetas (flechas, puntos, swipe, teclado) ---------- */
  (function () {
    var box = $('#lb'); if (!box) return;
    var img = $('.lb__img', box), vp = $('.lb__vp', box), prev = $('.lb__btn--prev', box), next = $('.lb__btn--next', box), dots = $$('.lb__dot', box);
    /* centro (fraccion de la foto) y zoom de cada parada: columna izquierda, barra superior, columna derecha */
    var STOPS = [{ x: .435, y: .55, s: 3.1 }, { x: .50, y: .47, s: 3.1 }, { x: .575, y: .55, s: 3.1 }], cur = 0, drag = null;
    function pos(i) { var p = STOPS[i]; return { tx: .5 - p.x * p.s, ty: .5 - p.y * p.s, s: p.s }; }
    function apply(extra) {
      var p = pos(cur);
      img.style.transform = 'translate(' + ((p.tx + (extra || 0)) * 100).toFixed(3) + '%,' + (p.ty * 100).toFixed(3) + '%) scale(' + p.s + ')';
    }
    function go(i) {
      cur = clamp(i, 0, STOPS.length - 1); apply(0);
      prev.disabled = cur === 0; next.disabled = cur === STOPS.length - 1;
      dots.forEach(function (d, k) { d.setAttribute('aria-current', k === cur ? 'true' : 'false'); });
    }
    prev.addEventListener('click', function () { go(cur - 1); });
    next.addEventListener('click', function () { go(cur + 1); });
    dots.forEach(function (d, k) { d.addEventListener('click', function () { go(k); }); });
    vp.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { go(cur + 1); e.preventDefault(); } else if (e.key === 'ArrowLeft') { go(cur - 1); e.preventDefault(); }
    });
    vp.addEventListener('pointerdown', function (e) { if (e.pointerType === 'mouse' && e.button !== 0) return; drag = { x: e.clientX, id: e.pointerId, d: 0 }; });
    vp.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      drag.d = e.clientX - drag.x;
      if (Math.abs(drag.d) > 6) { if (!vp.hasPointerCapture(e.pointerId)) { try { vp.setPointerCapture(e.pointerId); } catch (x) { } } box.classList.add('is-drag'); apply(drag.d / vp.clientWidth); }
    });
    function end(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var d = drag.d; drag = null; box.classList.remove('is-drag');
      go(d < -40 ? cur + 1 : d > 40 ? cur - 1 : cur);
    }
    vp.addEventListener('pointerup', end); vp.addEventListener('pointercancel', end);
    go(0);
    /* una vez, al entrar en pantalla, recorre la fila (invita a deslizar) */
    if (!reduce && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) {
        if (!en[0].isIntersecting) return; io.disconnect();
        setTimeout(function () { if (!drag && cur === 0) { go(1); setTimeout(function () { if (!drag && cur === 1) go(0); }, 1500); } }, 500);
      }, { threshold: .6 });
      io.observe(box);
    }
  })();

  /* ---------- wiring: el pulso (CSS) solo corre mientras es visible ---------- */
  (function () {
    var w = $('#cw'); if (!w) return;
    if (!('IntersectionObserver' in window)) { w.classList.add('is-live'); return; }
    new IntersectionObserver(function (en) { w.classList.toggle('is-live', en[0].isIntersecting); }, { threshold: .2 }).observe(w);
  })();

  if (reduce || !window.gsap || !window.ScrollTrigger) return; /* mejora progresiva: queda el poster */
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- hero por scroll: sub-a -> sub-b -> caja (termina de frente) + titular ---------- */
  (function () {
    var hero = $('#vhero'); if (!hero) return;
    function mk(id, name, n) { return createScrubber({ canvas: $(id), dir: FR + name, mobileDir: FR + name + '-720', count: n, eager: 10 }); }
    var A = mk('#vh-a', 'sub-a', 90), B = mk('#vh-b', 'sub-b', 64), C = mk('#vh-c', 'caja', 90);
    A.start(); /* B y C se piden cuando A ya esta lista, para no competir con la primera pantalla */
    A.ready.then(function () { setTimeout(function () { B.start(); C.start(); }, 400); });
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: hero, start: 'top top', end: '+=330%', pin: true, scrub: true, anticipatePin: 1 }
    });
    /* eje del timeline = progreso 0..1 */
    tl.fromTo('#vh-lb', { opacity: 0 }, { opacity: 1, duration: .06 }, .34)
      .fromTo('#vh-lc', { opacity: 0 }, { opacity: 1, duration: .06 }, .62)
      .fromTo('#vhShade', { opacity: 0 }, { opacity: 1, duration: .1 }, .8)
      .fromTo('#vhCue', { opacity: 1 }, { opacity: 0, duration: .04 }, 0)
      .fromTo('.vh__cap[data-i="0"]', { opacity: 1 }, { opacity: 0, duration: .04 }, .31)
      .fromTo('.vh__cap[data-i="1"]', { opacity: 0 }, { opacity: 1, duration: .04 }, .40)
      .to('.vh__cap[data-i="1"]', { opacity: 0, duration: .04 }, .58)
      .fromTo('.vh__cap[data-i="2"]', { opacity: 0 }, { opacity: 1, duration: .04 }, .68)
      .to('.vh__cap[data-i="2"]', { opacity: 0, duration: .04 }, .78)
      .fromTo('#h1 .ln>span', { yPercent: 115 }, { yPercent: 0, duration: .08, stagger: .035, ease: 'power3.out' }, .84)
      .fromTo('#vhero .vh-t', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .08, stagger: .03, ease: 'power2.out' }, .9);
    tl.eventCallback('onUpdate', function () {
      var t = tl.progress();
      A.setProgress(t / .36); B.setProgress((t - .34) / .30); C.setProgress((t - .62) / .26);
    });
    A.setProgress(0);
  })();

  /* ---------- breaker y varilla: secuencias scrubbed con el scroll del bloque ---------- */
  function seq(sel, name, n) {
    var cv = $(sel); if (!cv) return;
    var s = createScrubber({ canvas: cv, dir: FR + name, mobileDir: FR + name + '-720', count: n, eager: 10 });
    var fig = cv.parentNode;
    ScrollTrigger.create({ trigger: fig, start: 'top bottom+=700', once: true, onEnter: function () { s.start(); } });
    ScrollTrigger.create({
      trigger: fig, start: 'top 82%', end: 'bottom 38%', scrub: true,
      onUpdate: function (self) { s.setProgress(self.progress); }
    });
  }
  seq('#ib-breaker', 'breaker', 72);
  seq('#ib-ground', 'varilla', 72);
})();
