"""Prueba del servidor sin abrir acceso a la red."""
import importlib.util
import json
from pathlib import Path
from threading import Thread
from urllib.error import HTTPError
from urllib.request import urlopen

spec = importlib.util.spec_from_file_location('server', Path(__file__).resolve().parents[1] / 'servidor.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
server = module.ThreadingHTTPServer(('127.0.0.1', 0), module.Handler)
server.lan = False
thread = Thread(target=server.serve_forever, daemon=True)
thread.start()
base = f'http://127.0.0.1:{server.server_port}'
try:
    for path in ['/', '/index.html', '/math.js', '/app.js', '/motion.js', '/classroom.js', '/style.css']:
        with urlopen(base + path) as response:
            assert response.status == 200, path
    with urlopen(base+'/conexion.json') as response:
        assert json.load(response) == {'lan': False, 'urls': []}
    for path in ['/servidor.py', '/tests/', '/Video%20Ejemplo.mp4', '/README.md', '/%2e%2e/README.md']:
        try:
            urlopen(base+path)
            raise AssertionError('Archivo expuesto: '+path)
        except HTTPError as error:
            assert error.code == 404
finally:
    server.shutdown()
    server.server_close()
    thread.join()
print('OK: aplicación accesible; archivos de desarrollo y referencia excluidos.')
