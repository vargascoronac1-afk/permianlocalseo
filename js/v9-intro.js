/* Permian Local v9 - intro por scroll: carretera -> hero (telefonos con la rueda) -> deshacer -> tienda (2 pausas) -> ciudad.
   Los clips son secuencias de fotogramas webp dibujadas en <canvas> (drawImage, "cover"), elegidas por el progreso de ScrollTrigger.
   Mejora progresiva: sin JS o con prefers-reduced-motion queda el poster (foto) y los textos estaticos. */
(function () {
  'use strict';
  var doc = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var small = window.matchMedia('(max-width:768px)');
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function pad3(i) { return ('000' + i).slice(-3); }

  /* ---------------------------------------------------------------------------------------------
     createScrubber({canvas, dir, count, mobileDir, eager})
       - precarga los `eager` (10) primeros fotogramas antes de marcarse listo (canvas.classList 'is-ready');
         el resto se baja en segundo plano (lotes de 4); si se pide uno que no esta, se baja al momento y mientras
         se dibuja el cargado mas cercano.
       - dibuja con drawImage ajustando "cover" al tamano del canvas (devicePixelRatio, tope 2).
       - carpeta -720 (mobileDir) si matchMedia (max-width:768px).
       - setProgress(0..1). Nunca cambia el src de ningun <img>.
     --------------------------------------------------------------------------------------------- */
  function createScrubber(o) {
    var canvas = o.canvas, alpha = !!o.alpha, ctx = canvas.getContext('2d', { alpha: alpha }) || canvas.getContext('2d');
    var contain = o.fit === 'contain', maxStep = o.maxStep || 0, cur = -1;
    var count = Math.max(1, o.count | 0), eager = Math.min(o.eager || 10, count);
    var base = ((small.matches || o.light) && o.mobileDir) ? o.mobileDir : o.dir;
    var imgs = [], state = [], started = false, bgTimer = 0, rafId = 0, target = 0, drawn = -1, dirty = true;
    var readyRes, ready = new Promise(function (r) { readyRes = r; });
    var isReady = false;

    function url(i) { return base + '/f' + pad3(i) + '.webp'; }
    function load(i) {
      if (i < 0 || i >= count || state[i]) return;
      state[i] = 1; /* 1 cargando, 2 ok, 3 fallo */
      var im = new Image(); im.decoding = 'async'; imgs[i] = im;
      var fin = function (ok) { state[i] = ok ? 2 : 3; if (ok && (i === target || drawn < 0)) schedule(); };
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
  window.plV9 = { createScrubber: createScrubber };

  /* cambio de pantalla del telefono (1-4): funciona tambien sin gsap / con reduced-motion */
  (function () {
    var screen = $('#hs-screen'), slides = screen ? $$('.hs__slide', screen) : [], MAP = [0, 1, 2, 3, 0];
    if (!slides.length) return;
    var curK = -1, prevT = 0;
    function showSlide(k) { /* fundido cruzado: la anterior se queda debajo (is-prev) hasta que la nueva termina de aparecer */
      if (k === curK) return;
      slides.forEach(function (el, j) { el.classList.remove('is-prev'); if (j === curK) el.classList.add('is-prev'); el.classList.toggle('is-on', j === k); });
      curK = k; clearTimeout(prevT); prevT = setTimeout(function () { slides.forEach(function (el) { el.classList.remove('is-prev'); }); }, 700);
      screen.setAttribute('data-step', k);
    }
    showSlide(0);
    document.addEventListener('plhs', function (e) { showSlide(MAP[Math.min(e.detail.i, MAP.length - 1)]); });
  })();

  var road = $('#road'), shop = $('#data'), city = $('#city'), hero = $('.hero');
  if (!road && !shop && !city) return;
  var hasG = !!(window.gsap && window.ScrollTrigger);
  if (reduce || !hasG || !('requestAnimationFrame' in window)) return; /* queda el poster y los textos estaticos */
  doc.classList.add('v9-on');
  gsap.registerPlugin(ScrollTrigger);
  var IDEAS = doc.classList.contains('ideas'); /* ?ideas=1: version alternativa (cover-flow, 4 fotos, galeria); sin el parametro nada de esto corre */

  /* ---------- scrubbers ---------- */
  var S = {};
  function make(sec, sel, extra) {
    var cv = sec && $(sel, sec);
    if (!cv) return null;
    var clip = cv.getAttribute('data-clip'), cfg = { canvas: cv, dir: 'img/v9/frames/' + clip, mobileDir: 'img/v9/frames/' + clip + '-720', count: +cv.getAttribute('data-count') || 90, eager: 10 };
    for (var k in (extra || {})) cfg[k] = extra[k];
    var s = createScrubber(cfg);
    S[clip] = s; return s;
  }
  var A = make(road, '.v9-road__cv:not(.v9-road__cv--b)'), B = make(road, '.v9-road__cv--b');
  var T = make(shop, '.v9-shop__cv'), H = make(city, '.v9-city__cv', { eager: 20, maxStep: 1 }); /* houston: 20 antes de mostrar, y nunca salta mas de 1 fotograma por frame */
  var extras = $('#extras'), V = null;
  if (extras) {
    var tcv = $('.v9-truck__cv', extras);
    if (tcv) V = createScrubber({ canvas: tcv, dir: 'img/v9/silverado', mobileDir: 'img/v9/silverado-720', count: +tcv.getAttribute('data-count') || 72, eager: 10, alpha: true, fit: 'contain', onShow: function () { extras.classList.add('is-v9truck'); } });
  }

  /* numero de fotogramas real: MANIFEST.json (si existe) manda sobre data-count */
  function manifestCount(m, clip) {
    var v = m && (m[clip] != null ? m[clip] : (m.clips && m.clips[clip] != null ? m.clips[clip] : (m.frames && m.frames[clip] != null ? m.frames[clip] : null)));
    if (v == null && Array.isArray(m && m.clips)) { m.clips.forEach(function (c) { if (c && (c.name === clip || c.clip === clip || c.id === clip)) v = c; }); }
    if (v && typeof v === 'object') v = v.fotogramas != null ? v.fotogramas : (v.count != null ? v.count : (v.frames != null ? v.frames : (v.n != null ? v.n : (v.nframes != null ? v.nframes : null))));
    if (Array.isArray(v)) v = v.length;
    return +v > 0 ? +v : 0;
  }
  if (window.fetch) {
    fetch('img/v9/MANIFEST.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (m) {
      if (!m) return;
      Object.keys(S).forEach(function (clip) { var n = manifestCount(m, clip); if (n) S[clip].setCount(n); });
    }).catch(function () {});
  }

  /* ---------- orden de precarga: A ya; B tras los 10 de A; tienda al acercarse al hero; houston al acercarse a la tienda ---------- */
  function near(el, margin, fn) {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { fn(); return; }
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); fn(); } }, { rootMargin: margin + ' 0px ' + margin + ' 0px' });
    io.observe(el);
  }
  if (A) A.start().then(function () { if (B) B.start(); });
  near(hero, '60%', function () { if (H) H.start(); });
  near(city, '120%', function () { if (T) T.start(); });
  near(extras, '100%', function () { if (V) V.start(); });
  /* si el visitante entra por un ancla (p. ej. #contact), no hace falta bajar nada que no vea: solo empezamos lo que se acerca */

  /* ---------- 1. CARRETERA: pin 2.5 pantallas; 0-.5 intro-a, .5-1 intro-b (fundido cruzado); titular al 85 % ---------- */
  if (road && A) {
    var cb = B && B.canvas, title = $('.v9-road__title', road), cue = $('.v9-road__cue', road), titleOn = false, cueOn = true;
    ScrollTrigger.create({
      trigger: road, start: 'top top', end: '+=250%', pin: true, refreshPriority: 10, scrub: true, anticipatePin: 1,
      onUpdate: function (self) {
        var p = self.progress;
        A.start(); A.setProgress(clamp(p / 0.5, 0, 1));
        if (B) {
          B.start(); B.setProgress(clamp((p - 0.5) / 0.5, 0, 1));
          var x = clamp((p - 0.44) / 0.12, 0, 1); /* fundido cruzado entre .44 y .56 */
          cb.style.opacity = x * x * (3 - 2 * x);
        }
        var t = p >= 0.85; if (t !== titleOn) { titleOn = t; title.classList.toggle('is-on', t); }
        var c = p < 0.03; if (c !== cueOn) { cueOn = c; cue.classList.toggle('is-on', c); }
      }
    });
    if (cue) cue.classList.add('is-on');
    if (cb) cb.style.opacity = 0;
  }

  /* ---------- ?ideas=1 (5): cover-flow. Central frontal y grande, laterales en perspectiva (rotateY +-35, mas pequenos y atenuados);
     el scroll mueve una posicion continua `cf` (1 -> 3) con amortiguacion y cada telefono muestra su captura larga con scroll interno lento. ---------- */
  function coverFlow(hero) {
    var box = $('.phones', hero);
    if (!box) return null;
    var pfs = $$('.pf', box), n = pfs.length, cf = 1, tgt = 1, raf = 0, on = true, longs = ['electricista', 'taller', 'taqueria'], off = 200;
    doc.classList.add('ideas-cf');
    pfs.forEach(function (pf, i) {
      var im = $('.pf__poster', pf);
      if (!im) return;
      /* captura larga como fondo de un div (solo se pinta lo visible; una <img> alta con transform dentro de un telefono 3D a veces no se rasterizaba) */
      var url = 'img/v9/ideas/' + (longs[+pf.getAttribute('data-i')] || longs[i]) + '-long.webp', dv = document.createElement('div'), pre = new Image();
      dv.className = 'pf__poster pf__long'; dv.style.backgroundImage = 'url(' + url + ')'; dv._ratio = 6; /* alto/ancho, se corrige al cargar */
      pre.onload = function () { dv._ratio = pre.naturalHeight / pre.naturalWidth; }; pre.src = url;
      im.parentNode.replaceChild(dv, im);
    });
    function sm(x) { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); }
    function readOff() { off = parseFloat(getComputedStyle(box).getPropertyValue('--off')) || 200; }
    function frame(now) {
      raf = 0;
      if (!on) return;
      cf += (tgt - cf) * 0.14; if (Math.abs(tgt - cf) < 0.0004) cf = tgt;
      var want = ((Math.round(tgt) % n) + n) % n;
      if (window.plCarousel && window.plCarousel.cur !== want) { /* cambio externo (flechas, puntos, toque): el abanico lo sigue */
        var dl = ((window.plCarousel.cur - want + n + 1) % n) - 1; tgt = Math.round(tgt) + dl;
      }
      pfs.forEach(function (pf, i) {
        var d = i - cf; d -= n * Math.round(d / n);
        var ad = Math.min(Math.abs(d), 1), cd = clamp(d, -1.5, 1.5);
        pf.style.transform = 'translate(calc(-50% + ' + (cd * off * 0.86).toFixed(1) + 'px),-50%) translateZ(' + (-170 * ad).toFixed(1) + 'px) rotateY(' + (-clamp(d, -1, 1) * 35).toFixed(2) + 'deg) scale(' + (1.02 - 0.28 * ad).toFixed(3) + ')';
        pf.style.opacity = (1 - 0.22 * ad).toFixed(3);
        pf.style.zIndex = String(10 - Math.round(ad * 6));
        var im = $('.pf__long', pf), sc = $('.pf__screen', pf);
        if (im && sc) {
          var range = Math.max(0, im._ratio * sc.clientWidth - sc.clientHeight), per = Math.max(1, range * 2), ph = ((now / 1000) * 26 + i * 211) % per, y = ph < range ? ph : per - ph; /* ida y vuelta lenta */
          im.style.backgroundPosition = '0 ' + (-y).toFixed(1) + 'px';
        }
      });
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && on) raf = requestAnimationFrame(frame); }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { on = es[0].isIntersecting; if (on) { readOff(); kick(); } }, { rootMargin: '10% 0px' }).observe(hero);
    window.addEventListener('resize', readOff);
    readOff(); kick();
    return {
      set: function (p) { /* p 0..1 -> cada telefono se queda centrado el 25 % de su tramo */
        var u = clamp(p, 0, 1) * 2, base = Math.min(Math.floor(u), 2), fr = u - base;
        tgt = 1 + base + sm((fr - 0.25) / 0.5);
        var idx = ((Math.round(tgt) % n) + n) % n;
        if (window.plCarousel && window.plCarousel.cur !== idx) window.plCarousel.go(idx);
        kick();
      }
    };
  }

  /* ---------- 2/3. HERO: los telefonos avanzan con la rueda y despues el hero se deshace ---------- */
  if (hero) {
    var order = [1, 2, 0], lastIdx = 1, cflow = IDEAS ? coverFlow(hero) : null;
    function carousel(p) {
      if (cflow) { cflow.set(p); return; }
      var idx = order[Math.min(2, Math.floor(clamp(p, 0, 0.999) * 3))];
      if (idx !== lastIdx) { lastIdx = idx; if (window.plCarousel) window.plCarousel.go(idx); }
    }
    var mm = gsap.matchMedia();
    mm.add('(min-width:900px)', function () {
      var over = hero.offsetHeight - window.innerHeight; /* hero mas alto que la ventana: se fija con su borde inferior abajo (solo se recorta su relleno superior) */
      if (over > 96) return flowHero(); /* ventana muy baja: sin pin */
      var ci = { p: 0 };
      if (city) city.style.marginTop = '-100svh'; /* la ciudad sube sobre el final del deshacer: sin tramo negro */
      var tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: hero, start: over > 2 ? 'bottom bottom' : 'top top', end: '+=250%', pin: true, refreshPriority: 10, scrub: true, anticipatePin: 1 } });
      tl.to(ci, { p: 1, duration: 0.6, onUpdate: function () { carousel(ci.p); } }, 0);
      /* deshacer (ultima parte = 1 pantalla): titular a la izquierda, telefono a la derecha, fotos caen escalonadas */
      tl.to('.hero__copy', { x: '-40vw', opacity: 0, duration: 0.34, ease: 'power1.in' }, 0.62)
        .to('.pcar', { x: '40vw', duration: 0.38, ease: 'power1.in' }, 0.62)
        .to('.pcar', { opacity: 0, duration: 0.14 }, 0.86)
        .to('.marquee .chip', { y: '60vh', opacity: 0, duration: 0.2, ease: 'power1.in', stagger: 0.011 }, 0.64)
        .to('.hero__foot, .hero__word, .hero__halo-a, .hero__grid', { opacity: 0, duration: 0.2 }, 0.8);
      return function () { lastIdx = window.plCarousel ? window.plCarousel.cur : 1; if (city) city.style.marginTop = ''; };
    });
    mm.add('(max-width:899px)', function () { return flowHero(); });
    /* variante sin pin (movil / ventana baja): las mismas tres cosas, pero atadas a su propio paso por la pantalla */
    function flowHero() {
      var pcar = $('.pcar', hero), copy = $('.hero__copy', hero), chips = $$('.marquee .chip', hero);
      ScrollTrigger.create({ trigger: pcar, start: 'top 85%', end: 'bottom 35%', scrub: true, onUpdate: function (s) { carousel(s.progress); } });
      gsap.to(pcar, { x: '40vw', opacity: 0, ease: 'power1.in', scrollTrigger: { trigger: pcar, start: 'center 28%', end: 'bottom -10%', scrub: true } });
      gsap.to(copy, { x: '-40vw', opacity: 0, ease: 'power1.in', scrollTrigger: { trigger: copy, start: 'bottom 30%', end: 'bottom -10%', scrub: true } });
      gsap.to(chips, { y: '60vh', opacity: 0, ease: 'power1.in', stagger: 0.02, scrollTrigger: { trigger: $('.marquee', hero), start: 'top 45%', end: 'bottom -20%', scrub: true } });
    }
  }

  /* ---------- CIUDAD (va justo despues del deshacer): entra con fundido y houston se mueve con el scroll ---------- */
  if (city && H) {
    var ch = $('.v9-city__h', city), chOn = false, cstage = $('.v9-city__stage', city);
    /* escenario fijo: fundido sobre el final del deshacer (city sube 100svh sobre el hero fijado), se mantiene 200svh y la tienda lo tapa */
    gsap.fromTo(cstage, { opacity: 0 }, { opacity: 1, ease: 'none', scrollTrigger: { trigger: city, start: 'top 45%', end: 'top top', scrub: true } });
    ScrollTrigger.create({ trigger: city, start: 'top 45%', end: 'bottom top', onToggle: function (self) { cstage.style.visibility = self.isActive ? 'visible' : 'hidden'; if (self.isActive) H.start(); } });
    ScrollTrigger.create({
      trigger: city, start: 'top top', end: '+=200%', scrub: true,
      onUpdate: function (self) {
        var p = self.progress;
        H.start(); H.setProgress(p);
        var t = p >= 0.3; if (t !== chOn) { chOn = t; ch.classList.toggle('is-on', t); }
      }
    });
  }

  /* ---------- TIENDA: pin 3 pantallas (300 %; cada pausa = 24 % = 0,72 pantallas de recorrido + freno de Lenis). ----------
     p:  [0 .. .18] fotogramas 0 -> 45 % | [.18 .. .42] PAUSA 1 (45 %) | [.42 .. .74] 45 -> 95 %
         [.74 .. .98] PAUSA 2 (95 %)     | [.98 .. 1] 95 -> 100 %   (pausas de 24 % = 0,72 pantallas) */
  var SEG = [[0, 0.18, 0, 0.45], [0.18, 0.42, 0.45, 0.45], [0.42, 0.74, 0.45, 0.95], [0.74, 0.98, 0.95, 0.95], [0.98, 1, 0.95, 1]];
  function frameAt(p) {
    for (var i = 0; i < SEG.length; i++) { var sg = SEG[i]; if (p <= sg[1]) return sg[2] + (sg[3] - sg[2]) * clamp((p - sg[0]) / (sg[1] - sg[0]), 0, 1); }
    return 1;
  }
  /* freno: al entrar en una pausa baja la velocidad de Lenis (rueda x0.22, duracion 2.8 s) durante 1.2 s y la restaura */
  var brakeT = 0, brakeSaved = null;
  function brakeOff() {
    clearTimeout(brakeT); brakeT = 0;
    var L = window.plLenis; if (!L || !brakeSaved) return;
    if (L.virtualScroll && L.virtualScroll.options) L.virtualScroll.options.wheelMultiplier = brakeSaved.w;
    L.options.duration = brakeSaved.d; brakeSaved = null;
  }
  function brakeOn() {
    var L = window.plLenis; if (!L) return;
    if (!brakeSaved) brakeSaved = { w: L.virtualScroll && L.virtualScroll.options ? L.virtualScroll.options.wheelMultiplier : 1, d: L.options.duration };
    if (L.virtualScroll && L.virtualScroll.options) L.virtualScroll.options.wheelMultiplier = 0.22;
    L.options.duration = 2.8;
    clearTimeout(brakeT); brakeT = setTimeout(brakeOff, 1200);
  }
  window.plV9.brake = brakeOn;
  if (shop && T) {
    var d1 = $('.v9-d1', shop), d2 = $('.v9-d2', shop), cnt = $('.v9-count', shop), counted = false, o1 = false, o2 = false, in1 = false, in2 = false;
    if (cnt) cnt.textContent = '1';
    function runCount() {
      if (counted || !cnt) return; counted = true;
      var to = parseInt(cnt.getAttribute('data-to'), 10) || 34, obj = { v: 1 };
      gsap.to(obj, { v: to, duration: 1.2, ease: 'power2.out', onUpdate: function () { cnt.textContent = Math.round(obj.v); }, onComplete: function () { cnt.textContent = to; } });
    }
    ScrollTrigger.create({
      trigger: shop, start: 'top top', end: '+=300%', pin: true, refreshPriority: 10, scrub: true, anticipatePin: 1,
      onLeave: brakeOff, onLeaveBack: brakeOff,
      onUpdate: function (self) {
        var p = self.progress;
        T.start(); T.setProgress(frameAt(p)); /* start() es idempotente: cubre saltos por ancla */
        var i1 = p >= 0.18 && p < 0.42, i2 = p >= 0.74 && p < 0.98;
        if ((i1 && !in1) || (i2 && !in2)) brakeOn();
        in1 = i1; in2 = i2;
        var a = p >= 0.18 && p < 0.46, b = p >= 0.74;
        if (a !== o1) { o1 = a; d1.classList.toggle('is-on', a); }
        if (a && !counted) runCount();
        if (b !== o2) { o2 = b; d2.classList.toggle('is-on', b); }
      }
    });
  }

  /* ---------- ?ideas=1 (7): galeria horizontal de #work. Seccion fijada; 3 tarjetas altas (taller, electricista, taqueria); la captura larga de cada
     demo hace scroll interno al llegar al centro y el color de fondo pasa al del negocio. Titular fijo arriba a la izquierda. ---------- */
  if (IDEAS) (function () {
    var sec = $('#work'), panels = sec ? $$('.stack .panel', sec) : [];
    if (!panels.length) return;
    var COL = { taller: { bg: [200, 16, 46], ink: [255, 255, 255] }, electricista: { bg: [255, 212, 0], ink: [10, 19, 48] }, taqueria: { bg: [31, 74, 40], ink: [248, 238, 214] } };
    var wk = document.createElement('div'); wk.className = 'wk';
    var html = '<div class="wk__track">', slugs = [];
    panels.forEach(function (p) {
      var a = $('.panel__txt .btn', p), h3 = $('h3', p), href = a ? a.getAttribute('href') : '#', slug = (href.match(/demos\/([^\/]+)/) || [0, 'taller'])[1];
      slugs.push(slug);
      html += '<a class="wk__card" href="' + href + '" target="_blank" rel="noopener" aria-label="' + (a ? a.getAttribute('aria-label') : '') + '" data-i18n-aria="' + (a ? a.getAttribute('data-i18n-aria') : '') + '">' +
        '<span class="wk__frame"><img class="wk__img" src="img/v9/ideas/' + slug + '-long.webp" alt="" decoding="async"></span>' +
        '<span class="wk__cap"><b data-i18n="' + h3.getAttribute('data-i18n') + '">' + h3.textContent + '</b><span><span data-i18n="w_open">Open demo</span> &#8599;</span></span></a>';
    });
    wk.innerHTML = html + '</div>';
    sec.appendChild(wk); sec.classList.add('is-gal');
    var track = $('.wk__track', wk), cards = $$('.wk__card', wk), imgs = $$('.wk__img', wk), frames = $$('.wk__frame', wk), cx = [], range = [], lastW = 0, DW = 1.35, TT = 2 * DW + 1;
    function smooth2(x) { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); }
    function measure() {
      track.style.transform = 'none';
      cx = cards.map(function (c) { return c.offsetLeft + c.offsetWidth / 2; });
      range = imgs.map(function (im, i) { return Math.max(0, im.offsetHeight - frames[i].clientHeight); });
      update(lastW);
    }
    function update(p) {
      lastW = p;
      var t = clamp(p, 0, 1) * TT, i = Math.min(2, Math.floor(t / DW)), r = t - i * DW, f = Math.min(r, 1), pos = i + (r > 1 ? smooth2((r - 1) / (DW - 1)) : 0);
      var a = Math.min(2, Math.floor(pos)), b = Math.min(2, a + 1), fr = pos - a, c = (cx[a] || 0) + ((cx[b] || 0) - (cx[a] || 0)) * fr;
      track.style.transform = 'translate3d(' + (wk.clientWidth / 2 - c).toFixed(1) + 'px,0,0)';
      cards.forEach(function (cd, k) {
        var sc = k < i ? 1 : k > i ? 0 : f, near = Math.min(1, Math.abs(k - pos));
        imgs[k].style.transform = 'translate3d(0,' + (-sc * (range[k] || 0)).toFixed(1) + 'px,0)';
        cd.style.transform = 'scale(' + (1 - 0.1 * near).toFixed(3) + ')';
        cd.style.opacity = (1 - 0.45 * near).toFixed(3);
      });
      var A = COL[slugs[a]] || COL.taller, B = COL[slugs[b]] || A, e = smooth2(fr);
      function mix(x, y) { return 'rgb(' + [0, 1, 2].map(function (q) { return Math.round(x[q] + (y[q] - x[q]) * e); }).join(',') + ')'; }
      sec.style.setProperty('--wk-bg', mix(A.bg, B.bg));
    }
    imgs.forEach(function (im) { im.addEventListener('load', function () { ScrollTrigger.refresh(); }); });
    ScrollTrigger.create({ trigger: sec, start: 'top top', end: '+=360%', pin: true, refreshPriority: 10, scrub: true, anticipatePin: 1, onRefresh: measure, onUpdate: function (self) { update(self.progress); } });
    measure();
  })();

  /* ---------- SILVERADO a pantalla completa: pin 250 %. 0-.70 vuelta de 360 grados (grande y centrada), .70-.90 viaja y se reduce
     a su hueco (.stage3d), .88-1 entra el texto. Solo transform (variables --tx/--ty/--ts), sin re-layout. ---------- */
  if (extras && V) {
    var truck = $('.v9-truck', extras), slot = $('.stage3d', extras), geo = { tx: 0, ty: 0, ts: 1 }, lastP = 0;
    /* ?ideas=1 (6): 4 fotos (4 vistas distintas de la secuencia) entran desde los bordes como tarjetas con marco blanco y se funden en la camioneta.
       Por foto: [salida x vw, salida y vh, giro de salida, destino x vw, destino y vh, giro final] */
    var phc = [], PHS = [[-80, -4, -18, -17, -17, -6], [80, 6, 15, 17, -13, 5], [-12, -90, 12, -14, 15, 3], [12, 90, -14, 16, 18, -4]];
    if (IDEAS) {
      var phw = document.createElement('div'); phw.className = 'v9-ph'; phw.setAttribute('aria-hidden', 'true');
      [0, 18, 36, 54].forEach(function (fi) {
        var c = document.createElement('div'); c.className = 'v9-ph__c';
        c.innerHTML = '<img src="img/v9/silverado-720/f' + pad3(fi) + '.webp" alt="" decoding="async">';
        phw.appendChild(c); phc.push(c);
      });
      extras.appendChild(phw);
    }
    function ease3(x) { x = clamp(x, 0, 1); return 1 - Math.pow(1 - x, 3); }
    function placePhotos(P) {
      var m = smooth((P - 0.19) / 0.09), k = small.matches ? 0.8 : 1;
      phc.forEach(function (c, i) {
        var u = ease3((P - i * 0.025) / 0.10), S = PHS[i];
        c.style.setProperty('--px', ((S[0] + (S[3] * k - S[0]) * u) * (1 - m)).toFixed(2) + 'vw');
        c.style.setProperty('--py', ((S[1] + (S[4] * k - S[1]) * u) * (1 - m)).toFixed(2) + 'vh');
        c.style.setProperty('--r', ((S[2] + (S[5] - S[2]) * u) * (1 - m)).toFixed(2) + 'deg');
        c.style.setProperty('--s', (1 - 0.5 * m).toFixed(3));
        c.style.setProperty('--o', (Math.min(1, u * 3) * (1 - m)).toFixed(3));
      });
      extras.style.setProperty('--tv', m.toFixed(3));
    }
    function smooth(x) { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); }
    function measure() {
      truck.style.setProperty('--tx', '0px'); truck.style.setProperty('--ty', '0px'); truck.style.setProperty('--ts', '1');
      var tr = truck.getBoundingClientRect(), st = slot.getBoundingClientRect();
      if (!tr.width || !st.width) return;
      geo.tx = st.left + st.width / 2 - (tr.left + tr.width / 2);
      geo.ty = st.top + st.height * 0.52 - (tr.top + tr.height / 2);
      geo.ts = Math.min(st.width, 760) / tr.width;
      place(lastP);
    }
    function place(p) {
      lastP = p;
      var rot = clamp(p / 0.70, 0, 1), mv = smooth((p - 0.70) / 0.20), tx = clamp((p - 0.88) / 0.12, 0, 1);
      if (IDEAS) { rot = clamp((p - 0.28) / 0.50, 0, 1); mv = smooth((p - 0.78) / 0.14); tx = clamp((p - 0.90) / 0.10, 0, 1); placePhotos(p); } /* 0-.28 fotos, .28-.78 vuelta, .78-.92 viaja, .90-1 texto */
      V.start(); V.setProgress(rot);
      truck.style.setProperty('--tx', (geo.tx * mv).toFixed(1) + 'px');
      truck.style.setProperty('--ty', (geo.ty * mv).toFixed(1) + 'px');
      truck.style.setProperty('--ts', (1 + (geo.ts - 1) * mv).toFixed(4));
      var ang = rot * Math.PI * 2, c = Math.abs(Math.cos(ang));
      truck.style.setProperty('--sx', (0.58 + 0.42 * c).toFixed(3));
      truck.style.setProperty('--so', (0.62 + 0.3 * c).toFixed(3));
      extras.style.setProperty('--fin', mv.toFixed(3));
      extras.style.setProperty('--txt', smooth(tx).toFixed(3));
    }
    ScrollTrigger.create({
      trigger: extras, start: 'top top', end: IDEAS ? '+=330%' : '+=250%', pin: true, refreshPriority: 10, scrub: true, anticipatePin: 1,
      onRefresh: measure, onUpdate: function (self) { place(self.progress); }
    });
    measure(); place(0);
  }

  /* ---------- TELEFONO (1-2-3-4): el contenido del telefono cambia con deslizamiento + fundido ---------- */
  var hs = $('#features');
  if (hs && window.plHs) {
    var lock = false, hsST = null;
    var NS = window.plHs.n;
    function onHs(self) {
      if (lock) return;
      var i = clamp(Math.floor(self.progress * NS), 0, NS - 1);
      if (i !== window.plHs.cur) window.plHs.go(i, true);
    }
    var hmm = gsap.matchMedia();
    hmm.add('(min-width:900px) and (min-height:640px)', function () {
      /* se fija la SECCION entera (fondo + marco del telefono quietos); el telefono se reduce lo justo para que quepa en la ventana */
      var grid = $('.hs__grid', hs), ph = $('.hs__phone', hs), fixedH, k;
      hs.classList.add('is-pin');
      fixedH = hs.offsetHeight - grid.offsetHeight;
      k = (window.innerHeight - fixedH - 18) / 740;
      if (k >= 0.5) {
        ph.style.setProperty('--k', Math.min(k, 0.86).toFixed(3));
        hsST = ScrollTrigger.create({ trigger: hs, start: 'top top', end: '+=' + (NS * 55) + '%', pin: true, refreshPriority: 5, anticipatePin: 1, onUpdate: onHs });
      } else {
        hs.classList.remove('is-pin'); ph.style.removeProperty('--k');
        hsST = ScrollTrigger.create({ trigger: ph, start: 'top 75%', end: 'bottom 40%', onUpdate: onHs });
      }
      return function () { hsST = null; hs.classList.remove('is-pin'); ph.style.removeProperty('--k'); };
    });
    hmm.add('(max-width:899px), (max-height:639px)', function () {
      hsST = ScrollTrigger.create({ trigger: $('.hs__phone', hs), start: 'top 70%', end: 'bottom 40%', onUpdate: onHs });
      return function () { hsST = null; };
    });
    /* al pulsar un numero o un punto, el scroll se coloca en ese paso (si no, la siguiente actualizacion del scroll lo revertiria) */
    $$('.hs__tabs button, .hs__dot', hs).forEach(function (b) {
      b.addEventListener('click', function () {
        if (!hsST) return;
        var i = window.plHs.cur, y = hsST.start + (i + 0.5) / NS * (hsST.end - hsST.start);
        if (Math.abs(window.scrollY - y) < 4) return;
        lock = true; var done = function () { lock = false; };
        if (window.plLenis) window.plLenis.scrollTo(y, { duration: 0.8, onComplete: done }); else { window.scrollTo(0, y); done(); }
        setTimeout(done, 1400);
      });
    });
  }

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
