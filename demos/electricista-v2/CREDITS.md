# Créditos de demos/electricista-v2

Esta v2 no añade fotos nuevas: reutiliza el material que ya está en `img/` y ya está acreditado en `img/CREDITS.md` (sección "Demo electricista"). El director puede fusionar esto tal cual; no hay filas nuevas que añadir.

| Fichero usado | Origen | Autor | Licencia |
|---|---|---|---|
| `img/servicios/emergencias-960/480.webp` (también fondo del bloque de contacto) | https://www.pexels.com/photo/lightning-over-electricity-power-lines-5707737/ | Matheus Rocha | Pexels License |
| `img/servicios/paneles-960/480.webp` (servicios y foto del FAQ) | https://www.pexels.com/photo/electrical-circuit-breaker-panel-with-color-coded-wiring-28950842/ | ranjeet . | Pexels License |
| `img/servicios/instalaciones-960/480.webp` | https://www.pexels.com/photo/man-drilling-in-a-wall-in-an-apartment-4981802/ | Antoni Shkraba | Pexels License |
| `img/servicios/cargadores-960/480.webp` | https://www.pexels.com/photo/electric-car-while-charging-24376862/ | Elmir Jafarov | Pexels License |
| `img/servicios/iluminacion-960/480.webp` | https://www.pexels.com/photo/light-bulb-hanging-on-rope-in-studio-4379890/ | Keegan Checks | Pexels License |
| `img/servicios/inspecciones-960/480.webp` | https://www.pexels.com/photo/electrician-inspecting-residential-fuse-box-area-32497160/ | Kathleen Austin Kuhn | Pexels License |
| `img/v9/frames/breaker/` y `breaker-720/` (fotogramas del hero y del bloque "Inside your panel") | Clip propio del proyecto, ver `img/v9/MANIFEST.json` (clave `breaker`) | Permian Local | Propio |

Tipografía: Hanken Grotesk (Google Fonts, SIL Open Font License). Todas las fotos son de archivo y el negocio es ficticio.
No se ha generado ninguna imagen nueva ni se ha descargado nada nuevo para esta versión.

## Ronda 2 (2026-10-31)
Sin descargas nuevas. "Inside your panel" usa los fotogramas propios `img/v9/frames/caja`, `breaker` y `varilla` (y sus -720 en movil), cargados desde `../../img/v9/frames/`. El mapa de la zona es un SVG dibujado a mano (posiciones aproximadas, estilizado).

## Ronda 3 (2026-11-01)
- `img/mapa-cuenca.webp` (70 KB, 1400x934): composicion propia de teselas de OpenStreetMap (zoom 10, centro 32.00 N, -102.20 W, 12 teselas descargadas de tile.openstreetmap.org con User-Agent "PermianLocalSEO-demo/1.0"), pasada a gris, invertida y teñida al azul de la marca por CSS. Datos del mapa: © OpenStreetMap contributors, licencia ODbL (https://www.openstreetmap.org/copyright). La atribucion se ve en la esquina del mapa. La ruta I-20 y los radios son un SVG propio; los puntos se colocan con proyeccion Web Mercator a partir del bbox real de la imagen.
- El rayo, el flash y las tarjetas de oferta son SVG/CSS propios. Se retira el mapa de Google (boton e iframe).
