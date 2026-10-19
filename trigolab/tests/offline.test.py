"""Sin conexión real: tras la primera visita, el service worker permite usar la app aunque el servidor no responda."""
from browser_support import browser_options
import importlib.util
import json
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('server', root / 'servidor.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
server = module.ThreadingHTTPServer(('127.0.0.1', 0), module.Handler)
server.lan = False
thread = Thread(target=server.serve_forever, daemon=True)
thread.start()
base = f'http://127.0.0.1:{server.server_port}/'
online = True
try:
    with sync_playwright() as pw:
        browser = pw.chromium.launch(**browser_options())
        context = browser.new_context(viewport={'width': 1280, 'height': 900})
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(base)
        page.wait_for_selector('.metric')
        # El manifiesto se sirve con el tipo correcto y apunta a íconos existentes.
        manifest = page.evaluate("fetch('manifest.webmanifest').then(async r=>({type:r.headers.get('content-type'),body:await r.json()}))")
        assert manifest['type'].startswith('application/manifest+json'), manifest['type']
        assert manifest['body']['name'] == 'TrigoLab' and manifest['body']['start_url'] == './'
        for icon in manifest['body']['icons']:
            assert page.evaluate("src=>fetch(src).then(r=>r.ok)", icon['src']), icon
        # El service worker queda activo y guarda todos los archivos de la app.
        page.evaluate('navigator.serviceWorker.ready')
        page.wait_for_function("async()=>{const c=await caches.open('trigolab-v1');return (await c.keys()).length>=12}", timeout=15000)
        page.wait_for_function('navigator.serviceWorker.controller!==null', timeout=15000)
        # Se apaga el servidor: la app tiene que seguir cargando y calculando.
        server.shutdown(); server.server_close(); online = False
        page.reload()
        page.wait_for_selector('.metric', timeout=15000)
        page.locator('#formula').fill('cos(2x)')
        page.locator('#formula-form button').click()
        assert page.locator('#error').inner_text() == ''
        assert 'π' in page.locator('#metrics').inner_text()
        page.locator('[data-mode=formulas]').click()
        assert page.locator('#expression-0').is_visible()
        page.locator('#share-class').click()
        assert page.locator('#share-info').inner_text() != ''
        assert not errors, errors
        browser.close()
finally:
    if online:
        server.shutdown(); server.server_close()
    thread.join()
print('OK: manifiesto, íconos, service worker y uso sin conexión con el servidor apagado.')
