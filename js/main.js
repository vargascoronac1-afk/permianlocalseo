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

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !window.gsap || !window.ScrollTrigger) return;

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

  /* Reveals: un solo gesto, sobrio */
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%',
    once: true,
    onEnter: function (els) {
      gsap.to(els, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.09, overwrite: true });
    }
  });

  /* Parallax sutil en imagenes de gran formato */
  document.querySelectorAll('[data-parallax]').forEach(function (el) {
    var k = parseFloat(el.getAttribute('data-parallax')) || 0.1;
    gsap.fromTo(el, { yPercent: -k * 100 }, {
      yPercent: k * 100, ease: 'none',
      scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  /* Contador animado (solo cifras reales: 3 a 5 dias) */
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var end = parseInt(el.getAttribute('data-count'), 10);
    var o = { v: 0 };
    el.textContent = '0';
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: function () {
        gsap.to(o, { v: end, duration: 1.6, ease: 'power2.out',
          onUpdate: function () { el.textContent = Math.round(o.v); },
          onComplete: function () { el.textContent = end; } });
      }
    });
  });
})();
