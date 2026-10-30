/* Permian Local v8 - parte B: numeral activo del proceso y borde conico de respaldo. */
(function () {
  "use strict";
  var steps = document.querySelectorAll(".b-step");
  /* Los pasos se iluminan con el raton (hover), foco de teclado o toque en movil; ya no con el scroll. */
  Array.prototype.forEach.call(steps, function (s) {
    s.setAttribute("tabindex", "0");
    var on = function () { s.classList.add("is-active"); };
    var off = function () { s.classList.remove("is-active"); };
    s.addEventListener("mouseenter", on);
    s.addEventListener("mouseleave", off);
    s.addEventListener("focus", on);
    s.addEventListener("blur", off);
    s.addEventListener("touchstart", function () {
      Array.prototype.forEach.call(steps, function (o) { if (o !== s) o.classList.remove("is-active"); });
      s.classList.toggle("is-active");
    }, { passive: true });
  });

  /* Al elegir un plan, el nombre del plan viaja en el formulario del estimado. */
  var planField = document.getElementById("plan-field");
  Array.prototype.forEach.call(document.querySelectorAll("[data-plan]"), function (a) {
    a.addEventListener("click", function () { if (planField) planField.value = a.getAttribute("data-plan"); });
  });

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
