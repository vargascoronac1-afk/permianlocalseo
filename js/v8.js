/* Permian Local v8 - movimiento y comportamiento (secciones 0-5 y cromo global).
   Mejora progresiva: sin JS o con prefers-reduced-motion el contenido se ve completo y estatico. */
(function () {
  'use strict';
  var doc = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover:hover) and (pointer:fine) and (min-width:900px)');
  var hasG = !!(window.gsap && window.ScrollTrigger);
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  /* El i18n guarda el HTML original en la primera aplicacion: forzarla ahora, antes de tocar el DOM */
  if (window.plSetLang) window.plSetLang(doc.lang === 'es' ? 'es' : 'en');

  /* ---------- menu movil ---------- */
  (function () {
    var btn = $('.menu-btn'), nav = $('#site-nav');
    if (!btn || !nav) return;
    function set(open) { btn.setAttribute('aria-expanded', open ? 'true' : 'false'); nav.classList.toggle('is-open', open); }
    btn.addEventListener('click', function () { set(btn.getAttribute('aria-expanded') !== 'true'); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { set(false); btn.focus(); } });
    window.matchMedia('(min-width:900px)').addEventListener('change', function () { set(false); });
  })();

  /* ---------- cabecera, barra de progreso (alto del documento en cache: nada de leer layout en cada scroll) ---------- */
  var header = $('.site-header'), bar = $('.progress'), ticking = false, maxScroll = 0, solid = false;
  function measure() { maxScroll = doc.scrollHeight - window.innerHeight; }
  function onScroll() {
    ticking = false;
    var y = window.scrollY, s = y > 40;
    if (header && s !== solid) { solid = s; header.classList.toggle('is-solid', s); }
    if (bar) bar.style.transform = 'scaleX(' + (maxScroll > 0 ? Math.min(1, y / maxScroll) : 0) + ')';
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', function () { measure(); onScroll(); });
  window.addEventListener('load', function () { measure(); onScroll(); });
  if (window.ResizeObserver) new ResizeObserver(measure).observe(doc);
  measure(); onScroll();

  /* ---------- fondo del body por seccion ---------- */
  (function () {
    var map = { 'bg': 'var(--bg)', 'bg-2': 'var(--bg-2)', 'bg-3': 'var(--bg-3)', 'bone': 'var(--bone)', 'bone-2': 'var(--bone-2)' };
    var secs = $$('main > section');
    if (!('IntersectionObserver' in window)) return;
    /* barra segmentada del hero: seccion numerada vigente (01-09) por el eyebrow "// NN" */
    var segs = $$('.hprog__segs i'), nEl = document.querySelector('.hprog__n'), cur = 1;
    secs.forEach(function (s) { var eb = s.querySelector('.eyebrow'), m = eb && /\/\/\s*(\d\d)/.exec(eb.textContent); if (m) cur = +m[1]; s._n = cur; });
    function prog(n) {
      if (nEl) nEl.textContent = (n < 10 ? '0' : '') + n;
      var on = Math.ceil(n / 9 * segs.length);
      segs.forEach(function (g, i) { g.classList.toggle('on', i < on); });
    }
    prog(1);
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var k = e.target.getAttribute('data-bg') || 'bg';
        document.body.style.setProperty('--page-bg', map[k] || k);
        prog(e.target._n || 1);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(function (s) { io.observe(s); });
/* cabecera: clara u oscura segun la seccion bajo ella (franja superior) */    var hio = new IntersectionObserver(function (es) {      es.forEach(function (e) {        if (!e.isIntersecting || !header) return;        header.classList.toggle('on-light', e.target.classList.contains('is-light'));      });    }, { rootMargin: '-2% 0px -94% 0px' });    secs.forEach(function (s) { hio.observe(s); });
  })();

  /* ---------- iframes: politica estricta. Solo tienen src los que se ven (hero 1, trabajos 1, comparador 2, hotspots 1);
     el resto vuelve a su poster. Las cargas van en cola, de una en una. ---------- */
  var queue = [], busy = false, curLoad = null, lastScrollT = 0;
  /* las demos son del mismo origen (mismo hilo): nada de montar ni desmontar una durante el gesto de scroll, se espera a que pare */
  window.addEventListener('scroll', function () { lastScrollT = performance.now(); }, { passive: true });
  function scrolling() { return performance.now() - lastScrollT < 250; }
  function isLive(f) { var s = f.getAttribute('src'); return !!s && s !== 'about:blank'; }
  function posterOf(f) { return f.parentNode && f.parentNode.querySelector('.pf__poster'); }
  /* poster: se desvanece (400 ms) cuando el iframe carga y luego queda hidden */
  function hidePoster(f) {
    var p = posterOf(f);
    if (!p || p.hidden) return;
    if (reduce) { p.hidden = true; return; }
    p.classList.add('is-gone');
    setTimeout(function () { if (f.dataset.on === '1') p.hidden = true; }, 420);
  }
  function showPoster(f) { var p = posterOf(f); if (p) { p.hidden = false; p.classList.remove('is-gone'); } }
  function pump() {
    if (busy || !queue.length) return;
    if (scrolling()) { setTimeout(pump, 120); return; }
    var f = queue.shift();
    if (f.dataset.on !== '1' || isLive(f)) { pump(); return; }
    busy = true;
    var done = false;
    function fin() { if (done) return; done = true; if (curLoad && curLoad.f === f) curLoad = null; if (f.dataset.on === '1') f.classList.add('is-ready'); busy = false; setTimeout(pump, 150); }
    curLoad = { f: f, fin: fin };
    f.addEventListener('load', function () { if (f.dataset.on === '1') hidePoster(f); fin(); }, { once: true });
    setTimeout(fin, 7000);
    f.src = f.getAttribute('data-lazy');
  }
  function loadFrame(f) {
    if (!f) return;
    f.dataset.on = '1';
    if (isLive(f) || queue.indexOf(f) > -1) return;
    queue.push(f); pump();
  }
  function unloadFrame(f) {
    if (!f) return;
    f.dataset.on = '0';
    var q = queue.indexOf(f); if (q > -1) queue.splice(q, 1);
    if (!isLive(f)) return;
    if (curLoad && curLoad.f === f) curLoad.fin();
    (function blank() {
      if (f.dataset.on !== '0' || !isLive(f)) return;
      if (scrolling()) { setTimeout(blank, 150); return; }
      f.classList.remove('is-ready'); showPoster(f);
      f.src = 'about:blank';
      f.addEventListener('load', function () { if (f.getAttribute('src') === 'about:blank') f.removeAttribute('src'); }, { once: true });
    })();
  }
  /* observa un elemento con margen: on() al acercarse, off() al alejarse; sin IntersectionObserver, on() de una vez */
  function near(el, margin, on, off) {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { on(); return; }
    new IntersectionObserver(function (es) { if (es[es.length - 1].isIntersecting) on(); else off(); }, { rootMargin: margin + ' 0px ' + margin + ' 0px' }).observe(el);
  }
  function framesOf(root) { return $$('iframe[data-lazy]', root); }

  /* comparador y hotspots: cargan al acercarse (menos de ~1 pantalla) y descargan al alejarse */
  [$('#compare'), $('#features')].forEach(function (sec) {
    var fr = framesOf(sec);
    if (!sec || !fr.length) return;
    function start() { near(sec, '35%', function () { fr.forEach(loadFrame); }, function () { fr.forEach(unloadFrame); }); }
    if (document.readyState === 'complete') setTimeout(start, 200); else window.addEventListener('load', function () { setTimeout(start, 200); });
  });

  /* trabajos: solo el panel activo del stack (el ultimo que ha entrado) tiene su iframe vivo: portatil >=900, telefono <900 */
  (function () {
    var panels = (doc.classList.contains('ideas') && !reduce) ? [] : $$('.stack .panel');
    if (!panels.length) return;
    var wide = window.matchMedia('(min-width:900px)'), seen = [];
    function pick(p) { return $(wide.matches ? '.laptop__screen iframe' : '.panel__phone iframe', p); }
    function apply() {
      var top = -1;
      panels.forEach(function (p, i) { if (seen[i]) top = i; });
      panels.forEach(function (p, i) {
        var keep = i === top ? pick(p) : null;
        framesOf(p).forEach(function (f) { if (f === keep) loadFrame(f); else unloadFrame(f); });
      });
    }
    function start() {
      if (!('IntersectionObserver' in window)) { seen[0] = true; apply(); return; }
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { seen[panels.indexOf(e.target)] = e.isIntersecting; });
        apply();
      }, { rootMargin: '0px 0px -10% 0px' });
      panels.forEach(function (p) { io.observe(p); });
      if (wide.addEventListener) wide.addEventListener('change', apply);
    }
    if (document.readyState === 'complete') setTimeout(start, 200); else window.addEventListener('load', function () { setTimeout(start, 200); });
  })();

  /* animaciones infinitas (marquee, vaiven de telefonos, puntos, borde conico) en pausa fuera de pantalla */
  (function () {
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('is-off', !e.isIntersecting); }); }, { rootMargin: '10% 0px 10% 0px' });
    $$('.marquee, .hero, .hs, .b-plan--main').forEach(function (el) { io.observe(el); });
  })();

  /* ---------- hero: carrusel de telefonos (abanico 3D; deslizar, flechas, puntos, teclado) ---------- */
  (function () {
    var car = $('.pcar'), box = $('.phones');
    if (!car || !box) return;
    var mq = window.matchMedia('(max-width:899px), (pointer:coarse)');
    var slides = $$('.pf', box), dots = $$('.pnav__dot', car), n = slides.length, cur = 1, loadT = 0, ready = false, heroOn = true;
    function mob() { return mq.matches; }
    function frame(i) { return $('iframe[data-lazy]', slides[i]); }
    /* en el hero vive como mucho 1 iframe: el del telefono central; al rotar, sale el viejo y entra el nuevo */
    function load(i) {
      if (doc.classList.contains('ideas') && doc.classList.contains('v9-on')) return; /* ?ideas=1: el telefono central muestra su captura larga, sin iframe */
      slides.forEach(function (s, k) { var f = frame(k); if (k === i && ready && heroOn) loadFrame(f); else unloadFrame(f); });
    }
    near(box, '100%', function () { heroOn = true; load(cur); }, function () { heroOn = false; load(cur); });
    /* marcos fluidos de #work: escala por ancho y alto del iframe segun la pantalla (tope 62vh) */
    function fit() {
      $$('.pf--fluid').forEach(function (pf) {
        var sc = $('.pf__screen', pf), f = $('iframe', pf), w = sc && sc.clientWidth;
        if (!w || !f) return;
        var k = w / 375;
        pf.style.setProperty('--k', k.toFixed(4));
        f.style.height = (sc.clientHeight / k).toFixed(1) + 'px';
      });
    }
    function paint() {
      slides.forEach(function (s, i) {
        s.classList.toggle('is-active', i === cur);
        s.setAttribute('data-pos', i === cur ? 'c' : (i === (cur + n - 1) % n ? 'l' : 'r'));
      });
      dots.forEach(function (d, i) { if (i === cur) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
      clearTimeout(loadT);
      slides.forEach(function (s2, k) { if (k !== cur) unloadFrame(frame(k)); });
      if (ready) loadT = setTimeout(function () { load(cur); }, 180);
    }
    function go(i) { cur = (i % n + n) % n; paint(); }
    window.plCarousel = { go: go, get cur() { return cur; }, n: n }; /* v9: la rueda tambien mueve el carrusel */
    function openDemo(i) { var h = $('.pf__hit', slides[i]); if (h) window.open(h.getAttribute('href'), '_blank', 'noopener'); }
    $$('.pnav__arrow', car).forEach(function (b) { b.addEventListener('click', function () { go(cur + Number(b.getAttribute('data-dir'))); }); });
    dots.forEach(function (d) { d.addEventListener('click', function () { go(Number(d.getAttribute('data-go'))); }); });
    /* deslizar: gesto horizontal sobre .phones rota el abanico */
    var sx = 0, sy = 0, sid = -1, swiped = 0;
    box.addEventListener('pointerdown', function (e) { if (e.pointerType === 'mouse' && e.button !== 0) return; sx = e.clientX; sy = e.clientY; sid = e.pointerId; swiped = false; });
    box.addEventListener('pointerup', function (e) {
      if (e.pointerId !== sid) return; sid = -1;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) { swiped = Date.now(); go(cur + (dx < 0 ? 1 : -1)); }
    });
    box.addEventListener('pointercancel', function () { sid = -1; });
    /* toque: lateral -> al centro; central -> doble toque (<350 ms) abre el demo */
    var lastT = 0, lastI = -1;
    slides.forEach(function (s, i) {
      var hit = $('.pf__hit', s);
      if (!hit) return;
      hit.addEventListener('click', function (e) {
        e.preventDefault();
        if (swiped && Date.now() - swiped < 400) { swiped = false; return; }
        var now = Date.now();
        if (i !== cur) { go(i); lastI = -1; return; }
        if (lastI === i && now - lastT < 350) { lastI = -1; openDemo(i); return; }
        lastI = i; lastT = now;
      });
    });
    car.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); go(cur + (e.key === 'ArrowRight' ? 1 : -1)); }
      else if (e.key === 'Enter' && e.target === car) { e.preventDefault(); openDemo(cur); }
    });
    $$('.pf--fluid').forEach(function (pf) {
      if (window.ResizeObserver) new ResizeObserver(fit).observe(pf);
      var f = $('iframe', pf);
      if (f) f.addEventListener('load', function () { try { f.contentDocument.documentElement.style.overscrollBehavior = 'contain'; } catch (x) {} });
    });
    window.addEventListener('resize', fit);
    if (mq.addEventListener) mq.addEventListener('change', paint);
    paint(); fit();
    function start() { fit(); ready = true; load(cur); }
    if (document.readyState === 'complete') setTimeout(start, 250); else window.addEventListener('load', function () { setTimeout(start, 250); });
  })();

  /* ---------- marcos de portatil: escala del iframe segun el ancho ---------- */
  $$('.laptop__screen').forEach(function (scr) {
    var f = $('iframe', scr);
    function fit() {
      var w = scr.clientWidth; if (!w) return;
      var vw = w < 420 ? 390 : 1280, vh = Math.ceil(vw * 0.625);
      f.style.width = vw + 'px'; f.style.height = vh + 'px';
      scr.style.setProperty('--k', (w / vw).toFixed(4));
    }
    fit();
    if (window.ResizeObserver) new ResizeObserver(fit).observe(scr); else window.addEventListener('resize', fit);
  });

  /* ---------- hotspots ---------- */
  (function () {
    var dots = $$('.hs__dot'), tabs = $$('.hs__tabs button'), cards = $$('.hs__card');
    if (!cards.length) return;
    var api = window.plHs = { cur: 0, n: cards.length };
    function open(i, quiet) {
      cards.forEach(function (c, j) { c.hidden = j !== i; });
      api.cur = i;
      document.dispatchEvent(new CustomEvent('plhs', { detail: { i: i, quiet: !!quiet } }));
      dots.concat(tabs).forEach(function (b) {
        var on = b.getAttribute('aria-controls') === cards[i].id;
        b.setAttribute('aria-expanded', on ? 'true' : 'false');
      });
    }
    dots.forEach(function (b, i) { b.addEventListener('click', function () { open(i); }); });
    tabs.forEach(function (b, i) { b.addEventListener('click', function () { open(i); }); });
    api.go = open;
  })();

  /* ---------- comparador plantilla vs. nosotros ---------- */
  (function () {
    var scr = $('#cmp-screen'), rng = $('#cmp-range');
    if (!scr || !rng) return;
    var wide = window.matchMedia('(min-width:900px)'), frames = $$('.cmp__vp', scr);
    function fit() {
      var vw = wide.matches ? 1280 : 390, vh = wide.matches ? 800 : 770;
      frames.forEach(function (vp) {
        var w = vp.clientWidth; if (!w) return;
        var f = $('iframe', vp); f.style.width = (vw + (wide.matches ? 15 : 0)) + 'px'; f.style.height = vh + 'px';
        if (!wide.matches) { vh = Math.ceil(vp.clientHeight * vw / w); f.style.height = vh + 'px'; }
        vp.style.setProperty('--k', (w / vw).toFixed(4));
        f.style.transform = 'scale(' + (w / vw).toFixed(4) + ')';
      });
    }
    fit();
    if (window.ResizeObserver) new ResizeObserver(fit).observe(scr); else window.addEventListener('resize', fit);
    wide.addEventListener('change', fit);
    function set(v, quiet) {
      v = Math.max(0, Math.min(100, v));
      scr.style.setProperty('--v', (v / 100).toFixed(4));
      rng.value = v;
      var es = doc.lang === 'es';
      rng.setAttribute('aria-valuetext', es ? 'Permian Local se ve al ' + Math.round(100 - v) + ' %' : 'Permian Local shows ' + Math.round(100 - v) + ' percent');
    }
    set(50);
    rng.addEventListener('input', function () { set(parseFloat(rng.value)); });
    document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('.lang button')) setTimeout(function () { set(parseFloat(rng.value)); }, 0); });
    /* scroll independiente: solo se desplaza la mitad (plantilla o nuestra) bajo el cursor/dedo.
       Al llegar al final (o al inicio) del iframe se deja pasar el scroll a la pagina (y a Lenis). */
    function halfFrame(clientX) {
      var r = scr.getBoundingClientRect(), v = parseFloat(getComputedStyle(scr).getPropertyValue('--v')) || 0;
      var cut = r.left + 24 + (r.width - 48) * v;
      var vp = clientX < cut ? $('.cmp__pane--a .cmp__vp', scr) : $('.cmp__pane--b .cmp__vp', scr);
      return vp && $('iframe', vp);
    }
    function room(f, dy) {
      try {
        var w = f.contentWindow, d = f.contentDocument.documentElement;
        var max = d.scrollHeight - w.innerHeight, top = w.scrollY;
        if (dy > 0 ? top < max - 1 : top > 0) return w;
      } catch (err) { /* iframe de otro origen o sin cargar: no se consume */ }
      return null;
    }
    scr.addEventListener('wheel', function (e) {
      if (!wide.matches || e.ctrlKey || !e.deltaY || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      var f = halfFrame(e.clientX); if (!f) return;
      var w = room(f, e.deltaY); if (!w) return;
      var dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * w.innerHeight : e.deltaY;
      e.preventDefault(); e.stopPropagation();
      w.scrollBy({ top: dy, left: 0, behavior: 'instant' });
    }, { passive: false });
    var ty = null, tf = null;
    scr.addEventListener('touchstart', function (e) {
      var t = e.touches[0]; ty = t.clientY; tf = e.touches.length === 1 ? halfFrame(t.clientX) : null;
    }, { passive: true });
    scr.addEventListener('touchmove', function (e) {
      if (!wide.matches || !tf || ty === null) return;
      var t = e.touches[0], dy = ty - t.clientY; ty = t.clientY;
      if (!dy) return;
      var w = room(tf, dy); if (!w) return;
      if (e.cancelable) e.preventDefault();
      w.scrollBy({ top: dy, left: 0, behavior: 'instant' });
    }, { passive: false });
    scr.addEventListener('touchend', function () { ty = null; tf = null; }, { passive: true });
    /* entrada: un barrido corto de 85 a 50 una sola vez (no con reduced-motion) */
    if (!reduce && 'IntersectionObserver' in window) {
      var played = false;
      var io = new IntersectionObserver(function (es) {
        if (played || !es[0].isIntersecting) return;
        played = true; io.disconnect();
        var t0 = performance.now(), dur = 1100;
        (function step(t) {
          var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
          if (rng.matches(':active')) return;
          set(85 - 35 * e);
          if (p < 1) requestAnimationFrame(step);
        })(t0);
      }, { threshold: 0.55 });
      io.observe(scr);
    }
  })();

  /* ---------- 3D: carga solo cerca de la seccion, escritorio y sin reduced-motion ---------- */
  (function () {
    var stage = $('#stage3d'), canvas = $('#c3d'), sec = $('#extras');
    if (!stage || !canvas || !sec || reduce || !fine.matches || !('IntersectionObserver' in window)) return;
    var started = false;
    var io = new IntersectionObserver(function (es) {
      if (started || !es[0].isIntersecting) return;
      started = true; io.disconnect();
      import('/js/v8-3d.js').then(function (m) { m.init(stage, canvas); }).catch(function (e) { if (window.console) console.warn('3D no disponible', e); });
    }, { rootMargin: '100% 0px 100% 0px' });
    io.observe(sec);
  })();

  /* ---------- Silverado en movil / reduced-motion: secuencia de 36 vistas en canvas, segun el scroll acumulado ---------- */
  (function () {
    var stage = $('#stage3d'), img = stage && $('.stage3d__img', stage), sec = $('#extras');
    if (!stage || !img || !sec || (!reduce && fine.matches)) return;
    if (!reduce && $('.v9-truck__cv', sec)) return; /* v9: la secuencia a pantalla completa (v9-intro.js) sustituye a esta */
    var N = 36, dir = (window.devicePixelRatio || 1) >= 2 && !(navigator.connection && navigator.connection.saveData) ? '/img/silverado/36/' : '/img/silverado/36s/';
    function src(i) { return dir + ('000' + i).slice(-4) + '.webp'; }
    img.src = src(0); img.removeAttribute('loading'); img.width = 900; img.height = 535;
    if (reduce || !('IntersectionObserver' in window)) return; /* vista fija 0 */
    var cv = document.createElement('canvas'), cx = cv.getContext('2d');
    if (!cx) return;
    cv.className = 'stage3d__seq'; cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', img.alt || '');
    cv.width = 900; cv.height = 535; stage.appendChild(cv);
    var frames = [], loaded = 0, shown = -1, visible = false, raf = 0, acc = 0, sm = 0, lastY = window.scrollY, begun = false;
    function load(i) {
      if (frames[i]) return;
      var im = new Image(); im.decoding = 'async';
      im.onload = function () { loaded++; if (i === 0) { cv.width = im.naturalWidth; cv.height = im.naturalHeight; shown = -1; paint(true); stage.classList.add('is-seq'); } };
      im.src = src(i); frames[i] = im;
    }
    function begin() {
      if (begun) return; begun = true;
      load(0);
      [6, 12, 18, 24, 30].forEach(load);
      var i = 1; (function rest() { for (var k = 0; k < 3 && i < N; k++, i++) load(i); if (i < N) setTimeout(rest, 120); })();
    }
    function best(t) { /* vista cargada mas cercana a t */
      for (var d = 0; d < N / 2; d++) {
        var a = (t + d) % N, b = (t - d + N) % N;
        if (frames[a] && frames[a].complete && frames[a].naturalWidth) return a;
        if (frames[b] && frames[b].complete && frames[b].naturalWidth) return b;
      }
      return -1;
    }
    function paint(force) {
      var f = best(Math.round(sm / 1800 * N) % N); /* 1 vuelta cada ~1800 px */
      if (f < 0 || (f === shown && !force)) return;
      shown = f; cx.clearRect(0, 0, cv.width, cv.height); cx.drawImage(frames[f], 0, 0, cv.width, cv.height);
    }
    function tick() { sm += (acc - sm) * 0.12; if (Math.abs(acc - sm) < 0.5) sm = acc; paint(); raf = sm === acc ? 0 : requestAnimationFrame(tick); }
    window.addEventListener('scroll', function () {
      var y = window.scrollY, d = Math.abs(y - lastY); lastY = y;
      if (visible) { acc += Math.min(d, 400); if (!raf) raf = requestAnimationFrame(tick); }
    }, { passive: true });
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting; lastY = window.scrollY;
      if (visible) { begin(); if (!raf) raf = requestAnimationFrame(tick); } else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }, { rootMargin: '10% 0px 10% 0px' }).observe(stage);
    var pre = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { pre.disconnect(); begin(); } }, { rootMargin: '100% 0px 100% 0px' }); pre.observe(sec);
  })();

  if (reduce) return; /* reduced-motion: nada de lo que sigue se activa */

  /* ---------- contadores: precios y tarjetas del hero cuentan desde 0 (una vez, 900 ms) ---------- */
  (function () {
    var els = $$('.b-plan__num').filter(function (n) { return /^\$(490|790)$/.test(n.textContent.trim()); }).concat($$('.facts3 strong'));
    if (!els.length || !('IntersectionObserver' in window)) return;
    function parts(t) { var m = /^(\D*)(\d+)(.*)$/.exec(t); return m ? { a: m[1], n: parseInt(m[2], 10), b: m[3] } : null; }
    var data = els.map(function (el) { var p = parts(el.textContent); if (p) el.textContent = p.a + '0' + p.b; return p; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        var i = els.indexOf(e.target), c = parts(e.target.textContent); if (!c || !data[i]) return; var p = { a: c.a, n: data[i].n, b: c.b };
        var t0 = performance.now();
        (function step(t) {
          var k = Math.min(1, (t - t0) / 900), v = Math.round(p.n * (1 - Math.pow(1 - k, 3)));
          e.target.textContent = p.a + v + p.b;
          if (k < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: 0.6 });
    els.forEach(function (el, i) { if (data[i]) io.observe(el); });
  })();

  /* ---------- revelado [data-reveal] para todo el documento ---------- */
  (function () {
    var els = $$('[data-reveal]');
    if (!('IntersectionObserver' in window) || !els.length) return;
    doc.classList.add('reveal-on');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); e.target.classList.add('is-in'); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el, i) {
      var d = parseInt(el.getAttribute('data-reveal'), 10);
      if (d > 0) el.style.transitionDelay = d + 'ms';
      io.observe(el);
    });
  })();

  /* ---------- titular del hero: revelado por palabras ---------- */
  var h1 = $('.hero__h1');
  function splitNode(node, out) {
    Array.prototype.slice.call(node.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach(function (t) {
          if (!t) return;
          if (/^\s+$/.test(t)) { out.appendChild(document.createTextNode(' ')); return; }
          var w = document.createElement('span'); w.className = 'w';
          var s = document.createElement('span'); s.textContent = t; w.appendChild(s); out.appendChild(w);
        });
      } else if (n.nodeType === 1) {
        var c = n.cloneNode(false); splitNode(n, c); out.appendChild(c);
      }
    });
  }
  function splitHero(animate) {
    if (!h1) return;
    try {
      var tmp = document.createElement('span');
      splitNode(h1, tmp);
      h1.innerHTML = tmp.innerHTML;
      h1.setAttribute('aria-label', tmp.textContent.replace(/\s+/g, ' ').trim());
      var inner = $$('.w > span', h1);
      if (animate && hasG) {
        gsap.set(inner, { yPercent: 115 });
        gsap.to(inner, { yPercent: 0, duration: 1.1, ease: 'power4.out', stagger: 0.09, delay: 0.15, clearProps: 'transform' });
      }
    } finally { h1.classList.add('is-split'); }
  }
  splitHero(true);
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('.lang button')) { h1.removeAttribute('aria-label'); splitHero(false); }
  });

  /* ---------- cursor propio y parallax con el raton (escritorio, puntero fino) ---------- */
  (function () {
    if (!fine.matches) return;
    var dot = $('.cursor-dot'), ring = $('.cursor-ring'), phones = $('.phones'), hero = $('.hero');
    if (!dot || !ring) return;
    doc.classList.add('has-cursor');
    var mx = 0, my = 0, rx = 0, ry = 0, px = 0, py = 0, tx = 0, ty = 0, raf = 0, heroOn = false, isHot = false, isTxt = false;
    /* el bucle solo corre mientras algo se mueve; las variables del parallax solo se escriben con el hero a la vista */
    function loop() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      px += (tx - px) * 0.06; py += (ty - py) * 0.06;
      ring.style.transform = 'translate3d(' + rx.toFixed(2) + 'px,' + ry.toFixed(2) + 'px,0)';
      if (phones && heroOn) { phones.style.setProperty('--mx', px.toFixed(3)); phones.style.setProperty('--my', py.toFixed(3)); }
      if (Math.abs(mx - rx) < 0.1 && Math.abs(my - ry) < 0.1 && (!heroOn || (Math.abs(tx - px) < 0.002 && Math.abs(ty - py) < 0.002))) { raf = 0; return; }
      raf = requestAnimationFrame(loop);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(loop); }
    if (hero && 'IntersectionObserver' in window) new IntersectionObserver(function (es) { heroOn = es[0].isIntersecting; if (heroOn) kick(); }).observe(hero);
    window.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
      if (!doc.classList.contains('cur-on')) { rx = mx; ry = my; doc.classList.add('cur-on'); }
      var t = e.target;
      var hot = !!(t.closest && t.closest('a,button,summary,label,select,[data-cursor]'));
      if (hot !== isHot) { isHot = hot; ring.classList.toggle('is-hot', hot); }
      var txt = !!(t.closest && t.closest('input,textarea'));
      if (txt !== isTxt) { isTxt = txt; doc.classList.toggle('cur-text', txt); }
      if (heroOn && t.closest && t.closest('.hero')) { tx = (e.clientX / window.innerWidth - 0.5) * 2; ty = (e.clientY / window.innerHeight - 0.5) * 2; }
      kick();
    }, { passive: true });
    document.addEventListener('mouseleave', function () { doc.classList.remove('cur-on'); tx = ty = 0; kick(); });
    kick();
    fine.addEventListener('change', function () {
      if (!fine.matches) { cancelAnimationFrame(raf); raf = 0; doc.classList.remove('has-cursor', 'cur-on'); if (phones) { phones.style.removeProperty('--mx'); phones.style.removeProperty('--my'); } }
    });
  })();

  if (!hasG) return;
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Lenis + GSAP ---------- */
  var lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    window.plLenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href'), el = id.length > 1 && document.querySelector(id);
        if (el) {
          e.preventDefault();
          /* las secciones con content-visibility cambian de altura al pintarse: al llegar, se corrige la desviacion */
          lenis.scrollTo(el, { offset: -70, onComplete: function () { if (Math.abs(el.getBoundingClientRect().top - 70) > 3) lenis.scrollTo(el, { offset: -70, immediate: true }); } });
        }
      });
    });
  }

  /* ---------- palabra gigante del hero: se rellena de ambar con el scroll ---------- */
  var word = $('.hero__word');
  if (word) {
    gsap.fromTo(word, { '--fill': '0%' }, { '--fill': '100%', ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* ---------- anillos del 3D: pulsan despacio con el scroll ---------- */
  $$('.ring').forEach(function (r, i) {
    gsap.fromTo(r, { '--rs': 1 }, { '--rs': 1.06, ease: 'none', scrollTrigger: { trigger: '#extras', start: 'top bottom', end: 'bottom top', scrub: 1 + i * 0.4 } });
  });

  var mm = gsap.matchMedia();

  /* ---------- 2 el dato: contador y escena fijada ---------- */
  var cnt = $('.count');
  if (cnt) {
    var obj = { v: 0 }, to = parseInt(cnt.getAttribute('data-to'), 10) || 34;
    cnt.textContent = '0';
    ScrollTrigger.create({
      trigger: '.data', start: 'top 65%', once: true,
      onEnter: function () { gsap.to(obj, { v: to, duration: 1.8, ease: 'power2.out', onUpdate: function () { cnt.textContent = Math.round(obj.v); } }); }
    });
  }
  mm.add('(min-width:900px)', function () {
    if (!$('.data')) return; /* v9: la seccion del dato ahora la lleva js/v9-intro.js */
    var tl = gsap.timeline({ scrollTrigger: { trigger: '.data', start: 'top top', end: '+=110%', pin: true, scrub: 0.6 } });
    tl.fromTo('.data__photo img', { scale: 1.18, xPercent: 8 }, { scale: 1, xPercent: 0, ease: 'none' }, 0)
      .fromTo('.data__l2', { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: 'none', duration: 0.4 }, 0.25)
      .fromTo('.data__src', { opacity: 0 }, { opacity: 1, ease: 'none', duration: 0.3 }, 0.5);
  });

  /* ---------- 3 trabajos: card stack ---------- */
  mm.add('(min-width:900px)', function () {
    var panels = (doc.classList.contains('ideas') && !reduce) ? [] : $$('.stack .panel'); /* ?ideas=1: la galeria de v9-intro.js sustituye al stack */
    panels.forEach(function (p, i) {
      var next = panels[i + 1]; if (!next) return;
      var top = 76 + 16 + (i + 1) * 16;
      gsap.to(p, { scale: 0.94, ease: 'none', scrollTrigger: { trigger: next, start: 'top 90%', end: 'top ' + top + 'px', scrub: true } });
      gsap.to($('.panel__shade', p), { opacity: 0.55, ease: 'none', scrollTrigger: { trigger: next, start: 'top 90%', end: 'top ' + top + 'px', scrub: true } });
    });
  });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
