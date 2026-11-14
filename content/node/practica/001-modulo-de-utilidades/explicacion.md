## Idea clave

En Node cada archivo es un **módulo** con su propio alcance: nada sale de él salvo lo que marcas con `export`. Puedes exportar varias cosas **con nombre** y, como máximo, **una por defecto**. Para traer algo de otro módulo usas `import`, y los módulos que vienen con Node se piden con el prefijo `node:`.

## Paso a paso

1. **Las funciones en sí son simples.** Empieza por ellas, sin pensar en módulos:
   - Precio: `monto.toFixed(2)` devuelve un string con exactamente dos decimales (`3` da `"3.00"`). Lo metes en un template literal: `` `S/ ${monto.toFixed(2)}` ``.
   - Slug: `trim()` quita los espacios de los bordes, `toLowerCase()` pasa a minúsculas, `split(/\s+/)` corta en "uno o más espacios" y `join("-")` une con guiones.
   - Líneas: `lineas.join(EOL)`.
2. **Importa lo que usas de Node.** `EOL` no existe en JavaScript puro: es una constante del módulo `os` de Node. Arriba del archivo:

   ```js
   import { EOL } from "node:os";
   ```

   Las llaves significan "dame el export con nombre `EOL`". Los `import` van siempre al inicio del archivo, fuera de cualquier función.
3. **Exporta con nombre.** Poniendo `export` delante de `function`, cada función queda disponible para quien la importe con `import { formatearPrecio } from "./solucion.js"`.
4. **Agrega el export por defecto.** Es el valor que recibe quien importa **sin llaves**. Aquí es un objeto que agrupa las funciones:

   ```js
   export default { formatearPrecio, crearSlug, unirLineas };
   ```

```js
import { EOL } from "node:os";

export function formatearPrecio(monto) {
  return `S/ ${monto.toFixed(2)}`;
}

export function crearSlug(titulo) {
  return titulo.trim().toLowerCase().split(/\s+/).join("-");
}

export function unirLineas(lineas) {
  return lineas.join(EOL);
}

export default { formatearPrecio, crearSlug, unirLineas };
```

## Por qué funciona

Los tests importan tu archivo de las dos maneras a la vez:

```js
import utilidades, { formatearPrecio, crearSlug, unirLineas } from "./solucion.js";
```

- `utilidades` (sin llaves) recibe el **export por defecto**: tu objeto.
- `{ formatearPrecio, ... }` recibe los **exports con nombre**, que deben llamarse exactamente igual.

Como el objeto por defecto se arma con las mismas funciones (forma corta `{ formatearPrecio }` = `{ formatearPrecio: formatearPrecio }`), `utilidades.formatearPrecio === formatearPrecio` es `true`: es la **misma** función, no una copia.

Recorrido de `crearSlug("  Hola   Mundo  ")`:

| Paso | Valor |
|---|---|
| `trim()` | `"Hola   Mundo"` |
| `toLowerCase()` | `"hola   mundo"` |
| `split(/\s+/)` | `["hola", "mundo"]` |
| `join("-")` | `"hola-mundo"` |

Si hubieras usado `split(" ")`, los tres espacios del medio darían `["hola", "", "", "mundo"]` y el resultado sería `"hola---mundo"`.

Y `unirLineas(["uno", "dos"])` en tu laptop con Windows da `"uno\r\ndos"`; el mismo código en un servidor Linux da `"uno\ndos"`. Por eso conviene `EOL` cuando escribes archivos de texto pensados para el sistema donde corre el programa.

## Errores comunes

- **Olvidar el `export`.** La función existe, pero el test la recibe como `undefined` y verás "formatearPrecio is not a function".
- **Escribir mal el nombre exportado.** `import { formatearprecio }` no encuentra nada: los nombres distinguen mayúsculas.
- **Poner dos `export default`.** Solo puede haber uno por archivo; Node da un error de sintaxis antes de correr nada.
- **Importar sin `node:`** (`from "os"`) funciona, pero el prefijo deja claro que es un módulo de Node y no un paquete de npm. Úsalo siempre.
- **Olvidar la extensión en imports propios.** En ESM de Node se escribe `"./solucion.js"`, con `.js`; sin ella Node no encuentra el archivo.
- **Usar `"\n"` fijo en vez de `EOL`.** En Windows el test espera `"\r\n"` y fallará.

## Otra forma de resolverlo

**Exportar al final, en una sola línea.** En vez de `export function`, declaras normal y exportas todo junto:

```js
function formatearPrecio(monto) { /* ... */ }
function crearSlug(titulo) { /* ... */ }
function unirLineas(lineas) { /* ... */ }

export { formatearPrecio, crearSlug, unirLineas };
export default { formatearPrecio, crearSlug, unirLineas };
```

Es útil para ver de un vistazo qué ofrece el módulo. Poner `export` delante de cada función es más común en archivos pequeños.

**CommonJS (la sintaxis antigua).** Vas a ver mucho código así en proyectos viejos y en tutoriales:

```js
const { EOL } = require("node:os");
module.exports = { formatearPrecio, crearSlug, unirLineas };
```

ESM (`import`/`export`) es el estándar de JavaScript, funciona igual en el navegador y en Node, y es lo que usan React y Vite. Usa ESM en proyectos nuevos; reconoce CommonJS cuando lo leas.

## Cómo explicarlo en la entrevista

> "En Node cada archivo es un módulo con su propio alcance, así que exporto solo lo que otros archivos necesitan. Uso exports con nombre para cada función, porque se importan con su nombre exacto y el editor los autocompleta, y un export por defecto con un objeto que las agrupa por comodidad. Los módulos propios de Node, como os, los importo con el prefijo node: para distinguirlos de los paquetes de npm. Uso ESM, que es el estándar, aunque sé leer CommonJS con require y module.exports."

## Conceptos

- **Módulo**: un archivo con su propio alcance; sus variables no se ven desde afuera salvo que las exportes.
- **Export con nombre**: `export function f` o `export { f }`; se importa con llaves y el mismo nombre: `import { f } from "./archivo.js"`.
- **Export por defecto**: `export default valor`; uno por archivo; se importa sin llaves y con el nombre que quieras.
- **Prefijo `node:`**: marca los módulos que trae Node (`node:os`, `node:fs`, `node:path`).
- **`EOL`**: el fin de línea del sistema operativo (`"\r\n"` en Windows, `"\n"` en Linux y Mac).
- **ESM vs CommonJS**: `import`/`export` (estándar moderno) frente a `require`/`module.exports` (sistema antiguo de Node).
- **`toFixed(2)`**: redondea a dos decimales y devuelve un string.
