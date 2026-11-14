Estás armando la tienda en línea de un emprendimiento y quieres juntar en **un solo módulo** las funciones pequeñas que usas en todas partes. Crea en `solucion.js`:

1. `formatearPrecio(monto)`: devuelve el precio en soles con dos decimales, por ejemplo `"S/ 12.50"`.
2. `crearSlug(titulo)`: convierte un título en un texto apto para una URL: minúsculas y palabras unidas con guiones.
3. `unirLineas(lineas)`: une un arreglo de textos usando el **salto de línea del sistema operativo**, que te da Node en `EOL`, del módulo `node:os`.

Exporta las tres funciones **con nombre** (`export function ...`) y, además, un **export por defecto** con un objeto que las agrupe.

## Lo que necesitas de Node

En Node cada archivo `.js` es un **módulo**: lo que no exportas, no se ve desde afuera. Con ESM (la sintaxis moderna) se usa `export` e `import`:

```js
// precios.js
export function doble(n) { return n * 2; }        // export con nombre
export default { doble };                          // export por defecto (uno solo por archivo)

// otro archivo
import utilidades, { doble } from "./precios.js";  // por defecto + con nombre
import { EOL } from "node:os";                      // módulo que viene con Node
```

El prefijo `node:` indica que el módulo es de Node (no lo instalas con npm). `EOL` vale `"\r\n"` en Windows y `"\n"` en Linux o Mac.

## Reglas

- `formatearPrecio` siempre muestra dos decimales.
- `crearSlug` quita los espacios del inicio y del final, y si hay varios espacios seguidos los trata como uno.
- `unirLineas([])` devuelve `""`.
- El export por defecto es un objeto con las tres funciones (las mismas, no copias).

## Ejemplos

```js
formatearPrecio(12.5);               // "S/ 12.50"
formatearPrecio(3);                  // "S/ 3.00"
crearSlug("Mi Primer Post");         // "mi-primer-post"
crearSlug("  Hola   Mundo  ");       // "hola-mundo"
unirLineas(["uno", "dos"]);          // "uno\r\ndos" en Windows

import utilidades from "./solucion.js";
utilidades.formatearPrecio(5);       // "S/ 5.00"
```
