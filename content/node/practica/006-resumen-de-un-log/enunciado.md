Tu servidor escribe un **archivo de log** (registro) con una línea por evento. Cada línea tiene la fecha, la hora, el nivel y el mensaje, separados por espacios:

```
2026-11-14 10:00:01 INFO Servidor iniciado en el puerto 3000
2026-11-14 10:02:15 WARN La consulta tardó 2300 ms
2026-11-14 10:05:40 ERROR No se pudo conectar a la base de datos
```

Escribe la función **asíncrona** `resumirLog(ruta)` que lea el archivo y devuelva un resumen:

```js
{
  total: 3,                                   // líneas con contenido
  porNivel: { INFO: 1, WARN: 1, ERROR: 1 },   // siempre con las tres claves
  errores: ["No se pudo conectar a la base de datos"], // mensajes de ERROR, en orden
}
```

## Lo que necesitas de Node

Lees el archivo completo con `readFile(ruta, "utf8")` de `node:fs/promises` y lo partes en líneas con `split`. Ojo: un archivo creado en Windows termina sus líneas con `"\r\n"` y uno de Linux con `"\n"`. La expresión regular `/\r?\n/` corta en los dos casos.

## Reglas

- Ignora las líneas vacías (por ejemplo, la última línea en blanco que deja el salto final, o líneas con solo espacios).
- `porNivel` siempre tiene `INFO`, `WARN` y `ERROR`, aunque valgan 0.
- Una línea con otro nivel (por ejemplo `DEBUG`) cuenta en `total`, pero no en `porNivel`.
- El mensaje es todo lo que va después del nivel, aunque tenga espacios.
- Si el archivo no existe, la función rechaza (no atrapes ese error).

## Ejemplos

```js
// app.log:
// 2026-11-14 10:00:01 INFO Servidor iniciado
// 2026-11-14 10:05:40 ERROR Sin conexión
// (línea vacía)
// 2026-11-14 10:06:00 DEBUG Reintentando

await resumirLog("app.log");
// { total: 3, porNivel: { INFO: 1, WARN: 0, ERROR: 1 }, errores: ["Sin conexión"] }

await resumirLog("vacio.log");
// { total: 0, porNivel: { INFO: 0, WARN: 0, ERROR: 0 }, errores: [] }
```
