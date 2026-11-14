## En una frase

Con el módulo `fs` (file system) Node lee y escribe archivos del disco; la forma moderna es `node:fs/promises` con `await`, armando las rutas siempre con `path`.

## Lo esencial

### Leer y escribir con `fs/promises`

```js
import { readFile, writeFile, appendFile, mkdir, readdir, rm } from "node:fs/promises";

await writeFile("nota.txt", "Hola");           // crea o REEMPLAZA el archivo
await appendFile("nota.txt", "\nOtra línea");  // agrega al final
const texto = await readFile("nota.txt", "utf8");
// "Hola\nOtra línea"

await mkdir("datos/2026", { recursive: true }); // crea carpetas (y no falla si ya existen)
const archivos = await readdir("datos");         // ["2026"]  nombres, no rutas completas
await rm("datos", { recursive: true, force: true }); // borra la carpeta con todo
```

- Pasa siempre `"utf8"` a `readFile`: sin eso recibes un `Buffer` (bytes), no texto.
- Todas devuelven **promesas**: necesitan `await` (o `.then`).

### Sincrónico vs asincrónico

```js
import { readFileSync } from "node:fs";
const texto = readFileSync("nota.txt", "utf8"); // sin await, bloquea hasta terminar
```

| | `fs/promises` (`readFile`) | `fs` (`readFileSync`) |
|---|---|---|
| ¿Bloquea? | No: Node atiende otras cosas mientras el disco trabaja | **Sí**: todo el programa espera |
| Uso típico | Servidores y APIs | Scripts cortos, leer configuración al arrancar |

En un servidor, un `readFileSync` dentro de una ruta hace que **todos** los usuarios esperen mientras se lee ese archivo.

### Rutas con `path`

```js
import path from "node:path";

path.join("datos", "usuarios", "ana.json"); // "datos\\usuarios\\ana.json" en Windows
path.join("datos/", "/usuarios");            // "datos\\usuarios" (limpia las barras)
path.basename("datos/ana.json");             // "ana.json"
path.extname("datos/ana.json");              // ".json"
path.dirname("datos/ana.json");              // "datos"
path.resolve("datos");                       // ruta absoluta: "D:\\proyecto\\datos"
```

¿Por qué no concatenar con `+`? Windows usa `\` y Linux usa `/`; con `"datos" + "/" + nombre` es fácil duplicar o perder barras. `path.join` usa el separador correcto y normaliza.

**Rutas relativas**: `readFile("nota.txt")` busca desde la carpeta donde **ejecutaste** `node`, no desde donde está el archivo `.js`. Para ubicarte respecto al propio archivo usa `import.meta.dirname`:

```js
const ruta = path.join(import.meta.dirname, "datos", "productos.json");
```

### JSON en archivos

Un archivo `.json` es solo texto. Para guardarlo conviertes a texto, y para leerlo lo vuelves a convertir en objeto:

```js
const usuarios = [{ id: 1, nombre: "Ana" }];

// Guardar: objeto → texto
await writeFile("usuarios.json", JSON.stringify(usuarios, null, 2));
// null, 2 = con sangría de 2 espacios, legible para humanos

// Leer: texto → objeto
const lista = JSON.parse(await readFile("usuarios.json", "utf8"));
lista[0].nombre; // "Ana"
```

### Cuando el archivo no existe: ENOENT

Si el archivo no está, la promesa se **rechaza** con un error cuyo `code` es `"ENOENT"` ("Error NO ENTry": no existe esa entrada).

```js
async function leerConfig(ruta) {
  try {
    return JSON.parse(await readFile(ruta, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return {}; // no existe: uso valores por defecto
    throw error; // otro problema (JSON roto, sin permisos): que suba
  }
}
```

Otros códigos que verás: `EACCES` (sin permisos), `EISDIR` (es una carpeta, no un archivo), `EEXIST` (ya existe).

## Errores típicos

**1. Olvidar el `await`**

```js
const texto = readFile("nota.txt", "utf8");
texto.toUpperCase(); // TypeError: texto.toUpperCase is not a function
```
`texto` es una promesa, no el contenido. Escribe `await readFile(...)`.

**2. Olvidar `"utf8"`**

```js
const texto = await readFile("nota.txt");
console.log(texto); // <Buffer 48 6f 6c 61>
```
Sin codificación recibes bytes. Pasa `"utf8"`.

**3. Creer que `writeFile` agrega**

`writeFile` **reemplaza** todo el contenido. Para agregar al final usa `appendFile`, o lee, modifica y vuelve a escribir.

**4. Atrapar todos los errores como "no existe"**

```js
try { return JSON.parse(await readFile(ruta, "utf8")); }
catch { return {}; } // también esconde un JSON mal escrito
```
Revisa `error.code === "ENOENT"` y vuelve a lanzar los demás.

**5. Guardar un objeto sin `JSON.stringify`**

```js
await writeFile("u.json", { nombre: "Ana" });
// TypeError: The "data" argument must be of type string or ... Received an instance of Object
```

**6. Escribir en una carpeta que no existe**

`writeFile("salida/r.txt", ...)` falla con ENOENT si `salida/` no existe. Crea antes la carpeta con `mkdir(..., { recursive: true })`.

## Chuleta

| Función | Qué hace |
|---|---|
| `readFile(ruta, "utf8")` | Lee el archivo como texto |
| `writeFile(ruta, texto)` | Crea o reemplaza |
| `appendFile(ruta, texto)` | Agrega al final |
| `mkdir(ruta, { recursive: true })` | Crea carpetas anidadas |
| `readdir(ruta)` | Lista nombres dentro de una carpeta |
| `rm(ruta, { recursive: true, force: true })` | Borra archivo o carpeta |
| `path.join(a, b, c)` | Une partes de ruta con el separador correcto |
| `path.basename` / `extname` / `dirname` | Nombre, extensión, carpeta |
| `import.meta.dirname` | Carpeta del archivo `.js` actual |
| `JSON.stringify(x, null, 2)` / `JSON.parse(t)` | Objeto a texto / texto a objeto |
| `error.code === "ENOENT"` | El archivo o carpeta no existe |

## En la entrevista

**¿Qué diferencia hay entre `readFile` y `readFileSync`?**
`readFileSync` bloquea el programa hasta terminar de leer; `readFile` de `fs/promises` devuelve una promesa y deja a Node atender otras tareas mientras tanto. En un servidor se usa la versión asincrónica para no frenar a los demás usuarios.

**¿Por qué usar `path.join` en vez de concatenar rutas?**
Porque cada sistema operativo usa un separador distinto (`\` en Windows, `/` en Linux y Mac) y `path.join` pone el correcto y limpia barras duplicadas, así el código funciona en cualquier máquina.

**¿Cómo guardas y lees datos en un archivo JSON?**
Para guardar convierto el objeto a texto con `JSON.stringify` y lo escribo con `writeFile`; para leer uso `readFile` con `"utf8"` y convierto el texto en objeto con `JSON.parse`.

**¿Qué es ENOENT y cómo lo manejas?**
Es el código de error cuando un archivo o carpeta no existe. Lo atrapo con `try/catch`, reviso `error.code === "ENOENT"` para dar un valor por defecto y relanzo cualquier otro error para no esconder problemas reales.
