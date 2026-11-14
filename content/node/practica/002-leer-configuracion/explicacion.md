## Idea clave

Lees el archivo con `readFile` de `node:fs/promises`, lo conviertes con `JSON.parse` y lo combinas con los valores por defecto usando spread, donde lo del archivo gana. Lo importante es **qué errores atrapas**: "el archivo no existe" es normal y se resuelve con los valores por defecto; un JSON roto o cualquier otro problema se avisa con un error.

## Paso a paso

1. **Importa la función.** `readFile` viene en `node:fs/promises`, la versión de `fs` que devuelve promesas:

   ```js
   import { readFile } from "node:fs/promises";
   ```

2. **La función es `async`**, porque leer del disco tarda y no quieres congelar el programa. Dentro usas `await readFile(ruta, "utf8")`. El segundo argumento indica la codificación: sin él recibes un `Buffer` (bytes crudos) en vez de un string.
3. **Primer `try/catch`: la lectura.** Si falla, el error trae una propiedad `code`. `"ENOENT"` significa que no existe; en ese caso devuelves una **copia** de los valores por defecto. Cualquier otro código (`"EISDIR"` si la ruta es una carpeta, `"EACCES"` si no tienes permisos) lo vuelves a lanzar con `throw error`.
4. **Segundo `try/catch`: el parseo.** `JSON.parse` lanza un `SyntaxError` si el texto no es JSON válido. Lo atrapas y lanzas un error propio con un mensaje claro, que diga qué archivo está mal.
5. **Combina.** `{ ...CONFIG_POR_DEFECTO, ...datos }` copia primero todos los valores por defecto y luego pisa con los del archivo.

```js
import { readFile } from "node:fs/promises";

export const CONFIG_POR_DEFECTO = { puerto: 3000, idioma: "es", modoOscuro: false };

export async function leerConfiguracion(ruta) {
  let texto;
  try {
    texto = await readFile(ruta, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return { ...CONFIG_POR_DEFECTO };
    throw error;
  }

  let datos;
  try {
    datos = JSON.parse(texto);
  } catch {
    throw new Error(`JSON inválido en ${ruta}`);
  }

  return { ...CONFIG_POR_DEFECTO, ...datos };
}
```

## Por qué funciona

Recorrido con un `config.json` que contiene `{ "puerto": 8080 }`:

| Paso | Valor |
|---|---|
| `await readFile(ruta, "utf8")` | `'{"puerto":8080}'` (un string) |
| `JSON.parse(texto)` | `{ puerto: 8080 }` (un objeto) |
| `{ ...CONFIG_POR_DEFECTO }` | `{ puerto: 3000, idioma: "es", modoOscuro: false }` |
| `...datos` encima | `{ puerto: 8080, idioma: "es", modoOscuro: false }` |

Con el spread, si una propiedad aparece dos veces, **gana la última**. Por eso el orden importa: `{ ...datos, ...CONFIG_POR_DEFECTO }` haría que los valores por defecto pisen siempre al archivo.

Si el archivo no existe, `readFile` rechaza; el `await` convierte ese rechazo en una excepción que cae en el `catch`, `error.code` vale `"ENOENT"` y devuelves la copia.

¿Por qué copia y no `return CONFIG_POR_DEFECTO`? Porque los objetos se pasan **por referencia**: si devuelves el mismo objeto y alguien hace `config.puerto = 1`, cambias el valor por defecto para toda la app. El test "devuelve un objeto nuevo" revisa justo eso.

## Errores comunes

- **Olvidar `"utf8"`.** `readFile` devuelve un `Buffer`. `JSON.parse` lo convierte a texto solo y por suerte funciona, pero con otras operaciones de texto (`split`, `includes`) tendrás errores raros. Pon siempre la codificación cuando leas texto.
- **Olvidar el `await`.** `texto` sería una promesa, no un string, y `JSON.parse` fallaría al leer `"[object Promise]"`: tu función diría "JSON inválido" aunque el archivo esté perfecto. Si un error menciona `[object Promise]` o un JSON correcto "falla", revisa que no te falte un `await`.
- **Atrapar todos los errores y devolver los valores por defecto.** Parece cómodo, pero esconde problemas: si el usuario escribió mal su `config.json`, la app ignora su configuración sin avisar y nadie entiende por qué.
- **Devolver `CONFIG_POR_DEFECTO` sin copiar.** El test que modifica el resultado lo detecta.
- **Usar `readFileSync` dentro de una función `async`.** Funciona, pero bloquea todo el proceso mientras lee. En un servidor eso frena a todos los usuarios a la vez.
- **Comparar el mensaje del error** (`error.message.includes("no such file")`) en vez de `error.code`. El mensaje puede cambiar entre versiones o idiomas; el `code` es estable.

## Otra forma de resolverlo

**Revisar antes si existe**, con `access` o `existsSync`:

```js
import { existsSync } from "node:fs";

if (!existsSync(ruta)) return { ...CONFIG_POR_DEFECTO };
const texto = await readFile(ruta, "utf8");
```

Se lee más fácil, pero tiene un problema clásico: entre que preguntas y que lees, otro proceso podría borrar el archivo (se llama "condición de carrera"). Por eso la práctica recomendada en Node es **intentar y manejar el error**, como en la solución. Para un script personal, cualquiera de las dos sirve; en un servidor, prefiere la del `try/catch`.

**`Object.assign`** en vez de spread hace lo mismo: `Object.assign({}, CONFIG_POR_DEFECTO, datos)`. El primer `{}` es clave: sin él, modificarías `CONFIG_POR_DEFECTO`.

## Cómo explicarlo en la entrevista

> "Leo el archivo con readFile de fs/promises, con await y en utf8, y lo parseo con JSON.parse. Manejo los errores por separado: si el código es ENOENT, el archivo no existe y devuelvo una copia de los valores por defecto; si el JSON está roto lanzo un error claro, porque esconderlo haría que la configuración del usuario se ignore sin aviso; y cualquier otro error lo dejo subir. Al final combino con spread, primero los valores por defecto y luego los del archivo, para que el archivo gane. Prefiero intentar y manejar el error a preguntar antes si existe, para evitar condiciones de carrera."

## Conceptos

- **`node:fs/promises`**: funciones de archivos que devuelven promesas (`readFile`, `writeFile`, `mkdir`, `readdir`).
- **`readFile(ruta, "utf8")`**: lee todo el archivo como string; sin codificación devuelve un `Buffer`.
- **`error.code`**: código estable de los errores del sistema: `ENOENT` (no existe), `EISDIR` (es una carpeta), `EACCES` (sin permiso).
- **`JSON.parse`**: convierte texto JSON en un valor de JavaScript; lanza `SyntaxError` si el texto está mal.
- **Spread de objetos**: `{ ...a, ...b }` copia `a` y luego `b`; si se repite una propiedad, gana la última.
- **Referencia vs copia**: los objetos se comparten por referencia; para no modificar el original, devuelve una copia.
- **Relanzar un error**: `throw error` dentro de un `catch` para no tragarte problemas que no sabes resolver.
