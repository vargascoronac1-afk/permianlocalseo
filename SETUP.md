# Formulario "Free 1-page review" (FormSubmit, sin backend propio)

El formulario de /free-review/ envia a https://formsubmit.co/hello@permianlocalseo.com (sin cuenta).

## Activacion (una sola vez, la hace Carlos)
1. Con la web ya publicada, abrir https://permianlocalseo.com/free-review/ y enviar una solicitud de prueba.
2. FormSubmit manda un correo de activacion a hello@permianlocalseo.com. Abrirlo y pulsar el boton de confirmar.
3. Hasta confirmarlo, las solicitudes NO llegan. Tras confirmar, la propia prueba suele reenviarse; si no, volver a enviar.
4. Comprobar que el correo llega (revisar spam) y que tras enviar se muestra /free-review/thanks.html.

## Detalles
- Campos ocultos: _subject, _captcha=false, _next=https://permianlocalseo.com/free-review/thanks.html, _template=table y el honeypot _honey (si un bot lo rellena, se descarta).
- Respaldo visible en la pagina: "or just email hello@permianlocalseo.com".
- thanks.html lleva noindex y no esta en el sitemap.
- La pagina /privacy.html menciona FormSubmit como encargado del reenvio.
- Si FormSubmit deja de servir, cambiar el atributo action del formulario o sustituirlo por un mailto.
