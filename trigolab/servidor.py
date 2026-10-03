"""python servidor.py [puerto] [--lan]. Solo expone los archivos de la aplicación."""
import argparse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit
import json
import socket

ROOT = Path(__file__).resolve().parent
PUBLIC = {'index.html', 'style.css', 'math.js', 'motion.js', 'app.js', 'classroom.js', 'comparison.js'}

def addresses(port):
    ips = {entry[4][0] for entry in socket.getaddrinfo(socket.gethostname(), None, socket.AF_INET)}
    return [f'http://{ip}:{port}' for ip in sorted(ips) if not ip.startswith(('127.', '169.254.'))]

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        if urlsplit(self.path).path == '/conexion.json':
            body = json.dumps({'lan': self.server.lan, 'urls': addresses(self.server.server_port) if self.server.lan else []}).encode()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(body)))
            self.send_header('Cache-Control', 'no-store')
            self.end_headers()
            self.wfile.write(body)
        else:
            super().do_GET()

    def send_head(self):
        name = urlsplit(self.path).path
        if name not in {'/', *('/'+file for file in PUBLIC)}:
            self.send_error(404)
            return None
        return super().send_head()

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('port', nargs='?', type=int, default=5500)
    parser.add_argument('--lan', action='store_true', help='Acceso desde la red del aula')
    args = parser.parse_args()
    try:
        with ThreadingHTTPServer(('0.0.0.0' if args.lan else '127.0.0.1', args.port), Handler) as server:
            server.lan = args.lan
            print(f'TrigoLab en esta PC: http://localhost:{args.port}', flush=True)
            if args.lan:
                print('Otros equipos en la misma red pueden probar estos enlaces:', flush=True)
                for url in addresses(args.port):
                    print('  '+url, flush=True)
                print('Mantené esta ventana abierta. Si Windows pregunta, permití Python en redes privadas.', flush=True)
            print('Ctrl+C para detener.', flush=True)
            server.serve_forever()
    except KeyboardInterrupt:
        pass
    except OSError as error:
        parser.exit(1, f'No se pudo iniciar: {error}. Probá otro puerto, por ejemplo 5501.')

if __name__ == '__main__':
    main()
