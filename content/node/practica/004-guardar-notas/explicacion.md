## Idea clave

Guardar datos en archivos es combinar tres operaciones de `node:fs/promises`: **asegurar la carpeta** (`mkdir` con `recursive: true`), **escribir** (`writeFile` reemplaza, `appendFile` agrega) y **leer** (`readFile`). Cada una devuelve una promesa, así que van con `await`, y el único error "esperado" (la nota no existe) se convierte en `null`.

## Paso a paso

1. **Centraliza la ruta.** Las tres funciones usan el mismo archivo, así que lo calculas en un solo lugar:

   ```js
   const rutaDeNota = (carpeta, titulo) => path.join(carpeta, `${titulo}.txt`);
   ```

   Si mañana las notas pasan a ser `.md`, cambias una sola línea.
2. **Antes de escribir, asegura la carpeta.** `writeFile` no crea carpetas: si `notas/2026` no existe, falla con `ENOENT`. `mkdir(carpeta, { recursive: true })` crea todos los niveles que falten y, si la carpeta ya existe, no hace nada (sin `recursive` lanzaría `EEXIST`).
3. **Escribe** con `writeFile(ruta, texto, "utf8")`. Si el archivo existe, lo reemplaza entero.
4. **Lee** con `readFile(ruta, "utf8")` dentro de `try/catch`. El `return await` es importante: hace que el rechazo ocurra **dentro** del `try` y lo puedas atrapar.
5. **Agrega** con `appendFile(ruta, linea + "\n", "utf8")`: escribe al final sin borrar lo anterior, y si el archivo no existe lo crea (la carpeta no, por eso también va el `mkdir`).

```js
import { mkdir, writeFile, readFile, appendFile } from "node:fs/promises";
import path from "node:path";

const rutaDeNota = (carpeta, titulo) => path.join(carpeta, `${titulo}.txt`);

export async function guardarNota(carpeta, titulo, texto) {
  await mkdir(carpeta, { recursive: true });
  const ruta = rutaDeNota(carpeta, titulo);
  await writeFile(ruta, texto, "utf8");
  return ruta;
}

export async function leerNota(carpeta, titulo) {
  try {
    return await readFile(rutaDeNota(carpeta, titulo), "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

export async function agregarLinea(carpeta, titulo, linea) {
  await mkdir(carpeta, { recursive: true });
  await appendFile(rutaDeNota(carpeta, titulo), linea + "\n", "utf8");
}
```

## Por qué funciona

Recorrido del test "agregarLinea agrega al final":

| Llamada | Contenido de `compras.txt` |
|---|---|
| `guardarNota(dir, "compras", "pan\n")` | `"pan\n"` |
| `agregarLinea(dir, "compras", "leche")` | `"pan\nleche\n"` |
| `agregarLinea(dir, "compras", "café")` | `"pan\nleche\ncafé\n"` |
| `leerNota(dir, "compras")` | devuelve `"pan\nleche\ncafé\n"` |

Cada `await` espera a que el disco termine antes de seguir, por eso el orden de las líneas es el de las llamadas.

¿Por qué `return await` y no solo `return` en `leerNota`? Con `return readFile(...)` la función devuelve la promesa **sin esperarla**: el `try` termina al instante, y cuando la promesa rechaza ya no hay `catch` que la atrape. Quien llame recibiría un error `ENOENT` en vez de `null`. Con `return await`, el rechazo ocurre dentro del `try`.

## Errores comunes

- **No crear la carpeta antes de escribir.** Ves `ENOENT: no such file or directory, open '...\notas\2026\ideas.txt'`. Confunde, porque el archivo "no existe" justamente porque lo quieres crear: lo que falta es la **carpeta**.
- **`mkdir` sin `recursive: true`.** Falla si faltan niveles intermedios y también si la carpeta ya existe (`EEXIST`).
- **Usar `writeFile` para agregar.** Borra todo lo anterior: solo quedaría la última línea.
- **`return` sin `await` dentro de `try/catch`.** El test "leerNota devuelve null" falla con un `ENOENT`.
- **Olvidar el `await` en `mkdir`.** El `writeFile` puede arrancar antes de que exista la carpeta y fallar a veces sí y a veces no, lo que es lo peor para depurar.
- **Concatenar la ruta** (`carpeta + "/" + titulo + ".txt"`) en vez de `path.join`.

## Otra forma de resolverlo

**Versiones síncronas** (`node:fs`): `mkdirSync`, `writeFileSync`, `readFileSync`, `appendFileSync`.

```js
import { mkdirSync, writeFileSync } from "node:fs";

mkdirSync(carpeta, { recursive: true });
writeFileSync(ruta, texto, "utf8");
```

Son más fáciles de leer porque no hay `await`, pero **bloquean** el proceso hasta que el disco responde. En un script que corres una vez está bien; en un servidor Express, mientras un usuario guarda una nota, todos los demás esperan. Por eso en servidores se usan las versiones con promesas.

**`leerNota` revisando antes con `access`**: `await access(ruta)` lanza si no existe. Es lo mismo pero con dos operaciones en vez de una, y con riesgo de que el archivo cambie entre una y otra. Intentar leer y manejar el error es lo recomendado.

## Cómo explicarlo en la entrevista

> "Uso fs/promises para no bloquear el proceso. Antes de escribir creo la carpeta con mkdir y recursive true, que crea los niveles que falten y no falla si ya existe. Para guardar uso writeFile, que reemplaza; para agregar, appendFile, que escribe al final y crea el archivo si no existe. Al leer, atrapo solo el error ENOENT y lo convierto en null, porque una nota que no existe es un caso normal; cualquier otro error lo relanzo. Y uso return await dentro del try para que el rechazo se atrape ahí."

## Conceptos

- **`mkdir(ruta, { recursive: true })`**: crea la carpeta y sus padres; no falla si ya existe.
- **`writeFile(ruta, datos, "utf8")`**: crea o reemplaza el archivo completo.
- **`appendFile(ruta, datos, "utf8")`**: agrega al final; crea el archivo (no la carpeta) si no existe.
- **`readFile(ruta, "utf8")`**: lee el archivo como string.
- **`ENOENT`**: "no existe": puede faltar el archivo o alguna carpeta de la ruta.
- **`return await` en `try/catch`**: espera la promesa dentro del `try` para poder atrapar su rechazo.
- **Síncrono vs asíncrono**: las versiones `Sync` bloquean el proceso; las de promesas dejan que Node atienda otras cosas mientras espera al disco.
