## Idea clave

Una ruta no es un texto cualquiera: tiene piezas (carpeta, nombre, extensión) y un separador que **cambia según el sistema operativo**. El módulo `node:path` sabe armarlas (`join`) y separarlas (`extname`, `basename`, `parse`) correctamente en Windows y en Linux, así que tu código funciona en tu laptop y en el servidor sin cambios.

## Paso a paso

1. **Armar una ruta**: `path.join(carpetaBase, "subidas", usuario, archivo)`. Recibe cualquier cantidad de piezas, las une con el separador del sistema (`\` en Windows, `/` en Linux) y normaliza: quita barras repetidas y resuelve `..`.
2. **Sacar la extensión**: `path.extname("logo.PNG")` da `".PNG"`. Trae el punto y respeta las mayúsculas, así que la pasas a minúsculas antes de comparar.
3. **Clasificar**: guarda las extensiones en dos arreglos (`IMAGENES`, `DOCUMENTOS`) y pregunta con `includes`. Así agregar una extensión nueva es tocar una lista, no un `if`.
4. **Separar todas las piezas**: `path.parse(ruta)` devuelve un objeto. Para `"fotos/2026/playa.jpg"`:

   ```js
   { root: "", dir: "fotos/2026", base: "playa.jpg", ext: ".jpg", name: "playa" }
   ```

   `name` es justo "el nombre sin extensión".
5. **Cambiar la extensión**: tomas `dir` y `name` de `parse` y vuelves a armar con `path.join(dir, name + nuevaExtension)`.

```js
import path from "node:path";

const IMAGENES = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
const DOCUMENTOS = [".pdf", ".docx", ".txt"];

export function rutaDeSubida(carpetaBase, usuario, archivo) {
  return path.join(carpetaBase, "subidas", usuario, archivo);
}

export function tipoDeArchivo(nombre) {
  const ext = path.extname(nombre).toLowerCase();
  if (IMAGENES.includes(ext)) return "imagen";
  if (DOCUMENTOS.includes(ext)) return "documento";
  return "otro";
}

export function nombreSinExtension(ruta) {
  return path.parse(ruta).name;
}

export function cambiarExtension(ruta, nuevaExtension) {
  const { dir, name } = path.parse(ruta);
  return path.join(dir, name + nuevaExtension);
}
```

## Por qué funciona

Recorrido de `rutaDeSubida("datos/", "luis", "cv.pdf")` en Windows:

| Pieza | Resultado parcial |
|---|---|
| `"datos/"` | `datos\` |
| `"subidas"` | `datos\subidas` (no queda `datos\\subidas`) |
| `"luis"` | `datos\subidas\luis` |
| `"cv.pdf"` | `datos\subidas\luis\cv.pdf` |

Con concatenación (`carpetaBase + "/subidas/" + ...`) obtendrías `datos//subidas/luis/cv.pdf`, con barra doble y mezclando separadores en Windows.

`extname` mira solo **desde el último punto** del nombre del archivo:

| Nombre | `extname` | Tipo |
|---|---|---|
| `"logo.PNG"` | `".PNG"` → `".png"` | imagen |
| `"copia.tar.gz"` | `".gz"` | otro |
| `"LEEME"` | `""` | otro |

Por la misma razón, `path.parse("informe.final.pdf").name` es `"informe.final"`: solo se quita la última extensión.

En `cambiarExtension(path.join("fotos", "playa.png"), ".webp")`, `parse` da `dir: "fotos"` y `name: "playa"`, y `join("fotos", "playa.webp")` arma la ruta nueva. Si la ruta no tiene carpeta (`"cv.docx"`), `dir` es `""` y `path.join("", "cv.pdf")` da simplemente `"cv.pdf"`.

## Errores comunes

- **Concatenar con `"/"`.** Funciona a medias en Windows, pero al comparar o mostrar rutas mezclas `/` y `\`. Los tests comparan con `path.join` y fallan.
- **Olvidar que `extname` trae el punto.** Comparar con `"png"` (sin punto) nunca coincide.
- **No pasar a minúsculas.** `"logo.PNG"` termina en `"otro"`.
- **Usar `split(".")[1]` para la extensión.** Con `"informe.final.pdf"` te da `"final"`, y con `"LEEME"` te da `undefined`.
- **Usar `basename` sin el segundo argumento** para quitar la extensión: `path.basename("a/playa.jpg")` da `"playa.jpg"`, con extensión.
- **Usar `replace(ext, nuevaExtension)`** para cambiar la extensión: reemplaza la **primera** aparición, y en `"png.png"` cambiarías la parte equivocada.

## Otra forma de resolverlo

**`basename` con la extensión a quitar:**

```js
export function nombreSinExtension(ruta) {
  return path.basename(ruta, path.extname(ruta));
}
```

Es equivalente a `parse(ruta).name`. Usa `parse` cuando necesitas varias piezas a la vez (como en `cambiarExtension`) y `basename` cuando solo quieres el nombre.

**`path.format`**, lo contrario de `parse`, para armar la ruta nueva:

```js
const { dir, name } = path.parse(ruta);
return path.format({ dir, name, ext: nuevaExtension });
```

Ojo: `format` une `dir` y el nombre con el separador del sistema, pero no normaliza como `join`. Para este ejercicio da lo mismo; `join` es más fácil de recordar.

**Un objeto en vez de dos listas** para clasificar: `const TIPOS = { ".jpg": "imagen", ".pdf": "documento", ... }` y `return TIPOS[ext] ?? "otro"`. Es más corto cuando hay muchas categorías.

## Cómo explicarlo en la entrevista

> "Nunca armo rutas concatenando strings, porque el separador cambia entre Windows y Linux. Uso path.join, que pone el separador correcto y normaliza barras repetidas. Para analizar una ruta uso path.extname, que me da la extensión con el punto, y la paso a minúsculas antes de compararla; y path.parse, que me separa carpeta, nombre y extensión. Así el mismo código funciona en mi máquina con Windows y en un servidor Linux."

## Conceptos

- **`node:path`**: módulo de Node para manipular rutas sin tocar el disco (solo trabaja con textos).
- **`path.join(...piezas)`**: une piezas con el separador del sistema y normaliza la ruta.
- **`path.extname(ruta)`**: extensión desde el último punto, con el punto (`".pdf"`), o `""` si no hay.
- **`path.basename(ruta, ext?)`**: el último tramo de la ruta; si le pasas la extensión, la quita.
- **`path.parse(ruta)`**: objeto con `root`, `dir`, `base`, `name` y `ext`.
- **`path.sep`**: el separador del sistema (`"\\"` en Windows, `"/"` en Linux y Mac).
- **Desestructuración**: `const { dir, name } = objeto` saca dos propiedades en una línea.
