# Reels de estilo - Lote 3

Analisis visual por muestreo de fotogramas (Brave, solo lectura). Los fotogramas del reel 1 son de baja resolucion (169x301): el detalle fino puede faltar. Todo lo no visible se marca "no visible".

---

## 1. https://www.instagram.com/p/DZdOFrNDx4i/ (yasoppustudio)

- Ruta y duracion: /p/ (video, 10,95 s, 11 capturas a 1 s). Pie: "Built this entire website using only Claude AI - I didn't write a single line of code. Smart prompting, creativity, iteration. JUST COMMENT PROMPTS... copy my PROMPTS". Hashtags shopify, webdesign, antigravity. 183 mil reproducciones, 5,8 mil likes, 13,9 mil comentarios. Tipo: muestra una web y capta leads por comentario ("prompts"); no ensena el proceso en el video.
- Webs mostradas: una sola, tienda de producto "DRIP" (botella/termo de acero inoxidable, 600 ml), grabada en un portatil sobre mesa oscura con una mano que desliza el trackpad.
  - 0,5 s: hero claro, titular "The Future..." con producto oscuro entrando.
  - 1,5 s: "Sleek / Design" con sombra grande del producto cruzando.
  - 2,5 s: "Black" + parrafo corto a la derecha, botella negra vertical centrada.
  - 3,5 s: "Stainless Steel" a la izquierda, "Capacity 600ml" a la derecha, botella flotando al centro.
  - 4,5 s: "Long Lasting", producto girado (tapa) al centro, texto a la derecha.
  - 5,5 s: primer plano interior con particulas, "Charging Type USB-C" (macro con grano/particulas).
  - 6,5 s-7,5 s: icono de encendido, luego pila de aros morados (3D) y "Battery Capacity 5000 mAh".
  - 8,5 s: producto esferico oscuro con luz violeta, "5000 mAh".
  - 9,5 s: producto negro con luz lila en la tapa sobre fondo claro.
  - 10,5 s: cambio a modo oscuro (fondo azul marino), "Disinfection Rate 99%".
- Layout: scrollytelling de producto, una seccion por caracteristica (nombre grande a un lado, dato numerico al otro, producto 3D centrado); nav fina arriba con logo "DRIP" centrado (azul claro), enlaces HOME/CONTACT/SHOP a la izquierda e iconos a la derecha. Simetrico/centrado.
- Tipografia: sans geometrica, titulares medianos-grandes en negrita ("Stainless", "Long"), subtitulo pequeno en gris debajo; cifras grandes en negrita (600ml, 5000, 99%). Fuente: no visible.
- Color: fondo claro hueso/crema para la mayoria; cambia a azul marino oscuro al final. Acento: violeta/lila neon en las secciones de bateria; logo azul claro. 2-3 colores. Particulas/grano en el macro.
- Imagen: producto en 3D renderizado/secuencia de frames (botella, tapa, interior, aros), sin fotos reales ni video de fondo.
- Movimiento: intenso y continuo: el producto rota, se acerca, se separa en capas y cambia de pose (parece atado al scroll), transiciones claro a oscuro. Estilo "pagina de producto Apple".
- Componentes llamativos: producto 3D como protagonista, cifras gigantes, cambio de tema de color por seccion. No se ve pricing ni footer.
- Herramienta de construccion: segun el pie, Claude ("antigravity" en hashtags; Shopify). Probable Three.js/canvas de secuencia de imagenes; no visible en pantalla.
- Texto del reel (literal): "Can you believe Claude did this ?" y "JUST FOLLOW MY STEPS ITS EASY!!". No dice por que se ve cara.
- Viabilidad con HTML/CSS/JS + GSAP + Lenis: MEDIO. El scroll con ScrollTrigger + Lenis es facil. Lo dificil es el producto 3D: hace falta secuencia de imagenes en canvas (frames exportados de Blender) o un modelo glb con Three.js (libreria extra) y el render del producto. Sin activos 3D no se replica.

---

## 2. https://www.instagram.com/reel/Dbd6PFPq3-c/ (tessa.fairbrook, "contenido generado con IA")

- Ruta y duracion: reel, 42,7 s, 15 capturas (cada 2-6 s, no cada 1 s: una tanda de capturas se perdio por un error de la herramienta). Pie: "Stop building ugly AI websites. Claude can build beautiful websites when paired with the right design skills. Emil Kowalski's skill (animaciones suaves), Impeccable (tipografia y espaciado), Taste (calidad de diseno web). Conecta Claude a Figma y Playwright... Comment DESIGN para recibir las skills y la guia." 6,9 mil likes, 12 mil comentarios (31 jul 2026). Tipo: promo de herramientas/skills con gancho de leads. Solo los primeros ~12 s muestran webs.
- Webs mostradas (portatil negro sobre fondo oscuro, mano con anillo):
  - 0,3 s: "Time, Refined." relojeria de lujo (reloj oscuro con correa, oro rosa), sobre negro.
  - 2 s: Lamborghini dorado, titular "Bay Fioy" (no legible con certeza), negro con luces cenitales tipo tubos; nav minima.
  - 10 s: moto negra en garaje de ladrillo, "Intelligent Riding / Powerful & Silent", pequeno logo naranja, dentro de marco con esquinas redondeadas.
  - 12-42 s: presentadora hablando a un microfono, capturas de terminal Claude Code, tarjeta "emilkowalski/skills" (#1), capturas de una web "Respects your design system", cabeceras "BEST OF CLAUDE - VOL 62 / the BEST USE CASES / PART 62". No son webs de referencia.
- Layout: las 3 webs son heroes asimetricos a pantalla completa: texto a la izquierda abajo, producto grande central/derecha, nav fina arriba, fila de 3 iconos/beneficios abajo (reloj).
- Tipografia: serif elegante en el reloj ("Time, Refined." serif clara, tamano grande), sans fina en las otras. En el reel, subtitulos en serif blanca y naranja sobre negro. Fuente: no visible.
- Color: negro/carbon dominante con acento calido (dorado, cobre, naranja Claude). 2 colores. Luz volumetrica, reflejos en suelo.
- Imagen: renders/fotos realistas de producto con iluminacion de estudio y reflejos; sin recortes ni blanco y negro.
- Movimiento: no visible (muestreo disperso).
- Componentes llamativos: nav minima transparente, fila de 3 beneficios con iconos, marco redondeado; en el reel, subtitulos tipo karaoke.
- Herramienta de construccion: Claude Code + skills (Emil Kowalski, Impeccable, Taste) + Figma MCP + Playwright (segun pie y capturas de terminal).
- Texto del reel (literal, fragmentos): "Stop letting Claude build ugly generic websites", "beautiful websites", "but only if you give it the right design skills", "so your projects stop looking AI generated", "Respects your design system", "automatically", "modern animations instead of stiff".
- Viabilidad: FACIL a MEDIO para el hero oscuro de lujo (HTML/CSS, serif, imagen de producto con luz). Hace falta fotografia/render de producto buena y cuidado en espaciado/tipografia; sin 3D. Impeccable ya esta instalado en nuestro entorno.

---

## 3. https://www.instagram.com/reel/Dd_UfShp32b/ (kryntixstudio)

- Ruta y duracion: reel, 13,6 s, 9 capturas cada 1,5 s. Pie: "The more seamless and immersive the end experience is, the higher is the price for your service. I've done 30+ web design projects with $5k+ budgets and these are the elements that allowed me to do so." 530 likes, 110 comentarios (2 oct 2026). Tipo: muestra una web y argumenta que la inmersion permite cobrar mas.
- Webs mostradas: una sola, "KAGE" (sitio inmersivo de templo japones nocturno con luna roja), en portatil con luz amarilla de lampara.
  - 0,5-5 s: hero "WHERE STILLNESS REVEALS THE UNSEEN." a la izquierda, letras gigantes "K A G E" en blanco delante de la escena (templo, luna roja grande, cesped, hojas de arce rojas), indicador 01 02 03 04 abajo, kanji a la derecha.
  - 6,5 s: galeria: torii rojo, luna, cerezo en flor, tarjeta lateral a la derecha.
  - 8-11 s: escena casi a pantalla completa (torii, templo, flores rojas), dos miniaturas apiladas a la derecha, cursor visible.
  - 12,5 s: nueva seccion "AFTERLIGHT" (texto vertical a la derecha), fila de ventanas luminosas del templo, texto "walk through a kyoto mountain temple" abajo.
- Layout: inmersivo, pantalla completa, capas con profundidad (letras en primer plano, escena detras, hojas delante); secciones numeradas 01-04; texto pequeno en esquinas; asimetrico.
- Tipografia: eslogan en sans condensada mayusculas; "KAGE" en sans geometrica gigante (peso medio, tracking ancho), blanca; textos secundarios pequenos; kanji decorativo. Rotulo del reel en serif condensada blanca. Fuente: no visible.
- Color: fondo muy oscuro (azul-negro), acento rojo carmesi (luna, hojas), texto blanco, destellos calidos. 2-3 colores. Grano no visible.
- Imagen: escena 3D/ilustracion renderizada en capas (WebGL o capas parallax), no fotos reales.
- Movimiento: intenso: parallax por capas, titulares que se desplazan, transiciones entre escenas, cursor personalizado visible; probablemente scroll-triggered.
- Componentes llamativos: letras gigantes con profundidad delante del fondo, indicadores numerados, miniaturas laterales, texto vertical, cursor circular.
- Herramienta de construccion: no visible (probable WebGL/Three.js o Webflow/Framer con GSAP).
- Texto del reel (literal): "POV: You mastered Interactive Websites..". El pie dice que la experiencia inmersiva justifica el precio.
- Viabilidad: DIFICIL en version completa (escena 3D con profundidad). MEDIO si se reduce a capas PNG con parallax + GSAP ScrollTrigger + Lenis + texto gigante por delante (mix-blend/mask). Hace falta ilustracion/render por capas con transparencia y, para lo ultimo, Three.js.

---

## 4. https://www.instagram.com/reel/DepzwMBh2ZA/ (marcelodesignxh, hero sections)

- Ruta y duracion: reel, 9,87 s, ~20 capturas cada 0,25-0,5 s (los primeros intentos dieron fotogramas desordenados porque Instagram seguia reproduciendo; se corrigio forzando la pausa). Pie: "Stop designing boring hero sections. Save this for later!" 572 likes, 12 comentarios (18 oct 2026). Tipo: muestra webs (wireframe a resultado).
- Hallazgo: son 5 ejemplos, cada uno precedido de su wireframe en bloques de colores (nav rosa, bloques azul/amarillo/verde) que se transforma en el sitio final con un barrido. Intro 0-2,75 s: hombre de espaldas ante dos monitores (gancho). La lectura anterior de "6 ejemplos" probablemente contaba el hero de arquitectura dos veces.
- Webs mostradas:
  1. (wireframe 3,25 s: Title + Subtitle / CTA / Product Image o Dashboard sobre semicirculo) Resultado 3,75 s: "Operational analytics, forged in real time." Hero negro, anillo/arco de fuego naranja brillante en el borde, dashboard oscuro asomando abajo, titular blanco centrado en dos lineas, nav fina y botones. Fondo del reel rosa claro.
  2. (wireframe 4,25 s: Main Heading centrado con montanas laterales) Resultado 4,75 s: "Know Your Land / Down to Every Acre" (agrotech). Fondo crema/verde salvia, titular centrado en sans fina (linea 1 gris claro, linea 2 oscura), montanas rocosas fotograficas a ambos lados, dashboard verde oscuro (2.148,6 t) con mapa abajo. Fondo del reel verde menta.
  3. (wireframe 5,25 s: Main Title Second Line, sol y tarjeta central) Resultado 5,75-6,25 s: "Tap. Split. Earn back." (fintech). Tarjeta negra/violeta 3D flotando sobre agua con ondas, atardecer naranja-rojo que vira a violeta (animacion de color en 0,5 s), titular blanco abajo a la izquierda en sans media, texto pequeno a la derecha, CTA pequeno abajo a la derecha, anillo fino alrededor de la tarjeta. Fondo del reel salmon.
  4. (wireframe 6,75 s: Main Heading + Main Visual / 3D Graphic + bloques pequenos) Resultado 7,25-7,75 s: "Shaping Spaces That Endure" (arquitectura). Fondo gris muy claro, titular enorme en sans ligera negra en dos lineas (curva decorativa en la "t"), edificio de lineas wireframe 3D isometrico que crece/hace zoom hasta ocupar el hero; parrafo y boton abajo a la izquierda, miniatura foto abajo a la derecha, nav con pastilla negra "Start a project".
  5. (wireframe 8,25 s: Main Title centrado con onda abstracta) Resultado 8,75-9,7 s: "Turn Your Data Into / Your Smartest Teammate". Negro puro, dos manos de particulas/puntos blancos que casi se tocan (estilo Creacion de Adan) en la mitad inferior, titular blanco centrado (segunda linea en negrita), subtitulo gris pequeno, dos botones (relleno blanco + contorno), nav centrada en pastilla. Fondo del reel gris claro.
- Layout: heroes de una pantalla con titular fuerte y visual protagonista; 3 centrados (analytics, Know Your Land, Turn Your Data) y 2 asimetricos (Tap Split: titular abajo-izquierda; Shaping Spaces: titular arriba-izquierda). Nav fina en pastilla; botones pastilla.
- Tipografia: siempre sans moderna (neo-grotesca); contraste de peso en dos lineas (ligera/negrita) en Know Your Land y Turn Your Data; titular muy grande y apretado en Shaping Spaces; sin serif; Title Case/minusculas. Fuente: no visible.
- Color: alternan oscuros (analytics, fintech, data) y claros (Know Your Land, Shaping Spaces). 1 acento por sitio (naranja fuego, violeta/naranja, verde salvia); degradados atmosfericos en los oscuros; grano no visible.
- Imagen: mezcla de render 3D (tarjeta, edificio), foto (montanas), particulas (manos) y mockup de dashboard; los visuales asoman por el borde inferior o se salen del marco.
- Movimiento: cada hero tiene su propio gesto: cambia el color del atardecer (fintech), el edificio crece (arquitectura), las particulas flotan (data). Intensidad media-alta.
- Componentes llamativos: dashboard asomando abajo, nav en pastilla, botones pastilla doble, tarjeta con anillo, miniatura de imagen en la esquina.
- Herramienta de construccion: no visible (wireframes sugieren Figma).
- Texto del reel (literal): "Save this". Pie: "Stop designing boring hero sections".
- Viabilidad: mayoria MEDIO. Facil: Know Your Land y Shaping Spaces sin 3D (tipografia + fotos + dashboard como imagen). Medio: analytics con anillo de luz (conic/radial gradient + blur o PNG) y fintech (render de tarjeta + gradiente animado con GSAP). Dificil: edificio 3D y manos de particulas (Three.js/canvas de particulas o video en bucle). Atajo: video en bucle o secuencia de imagenes para los efectos 3D.

---

## Patrones comunes del lote

1. Heroe a pantalla completa con UN visual protagonista (producto, tarjeta, edificio, escena) y titular grande en sans; muy poco texto alrededor.
2. Dominan fondos oscuros (negro/azul-noche) con UN acento calido (naranja, rojo, oro, violeta) y luz volumetrica/reflejos; los claros son crema o gris muy suave.
3. Tipografia: sans limpia con contraste de peso (ligero/negrita) o serif elegante para lujo; titular enorme; nav fina o en pastilla; botones pastilla.
4. El render 3D o la ilustracion en capas es lo que "parece caro"; con fotos de stock y sin 3D la mayoria pierde el efecto.
5. Movimiento atado al scroll: rotacion/zoom de producto, parallax por capas, cambios de color de fondo, cursor personalizado; intensidad media-alta y fluida (Lenis + GSAP).
6. Dificultad: texto + foto + dashboard = facil; gradientes animados y anillos de luz = medio; 3D real, particulas o escena inmersiva = dificil (Three.js o secuencia de frames).
7. Los reels muestran el resultado, no el proceso; el argumento de venta es "inmersion = precio mas alto" ($5k+).
8. Para nuestro stack: copiar estructura y tipografia (facil) y usar 1 render de producto o video en bucle como pieza heroe en lugar de 3D en vivo.

## Problemas del lote
- Instagram siguio reproduciendo el video tras pausarlo (reel 4 dio fotogramas desordenados hasta forzar la pausa en bucle); los fotogramas del reel 1 son pequenos (169x301); en el reel 2 se perdio una tanda de capturas por un error de la herramienta y se repitio con menos densidad; en el reel 3 solo hay 9 capturas en 13,6 s.
- No se hizo like, comentario, seguimiento ni guardado. Pestana propia cerrada; la pestana de Expo de otro proceso no se toco.
