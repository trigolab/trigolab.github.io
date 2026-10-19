"""Genera out/ sin tocar la publicación de respaldo ni su configuración."""
from pathlib import Path
import shutil
root=Path(__file__).resolve().parent
out=root/'out'
out.mkdir(exist_ok=True)
for name in ['index.html','style.css','math.js','app.js','motion.js','classroom.js','comparison.js','sw.js','manifest.webmanifest','icono.svg','icono-192.png','icono-512.png','juego.js','vendor/three.min.js','vendor/LICENSE-three.txt']:
    (out/name).parent.mkdir(parents=True,exist_ok=True)
    shutil.copyfile(root/'trigolab'/name,out/name)
(out/'.nojekyll').write_text('',encoding='utf-8')
print('out/ listo, con index.html en la raíz.')
