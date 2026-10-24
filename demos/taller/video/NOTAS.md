# Órbita 360 de la camioneta (Higgsfield)
- Generado 2026-10-24 por el director en Brave con la sesión de Carlos (acuerdo de subida aceptado con su autorización explícita en chat).
- Modelo: Seedance 2.0 · 15 s · 16:9 · 720p · 68 créditos (una generación).
- Imagen de entrada: img/fuentes/truck-7873720.jpg (Pexels, Andrew LaBonne).
- Prompt: "Smooth 360-degree orbit camera move around a parked yellow pickup truck, truck perfectly still, studio lighting, dark seamless background, no people, no camera shake, constant speed, full rotation, photorealistic".
- Fichero: orbita.mp4 (4,4 MB). Condiciones de uso comercial del plan de Higgsfield: no leídas; VERIFICAR antes de usar en web de cliente.

## orbita-motor.mp4: secuencia de fotogramas (2026-10-24)
- Vídeo 1280x720, 24 fps, 15 s (Seedance 2.0, misma pickup). Revisado a 1 fotograma/s.
- 0 a ~11,5 s: la cámara rodea la camioneta (puerta, caja, trasera, perfil, 3/4 delantero). ~11 s: vista frontal exacta.
- ~11,5 a ~13 s: se abre el capó. 13,0 s: capó arriba. 14,5 s en adelante: zoom tan cerrado que se corta el capó y parte del motor.
- FOTOGRAMA FINAL elegido: 13,5 s (fotograma 324, base 0). Motor completo y centrado, capó aún visible arriba, faros encendidos.
- Muestreo: 40 fotogramas de 0 a 11,5 s (cada ~7 fotogramas del vídeo) + 48 de 11,6 a 13,5 s (cada fotograma) = 88. Más densidad en capó/motor.
- Recorte: rembg 'isnet-general-use' sin -a (con -a -ae 15 el recorte de los primeros planos del motor salía casi vacío) para los fotogramas 1-77; 'u2net' para 78-88 (isnet falla cuando la camioneta llena todo el encuadre). Postproceso: contraste de alfa, relleno de huecos interiores (ventanillas) y degradado de 48 px en los bordes del encuadre.
- Salida: motor/0001..0088.webp (1100x619) y motor600/ (600x338), calidad 80 con alfa. Mismo encuadre en todos.
- Limitaciones: en los últimos fotogramas el capó interior se ve fantasmal/recortado (el modelo lo toma por fondo); las primeras tomas muy cerradas (puerta) tienen alfa irregular.

### Rango usado en la web (vuelta 2)
- Se usan solo los fotogramas 0005-0064 (60). Descartados: 0001-0004 (primeros planos de la puerta con alfa deshecha) y 0065-0088 (el capó interior y el motor salen fantasmales con rembg). Los descartados se movieron fuera del proyecto (scratchpad).
- Fotograma de PARADA: 0064 (capó abierto, motor visible, recorte nítido). Peso actual: motor 2,3 MB + motor600 1,2 MB = 3,5 MB.
- Para recuperar el zoom final al motor habría que regenerar el recorte con otro método (SAM/matting o enmascarar con el fotograma 0064).
