# Candidatos 3D: pickup con capó separado y motor (Sketchfab, descargables CC)

Método: API pública de búsqueda de Sketchfab (downloadable=true, licencias cc0/by/by-sa) para 18 consultas, 179 fichas únicas; filtrado por descripción/etiquetas (engine, hood, motor) y revisión visual en el visor de 2 fichas. NO se descargó nada. El peso de descarga no es visible sin pulsar Download (requiere sesión y clic); queda "n/d" (estimación por triángulos). Model Inspector no se abrió: lo de "capó separado" se basa en lo que declara el autor, salvo indicación.

URL corta de cada ficha: https://sketchfab.com/models/<UID> (redirige a la ficha).

| modelo | URL (UID) | licencia | triángulos | peso | capó separado | motor | realismo 1-5 | notas |
|---|---|---|---|---|---|---|---|---|
| Rusty Abandoned Truck with Interior - Game Ready (rashad-brahimli) | https://sketchfab.com/models/68f715c39c07464db59e099bb8dc2d4e | CC BY | 9.730 | n/d (pequeño, textura 4K) | SÍ, declarado: "Doors, trunk and hood can be opened" | SÍ, declarado: "engine ... separated" | 3 (low poly, estilo oxidado) | Visto en visor: pickup clásica Ford tipo F-series, ligera. 411 likes. Hecho en Blender. Mejor candidato directo, pero estética destartalada (hay que limpiar texturas). |
| Hot Rod Pickup (kird3rf) | https://sketchfab.com/models/7b882dc2d7ed407689f8e851d5f8250f | CC BY | 531.917 | n/d (grande) | NO confirmado | "powerful v8 engine" en la descripción (probable motor expuesto de hot rod) | 4 | Pesado para web. Pickup Ford vieja con V8 visible; 465 likes. Verificar en visor si el capó falta o es separable. |
| Ford F-150 (Car2022 / Mona x Supercars) | https://sketchfab.com/models/c205cde66b1d4f14b1820b89de7b8d23 | CC BY | 373.156 | n/d | NO confirmado | Descripción: "3.6L V8 Engine" (sin garantía de modelado) | 3-4 | Visto en visor: F-150 moderna blanca, carrocería cerrada. Sin comentarios técnicos. |
| 2019 Chevrolet Silverado Trail Boss Z71 (ddiaz-design) | https://sketchfab.com/models/652324cc8a974d3a9869ce2b0f3beaaa | CC BY | 479.112 | n/d | NO confirmado | Descripción solo marketing | 4 | Mismo modelo de camión que usamos (Silverado); 207 likes. Probable exterior+interior sin motor. |
| 2020 Chevrolet Silverado 1500 RST (ddiaz-design) | https://sketchfab.com/models/6a0be94fec824513bffe48df57d0b17a | CC BY | 472.293 | n/d | NO confirmado | Solo texto de marketing | 4 | Igual: 113 likes. |
| 1998 Toyota Tacoma Pikes Peak (Tyler_Dave) | https://sketchfab.com/models/4bce0e6640a143d1ad16c21a41017bbe | CC BY | 51.150 | n/d | NO confirmado | menciona engine/motor (es un coche de carreras) | 3 | Pickup real con 51k tris; revisar visor. |
| Disassembled V8 Engine Block (Tomasoo) | https://sketchfab.com/models/3026bd87ca3945d6829d24c86ce695f0 | CC BY | 2.197.453 | n/d (muy pesado) | n/a | V8 desmontado, piezas separadas | 5 | Demasiado pesado para web sin decimar. 330 likes. |
| V8 Engine (Tahminayeasminmony) | https://sketchfab.com/models/7a957b5f9f954fe5b24e685f5e22046f | CC BY | 2.167.308 | n/d (muy pesado) | n/a | V8 completo | 4-5 | 236 likes; requiere decimado. |
| V8 Hot Rod Engine | https://sketchfab.com/models/f20acef709b847eb98839b89c5ef916c | CC BY | 103.560 | n/d | n/a | V8 hot rod | 4 | Tamaño razonable. Mejor motor suelto para web. 72 likes. |
| Old V8 (wb...) | https://sketchfab.com/models/9f9683452b184f6e8d04cdd6434ba6f8 | CC BY | 8.388 | n/d (ligero) | n/a | V8 low poly | 2-3 | Muy ligero; 147 likes. Aspecto simple. |

## Observaciones
- Ninguna ficha CC descargable de pickup moderna declara capó abatible con motor modelado. La búsqueda confirmó solo una con ambas cosas declaradas (Rusty Truck).
- Con licencia CC y descargable, el catálogo de pickups modernas con compartimento de motor es casi inexistente (los modelos de coches detallados suelen ser de pago).
- Todas las licencias halladas son CC BY: exige atribución (autor + enlace) en la web.
- Ningún CC0 relevante apareció.

## Alternativa: V8 suelto + Blender
- Motor suelto: "V8 Hot Rod Engine" (103k tris) es el equilibrio calidad/peso. Colocarlo bajo el Silverado requiere escalar y posicionarlo; falta batería/radiador (se modelan sencillos o se buscan aparte).
- Separar el capó del Silverado con Blender: viable. Si la malla de la carrocería es un solo objeto, hay que seleccionar el capó en modo edición (L sobre la pieza, o P > Selección), separarlo, fijar el origen en la bisagra y animar rotación. Si está soldado a guardabarros y parabrisas, hay que cortar bordes y rellenar el hueco; el interior del capó (por dentro) seguramente falta y hay que extruirlo. Blender no está instalado; es gratis (~300 MB). Esfuerzo: medio (1-2 h para capó + motor sencillo), más si hay que modelar compartimento.

## Recomendación
1. Para un "engine bay" ya hecho: usar Rusty Abandoned Truck (CC BY, 9,7k tris), el único con capó que abre y motor separado declarados; verificar en Model Inspector tras descargar y retexturizar para quitar el óxido.
2. Para mantener nuestro Silverado: descargar "V8 Hot Rod Engine" (103k tris) y separar el capó en Blender; añadir caja de batería y radiador simples.
3. Los Silverado de ddiaz-design (472k-479k tris) son demasiado pesados para web y sin motor confirmado; no son prioridad.
4. Antes de descargar, abrir Model Inspector en Rusty Truck y Hot Rod Pickup para confirmar nodos "hood"/"engine".
5. Instalar Blender solo si se elige la opción 2.
