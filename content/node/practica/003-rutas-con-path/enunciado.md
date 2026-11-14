En tu app los usuarios suben archivos (fotos de perfil, CV, documentos). Necesitas armar y analizar rutas **sin pegar textos a mano**, porque Windows usa `\` y Linux usa `/`. Escribe cuatro funciones con el módulo `node:path`:

1. `rutaDeSubida(carpetaBase, usuario, archivo)`: la ruta donde se guarda un archivo subido: `<carpetaBase>/subidas/<usuario>/<archivo>`.
2. `tipoDeArchivo(nombre)`: devuelve `"imagen"`, `"documento"` u `"otro"` según la extensión.
3. `nombreSinExtension(ruta)`: el nombre del archivo, sin carpetas ni extensión.
4. `cambiarExtension(ruta, nuevaExtension)`: la misma ruta con otra extensión (por ejemplo, para guardar la versión `.webp` de una foto).

## Lo que necesitas de Node

```js
import path from "node:path";

path.join("datos", "fotos", "a.png");   // "datos\\fotos\\a.png" en Windows, "datos/fotos/a.png" en Linux
path.extname("playa.JPG");              // ".JPG"   (con el punto)
path.basename("fotos/playa.jpg");       // "playa.jpg"
path.parse("fotos/playa.jpg");
// { root: "", dir: "fotos", base: "playa.jpg", ext: ".jpg", name: "playa" }
```

`path.join` usa el separador del sistema y limpia separadores repetidos o sobrantes.

## Reglas

- Imágenes: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`. Documentos: `.pdf`, `.docx`, `.txt`. Todo lo demás (incluido no tener extensión) es `"otro"`.
- La extensión no distingue mayúsculas: `"LOGO.PNG"` es una imagen.
- `nuevaExtension` llega con el punto: `".webp"`.
- No escribas `"/"` ni `"\\"` a mano: usa las funciones de `path`.

## Ejemplos

```js
rutaDeSubida("datos", "ana", "foto.png");   // path.join("datos", "subidas", "ana", "foto.png")
tipoDeArchivo("logo.PNG");                  // "imagen"
tipoDeArchivo("cv.pdf");                    // "documento"
tipoDeArchivo("LEEME");                     // "otro"
nombreSinExtension("fotos/2026/playa.jpg"); // "playa"
nombreSinExtension("informe.final.pdf");    // "informe.final"
cambiarExtension("fotos/playa.png", ".webp"); // path.join("fotos", "playa.webp")
```
