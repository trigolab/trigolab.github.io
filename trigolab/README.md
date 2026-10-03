# TrigoLab — Matemática en movimiento

Aplicación local en español para explorar seno, coseno y tangente en 6.º año. No requiere cuenta, internet, servidor de datos ni bibliotecas externas. El código se puede editar en Visual Studio Code y versionar en GitHub.

## 1. Abrir y ejecutar

1. Abrí la carpeta `trigolab`. En Windows, hacé doble clic en **INICIAR.cmd** para abrir la aplicación en tu navegador.
2. En Visual Studio Code elegí **Archivo → Abrir carpeta** y seleccioná `trigolab` (la carpeta que contiene `index.html`).
3. Para empezar de inmediato, abrí `index.html` con Chrome, Edge o Firefox desde el Explorador de archivos. La aplicación funciona sin conexión.
4. Para trabajar con recarga al editar, si ya tenés la extensión Live Server: clic derecho en `index.html` → **Open with Live Server**.
5. Alternativa, si tenés Python instalado: desde la terminal de esa carpeta ejecutá `python servidor.py` y abrí `http://localhost:5500`. Detené el servidor con Ctrl+C.

No hace falta `npm install`. Con Node instalado, `npm test` ejecuta las pruebas matemáticas. `npm start` usa Python para iniciar el servidor.

## 2. Qué incluye

- Fórmulas editables: `2sen(x)`, `cos(2x)`, `3sen(2x-pi)+1`, `tan(x/2)`, `sen(x)^2+cos(x)^2`.
- Operaciones `+ - * / ^`, multiplicación implícita, números con punto decimal, `x`, `pi` o `π`; aliases `sin`, `sen`, `tan`, `tg`.
- Controles para A, B, h y D en `A·función(B·(x-h))+D`.
- Grados y radianes; comparación con la función base; acercar y alejar el eje horizontal.
- Escenario animado con un personaje propio, círculo unitario y seno, coseno y tangente simultáneos. Comparte A, B, h, D, unidades y reloj con el gráfico.
- Pausa, recorrido manual con teclado o deslizador, curvas que se pueden ocultar y descarga PNG del escenario.
- Cuatro experiencias guiadas: una vuelta, amplitud, frecuencia y puntos excluidos de tangente, con preguntas y devolución.
- Punto animado que recorre la curva y muestra sus coordenadas. El cursor también permite inspeccionar puntos.
- Amplitud, período, desfasaje y línea media para una única función trigonométrica con transformaciones lineales.
- Asíntotas verticales para tangente en esa forma; sus ramas no se unen a través de las discontinuidades.
- Cuatro identidades predefinidas, con campos editables para comparar otras expresiones.
- Cinco desafíos de construcción de funciones, con comprobación y contador por sesión.
- Tabla de valores, exportación CSV y descarga PNG de la gráfica.
- Diseño adaptable a computadora y celular; guía integrada.

Los indicadores automáticos se calculan para `A·sen(Bx+C)+D`, `A·cos(Bx+C)+D` y `A·tan(Bx+C)+D`. Otras expresiones se grafican, pero no se les asignan automáticamente esos indicadores. Mover un control reemplaza una expresión libre por la función de los controles.

## 3. Precisiones para enseñar

- En seno y coseno: amplitud = `|A|`, período = `2π/|B|` o `360°/|B|`.
- En tangente: no existe amplitud. A modifica la escala vertical; período = `π/|B|` o `180°/|B|`.
- En `A·f(Bx+C)+D`, el desfasaje es `h = -C/B`.
- Si A = 0 o B = 0, no hay período fundamental positivo: la expresión es constante en su dominio. Puede conservar puntos excluidos si aparece una tangente indefinida.
- Al cambiar grados/radianes se conserva la función transformada ajustando sus constantes angulares. Ejemplo: `sen(x-pi/2)` pasa a `sen(x-90)`. Las identidades personalizadas conservan lo escrito: revisá sus constantes al cambiar de unidad.
- El desfasaje no es único: h y h + un período representan la misma curva. La comprobación de desafíos acepta esos desfasajes equivalentes.
- La coincidencia gráfica o numérica de dos expresiones no demuestra una identidad. Revisá los dominios y pedí una justificación algebraica.
- La tabla es una selección de nueve puntos. Por ejemplo, una onda de frecuencia alta puede coincidir con cero en varios puntos de la tabla y aun oscilar entre ellos.
- La ventana vertical se ajusta para las transformaciones simples. Expresiones libres grandes pueden salir del área visible; el punto informa si queda fuera de la ventana.
- Los resultados de la interfaz se redondean a tres decimales. El cálculo usa la precisión numérica de JavaScript.

## 4. Propuesta breve para el aula (dos módulos)

**Inicio — 10 min.** Abrir `sen(x)`. Animar el punto. Preguntar: ¿entre qué valores se mueve?, ¿cuándo se repite?

**Exploración — 20 min.** En parejas, cambiar solo A: 1, 2 y −2. Luego restablecer y cambiar B: 1, 2 y 0.5. Pedir una frase por cambio y una captura que respalde la explicación.

**Desplazamientos — 15 min.** Comparar `sen(x)`, `sen(x-pi/2)` y `sen(x)+1` en radianes. Identificar cuál se mueve horizontalmente y cuál verticalmente. Volver a controles para probar h positivo y negativo.

**Tangente — 10 min.** Probar `tan(x)` y `2tan(x)`. Preguntar por qué no puede usarse la misma idea de amplitud. Identificar las asíntotas y los valores excluidos.

**Identidades — 15 min.** Comparar la identidad fundamental y `tan(x)=sen(x)/cos(x)`. Explicar por qué en la segunda hay valores excluidos. La observación se acompaña de la justificación trabajada en clase.

**Cierre — 10 min.** Resolver un desafío y entregar una captura con tres frases: qué cambió la altura, qué cambió el período y hacia dónde desplazaron la función.

Evidencia observable: reconoce amplitud en seno/coseno, identifica un ciclo, explica h y D, distingue dominio en tangente y diferencia exploración numérica de demostración.

## 5. Versionar con GitHub desde VS Code

Este paquete no está conectado a tu repositorio. La publicación queda pendiente de revisar esta versión local y elegir el repositorio de destino.

### Si vas a crear un repositorio nuevo

1. Abrí la carpeta `trigolab` en VS Code.
2. En **Control de código fuente**, elegí **Inicializar repositorio**.
3. Escribí como mensaje `Primera versión de TrigoLab` y confirmá los archivos.
4. Elegí **Publicar en GitHub**. Seleccioná privado o público según cómo quieras compartir el código.

### Si ya tenés un repositorio clonado

1. Copiá el contenido de `trigolab` dentro de la carpeta de ese proyecto, sin sobrescribir otros archivos de una aplicación existente.
2. Abrí ese repositorio en VS Code.
3. Revisá los cambios en Control de código fuente, creá el commit y elegí **Sincronizar cambios**.

En terminal, dentro del repositorio correcto:

```bash
git status
git add index.html style.css math.js app.js motion.js classroom.js package.json servidor.py INICIAR.cmd COMPARTIR_EN_RED.cmd tests README.md .gitignore
git commit -m "Agregar laboratorio de funciones trigonométricas"
git push
```

`git push` requiere que el repositorio ya tenga un remoto configurado. Publicar en GitHub desde VS Code configura ese remoto para un repositorio nuevo.

Para que los alumnos usen la aplicación localmente, compartí el ZIP y pediles que abran `index.html`. Para acceder desde un enlace en el celular, habrá que publicarla en un alojamiento web; este paquete todavía no está publicado.

## 6. Estructura

- `index.html`: interfaz y guía.
- `style.css`: diseño responsive.
- `math.js`: parser de expresiones, evaluación y análisis de parámetros. No usa `eval` ni `Function`.
- `app.js`: estado compartido, gráfico principal, interacción, identidades, desafíos y exportaciones.
- `motion.js`: escena del círculo, personaje, tres curvas y experiencias guiadas.
- `tests/math.test.cjs`: pruebas matemáticas con Node, sin dependencias.
- `package.json`: comandos opcionales de pruebas y servidor local.
- `INICIAR.cmd`: abre la aplicación en Windows sin servidor.
- `servidor.py`: servidor opcional con Python. Local por defecto; `--lan` permite acceso desde la red.
- `COMPARTIR_EN_RED.cmd`: inicia el servidor de aula en el puerto 5501.
- `classroom.js`: temas, grabación de video, ficha de explicación y acceso compartido.
- `tests/browser.test.py`: pruebas de Chrome con Playwright, solo para desarrollo.

La aplicación guarda únicamente la preferencia de tema en este navegador. Las respuestas y la explicación permanecen en la sesión, salvo que el alumno descargue su ficha. El contador de desafíos se reinicia al recargar. No reproduce ni incorpora escenas del video compartido: utiliza dibujos y animaciones propios realizados con Canvas.

## 7. Instrucción reutilizable para Codex en VS Code

Pegá lo siguiente en la extensión Codex, con esta carpeta abierta:

> Continuá el proyecto TrigoLab existente. Primero leé README.md, math.js y app.js. Mantené la interfaz en español, el funcionamiento sin conexión y la ausencia de dependencias externas. No cambies la fórmula matemática de amplitud, período o desfasaje; la tangente no tiene amplitud. Nunca unas ramas de tangente a través de una asíntota. Las identidades requieren considerar el dominio y el gráfico no es una demostración. Antes de modificar, explicá brevemente qué archivos vas a cambiar. Ejecutá npm test después de cambios matemáticos. Quiero agregar: [describí aquí la mejora].

## 8. Validación local — 2 de octubre de 2026

Se verificó en Chrome real, en modo automatizado, abriendo `index.html` directamente:

- Suite matemática de `tests/math.test.cjs`, ejecutada en el motor JavaScript de Chrome con un adaptador de aserciones. Node no estaba disponible en esta PC: no se ejecutó `npm test`.
- Fórmulas válidas e inválidas, controles, unidades y constantes con B = 0.
- Identidad de tangente y seno/coseno en sus puntos excluidos.
- Desafíos con controles visibles, animación, guía y descargas reales PNG/CSV.
- Capturas de escritorio y celular de 390 px, sin desborde horizontal ni errores JavaScript.

Correcciones: se conserva la constante angular al editar una expresión con B = 0; los valores constantes grandes entran en la ventana; las ayudas del período respetan la unidad; se mantienen más cifras al convertir unidades; las ramas de tangente se separan también por su intervalo matemático. Los valores trigonométricos menores que 1e-14 se tratan como cero para reducir residuos numéricos en puntos como cos(π/2). Es una herramienta numérica, no de cálculo simbólico.

Para repetir las pruebas de navegador desde la carpeta superior `TrigoLab`:

```powershell
python -m pip install --target .local-tools playwright
python trigolab/tests/browser.test.py
```

La prueba usa Chrome instalado en su ruta habitual de Windows. Playwright es una herramienta de desarrollo opcional: los alumnos no necesitan instalarlo. Capturas y descargas de prueba quedan en `artifacts/`.

## 9. Próximo paso para compartir

La aplicación es estática: el alojamiento deberá servir `index.html`, `style.css`, `math.js`, `motion.js`, `classroom.js`, `comparison.js` y `app.js` juntos. No requiere base de datos ni cuentas de alumnos. Por ahora se puede compartir la carpeta completa y abrir `index.html` sin conexión.

Antes de publicarla, conviene probar una actividad con alumnos y definir el repositorio y alojamiento. No se creó un repositorio ni se publicó esta revisión. Por defecto, el servidor de Python escucha solo en esta PC. Para celulares y otras computadoras de la misma red, usá el modo de aula explicado abajo; localhost siempre se refiere al dispositivo que abre el enlace.

## 10. Escenario animado y experiencias guiadas

Usá **Ver escenario animado**, elegí **01 · Una vuelta** y presioná **Animar**. Podés pausar o mover x con el deslizador y las flechas del teclado. Cambiar el deslizador pausa la animación para observar un valor. Las unidades y la velocidad se comparten con el gráfico principal.

El círculo muestra el ángulo **θ = Bx + C**, con radio siempre igual a 1. Sus proyecciones son sen(θ) y cos(θ); la tangente se construye sobre la recta vertical que pasa por (1, 0). En el otro lienzo aparecen **A·sen(θ)+D**, **A·cos(θ)+D** y **A·tan(θ)+D**. Las tarjetas distinguen el valor de la proyección y el valor transformado. Con B negativo el círculo gira en sentido horario; con B = 0 queda quieto. El personaje acompaña ese mismo ángulo.

Las curvas completas aparecen atenuadas; el tramo recorrido tiene mayor contraste. Cada función tiene color y patrón de trazo propios. Los puntos de tangente no se dibujan cuando no están definidos ni cuando quedan fuera de la ventana; la tarjeta explica cada caso. El radio y la recta tangente se recortan al borde del lienzo conservando su dirección geométrica.

Las experiencias cargan parámetros nuevos, pero no arrancan el movimiento automáticamente. Primero pedí una predicción, después observá la animación y finalmente una explicación. Si el alumno modifica los parámetros de una experiencia, las respuestas se desactivan hasta que vuelve a elegirla, para no evaluar una pregunta sobre otro ejemplo.

Las expresiones libres continúan disponibles en el gráfico principal. Cuando no corresponden a una transformación trigonométrica simple, el escenario muestra un aviso en lugar de representar un círculo que no corresponda. En Identidades el escenario se oculta. **Guardar escena** exporta ambos lienzos y sus valores; **Guardar gráfica** y CSV siguen correspondiendo al gráfico principal.

Referencia didáctica: [relación entre círculo unitario, seno, coseno y tangente en GeoGebra](https://www.geogebra.org/m/bUu7czBW). La captura y descripción de Animation vs. Math aportadas por el usuario orientaron la idea visual; no se incorporaron recursos del video ni de GeoGebra. No hay dependencias ni peticiones de red en la aplicación.

Validación de esta ampliación: Chrome, estados en 0 y π/2, grados/radianes, A = 2, B = 2, B negativo, B = 0, controles sincronizados, ocultación de curvas, preguntas y descarga PNG de la escena. Revisión visual a 1440 y 390 px; comprobación de desborde horizontal a 360, 390 y 768 px. Las pruebas anteriores de fórmulas, identidades, desafíos y exportaciones también pasan.

## 11. Computadoras y celulares del aula

En Windows, abrí **COMPARTIR_EN_RED.cmd**. Equivale a:

```powershell
python servidor.py 5501 --lan
```

La terminal muestra uno o más enlaces, por ejemplo `http://192.168.0.86:5501`. Compartí el correspondiente a tu Wi-Fi; esa dirección puede cambiar al conectarte a otra red. Desde la PC principal podés abrir `http://localhost:5501` y pulsar **Compartir** para verlos.

1. Conectá celulares y computadoras a la misma red.
2. Mantené la PC principal encendida y el servidor abierto.
3. Si Windows solicita acceso, permití Python en redes privadas.
4. Los estudiantes abren el enlace de red en su navegador; no necesitan instalar Python.
5. Ctrl+C en la terminal detiene el acceso.

El servidor sirve únicamente los archivos de la aplicación y la información del enlace. No publica el video de referencia, scripts de Python, pruebas ni listados de carpetas. Algunas redes escolares o de invitados aíslan equipos: si no abre, consultá con quien administra esa red. No hace falta abrir puertos en el router para usarlo dentro del aula.

Para estudiantes fuera de esa red (sus casas o datos móviles) se necesita publicar los archivos estáticos en un alojamiento con HTTPS. Esta versión no se publicó todavía. Otra alternativa sin conexión es compartir el ZIP y abrir `index.html` en cada computadora.

## 12. Video para presentar y ficha del alumno

En el escenario, elegí **8, 15 o 30 segundos** y pulsá **Descargar animación**. Se recorre una vez toda la ventana horizontal, de izquierda a derecha; la duración elegida determina el ritmo del video, independientemente del control de velocidad de exploración. Incluye círculo, curvas, unidad, regla de transformación y valores.

- El navegador elige MP4 si puede codificarlo; de lo contrario se intenta WebM. La disponibilidad se consulta con [MediaRecorder.isTypeSupported](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/isTypeSupported_static).
- No se graban cámara, micrófono ni el resto de la pantalla. Todo se procesa en el dispositivo.
- Durante la grabación los parámetros quedan bloqueados. Al terminar se recuperan la posición y el estado de reproducción anteriores.
- **Terminar y guardar** descarga el tramo grabado. Salir de la pestaña también finaliza ese tramo, para evitar continuar una grabación detenida en segundo plano.
- Mantené la pestaña visible. Cuando finaliza, se intenta descargar el archivo y queda **Descargar video listo** para guardarlo manualmente, especialmente en celulares.
- Si el navegador no admite grabación, la interfaz lo informa; **Guardar escena** sigue disponible como PNG.

En **Mi explicación**, el alumno escribe qué cambió y qué observó. **Descargar ficha de mi función** genera un TXT con la fórmula, unidad, parámetros e interpretación escrita. Ese texto no se guarda al cerrar o recargar: hay que descargarlo. Se puede adjuntar junto al video a una presentación o entrega.

## 13. Tema y referencia visual

El selector superior permite **Claro**, **Oscuro** y **Automático** (según el sistema). Se recuerda la elección en ese navegador, cuando permite almacenamiento local. El escenario y sus exportaciones respetan el tema; el gráfico principal mantiene un fondo blanco de lectura.

Se revisaron fotogramas del video local de 29 segundos: introduce el círculo y las proyecciones antes de mostrar seno y coseno juntos. **Enfocar seno y coseno** aplica esa progresión, ocultando la tangente del escenario; **Ver las tres funciones** vuelve a incorporarla. El archivo original se conserva como referencia local y no forma parte del paquete para distribuir.

Verificación: `python trigolab/tests/classroom.test.py` desde la carpeta superior (con Playwright instalado como se indicó antes) comprueba preferencias, temas, ficha y grabación completa/parcial. Se generó y decodificó un MP4 de 1200×620 de unos 8 segundos, con fotogramas diferentes. Se revisaron temas y tamaños móviles en Chrome. La compatibilidad real de grabación en Safari/iPhone y el acceso desde otro equipo físico quedan por verificar; el formato se detecta en cada navegador.

## 14. Comparar tres fórmulas libres

La pestaña **Compará fórmulas** ofrece tres casilleros vacíos e independientes. Cada alumno decide qué escribir: pueden ser tres senos diferentes, polinomios o combinaciones admitidas por el parser. No están asignados a seno, coseno y tangente.

- Pulsar **Graficar mis fórmulas** aplica las tres entradas. Un error se explica junto a su casillero; las otras fórmulas válidas siguen disponibles.
- Casilleros vacíos y curvas desmarcadas no se dibujan. Color, número y patrón de trazo identifican cada función.
- Animación y deslizador muestran los tres valores para un mismo x; también se informa si un valor no existe o queda fuera de la ventana.
- **Ajustar altura** usa muestreo y puede omitir picos. La ventana vertical también se puede ajustar manualmente.
- Las unidades son propias de esta comparación. Al cambiarlas, se conservan las expresiones escritas; revisá las constantes angulares.
- PNG y CSV de esta pestaña incluyen las fórmulas visibles. La descarga de video sigue correspondiendo al escenario del círculo, accesible en Explorá.
- Se usan comprobaciones de continuidad para tangentes y cocientes, además del muestreo. No es un motor simbólico: expresiones de frecuencia extrema o singularidades muy estrechas pueden superar la resolución del gráfico.

La comparación mantiene su contenido al cambiar de pestaña durante la sesión. No se almacena al recargar. El laboratorio original, sus desafíos, el círculo y sus exportaciones siguen disponibles.

Prueba: `python trigolab/tests/comparison.test.py` desde la carpeta superior.

## 15. Publicación web

El proyecto está preparado para Sites, con una identidad de publicación guardada en `.openai/hosting.json` de la carpeta superior. Para generar los archivos públicos se ejecuta `python prepare_web.py`. La carpeta `out/` contiene exclusivamente HTML, CSS y JavaScript, sin el video de referencia ni herramientas de desarrollo.

Sites administra el alojamiento y el repositorio de fuente de esta publicación. No es un repositorio de GitHub. La misma carpeta `out/` se puede alojar posteriormente en GitHub Pages si se elige ese proveedor. La URL de producción se comunica cuando el servicio confirma que la publicación terminó; no hay que compartir una dirección de vista previa ni localhost con alumnos fuera de la red.

En la versión publicada, el botón **Compartir** muestra su URL. En la versión local mantiene las instrucciones para la red del aula.
