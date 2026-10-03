"""Configuración de pruebas compartida por Windows y GitHub Actions."""
import os
import sys
from pathlib import Path
REPO=Path(__file__).resolve().parents[2]
os.chdir(REPO)
(REPO/'artifacts').mkdir(exist_ok=True)
sys.path.insert(0,str(REPO/'.local-tools'))
def browser_options():
    configured=os.environ.get('TRIGOLAB_BROWSER')
    windows=Path('C:/Program Files/Google/Chrome/Application/chrome.exe')
    if configured: return {'headless':True,'executable_path':configured}
    if sys.platform=='win32' and windows.exists(): return {'headless':True,'executable_path':str(windows)}
    return {'headless':True}
def app_url():
    if len(sys.argv)>1: return sys.argv[1]
    if os.environ.get('TRIGOLAB_BASE_URL'): return os.environ['TRIGOLAB_BASE_URL']
    index=REPO/'out/index.html'
    if not index.exists(): raise RuntimeError('Ejecutá python prepare_web.py antes de las pruebas.')
    return index.as_uri()
