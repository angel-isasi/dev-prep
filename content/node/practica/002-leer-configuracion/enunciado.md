Tu app guarda sus ajustes en un archivo `config.json`. Escribe la función **asíncrona** `leerConfiguracion(ruta)` que lea ese archivo y devuelva la configuración completa, rellenando con valores por defecto lo que falte.

Los valores por defecto ya están exportados en `CONFIG_POR_DEFECTO`:

```js
{ puerto: 3000, idioma: "es", modoOscuro: false }
```

## Lo que necesitas de Node

El módulo `node:fs/promises` trae las funciones para trabajar con archivos, en versión con promesas (se usan con `await`):

```js
import { readFile } from "node:fs/promises";

const texto = await readFile("C:/proyecto/config.json", "utf8"); // string con el contenido
const datos = JSON.parse(texto);                                   // string -> objeto
```

Si el archivo no existe, `readFile` **rechaza** con un error cuyo `error.code` es `"ENOENT"` (de "Error NO ENTry": no existe esa entrada).

## Reglas

- Si el archivo existe, sus valores **reemplazan** a los de por defecto, y lo que no traiga se completa con los de por defecto.
- Si el archivo **no existe**, devuelve los valores por defecto.
- Devuelve siempre un **objeto nuevo**: si quien llama modifica el resultado, `CONFIG_POR_DEFECTO` no debe cambiar.
- Si el archivo existe pero **no es JSON válido**, lanza un error cuyo mensaje contenga `"JSON inválido"` (no lo escondas devolviendo los de por defecto: el usuario tiene que enterarse).
- Cualquier otro error de lectura se deja pasar tal cual.

## Ejemplos

```js
// config.json contiene: { "puerto": 8080 }
await leerConfiguracion("config.json");
// { puerto: 8080, idioma: "es", modoOscuro: false }

// el archivo no existe
await leerConfiguracion("no-existe.json");
// { puerto: 3000, idioma: "es", modoOscuro: false }

// config.json contiene: { "puerto": 80,
await leerConfiguracion("config.json");
// Error: JSON inválido en config.json
```
