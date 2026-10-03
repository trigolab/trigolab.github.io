# TrigoLab · GitHub Pages

Laboratorio de funciones trigonométricas para estudiantes. Aplicación estática, sin cuentas de alumnos ni dependencias externas en ejecución.

Publicado en **https://trigolab.github.io** (organización **trigolab**, repositorio **trigolab.github.io**). El sitio de respaldo en Sites se conserva.

Si trabajás con un asistente de código (Codex, Claude, etc.), las reglas que debe seguir están en [AGENTS.md](AGENTS.md).

## Trabajar y probar

Los archivos de la aplicación están en `trigolab/`. Se pueden abrir sin conexión con `trigolab/index.html`. La guía didáctica está en `trigolab/README.md`.

```sh
python -m pip install -r requirements-dev.txt
python -m playwright install chromium
python prepare_web.py
node trigolab/tests/math.test.cjs
python run_tests.py
```

`out/` contiene los siete recursos de la aplicación y `.nojekyll`, con `index.html` en su raíz. Solo esa carpeta se publica. Videos de referencia, resultados de pruebas, ZIP, herramientas y configuración de Sites quedan excluidos.

En Windows las pruebas usan Chrome si está instalado en su ubicación habitual; en Linux usan Chromium de Playwright. Se puede indicar otra ruta con `TRIGOLAB_BROWSER`. Para probar una publicación, usar `TRIGOLAB_BASE_URL` o pasar la URL como argumento a los tres scripts de navegador.

## Actualizar

Abrir **esta carpeta `github-pages`** en VS Code y editar los archivos de `trigolab/`.

Forma recomendada (con revisión y pruebas antes de publicar):

```sh
git switch main
git pull --ff-only
git switch -c mejora/descripcion-corta
# ...editar y probar...
git add .
git commit -m "Describir la mejora"
git push -u origin mejora/descripcion-corta
```

Después abrir el Pull Request en GitHub, esperar el check verde y hacer **Merge**. Al fusionarse en `main`, el sitio se publica solo.

Para un cambio chico también se puede subir directo a `main` (`git push origin main`): igual se ejecutan las pruebas y solo se publica si pasan.

No editar `out/` directamente: se genera desde las fuentes. Si un workflow falla, el sitio anterior sigue publicado. En Settings → Pages, la fuente debe ser **GitHub Actions**.

## Accesos

`ProfeYamila` es propietaria de la organización y `ckfavaro` es administrador. Para sumar a otra persona: **trigolab → People → Invite member** (toda la organización) o **repositorio → Settings → Collaborators and teams** (solo este proyecto). No hace falta compartir contraseñas.

La aplicación original y su publicación en Sites no se actualizan automáticamente desde este repositorio.
