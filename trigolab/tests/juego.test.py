"""Modo Juego: carga diferida, niveles, aros, devolución, vistas 3D y 2D. Se sirve por http porque usa módulos."""
from browser_support import browser_options
import importlib.util
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
artifacts = root.parent / 'artifacts'
artifacts.mkdir(exist_ok=True)
try:
    with sync_playwright() as pw:
        browser = pw.chromium.launch(**browser_options())
        page = browser.new_page(viewport={'width': 1366, 'height': 900})
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(base)
        page.wait_for_selector('.metric')
        # El juego no se descarga hasta entrar al modo.
        assert page.evaluate("performance.getEntriesByType('resource').some(r=>r.name.endsWith('juego.js'))") is False
        page.locator('[data-mode=game]').click()
        page.wait_for_selector('#game-A')
        assert page.evaluate("performance.getEntriesByType('resource').some(r=>r.name.endsWith('three.min.js'))")
        state = lambda: page.evaluate("import('./juego.js').then(m=>m._test.state)")
        s = state()
        print('WebGL disponible en la prueba:', s['webgl'])
        assert s['level'] == 0 and s['view3d'] == s['webgl']
        # Nivel 1: solo A libre; los demás controles están fijos en el valor del objetivo.
        assert page.locator('#game-A').is_enabled() and page.locator('#game-B').is_disabled() and page.locator('#game-h').is_disabled() and page.locator('#game-D').is_disabled()
        assert 'Nivel 1' in page.locator('#game-level').inner_text()
        page.emulate_media(reduced_motion='reduce')
        # Un lanzamiento errado devuelve cuántos aros y una pista direccional sobre A.
        wrong = 4 if s['target']['A'] < 4 else 0.25
        page.locator('#game-A').fill(str(wrong))
        page.locator('#game-launch').click()
        page.wait_for_function("document.getElementById('game-result').textContent.includes('aros')")
        result = page.locator('#game-result').inner_text()
        assert 'de 7 aros' in result and ('A más grande' in result or 'A más chico' in result), result
        assert state()['launches'] == 1
        # Con A igual al objetivo se atraviesan los 7 aros; segunda vez: dos estrellas.
        page.locator('#game-A').fill(str(s['target']['A']))
        page.locator('#game-launch').click()
        page.wait_for_function("document.getElementById('game-result').textContent.includes('Atravesaste los 7')")
        assert '★★☆' in page.locator('#game-result').inner_text()
        assert page.locator('#game-next').is_visible()
        page.locator('[aria-labelledby=game-title]').screenshot(path=str(artifacts / 'juego-3d.png'))
        # Nivel 2 libera B; la pista habla de B cuando B está mal.
        page.locator('#game-next').click()
        page.wait_for_function("document.getElementById('game-level').textContent.includes('Nivel 2')")
        assert page.locator('#game-B').is_enabled() and page.locator('#game-D').is_disabled()
        t = state()['target']
        page.evaluate("p=>import('./juego.js').then(m=>m._test.set(p))", {'A': t['A'], 'B': 0.25 if t['B'] > 0.25 else 3})
        page.locator('#game-launch').click()
        page.wait_for_function("document.getElementById('game-result').textContent.includes('aros')")
        assert 'B' in page.locator('#game-result').inner_text()
        # Vistas de cámara y vista plana.
        if s['webgl']:
            for view in ['side', 'top', 'front', 'free']:
                page.locator(f'#game-views button[data-view={view}]').click()
                assert page.locator(f'#game-views button[data-view={view}]').get_attribute('aria-pressed') == 'true'
        page.locator('#game-2d').click()
        assert page.locator('#game-2d-canvas').is_visible() and not page.locator('#game-gl').is_visible()
        page.locator('[aria-labelledby=game-title]').screenshot(path=str(artifacts / 'juego-2d.png'))
        # Reiniciar nivel vuelve a cero los lanzamientos; el progreso queda guardado.
        page.locator('#game-retry').click()
        assert state()['launches'] == 0
        assert page.evaluate("JSON.parse(localStorage.getItem('trigolab-juego'))['0']") == 2
        # Tema oscuro y celular sin desborde horizontal.
        page.locator('#theme').select_option('dark')
        page.locator('#game-3d').click()
        page.set_viewport_size({'width': 390, 'height': 844})
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
        page.locator('[aria-labelledby=game-title]').screenshot(path=str(artifacts / 'juego-celular-oscuro.png'))
        # Volver a Explorá restablece el laboratorio.
        page.locator('[data-mode=explore]').click()
        assert page.locator('#formula').is_visible() and not page.locator('#game-mode').is_visible()
        assert not errors, errors
        browser.close()
finally:
    server.shutdown(); server.server_close(); thread.join()
print('OK: juego cargado a demanda, niveles, pistas, estrellas, vistas 3D y 2D, tema oscuro y celular.')
