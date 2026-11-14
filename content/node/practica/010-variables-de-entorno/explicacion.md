## Idea clave

Las variables de entorno llegan **siempre como texto** (o `undefined`), así que para cada una haces lo mismo: leer, poner un valor por defecto, convertir al tipo correcto y validar. Si algo está mal, lanzas un error claro **al arrancar**, no cuando un usuario ya está usando la app. Recibir `env` como parámetro (con `process.env` por defecto) hace la función fácil de probar.

## Paso a paso

1. **El parámetro con valor por defecto.** `leerConfig(env = process.env)`: en el servidor real la llamas sin argumentos y lee las variables del sistema; en los tests le pasas un objeto inventado como `{ PORT: "8080" }`. Esto se llama **inyección de dependencias**: la función no va a buscar sus datos, se los dan.
2. **Una variable vacía no cuenta.** `PORT=""` debe comportarse como si no existiera. Como `??` solo reemplaza `null` y `undefined` (no `""`), escribes una función auxiliar:

   ```js
   const leer = (env, nombre) => (env[nombre] ? env[nombre] : undefined);
   ```

   `""` es falsy, así que devuelve `undefined` y el `??` siguiente pone el valor por defecto.
3. **`PORT`**: `Number(texto)` convierte; `Number.isInteger` descarta `NaN` (de `"abc"`) y decimales (`"80.5"`); el rango 1 a 65535 es el de los puertos válidos. El mensaje incluye el valor recibido, para que quien lo lea sepa qué corregir.
4. **`NODE_ENV`**: lista de valores permitidos y `includes`. Así un error de tipeo como `"produccion"` falla en vez de hacer que la app crea que no está en producción.
5. **`DEBUG`**: `["true", "1"].includes(valor)`. Si la variable no existe, `includes(undefined)` da `false`.
6. **`DATABASE_URL`**: si el entorno es producción y no hay URL, lanzas. Fuera de producción, usas una base local por defecto.
7. **Devuelve** el objeto con nombres claros en español y los tipos correctos.

```js
const ENTORNOS = ["development", "production", "test"];

const leer = (env, nombre) => (env[nombre] ? env[nombre] : undefined);

export function leerConfig(env = process.env) {
  const textoPuerto = leer(env, "PORT") ?? "3000";
  const puerto = Number(textoPuerto);
  if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535) {
    throw new Error(`PORT inválido: ${textoPuerto}`);
  }

  const entorno = leer(env, "NODE_ENV") ?? "development";
  if (!ENTORNOS.includes(entorno)) {
    throw new Error(`NODE_ENV inválido: ${entorno}`);
  }

  const debug = ["true", "1"].includes(leer(env, "DEBUG"));

  const url = leer(env, "DATABASE_URL");
  if (entorno === "production" && !url) {
    throw new Error("Falta DATABASE_URL en producción");
  }

  return { puerto, entorno, debug, urlBaseDeDatos: url ?? "sqlite://local.db" };
}
```

## Por qué funciona

Cómo se procesa `PORT` según lo que llegue:

| `env.PORT` | `leer` | Texto final | `Number(...)` | ¿Válido? |
|---|---|---|---|---|
| no existe | `undefined` | `"3000"` | `3000` | sí |
| `""` | `undefined` | `"3000"` | `3000` | sí |
| `"8080"` | `"8080"` | `"8080"` | `8080` | sí |
| `"abc"` | `"abc"` | `"abc"` | `NaN` | no: `isInteger(NaN)` es `false` |
| `"80.5"` | `"80.5"` | `"80.5"` | `80.5` | no: no es entero |
| `"70000"` | `"70000"` | `"70000"` | `70000` | no: mayor que 65535 |

Y por qué `DEBUG` no se puede convertir con `Boolean`:

| `env.DEBUG` | `Boolean(valor)` | `["true", "1"].includes(valor)` |
|---|---|---|
| `"true"` | `true` | `true` |
| `"false"` | **`true`** (string no vacío) | `false` |
| `"0"` | **`true`** | `false` |
| no existe | `false` | `false` |

El último test usa `vi.stubEnv("PORT", "4567")`, que cambia `process.env` solo durante ese test (y `vi.unstubAllEnvs()` lo restaura). Como `leerConfig()` se llama sin argumentos, el valor por defecto `process.env` entra en juego y el puerto sale `4567`.

## Errores comunes

- **Olvidar que todo es string.** `env.PORT === 8080` es siempre `false`, y `env.PORT + 1` da `"80801"`.
- **`Boolean(env.DEBUG)` o `if (env.DEBUG)`**: `"false"` activa el modo debug. Es un error real y muy común en producción.
- **`parseInt` en vez de `Number`**: `parseInt("80abc")` da `80` y `parseInt("80.5")` da `80`, así que un valor mal escrito pasa sin aviso. `Number` es más estricto.
- **`env.PORT || 3000` sin convertir**: si la variable existe devuelves un string y si no, un número. El tipo cambia según el caso.
- **Validar solo `isNaN`**: deja pasar `0`, negativos y decimales.
- **Leer `process.env` directamente dentro de la función** (sin parámetro): para probarla tendrías que modificar las variables reales del proceso en cada test.
- **No fallar si falta algo obligatorio**: la app arranca "bien" y se cae minutos después, en la primera consulta a la base de datos. Fallar al arrancar es mucho más fácil de diagnosticar.

## Otra forma de resolverlo

**Archivo `.env`**: en vez de definir las variables en la terminal, las escribes en un archivo `.env` en la raíz del proyecto:

```
PORT=8080
DEBUG=true
```

Desde Node 20 puedes cargarlo sin instalar nada: `node --env-file=.env servidor.js`, o dentro del código con `process.loadEnvFile()`. Antes se usaba el paquete `dotenv`. El `.env` **nunca** se sube a Git (va en `.gitignore`), porque suele tener contraseñas; se sube un `.env.example` con los nombres y valores de ejemplo.

**Librerías de validación** como `zod` permiten describir la configuración como un esquema (`z.coerce.number().int().min(1).max(65535)`) y validan todo de una vez, juntando todos los errores. Para cuatro variables, la validación a mano es suficiente y se entiende mejor.

## Cómo explicarlo en la entrevista

> "La configuración que cambia entre entornos, como el puerto o la URL de la base de datos, va en variables de entorno, nunca en el código. Las leo de process.env, pero recibo el objeto como parámetro con process.env por defecto, así en los tests le paso un objeto inventado. Como todo llega como string, convierto cada valor: el puerto con Number y validando que sea entero y esté en rango, y los booleanos comparando con 'true' o '1', porque Boolean de 'false' da true. Valido al arrancar y lanzo errores claros si falta algo obligatorio, como la base de datos en producción. Localmente uso un archivo .env, que no subo a Git."

## Conceptos

- **Variables de entorno**: valores que el sistema operativo le pasa al proceso; en Node están en `process.env` y **siempre son strings**.
- **`NODE_ENV`**: convención para indicar el entorno (`development`, `production`, `test`); muchas librerías cambian su comportamiento según su valor.
- **Parámetro con valor por defecto**: `function f(env = process.env)`; se usa si no pasas el argumento.
- **Inyección de dependencias**: la función recibe lo que necesita en vez de buscarlo, y así es fácil de probar.
- **`Number` vs `parseInt`**: `Number` rechaza textos con basura (`NaN`); `parseInt` lee lo que puede.
- **`??` vs `||`**: `??` solo reemplaza `null` y `undefined`; `||` reemplaza cualquier falsy (`""`, `0`, `false`).
- **Fallar rápido (fail fast)**: validar la configuración al arrancar en vez de descubrir el problema después.
- **`vi.stubEnv`**: cambia `process.env` solo durante un test.
