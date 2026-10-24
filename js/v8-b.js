/* Permian Local v8 - parte B: numeral activo del proceso y borde conico de respaldo. */
(function () {
  "use strict";
  var steps = document.querySelectorAll(".b-step");
  if (steps.length) {
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          e.target.classList.toggle("is-active", e.isIntersecting);
        });
      }, { rootMargin: "-42% 0px -42% 0px", threshold: 0 });
      Array.prototype.forEach.call(steps, function (s) { io.observe(s); });
    } else {
      Array.prototype.forEach.call(steps, function (s) { s.classList.add("is-active"); });
    }
  }

  /* Respaldo: si el navegador no soporta @property, gira el borde de la tarjeta Business con rAF. */
  var main = document.querySelector(".b-plan--main");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var registered = window.CSS && typeof CSS.registerProperty === "function";
  if (main && !reduce && !registered) {
    var a = 0, last = 0, visible = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(main);
    }
    var tick = function (t) {
      if (visible) {
        a = (a + (t - last) * 0.03) % 360;
        main.style.setProperty("--b-angle", a.toFixed(1) + "deg");
      }
      last = t;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(function (t) { last = t; requestAnimationFrame(tick); });
  }
})();
