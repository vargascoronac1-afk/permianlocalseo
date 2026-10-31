---
name: Permian Local
description: Estudio web de Odessa y Midland (TX). Negro de carretera nocturna, rojo neón y azul eléctrico; titulares gigantes; bilingüe EN/ES.
colors:
  bg: "#050507"
  bg-2: "#0B0B10"
  bg-3: "#141420"
  bone-2: "#101018"
  bone-3: "#17172A"
  text: "#F5F5F7"
  text-2: "#B9BCC8"
  text-3: "#8A8FA3"
  red-neon: "#FF2A3C"
  red-deep: "#C8102E"
  red-ink: "#FFFFFF"
  blue-neon: "#3B82FF"
  blue-deep: "#1D4ED8"
typography:
  display-giant:
    fontFamily: "Bricolage Grotesque, Arial, sans-serif"
    fontSize: "clamp(2.6rem, 9vw, 8.5rem)"
    fontWeight: 700
    lineHeight: 0.92
    letterSpacing: "-0.03em"
  hero-h1:
    fontFamily: "Bricolage Grotesque, Arial, sans-serif"
    fontSize: "clamp(2.6rem, 12vw, 4.6rem)"
    fontWeight: 700
    lineHeight: 0.92
    letterSpacing: "-0.03em"
  figure-giant:
    fontFamily: "Bricolage Grotesque, Arial, sans-serif"
    fontSize: "clamp(6rem, 24vw, 17rem)"
    fontWeight: 800
    lineHeight: 0.8
    letterSpacing: "-0.05em"
  headline:
    fontFamily: "Bricolage Grotesque, Arial, sans-serif"
    fontSize: "clamp(2.4rem, 5.4vw, 5rem)"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Bricolage Grotesque, Arial, sans-serif"
    fontSize: "clamp(1.7rem, 3vw, 2.4rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  accent-serif:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontStyle: italic
    fontWeight: 400
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  lead:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "clamp(1.05rem, 1.6vw, 1.25rem)"
    fontWeight: 400
    lineHeight: 1.55
  button:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.1
rounded:
  field: "12px"
  chip: "14px"
  fact: "16px"
  card: "24px"
  panel: "28px"
  phone-frame: "34px"
  phone-screen: "26px"
  pill: "999px"
spacing:
  gutter: "clamp(20px, 5vw, 72px)"
  max: "1280px"
  section: "clamp(72px, 10vw, 140px)"
  header-h: "76px"
  tap: "48px"
components:
  button-primary:
    backgroundColor: "{colors.red-deep}"
    textColor: "{colors.red-ink}"
    rounded: "{rounded.pill}"
    padding: "0.7em 1.5em"
    height: "48px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    rounded: "{rounded.pill}"
    padding: "0.7em 1.5em"
    height: "48px"
  card-glass:
    backgroundColor: "rgba(245,245,247,0.05)"
    textColor: "{colors.text}"
    rounded: "{rounded.card}"
    padding: "clamp(22px, 3vw, 36px)"
  card-plan:
    backgroundColor: "rgba(245,245,247,0.05)"
    textColor: "{colors.text}"
    rounded: "{rounded.panel}"
    padding: "clamp(24px, 3.2vw, 44px)"
  form:
    backgroundColor: "rgba(11,11,16,0.85)"
    textColor: "{colors.text}"
    rounded: "{rounded.panel}"
    padding: "clamp(20px, 3.4vw, 44px)"
  field:
    backgroundColor: "rgba(245,245,247,0.05)"
    textColor: "{colors.text}"
    rounded: "{rounded.field}"
    padding: "12px 14px"
    height: "48px"
---

# Design System: Permian Local

Fuente de verdad: `index.html` (v9) con `css/v8.css`, `css/v8-b.css`, `css/v9-intro.css` y `js/v9-intro.js`, rama `v9-preview`. Las demos (`demos/taller`, `demos/electricista`, `demos/taqueria`) se leen como variantes de sector, no como la marca. `css/styles.css` (ámbar y petróleo) no está enlazado desde `index.html` y no se usa como fuente.

## Overview

**Creative North Star: "La carretera de noche"**

Un estudio de una sola persona que vende webs a negocios de Odessa y Midland. La página entera es nocturna: negro casi puro, una carretera que avanza con la rueda, la ciudad y cifras enormes que aparecen como letreros. El rojo es el neón del letrero; el azul es el resplandor frío que lo acompaña. Todo lo demás es negro, blanco roto y grises azulados.

La densidad es baja y la escala es extrema. Los titulares y las cifras ocupan la pantalla; el texto de apoyo es corto y legible. El movimiento lo conduce el scroll: intro por fotogramas, secciones fijadas, paradas obligatorias. Con `prefers-reduced-motion` o sin JS queda el póster y el texto estático.

**Key Characteristics:**
- Solo modo oscuro. Las secciones con clase `is-light` conservan el nombre pero son oscuras (`bone`, `bone-2`).
- Rojo neón y azul eléctrico sobre negro; ningún otro matiz de marca en la página principal.
- Titular gigante en Bricolage Grotesque con una palabra en Instrument Serif itálica roja con brillo neón.
- Cifras grandes con números tabulares.
- Grano fijo sobre toda la página, intro de carretera por fotogramas, cuatro paradas de scroll.
- Bilingüe EN/ES con conmutador en la cabecera.

## Colors

Paleta oscura de cuatro familias: negro, blanco roto, rojo neón, azul neón. Tokens de `:root` en `css/v8.css`.

### Primary
- **Rojo neón** (`#FF2A3C`, `--red`): texto de acento (la palabra en serif, el `%` de las cifras, número de paso activo), puntero, barra de progreso, enlaces (`--link`), anillo de foco, puntos de hotspot. Siempre con brillo de neón cuando es texto grande.
- **Rojo letrero** (`#C8102E`, `--red-deep`): relleno de botones primarios, insignias, pestañas activas, etiqueta B del comparador, perilla. El texto encima es `#FFFFFF` (`--red-ink`).

### Secondary
- **Azul neón** (`#3B82FF`, `--blue`): segundo extremo de la barra de progreso, halos radiales (`rgba(59,130,255,.14-.22)`), bordes `--edge` (`rgba(59,130,255,.35)`) en tarjetas de cristal, anillos del escenario 3D, borde cónico del plan principal. No se usa como texto corriente.
- **Azul profundo** (`#1D4ED8`, `--blue-deep`): declarado, sin uso visible en la principal.

### Neutral
- **Negro carretera** (`#050507`, `--bg`): fondo base y extremo de todos los degradados de sombreado.
- **Negro 2** (`#0B0B10`, `--bg-2`, alias `--bone`): secciones alternas, marco de teléfono, cabecera translúcida.
- **Negro 3** (`#141420`, `--bg-3`): franja, cita de presupuesto, fondo de tarjetas de imagen.
- **Bone 2 y Bone 3** (`#101018`, `#17172A`): secciones `is-light` (hotspots, por qué nosotros) y la superficie más alta.
- **Blanco roto** (`#F5F5F7`, `--text`): texto principal; trazos al 14 % (`--line`) y cristal al 5 % (`--glass`) derivan de él.
- **Gris plata** (`#B9BCC8`, `--text-2`): texto secundario.
- **Gris azulado** (`#8A8FA3`, `--text-3`): notas, placeholders, números auxiliares.

### Contraste medido (WCAG 2, luminancia relativa)
| Par | sobre `#050507` | sobre `#0B0B10` | sobre `#141420` | sobre `#17172A` |
|---|---|---|---|---|
| `#F5F5F7` texto | 18.70 | 18.03 | 16.76 | 16.17 |
| `#B9BCC8` texto-2 | 10.75 | 10.37 | 9.64 | 9.30 |
| `#8A8FA3` texto-3 | 6.34 | 6.11 | 5.68 | 5.48 |
| `#FF2A3C` rojo neón | 5.48 | 5.28 | 4.91 | 4.74 |
| `#3B82FF` azul neón | 5.65 | 5.44 | 5.06 | 4.88 |

Todos los pares de texto sobre superficies oscuras pasan 4.5:1 (mínimo 4.74). `#FFFFFF` sobre `#C8102E` = 5.88 (botones). Pares que fallan y no se usan: `#B9BCC8` sobre `#C8102E` = 3.11 y `#FF2A3C` sobre `#C8102E` = 1.58.

### Named Rules
**The Neon Pair Rule.** Rojo y azul son los únicos colores de marca. El rojo habla (texto, acción, foco); el azul brilla (halos, bordes, anillos). Un tercer matiz de marca no entra en la principal.
**The Ink-On-Red Rule.** Todo relleno `#C8102E` lleva texto `#FFFFFF`. El rojo neón `#FF2A3C` es texto o trazo sobre negro, no un relleno bajo texto.

## Typography

**Display Font:** Bricolage Grotesque (pesos 200-800, variable, `fonts/bricolage.woff2`), con Arial
**Body Font:** Instrument Sans (400-700, variable, `fonts/instrument.woff2`), con system-ui
**Accent Font:** Instrument Serif itálica 400 (`fonts/instrument-serif-italic.woff2`), con Georgia

**Character:** Bricolage es ancha, pesada y con carácter para titulares y cifras; Instrument Sans es neutra y legible para todo lo demás; la serif itálica entra en una sola palabra de cada titular como voz humana contra el neón.

### Hierarchy
- **Display giant** (700, `clamp(2.6rem, 9vw, 8.5rem)`, 0.92, -0.03em): `.h-giant`, titulares de sección e intro. El h1 del hero es más contenido: `clamp(2.6rem, 12vw, 4.6rem)` y desde 1000 px `clamp(3.4rem, 5.8vw, 6rem)`.
- **Hero word** (800, `clamp(7rem, 27vw, 24rem)`, 0.8, -0.04em): palabra gigante detrás del recorte del hero, solo contorno (`-webkit-text-stroke: 1px var(--line)`), con relleno al 7 % que crece con el scroll.
- **Figure giant** (800): cifras. `.v9-num` `clamp(6rem, 24vw, 17rem)`, 0.8, -0.05em (móvil `clamp(4.5rem, 22vw, 8rem)`); `.data__num` `clamp(8rem, 32vw, 25rem)`. El `%` va en rojo con brillo neón.
- **Headline** (700): h2 de sección `clamp(2.4rem, 5.4vw, 5rem)` (hotspots, extras), `clamp(2.4rem, 5.6vw, 5.2rem)` (comparador); título de panel `clamp(2rem, 4.4vw, 3.6rem)`.
- **Title** (700): `clamp(1.7rem, 3vw, 2.4rem)` en tarjetas de hotspot; `clamp(1.8rem, 4vw, 3rem)` en proceso y extras.
- **Lead** (400): `clamp(1.05rem, 1.6vw, 1.25rem)` en `--text-2`, máximo 30em.
- **Body** (400, 1rem, 1.55): `--text-2`, anchos de 46-58ch.
- **Button** (600, 1rem, 1.1); `btn--sm` a .95rem.
- **Cifras de interfaz**: `font-variant-numeric: tabular-nums` en `.fact strong`, `.b-plan__num`, `.b-extra__price`.

### Named Rules
**The Serif Spark Rule.** Dentro de un titular, una sola palabra va en Instrument Serif itálica 400, en rojo neón con brillo (`em.neon`, `.h-giant em`). Nunca la serif en párrafos ni en títulos enteros.
**The Tabular Figure Rule.** Toda cifra que se compare, cuente o fije un precio lleva números tabulares.

## Layout

Un solo contenedor: `.wrap` de `--max: 1280px` más `--gutter: clamp(20px, 5vw, 72px)` a cada lado. Secciones con `padding-block: clamp(72px, 10vw, 140px)` (variantes de 64 a 160 px). Cabecera fija a 12 px del borde, alto `--hdr: 76px`. Mínimo táctil de 48 px en botones, pestañas, puntos de hotspot y selector de idioma.

Dos columnas desde 860-1000 px (`1.08fr / .92fr` en el hero, `.85fr / 1.15fr` en extras, `1.05fr / .95fr` en por qué nosotros). Por debajo de 900 px el menú pasa a panel desplegable y los teléfonos a carrusel con scroll-snap. Breakpoints reales: 480, 700, 768, 860, 899/900, 1000.

Orden de la página principal: carretera (intro por fotogramas), hero con teléfonos, ciudad, tienda/dato, trabajos, extras 3D (camión), hotspots del teléfono, comparador, precios, proceso, por qué nosotros, maqueta gratis (formulario), contacto, pie.

## Elevation & Depth

Híbrido: planos tonales sobre negro más luz de neón. Las superficies se separan con borde fino (`1px var(--line)` o `--edge` azul) y relleno de cristal al 5 %; la profundidad real vive en los teléfonos y portátiles y en los halos radiales.

### Shadow Vocabulary
- **Neon text** (`text-shadow: 0 0 6px rgba(255,42,60,.55), 0 0 18px rgba(255,42,60,.35), 0 0 42px rgba(255,42,60,.18)`): `.neon`, `%` de las cifras, paso de proceso activo.
- **Button hover glow** (`0 10px 30px -8px rgba(255,42,60,.5)`) con `translateY(-2px)`.
- **Phone body** (`0 40px 70px -24px rgba(0,0,0,.85), 0 10px 24px -12px rgba(0,0,0,.6)`).
- **Plan principal** (`0 0 0 1px rgba(59,130,255,.35), 0 30px 120px -40px rgba(59,130,255,.35)`) más borde cónico rojo/azul animado.
- **Halo** (`radial-gradient(closest-side, rgba(59,130,255,.14), transparent)`): luz azul detrás de teléfonos y escenario 3D.
- **Glass** (`backdrop-filter: blur(14px)`) en cabecera y chips del hero.

### Named Rules
**The Glow-Not-Drop Rule.** La luz de la marca es un resplandor difuso (rojo en acciones, azul en escenarios). Las sombras duras con desplazamiento y sin desenfoque no pertenecen al sistema.

## Shapes

Redondez alta y consistente: píldora (`999px`) para botones, marca, pestañas, chips y selector de idioma; `24-28px` para tarjetas, paneles, planes y formulario; `12px` en campos; `14-16px` en chips de imagen y hechos; marco de teléfono `34px` con pantalla `26px`; portátil `14px`. Rejilla de líneas de 96 px (`.grid-lines`) y máscaras de degradado para fundir fotos con el negro.

Grano: `img/grain.png`, tesela de 128 px, opacidad `.05`, `position: fixed; inset: 0; z-index: 110; pointer-events: none` sobre toda la página.

## Components

### Buttons
- **Shape:** píldora (999px), alto mínimo 48 px, padding `.7em 1.5em`, Instrument Sans 600.
- **Primary:** relleno `#C8102E`, borde igual, texto `#FFFFFF`. Hover: sube 2 px y brillo rojo difuso (`.3s`, `--ease`).
- **Ghost:** transparente, texto `--text`, borde `--line`; hover rellena con `--glass`, sin brillo.
- **Small:** `btn--sm` (`.55em 1.2em`, .95rem); desde 900 px aparece en la cabecera. Foco: contorno de 3 px rojo, separado 3 px.

### Navigation
Cabecera fija y flotante: marca en píldora de cristal, enlaces en píldora (`.95rem`, 500, `--text-2`, hover `--text` sobre `--glass`), CTA y selector EN/ES. Botón activo del selector: fondo `--text`, texto `--bg`. Móvil: botón de menú de 48 px que abre un panel de 24 px de radio con el CTA en rojo.

### Tarjetas de demos
Teléfonos en abanico 3D (centro `--kc .55-.66`, laterales con `rotateY(±18deg)` y `translateZ(-90px)`), con iframes escalados de la demo real, póster mientras carga, chip rojo y botón "Abrir demo" bajo el teléfono central. En móvil, scroll-snap con `pf--fluid`. En Trabajos, paneles apilados que se fijan (`position: sticky`) en escritorio, cada uno con el color de su negocio (`--pbg`, `--pacc`): taller `#0a0a0a`/`#ff4d2e`, electricista `#0b1a33`/`#ffd400`, taquería `#f3e7d3`/`#a8231a`. Marco de portátil con tapa de 8 px.

### Planes y extras
Tarjeta de cristal de 28 px, nombre en Bricolage 600, precio o rótulo fijo en Bricolage 700 tabular, lista con marca de verificación enmascarada en `--link`. Plan principal con borde cónico que gira en 9 s. Extras como lista con puntos guía (`border-bottom: 2px dotted`) y precios tabulares en mayúsculas.

### Inputs / Fields (formulario)
Contenedor `rgba(11,11,16,.85)`, 28 px de radio, borde `--edge`, `color-scheme: dark`. Campos de 48 px mínimo, 12 px de radio, borde `rgba(245,245,247,.32)`, fondo `--glass`, texto de 16 px (evita el zoom de iOS). Etiquetas 600 .95rem. Foco: contorno de 3 px rojo con 2 px de separación. Envío `b-btn-lg`: 60 px de alto, ancho completo, rojo letrero.

### Pie
Fondo `--bg`, borde superior `--line`, tres columnas desde 860 px, enlaces `--text` con subrayado desplazado 3 px y hover rojo, créditos en `<details>`, y una marca gigante en Bricolage 800 a `15vw`, interletrado .18em, color `--bg-3`, recortada y decorativa.

### Signature: intro de carretera
Lienzo `<canvas>` que reproduce una secuencia de fotogramas con la rueda: `intro-a` e `intro-b`, 90 fotogramas cada una, carpeta `img/v9/frames/<clip>`, variante `-720` en móvil y `-v` vertical para ciudad (`houston-v`) y tienda (`tienda-v`). Póster estático de respaldo. Titular `.h-giant` en la parte baja con la palabra neón. Después el hero "se deshace" (copia a la izquierda, teléfonos a la derecha, chips caen), entra la ciudad y la tienda con cifras gigantes.

### Signature: titular gigante detrás del recorte
`.hero__word`: palabra a 27vw en contorno, centrada detrás de los teléfonos y del recorte de la foto, que se rellena con el scroll (`--fill`).

### Signature: cifras
Cifra enorme (`.v9-num`) con el `%` en rojo neón, una línea de 600 en Bricolage debajo y la fuente a `.82rem`. Conteo animado de 1 a 34 con `power2.out` en 1.2 s.

### Motion
- **Easing base:** `--ease: cubic-bezier(.22,.8,.2,1)`. Scrub de scroll con `ease: 'none'`; salidas del hero `power1.in`.
- **Duraciones:** botones .3 s; fondo de body .9 s; reveal .9 s con `translateY(24px)`; textos de intro .55-.8 s con `translateY(26-32px)`; fundido de lienzos .5 s; teléfonos .6 s; marquesina 60 s lineal; `bob` 7 s; `flick` neón 6 s; `ping` de hotspot 2.2 s; borde cónico 9 s; flecha de scroll 1.8 s.
- **Scroll (Lenis `duration: 1.1`, `syncTouch` en táctil):** carretera pin `+=250%`; hero pin `+=250%`; ciudad `+=200%` (sección de `300svh`); tienda pin `+=300%` con fotogramas 0 a 45 %, pausa, 45 a 95 %, pausa, 95 a 100 %; extras (camión) pin `+=250%`; hotspots pin de 55 % por pantalla.
- **Paradas obligatorias (compuertas):** cuatro. Fin de la carretera (f=1 del recorrido), titular de la ciudad (f=0.92), dato 34 % (f=0.2 de la tienda) y dato 61 % (f=0.78). Al cruzar hacia abajo, Lenis salta a Y y se detiene 700 ms (y hasta que la rueda calle 150 ms, tope 2.5 s); se rearma una pantalla por encima. Hacia arriba y en saltos por ancla no hay paradas.
- **`prefers-reduced-motion`:** `v9-intro.js` sale sin crear lienzos ni ScrollTriggers (queda póster y texto estático). El CSS apaga las transiciones de la intro, `bob`, `flick`, `ping`, la flecha, el borde cónico y la marquesina (pasa a scroll horizontal manual); los paneles de Trabajos dejan de fijarse. Sin JS (`html:not(.v9-on)`) las secciones de intro caen a bloques estáticos.
- **Rendimiento:** animaciones infinitas en pausa fuera de pantalla (`.is-off`); `content-visibility: auto` en secciones largas.

### Bilingüe ES/EN
Inglés por defecto (`<html lang="en">`), español con el selector EN/ES de la cabecera. Todo texto visible lleva `data-i18n`, `data-i18n-html` (cuando incluye `<em class="neon">`) o `data-i18n-aria`; diccionarios en `js/i18n.js` y `js/i18n-parte-b.js`. La elección se guarda en `localStorage` y se refleja en `aria-pressed`. Todo texto nuevo necesita sus dos versiones y su clave.

## Do's and Don'ts

### Do:
- **Do** usar solo `--bg`, `--bg-2`, `--bg-3`, `--bone-2`, `--bone-3` como superficies y `--text`, `--text-2`, `--text-3` como texto.
- **Do** poner el rojo letrero `#C8102E` bajo texto blanco y el rojo neón `#FF2A3C` solo como texto, trazo o brillo sobre negro.
- **Do** dar a cada titular grande una palabra en Instrument Serif itálica roja con brillo, y a cada cifra números tabulares.
- **Do** mantener botones en píldora de 48 px mínimo y radios de 24-28 px en tarjetas.
- **Do** mantener grano fijo al 5 %, la intro de carretera, las cuatro paradas y el selector ES/EN en cualquier recomposición.
- **Do** probar con `prefers-reduced-motion` y sin JS: póster y texto deben bastar.

### Don't (lo que NO es nuestra marca):
- **Don't** usar fondo claro como base de la página principal.
- **Don't** usar paletas crema/terracota, ámbar o petróleo (ni `#f2a93b`/`#58bfc4` de `styles.css`) en la principal. La crema y el ámbar de la taquería son de ese cliente.
- **Don't** usar fuentes condensadas tipo Anton, Bebas o Barlow Condensed en la principal; son de las demos de sector.
- **Don't** añadir eyebrows, kickers ni numeración decorativa a secciones nuevas.
- **Don't** copiar a la principal el lenguaje de `v2/`, `demos/taller-v2/` ni `demos/electricista-v2/`.
- **Don't** usar sombras duras con desplazamiento.

### Variantes de sector (demos)
Cada demo lleva su paleta y tipografía porque es el sitio de un cliente: taller (`#0d0a08`, rojo `#c0321b`, Barlow Condensed), electricista (`#03060e`/`#0a1330`, amarillo `#ffd400`, Barlow Condensed), taquería v3 (`#1b120c`, ámbar `#f2b13a`, salsa `#9b2a1c`, Anton + Inter Tight). No heredan su paleta ni sus fuentes hacia la principal, ni la principal hacia ellas.

## Reglas para quien construya con taste-skill u otra skill

**Fijo (no se toca):**
- Paleta: los 13 tokens del frontmatter; fondo oscuro, rojo y azul neón.
- Fuentes: Bricolage Grotesque (titulares, cifras, marca), Instrument Sans (cuerpo y botones), Instrument Serif itálica (una palabra por titular).
- Grano fijo `.05`, halos azules, brillo de neón rojo.
- La intro de carretera por fotogramas y las cuatro paradas obligatorias de scroll, con pin, scrub y resguardo de póster.
- Bilingüe EN/ES con claves i18n.
- Botón primario en píldora roja letrero; formulario oscuro con campos de 48 px.
- `prefers-reduced-motion` y modo sin JS.

**Libre (decide la composición):**
- Composición por sección: rejillas, asimetrías, cortes, qué ocupa el viewport.
- Ritmo vertical dentro del rango `clamp(72px, 10vw, 140px)`.
- Detalles: máscaras, líneas, halos, micro-interacciones, orden de entrada.
- Fotografía: encuadre, recortes y tratamiento, con tono nocturno (desierto, carretera, industria local) y degradado a `--bg`.
- Longitud de scroll de secciones nuevas, mientras no rompan las cuatro paradas.

## Defectos y deriva no canonizados

Presentes en la build; no son reglas para superficies futuras:
- Etiquetas en mono mayúsculas (`.eyebrow`, `.b-strip__eyebrow`, `.hprog`, `.hs__home-eb`) y numeración decorativa (`.b-step__n` de contorno, `.hs__num`, `.b-extra__n`).
- Rutas `url()` relativas a `css/` en `v8.css` (`fonts/...`, `img/grain.png`) y comillas rotas en `v8-b.css` (`url(img/desert-road-winding-mock-1600.webp")`). En el sitio publicado `css/fonts/bricolage.woff2` y `css/img/grain.png` devuelven 404 (comprobado), así que se ve Arial/system-ui y sin grano hasta que se corrija. Este documento describe la intención de diseño, no ese fallo.
- `--blue-deep`, `--sage`, `--bone`, `--ink*` son alias o tokens sin uso visible; `css/styles.css` no está enlazado.
