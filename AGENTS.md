# Reglas para asistentes de código (Codex, Claude, Copilot, etc.)

Este repositorio publica **https://trigolab.github.io**, que usan estudiantes. Cualquier asistente que trabaje acá debe seguir estas reglas.

## Dónde trabajar

- La fuente es `trigolab/` dentro de **este** repositorio (`github-pages/`). No editar `out/`: se genera con `python prepare_web.py`.
- La carpeta padre (`D:/Proyecto Yami/TrigoLab`) es el respaldo publicado en chatgpt.site. **No modificarla** ni publicarla desde acá.
- Si se agrega un archivo que la app necesita en la web, sumarlo a la lista de `prepare_web.py`.

## Cómo hacer cambios

1. Partir de `main` actualizado: `git switch main && git pull --ff-only`.
2. Crear una rama descriptiva (`mejora/...`, `arreglo/...`, `docs/...`).
3. Cambios mínimos: no refactorizar ni cambiar diseño o funcionalidades que no se pidieron.
4. Probar antes de subir:
   ```sh
   python prepare_web.py
   node trigolab/tests/math.test.cjs
   python run_tests.py
   ```
   Si se agrega una función, agregar o ajustar su prueba en `trigolab/tests/`.
5. Commit con mensaje claro en español, push de la rama y Pull Request a `main`.
6. Fusionar el PR solo cuando el check **Probar y publicar TrigoLab** esté en verde. Después, borrar la rama.

Cada push a `main` ejecuta las pruebas y publica automáticamente. Si las pruebas fallan, no se publica y el sitio anterior sigue en línea.

## Cuentas y seguridad

- Commits y PRs con la cuenta de la persona que pide el cambio (`git config user.name` / `user.email` y `gh auth status`). Cuentas: `ckfavaro` (Cristian) y `ProfeYamila` (Yamila).
- Nunca pedir, guardar ni commitear contraseñas o tokens.
- No usar `git push --force` sobre `main` ni cambiar la configuración de GitHub Pages (fuente: **GitHub Actions**) sin que lo pidan.

## La app

- Estática (HTML/CSS/JS), sin dependencias externas en ejecución; debe funcionar en celular (probar a 390 px de ancho) y en modo claro y oscuro.
- Rutas siempre relativas (`./archivo.js`), nunca `D:/`, `file://` ni `localhost`.
- Textos para estudiantes en español rioplatense (vos), claros y sin errores matemáticos.
