Un servidor no debería tener el puerto o la contraseña de la base de datos escritos en el código: cambian entre tu laptop, el servidor de pruebas y producción. Para eso existen las **variables de entorno**, que se leen en Node con `process.env`.

Escribe la función `leerConfig(env = process.env)` que lea las variables y devuelva la configuración ya convertida y validada:

```js
{ puerto: 3000, entorno: "development", debug: false, urlBaseDeDatos: "sqlite://local.db" }
```

Recibe el objeto `env` como parámetro (por defecto `process.env`) para poder probarla con objetos inventados, sin tocar las variables reales del sistema.

## Lo que necesitas de Node

```js
process.env.PORT;     // "8080"  ¡siempre string! (o undefined si no existe)
process.env.DEBUG;    // "true"  también string, no booleano
```

En la terminal de Windows (PowerShell) se definen así: `$env:PORT = "8080"; node servidor.js`.

## Reglas

| Variable | Propiedad | Por defecto | Reglas |
|---|---|---|---|
| `PORT` | `puerto` (número) | `3000` | Debe ser un entero entre 1 y 65535. Si no, lanza `Error("PORT inválido: <valor>")`. |
| `NODE_ENV` | `entorno` | `"development"` | Solo `"development"`, `"production"` o `"test"`. Si no, lanza un error que diga `NODE_ENV inválido`. |
| `DEBUG` | `debug` (booleano) | `false` | `true` solo si vale `"true"` o `"1"`. |
| `DATABASE_URL` | `urlBaseDeDatos` | `"sqlite://local.db"` | En `"production"` es **obligatoria**: si falta, lanza un error que diga `Falta DATABASE_URL`. |

Una variable que existe pero está vacía (`PORT=""`) cuenta como si no existiera.

## Ejemplos

```js
leerConfig({});
// { puerto: 3000, entorno: "development", debug: false, urlBaseDeDatos: "sqlite://local.db" }

leerConfig({ PORT: "8080", DEBUG: "1" });
// { puerto: 8080, entorno: "development", debug: true, urlBaseDeDatos: "sqlite://local.db" }

leerConfig({ PORT: "abc" });                 // Error: PORT inválido: abc
leerConfig({ NODE_ENV: "produccion" });      // Error: NODE_ENV inválido: produccion
leerConfig({ NODE_ENV: "production" });      // Error: Falta DATABASE_URL en producción
```
