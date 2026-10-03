# TrigoLab · GitHub Pages

Laboratorio de funciones trigonométricas para estudiantes. Aplicación estática, sin cuentas de alumnos ni dependencias externas en ejecución.

Destino previsto: organización **trigolab**, repositorio **trigolab.github.io**. La publicación se considera lista cuando GitHub Actions finaliza correctamente y se verifica la URL de Pages. El sitio de respaldo en Sites se conserva.

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

Abrir **esta carpeta `github-pages`** en VS Code, editar los archivos de `trigolab/` y ejecutar:

```sh
git add .
git commit -m "Describir la mejora"
git push origin main
```

Cada push a `main` ejecuta las pruebas y publica si todas pasan. No editar `out/` directamente: se genera desde las fuentes. Si un workflow falla, el sitio anterior sigue publicado. En Settings → Pages, la fuente debe ser **GitHub Actions**.

## Incorporar a ckfavaro

Yamila, como propietaria de la organización, puede ir a **trigolab → People → Invite member**, escribir `ckfavaro` y elegir **Owner** si desea que ambos administren toda la organización. La invitación debe aceptarse desde la cuenta de ckfavaro.

Si solo quiere darle acceso a este proyecto, usar **repositorio → Settings → Collaborators and teams → Add people** y asignar **Write** para cambios de código o **Admin** para administrar el repositorio. No hace falta compartir contraseñas.

La aplicación original y su publicación en Sites no se actualizan automáticamente desde este repositorio.
