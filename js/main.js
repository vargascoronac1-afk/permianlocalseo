/* Permian Local SEO - movimiento. Todo es mejora progresiva:
   sin JS o con prefers-reduced-motion el contenido se ve igual, estatico. */
(function () {
  var doc = document.documentElement;
  var header = document.querySelector('.site-header');

  function onScrollHeader() {
    if (header) header.classList.toggle('is-solid', window.scrollY > 40);
  }
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* Menu movil: boton con aria-expanded; Escape y clic en un enlace lo cierran */
  (function () {
    var btn = document.querySelector('.menu-btn'), nav = document.getElementById('site-nav');
    if (!btn || !nav) return;
    function set(open) { btn.setAttribute('aria-expanded', open ? 'true' : 'false'); nav.classList.toggle('is-open', open); }
    btn.addEventListener('click', function () { set(btn.getAttribute('aria-expanded') !== 'true'); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { set(false); btn.focus(); } });
    window.matchMedia('(min-width: 900px)').addEventListener('change', function () { set(false); });
  })();

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canAnimate = !reduce && !!window.gsap;

  /* Sectores: patron WAI-ARIA tabs (flechas, Inicio, Fin). Funciona sin GSAP;
     con GSAP y sin reduced-motion, el cambio de panel se anima. */
  (function () {
    var list = document.querySelector('.sector-tabs');
    if (!list) return;
    var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
    var busy = null;
    var wide = window.matchMedia('(min-width: 900px)');
    function orient() { list.setAttribute('aria-orientation', wide.matches ? 'vertical' : 'horizontal'); }
    orient(); wide.addEventListener('change', orient);
    function panelOf(t) { return document.getElementById(t.getAttribute('aria-controls')); }
    function select(tab, focus) {
      var current = tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0];
      if (current === tab) { if (focus) tab.focus(); return; }
      var from = panelOf(current), to = panelOf(tab);
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
      });
      if (focus) tab.focus();
      if (!wide.matches && list.scrollWidth > list.clientWidth) {
        list.scrollTo({ left: tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' });
      }
      if (busy) { busy.kill(); busy = null; tabs.forEach(function (t) { var p = panelOf(t); if (p !== to) p.hidden = true; }); }
      if (!canAnimate) { from.hidden = true; to.hidden = false; return; }
      var bgImg = to.querySelector('.sector-bg img'), body = to.querySelector('.sector-body');
      busy = gsap.timeline({ onComplete: function () { busy = null; } })
        .to(from, { opacity: 0, y: -10, duration: 0.18, ease: 'power1.in',
          onComplete: function () { from.hidden = true; gsap.set(from, { clearProps: 'opacity,transform' }); to.hidden = false; } })
        .fromTo(to, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: 'power3.out', clearProps: 'opacity',
          onComplete: function () { if (window.ScrollTrigger) ScrollTrigger.refresh(); } })
        .fromTo(bgImg, { scale: 1.22 }, { scale: 1, duration: 1.3, ease: 'power3.out' }, '<')
        .fromTo(body, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', clearProps: 'transform,opacity' }, '<0.1');
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t, false); });
      t.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') n = tabs[0];
        else if (e.key === 'End') n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n, true); }
      });
    });
  })();

  if (reduce || !window.gsap || !window.ScrollTrigger) return;

  /* El movimiento se arranca cuando el navegador esta libre, no en la ruta critica de carga */
  var start = function () {
  gsap.registerPlugin(ScrollTrigger);
  doc.classList.add('motion');

  /* Scroll suave con Lenis, sincronizado con el ticker de GSAP */
  if (window.Lenis) {
    var lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        var el = id.length > 1 && document.querySelector(id);
        if (el) { e.preventDefault(); lenis.scrollTo(el, { offset: -60 }); }
      });
    });
  }

  /* Una sola IntersectionObserver para todas las apariciones (evita medir el layout una vez por elemento) */
  function whenVisible(els, run) {
    if (!('IntersectionObserver' in window)) { run(els); return; }
    var pending = [], queued = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { io.unobserve(en.target); pending.push(en.target); } });
      if (pending.length && !queued) {
        queued = true;
        requestAnimationFrame(function () { var b = pending; pending = []; queued = false; run(b); });
      }
    }, { rootMargin: '0px 0px -10% 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  /* Titulares H2: aparicion por palabras, una sola vez (el H1 se anima en CSS al cargar) */
  if (window.splitHeading) {
    var heads = [], wordsOf = new Map();
    document.querySelectorAll('main h2').forEach(function (h) {
      var words = window.splitHeading(h);
      if (!words.length) return;
      wordsOf.set(h, words); heads.push(h);
    });
    whenVisible(heads, function (batch) {
      batch.forEach(function (h) { gsap.fromTo(wordsOf.get(h), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.05, immediateRender: false }); });
    });
  }

  /* Reveals: un solo gesto, sobrio */
  whenVisible(Array.prototype.slice.call(document.querySelectorAll('[data-reveal]')), function (els) {
    gsap.fromTo(els, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.09, overwrite: true, immediateRender: false });
  });

  /* Parallax sutil en imagenes de gran formato (ScrollTrigger, solo 2 disparadores) */
  document.querySelectorAll('[data-parallax]').forEach(function (el) {
    var k = parseFloat(el.getAttribute('data-parallax')) || 0.1;
    gsap.fromTo(el, { yPercent: -k * 100 }, {
      yPercent: k * 100, ease: 'none',
      scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  /* Los fondos de sector se amplian suavemente al hacer scroll: un solo disparador, la escala va en una variable CSS */
  var ui = document.querySelector('.sector-ui');
  if (ui) {
    ScrollTrigger.create({ trigger: ui, start: 'top bottom', end: 'bottom top',
      onUpdate: function (self) { ui.style.setProperty('--zoom', (1 + 0.12 * self.progress).toFixed(3)); } });
  }

  /* Contador animado (solo cifras reales: 3 a 5 dias) */
  var counters = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
  counters.forEach(function (el) { el.textContent = '0'; });
  whenVisible(counters, function (els) {
    els.forEach(function (el) {
      var end = parseInt(el.getAttribute('data-count'), 10), o = { v: 0 };
      gsap.to(o, { v: end, duration: 1.6, ease: 'power2.out',
        onUpdate: function () { el.textContent = Math.round(o.v); },
        onComplete: function () { el.textContent = end; } });
    });
  });
  };
  if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 1500 }); else setTimeout(start, 200);
})();
