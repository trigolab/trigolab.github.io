"""Ejecuta todas las pruebas Python; falla ante el primer error."""
from pathlib import Path
import subprocess
import sys
root=Path(__file__).resolve().parent
for test in sorted((root/'trigolab/tests').glob('*.test.py')):
    print('Ejecutando '+test.name,flush=True)
    subprocess.run([sys.executable,str(test)],cwd=root,check=True)
