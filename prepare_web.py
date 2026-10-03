"""Genera out/ sin tocar la publicación de respaldo ni su configuración."""
from pathlib import Path
import shutil
root=Path(__file__).resolve().parent
out=root/'out'
out.mkdir(exist_ok=True)
for name in ['index.html','style.css','math.js','app.js','motion.js','classroom.js','comparison.js']:
    shutil.copyfile(root/'trigolab'/name,out/name)
(out/'.nojekyll').write_text('',encoding='utf-8')
print('out/ listo, con index.html en la raíz.')
