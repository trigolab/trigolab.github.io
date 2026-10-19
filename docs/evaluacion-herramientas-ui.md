# Evaluación de herramientas de interfaz para TrigoLab

Fecha: 18 de octubre de 2026. Autor: Cristian Favaro (ckfavaro).

## 1. Diagnóstico del proyecto

- **Fuente real**: `trigolab/` dentro de este repositorio (`github-pages/`). La carpeta padre `D:/Proyecto Yami/TrigoLab` es el respaldo de la publicación anterior en chatgpt.site y no se toca.
- **Tecnología**: HTML, CSS y JavaScript nativos. Sin React, sin bundler, sin `npm install` para ejecutar. El `package.json` solo declara scripts de prueba. Siete archivos publicados, 88 KB en total.
- **Publicación**: `python prepare_web.py` copia los siete archivos a `out/`. El workflow `.github/workflows/pages.yml` corre en cada push o pull request a `main`: instala Playwright, ejecuta `math.test.cjs` y las cuatro pruebas Python, y solo si todo pasa publica `out/` con `actions/deploy-pages`. La fuente de Pages es GitHub Actions. Un push a una rama con PR ejecuta las pruebas sin publicar.
- **Sitio publicado**: https://trigolab.github.io (organización `trigolab`, repositorio `trigolab.github.io`). Verificado con `git remote -v` y con los encabezados HTTP del sitio.
- **"Sin conexión"**: significa que la app no hace ninguna petición de red en ejecución (no hay fuentes externas, CDN ni servicios). Abierta desde `index.html` funciona sin internet. No hay service worker, así que la versión publicada sí necesita conexión para cargarse la primera vez; después el navegador la cachea 10 minutos (`Cache-Control: max-age=600`).
- **Pruebas**: `node trigolab/tests/math.test.cjs` (parser y propiedades) y `python run_tests.py` (navegador real con Chrome: fórmulas, unidades, identidades, escenario, video, comparador, móvil a 360/390/768 px, servidor local). Línea base antes de tocar nada: todo en verde.

## 2. Capacidad, costo y seguridad de GitHub Pages

Fuente: documentación oficial de límites de GitHub Pages y encabezados observados en el sitio.

| Aspecto | Valor | Qué significa para TrigoLab |
|---|---|---|
| Costo | Gratis para repositorios públicos | Sin tarjeta ni plan. Las pruebas en Actions también entran en el plan gratuito de repos públicos. |
| Tamaño del sitio | Máximo 1 GB | TrigoLab publicado pesa 88 KB. |
| Ancho de banda | Límite blando de 100 GB por mes | Equivale a más de un millón de cargas completas por mes. Un curso entero no se acerca. |
| Publicaciones | Límite blando de 10 por hora (no aplica con Actions propio) | Irrelevante en el uso normal. |
| Visitantes simultáneos | No hay cifra oficial | Es un sitio estático servido por la red de Fastly (se ve en `X-Served-By`, `Via: varnish`, borde en Buenos Aires). Miles de alumnos a la vez no son problema; cada uno descarga 88 KB y después todo corre en su navegador. |
| HTTPS | Obligatorio, con `Strict-Transport-Security` | Las conexiones van cifradas. |
| Usos prohibidos | Comercio, contraseñas, datos sensibles | TrigoLab no guarda datos de alumnos ni tiene cuentas: cumple. |

Seguridad ante ataques: no hay servidor propio, base de datos ni formularios que envíen datos, así que no hay nada que "hackear" en la app. Un ataque de denegación de servicio lo absorbe la CDN de GitHub (grace mode: sirve copia en caché aunque el origen esté saturado). Los riesgos reales son otros dos: la cuenta de GitHub (activar verificación en dos pasos en `ProfeYamila` y `ckfavaro`, y proteger `main` para exigir el check verde antes de fusionar) y las dependencias (hoy no hay ninguna en ejecución, lo que elimina el riesgo de cadena de suministro; conviene mantenerlo así).

Veredicto: para un proyecto educativo tranquilo, GitHub Pages sobra. No hace falta pagar hosting.

## 3. Herramientas del reel

| Herramienta | Qué es | Sirve para TrigoLab | Compatibilidad | Costo | Decisión |
|---|---|---|---|---|---|
| Motion (ex Framer Motion) 14.3 | Biblioteca de animación. Tiene versión para JavaScript puro (`motion/mini`, 3,2 KB) además de React. Licencia MIT. | Poco. Las animaciones didácticas de TrigoLab (círculo, manivela, curvas, punto móvil) se dibujan en `canvas` con un reloj propio compartido entre tres módulos. Motion anima propiedades del DOM, no el dibujo en canvas. Las transiciones de interfaz que faltaban se resuelven con CSS. | Rompería la regla "sin dependencias externas en ejecución" o habría que incluir el archivo en el repo. | Gratis (Motion+ es pago, no hace falta). | **Descartada por ahora.** Reevaluar si se agrega una pantalla con muchas transiciones de DOM. |
| UI UX Pro Max 2.15 | Skill para asistentes: CSV con 79 estilos, 192 paletas, 74 pares de fuentes, 119 pautas de UX y un buscador BM25 en Python. 137 mil estrellas, MIT, último push 15/10/2026, 91 issues abiertos. Scripts sin red (verificado con grep). | Marginal. Su fuerte es generar sistemas de diseño para landings y SaaS con Tailwind o React. Para TrigoLab propuso "Claymorphism", fuentes de Google (dependencia externa, prohibida acá) y "evitar modo oscuro" (TrigoLab lo tiene y se prueba). Las 119 pautas de UX son correctas pero generales (contraste 4.5:1, 44 px táctiles, `prefers-reduced-motion`). | Compatible: solo archivos de texto y Python. Instalada en `.claude/skills/` con alcance local al proyecto, ignorada por git. | Gratis. Hay una versión premium (marca, logos) que no interesa. | **Instalada para probar.** Útil como lista de verificación; no reemplaza el criterio sobre esta app. |
| 21st.dev | Catálogo de componentes React + Tailwind + shadcn. MCP "Magic" para que el asistente busque y genere componentes. | No. Exige React. TrigoLab es JavaScript nativo y migrar solo para usar componentes decorativos contradice las reglas del repo. | Incompatible sin migración. | Navegar es gratis; 2 copias por día gratis; generación y `get_component` son pagos; el MCP requiere clave de API. | **Descartada.** |
| Claude Code | Ya en uso. | — | — | Suscripción existente. | Sin cambios. |

Verificado: documentación de Motion (`motion.dev/docs`), `npm view motion`, repositorio y `SKILL.md` de UI UX Pro Max, `21st.dev` y `21st.dev/mcp.md`, límites de GitHub Pages. No verificado: comportamiento de Motion en canvas en la práctica (se descartó por diseño, no por prueba) y los precios exactos de 21st.dev más allá de lo que publica su página.

### ¿Aporta UI UX Pro Max frente al asistente sin la skill?

Probé tres consultas reales. "range slider live value feedback" devolvió chips, badges y vibración háptica: nada aplicable. "reduced motion animation meaning" devolvió la pauta correcta de `prefers-reduced-motion`, que ya estaba contemplada. El sistema de diseño completo para "educational math tool" propuso un estilo infantil con fuentes externas. Conclusión: para una app ya diseñada, con identidad propia y reglas estrictas, la skill suma una lista de verificación genérica y resta tiempo si se siguen sus recomendaciones sin filtrar. Queda instalada por si se quiere consultar la tabla de prioridades (accesibilidad, tacto, rendimiento) antes de entregar.

## 4. Qué se instaló y qué no

- Instalado: UI UX Pro Max con `npx ui-ux-pro-max-cli init --ai claude` dentro de `github-pages/`. Escribió 4,5 MB en `.claude/skills/` (siete skills: ui-ux-pro-max, design, design-system, ui-styling, brand, banner-design, slides). Se agregó `.claude/` a `.gitignore` para que no entre al repositorio ni a la publicación. Se desinstala con `npx ui-ux-pro-max-cli uninstall --ai claude` o borrando la carpeta.
- No instalado: Motion (no hay dónde usarlo sin violar las reglas), 21st.dev y su MCP (React y clave de API), Claude Code (ya estaba).
- No se agregaron claves, tokens ni servicios.

## 5. Mejora implementada

Problema observado en las capturas a 390 px: el alumno mueve un control arriba y la gráfica y los indicadores (amplitud, período, desfasaje, línea media) quedan varias pantallas más abajo. La conexión "muevo B, cambia el período" no se veía en el mismo lugar. Además, el modo activo (Explorá, Compará, Identidades, Desafíos) no se anunciaba a lectores de pantalla.

Cambios, en la rama `mejora/lectura-de-parametros`:

- `trigolab/app.js`: nueva función `describeEffects()` que escribe debajo de cada control qué propiedad cambia, con las mismas fórmulas que los indicadores: amplitud |A| (o escala vertical en tangente, que no tiene amplitud), período = 2π/|B| o π/|B| (360°/|B| o 180°/|B| en grados), desplazamiento h hacia la derecha o izquierda, línea media y = D. Casos especiales: A = 0 y B = 0 (constante), A o B negativos (reflexión). Nueva función `markChangedMetrics()` que resalta solo el indicador cuyo valor cambió. Los botones de modo reciben `aria-current`.
- `trigolab/style.css`: estilo del texto de lectura, resalte del indicador por cambio de color (sin desplazamiento ni escala), variante para tema oscuro y anulación de la animación con `prefers-reduced-motion`. Texto de los indicadores de 10 a 11 px.
- `trigolab/index.html`: `aria-current="true"` en el modo inicial.
- `trigolab/tests/browser.test.py`: comprobaciones nuevas para la lectura en radianes y grados, tangente, B = 0, resalte de un solo indicador, animación anulada con movimiento reducido y `aria-current` único.
- `trigolab/README.md`: una línea en "Qué incluye".
- `.gitignore`: `.claude/`.

No se modificaron `math.js`, `motion.js`, `classroom.js`, `comparison.js` ni fórmulas, unidades, sincronización o asíntotas.

## 6. Pruebas

Ejecutado en Windows con Chrome, después de los cambios:

```
python prepare_web.py
node trigolab/tests/math.test.cjs      -> OK
python run_tests.py                    -> browser, classroom, comparison, server: OK
```

Cubren: ingreso de fórmulas y errores, parámetros A, B, h y D, grados y radianes, seno, coseno y tangente con asíntotas, animación, comparación, identidades, descargas PNG/CSV/video, temas, anchos 360/390/768 px sin desplazamiento horizontal. Revisé capturas del panel de controles en claro y oscuro a 390 px.

Limitaciones: no se probó con un lector de pantalla real; el resalte vuelve a dispararse en cada paso mientras se arrastra un control (es intencional, pero conviene observarlo con alumnos). Las pruebas en GitHub Actions usan Chromium en Linux; corren solas al abrir el PR.

## 7. Cómo verlo y cómo publicarlo

Local: abrir `github-pages/trigolab/index.html` en el navegador, o `python trigolab/servidor.py` y entrar en http://localhost:5500.

Publicación (la hacen Cristian o Yamila):

```sh
git push -u origin mejora/lectura-de-parametros
```

Abrir el Pull Request, esperar el check "Probar y publicar TrigoLab" en verde y hacer Merge. Al entrar en `main` se publica solo en https://trigolab.github.io. Si algo falla, el sitio anterior sigue en línea.

## 8. Segunda tanda de mejoras (misma fecha, rama `mejora/experiencia-alumnos`)

A pedido de Cristian se implementaron todas las mejoras detectadas, cada una con su prueba:

| Mejora | Dónde | Prueba |
|---|---|---|
| Desafíos con devolución concreta: indica qué parámetro falta (función, amplitud o escala vertical, período, desfasaje, traslado) | `app.js` `challengeFeedback()` | `browser.test.py` |
| Desafíos ilimitados: cinco fijos y después generados al azar, estables mientras no se pasa al siguiente | `app.js` `challengeAt()` | `browser.test.py` |
| Experiencias guiadas 05 Corrimiento (h = π/2) y 06 Línea media (D = 1), con h convertido a grados cuando el escenario está en grados | `motion.js` | `browser.test.py` |
| Borrador de «Mi explicación» guardado en el navegador | `classroom.js` | `classroom.test.py` |
| Plano y comparador con fondo y colores del tema oscuro, también en los PNG exportados | `app.js`, `comparison.js`, `style.css` | `classroom.test.py` |
| Legibilidad: textos de ayuda e indicadores de 10-12 px a 11-14 px | `style.css` | anchos 360/390/768 sin desborde en todas las suites |
| Sin conexión real e instalación como app: `sw.js` (red primero), `manifest.webmanifest`, íconos SVG y PNG | `trigolab/`, `prepare_web.py`, `servidor.py` | `offline.test.py` (apaga el servidor y la app sigue), `server.test.py` |

Decisiones de seguridad para no romper lo que funciona: el service worker solo intercepta los archivos propios de la app y siempre intenta la red primero, así una publicación nueva llega a los alumnos en cuanto recargan; el borrador se guarda solo en el dispositivo del alumno; los desafíos generados usan valores alcanzables con los controles (A, B, h y D sobre sus pasos).

Pendiente de verificar en la publicación real: que GitHub Pages sirva `manifest.webmanifest` con el tipo `application/manifest+json` (el servidor local ya lo hace) y que Chrome en Android ofrezca «Instalar». Si no lo ofrece, la app sigue funcionando sin conexión igual.

## 9. Modo Juego: la hélice (rama `mejora/juego-helice`)

Idea didáctica: un punto gira en el círculo mientras el tiempo avanza y dibuja una hélice. Su sombra de costado es el seno; desde arriba, el coseno. El alumno ajusta A, B, h y D para que la hélice atraviese siete aros. Es el modo "Desafíos" convertido en juego, y la primera vez que TrigoLab muestra seno y coseno como dos sombras del mismo movimiento.

Cómo está hecho:

- `trigolab/juego.js`: módulo ES que se descarga recién al entrar al modo "05 / Juego" (la app principal no pesa más). Vista 3D con Three.js y vista 2D en canvas sobre el mismo nivel. Cinco niveles que liberan de a uno A, B, D y h; después niveles al azar. Pistas direccionales ("los aros dan más vueltas que tu hélice: aumentá B"), estrellas por cantidad de lanzamientos, mejor puntaje guardado en el navegador. Cámara con arrastre y pellizco, cuatro vistas con nombre (perspectiva, círculo, seno, coseno), rótulos proyectados sobre la escena, tema claro y oscuro, `prefers-reduced-motion` (sin animaciones de cámara ni de lanzamiento).
- `trigolab/vendor/three.min.js`: Three.js 0.186.1 (MIT) reducido con esbuild a las clases que usa el juego: 544 KB, 140 KB comprimido. Se incluye en el repo para no depender de ningún servidor externo; el service worker lo guarda para uso sin conexión. Cómo regenerarlo está en `vendor/README.md`.
- Sin WebGL, el modo avisa y ofrece la vista 2D. Abierta desde el archivo `index.html` (sin servidor), el modo explica cómo abrirlo porque los módulos no cargan desde `file://`; el resto de la app no cambia.
- Pruebas: `juego.test.py` sirve la app por http y verifica carga diferida, niveles, bloqueo de controles, pistas, estrellas, vistas, 2D, tema oscuro y celular; `browser.test.py` verifica el aviso cuando se abre desde el archivo; `server.test.py` y `offline.test.py` cubren los archivos nuevos.

Decisiones: tiempo de izquierda a derecha en todas las vistas; la pared del seno queda detrás de la hélice y el piso del coseno debajo; los aros son toros en el plano del círculo, así en la vista "de costado" se ven como trazos y en la "de frente" como círculos. Las pistas solo hablan de los parámetros libres del nivel para no dar la respuesta.

## 10. Veredicto

Las herramientas del reel sirven para construir rápido landings y paneles con React. TrigoLab no es eso: es una app didáctica en JavaScript nativo, sin dependencias, con pruebas automáticas y reglas de publicación estrictas. De las tres, solo UI UX Pro Max se puede usar sin romper nada, y su aporte es una lista de verificación genérica. La mejora de hoy salió de mirar la app en un celular y de las reglas del propio repo, no de la skill. El camino para seguir mejorando la experiencia de los alumnos es ese: observar un problema concreto, cambiar lo mínimo, probar y publicar por PR.
