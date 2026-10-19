# Dependencias incluidas

`three.min.js` es Three.js 0.186.1 (licencia MIT, ver `LICENSE-three.txt`) reducido a las clases que usa `../juego.js`.
Se incluye en el repositorio para que la aplicación no dependa de ningún servidor externo.

Para regenerarlo (solo si se actualiza Three.js o el juego necesita otras clases):

```sh
npm init -y && npm i three@0.186.1
# three-entry.js: export {Scene,PerspectiveCamera,...} from 'three'  (ver lista en juego.js)
npx esbuild three-entry.js --bundle --minify --format=esm --target=es2020 --legal-comments=none --outfile=three.min.js
```
