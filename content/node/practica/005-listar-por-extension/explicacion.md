## Idea clave

`readdir` con `withFileTypes: true` te da, por cada cosa de la carpeta, un objeto que sabe si es **archivo o carpeta**. Te quedas con los archivos y, a partir de ahí, es un problema de arrays: `filter` + `sort` para listar y un objeto contador para contar. La extensión la sacas con `path.extname` en minúsculas.

## Paso a paso

1. **Lee la carpeta sabiendo qué es cada cosa.** Sin opciones, `readdir` devuelve solo nombres (`["hola.md", "borradores.md", ...]`) y no puedes distinguir un archivo de una carpeta por su nombre. Con `{ withFileTypes: true }` devuelve objetos `Dirent` con `name`, `isFile()` e `isDirectory()`.
2. **Escribe una función auxiliar** con lo que comparten las dos funciones:

   ```js
   async function nombresDeArchivos(carpeta) {
     const entradas = await readdir(carpeta, { withFileTypes: true });
     return entradas.filter((e) => e.isFile()).map((e) => e.name);
   }
   ```

   No la exportas: es un detalle interno del módulo.
3. **Listar**: filtra los nombres cuya extensión en minúsculas sea la pedida y ordénalos con `sort()`.
4. **Contar**: recorre los nombres; la clave es la extensión en minúsculas o, si `extname` devuelve `""`, el texto `"(sin extensión)"`. El operador `||` hace ese reemplazo en una línea porque `""` es falsy.
5. **Suma en el objeto** con `conteo[clave] = (conteo[clave] ?? 0) + 1`: si la clave aún no existe, parte de 0.

```js
import { readdir } from "node:fs/promises";
import path from "node:path";

async function nombresDeArchivos(carpeta) {
  const entradas = await readdir(carpeta, { withFileTypes: true });
  return entradas.filter((e) => e.isFile()).map((e) => e.name);
}

export async function listarPorExtension(carpeta, extension) {
  const nombres = await nombresDeArchivos(carpeta);
  return nombres.filter((nombre) => path.extname(nombre).toLowerCase() === extension).sort();
}

export async function contarPorExtension(carpeta) {
  const nombres = await nombresDeArchivos(carpeta);
  const conteo = {};
  for (const nombre of nombres) {
    const clave = path.extname(nombre).toLowerCase() || "(sin extensión)";
    conteo[clave] = (conteo[clave] ?? 0) + 1;
  }
  return conteo;
}
```

## Por qué funciona

Con la carpeta de los tests (`hola.md`, `LEEME.MD`, `zeta.md`, `foto.png`, `app.js`, `Makefile` y las carpetas `borradores.md/` e `imagenes/`):

| Entrada | `isFile()` | `extname` en minúsculas | Clave |
|---|---|---|---|
| `hola.md` | sí | `.md` | `.md` |
| `LEEME.MD` | sí | `.md` | `.md` |
| `zeta.md` | sí | `.md` | `.md` |
| `foto.png` | sí | `.png` | `.png` |
| `app.js` | sí | `.js` | `.js` |
| `Makefile` | sí | `""` | `(sin extensión)` |
| `borradores.md` | **no** | | se descarta |
| `imagenes` | **no** | | se descarta |

El resultado de contar es `{ ".md": 3, ".png": 1, ".js": 1, "(sin extensión)": 1 }`.

Al listar `.md` quedan `["hola.md", "LEEME.MD", "zeta.md"]` y `sort()` los deja como `["LEEME.MD", "hola.md", "zeta.md"]`: `sort` sin función compara códigos Unicode, y las mayúsculas (`L` = 76) van antes que las minúsculas (`h` = 104).

El archivo `oculto.md` que está **dentro** de `borradores.md/` no aparece porque `readdir` solo mira un nivel.

## Errores comunes

- **No usar `withFileTypes`** y filtrar solo por el nombre: la carpeta `borradores.md` se cuela en la lista. Es el test "ignora las carpetas".
- **Usar `e.isFile` sin paréntesis.** Es un método: `e.isFile` (sin llamar) es una función, que es truthy, y no filtras nada.
- **Olvidar el `await` en `readdir`.** `entradas` sería una promesa y verás "entradas.filter is not a function".
- **Comparar la extensión sin pasar a minúsculas**: `LEEME.MD` no aparece.
- **`nombre.endsWith(extension)`** parece suficiente, pero no ignora mayúsculas (`"LEEME.MD"` no termina en `".md"`) y no te sirve para contar, donde necesitas saber **cuál** es la extensión. `extname` resuelve los dos casos.
- **`conteo[clave]++` sin inicializar**: `undefined + 1` es `NaN`.

## Otra forma de resolverlo

**Contar con `reduce`:**

```js
return nombres.reduce((conteo, nombre) => {
  const clave = path.extname(nombre).toLowerCase() || "(sin extensión)";
  conteo[clave] = (conteo[clave] ?? 0) + 1;
  return conteo;
}, {});
```

Hace lo mismo que el `for...of`. El bucle es más fácil de leer y depurar; `reduce` es común en código funcional. Elige el que puedas explicar sin dudar.

**Recorrer subcarpetas también**: `readdir(carpeta, { recursive: true, withFileTypes: true })` (Node 20 o superior) entra en todas las subcarpetas. Cada `Dirent` trae `parentPath` con su carpeta. Para este ejercicio no se pide, pero es útil para un buscador de archivos.

**Orden que ignora mayúsculas**: `sort((a, b) => a.localeCompare(b))` ordena como un humano (`hola.md`, `LEEME.MD`, `zeta.md`). Úsalo para mostrar listas a usuarios; aquí los tests piden el orden de `sort()`.

## Cómo explicarlo en la entrevista

> "Leo la carpeta con readdir y withFileTypes en true, para recibir objetos que me dicen si cada entrada es archivo o carpeta, porque por el nombre no se puede saber. Me quedo con los archivos en una función auxiliar que reutilizo. Para listar, filtro por path.extname en minúsculas y ordeno. Para contar uso un objeto como mapa: la extensión es la clave y, si no tiene, uso una clave especial. No entro a subcarpetas porque readdir solo mira un nivel, aunque tiene la opción recursive si lo necesitara."

## Conceptos

- **`readdir(carpeta)`**: lista los nombres de lo que hay en una carpeta (un solo nivel).
- **`withFileTypes: true`**: devuelve objetos `Dirent` con `name`, `isFile()` e `isDirectory()`.
- **`path.extname`**: extensión con punto, o `""` si no hay.
- **Objeto como contador**: `obj[clave] = (obj[clave] ?? 0) + 1`.
- **`||` para valores por defecto**: `a || b` devuelve `b` si `a` es falsy (`""`, `0`, `null`, `undefined`).
- **`??` (nullish)**: como `||`, pero solo reemplaza `null` y `undefined`; respeta el `0`.
- **`sort()` sin comparador**: orden por códigos Unicode; mayúsculas antes que minúsculas.
