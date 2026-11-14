Vas a escribir el "motor" de una app de notas que guarda cada nota como un archivo de texto `<titulo>.txt` dentro de una carpeta. Escribe tres funciones **asíncronas**:

1. `guardarNota(carpeta, titulo, texto)`: crea (o reemplaza) el archivo `<carpeta>/<titulo>.txt` con ese texto. Si la carpeta no existe, la crea, **aunque falten varios niveles** (por ejemplo `notas/2026/noviembre`). Devuelve la ruta completa del archivo.
2. `leerNota(carpeta, titulo)`: devuelve el texto de la nota, o `null` si no existe.
3. `agregarLinea(carpeta, titulo, linea)`: agrega `linea` y un salto de línea `"\n"` **al final** de la nota. Si la nota no existe, la crea.

## Lo que necesitas de Node

Todo viene de `node:fs/promises`:

```js
import { mkdir, writeFile, readFile, appendFile } from "node:fs/promises";

await mkdir("notas/2026", { recursive: true }); // crea la carpeta y las que falten; no falla si ya existe
await writeFile("notas/2026/a.txt", "hola");     // crea o REEMPLAZA el archivo
await appendFile("notas/2026/a.txt", " mundo");  // agrega al final (crea el archivo si no existe)
await readFile("notas/2026/a.txt", "utf8");      // "hola mundo"
```

Para armar la ruta usa `path.join` de `node:path`.

## Reglas

- Los archivos se escriben y se leen en `"utf8"`, así que tildes y ñ deben llegar intactas.
- `guardarNota` dos veces con el mismo título **reemplaza** el contenido.
- `leerNota` devuelve `null` solo si el archivo no existe (`error.code === "ENOENT"`); otros errores se dejan pasar.

## Ejemplos

```js
await guardarNota("notas", "compras", "pan\n");  // "notas\\compras.txt" en Windows
await agregarLinea("notas", "compras", "leche");
await leerNota("notas", "compras");              // "pan\nleche\n"
await leerNota("notas", "no-existe");            // null
```
