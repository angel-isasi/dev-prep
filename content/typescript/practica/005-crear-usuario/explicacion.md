## Idea clave

Dos modificadores de propiedades: `?` la vuelve **opcional** (su tipo pasa a ser `string | undefined` y puede no existir) y `readonly` impide **reasignarla** después de crear el objeto. Con ellos el tipo cuenta las reglas del negocio: el teléfono puede faltar y el id nunca cambia.

## Paso a paso

1. **Separa lo que llega de lo que guardas.** `DatosUsuario` es lo que manda el formulario (sin id, sin `activo`). `Usuario` es el registro completo. Son dos formas distintas, y por eso son dos interfaces.

   ```ts
   export interface DatosUsuario {
     nombre: string;
     email: string;
     telefono?: string;
   }

   export interface Usuario {
     readonly id: number;
     nombre: string;
     email: string;
     telefono?: string;
     activo: boolean;
   }
   ```

2. **Arma el objeto con lo obligatorio.** `id` (atajo de `id: id`), `nombre` con `trim()`, `email` con `trim().toLowerCase()` y `activo: true`. Anotar `const usuario: Usuario` hace que TypeScript revise que no falte nada.
3. **El teléfono, con cuidado.** `datos.telefono` es `string | undefined`. Llamar `datos.telefono.trim()` es un error de tipos ("posiblemente undefined"). El encadenamiento opcional `?.` lo resuelve: si es `undefined`, devuelve `undefined` sin llamar a `trim`.
4. **Agrega solo si hay algo.** `if (telefono)` es falso para `undefined` y para `""`. Dentro del `if`, TypeScript sabe que `telefono` es `string`.
5. **`readonly` trabaja solo.** No tienes que hacer nada en la función: la interface ya impide `u.id = 5` en el resto del código.

```ts
export function crearUsuario(id: number, datos: DatosUsuario): Usuario {
  const usuario: Usuario = {
    id,
    nombre: datos.nombre.trim(),
    email: datos.email.trim().toLowerCase(),
    activo: true,
  };
  const telefono = datos.telefono?.trim();
  if (telefono) {
    usuario.telefono = telefono;
  }
  return usuario;
}
```

## Por qué funciona

Recorrido con `{ nombre: "Rosa", email: "rosa@correo.pe", telefono: "   " }`:

| Paso | Valor |
|---|---|
| `datos.telefono` | `"   "` |
| `datos.telefono?.trim()` | `""` |
| `if ("")` | falso: no se agrega |
| Resultado | `{ id: 3, nombre: "Rosa", email: "rosa@correo.pe", activo: true }` |

Y sin teléfono: `datos.telefono` es `undefined`, `undefined?.trim()` da `undefined` (sin error) y el `if` tampoco entra.

En tiempo de compilación, `u.id = 5` falla con "No se puede asignar a 'id' porque es una propiedad de solo lectura". Ojo: `readonly` es **solo de TypeScript**. En tiempo de ejecución el objeto es normal; si necesitas protección real usas `Object.freeze`.

## Errores comunes

- **Poner `telefono: datos.telefono` directo en el objeto.** Si no vino, el objeto queda con `telefono: undefined`, y la propiedad **existe** (`"telefono" in u` es `true`). El test "sin teléfono, el usuario no tiene la propiedad" lo detecta.
- **`datos.telefono.trim()` sin `?.`.** Error de tipos: "'datos.telefono' es posiblemente 'undefined'". Y en tiempo de ejecución: "Cannot read properties of undefined (reading 'trim')".
- **Poner `readonly` en la variable en vez de la propiedad.** `const u` impide reasignar `u`, no sus propiedades. `readonly` va dentro de la interface.
- **Confundir `telefono?: string` con `telefono: string | undefined`.** El segundo obliga a escribir la propiedad (aunque sea `undefined`); el primero permite omitirla.
- **Olvidar `trim` en el email.** `"Ana@Correo.PE "` con espacio al final no es el mismo email.

## Otra forma de resolverlo

**Spread condicional**, todo en una expresión:

```ts
export function crearUsuario(id: number, datos: DatosUsuario): Usuario {
  const telefono = datos.telefono?.trim();
  return {
    id,
    nombre: datos.nombre.trim(),
    email: datos.email.trim().toLowerCase(),
    ...(telefono ? { telefono } : {}),
    activo: true,
  };
}
```

`...(condición ? { telefono } : {})` agrega la propiedad solo si hay teléfono. Es un patrón muy usado en React para armar props u objetos de configuración. La versión con `if` es más fácil de leer; esta es más compacta y no muta el objeto después de crearlo.

## Cómo explicarlo en la entrevista

> "Separo dos interfaces: lo que llega del formulario y el usuario guardado. El teléfono es opcional con el signo de interrogación, así que su tipo es string o undefined, y el id es readonly para que nadie lo cambie después. En la función limpio nombre y email, y el teléfono lo proceso con encadenamiento opcional y solo lo agrego si quedó algo, para no guardar una propiedad vacía. Aclaro que readonly es solo en compilación; en tiempo de ejecución usaría Object.freeze."

## Conceptos

- **Propiedad opcional**: `telefono?: string`, su tipo es `string | undefined` y puede omitirse.
- **`readonly`**: la propiedad no se puede reasignar (solo lo revisa TypeScript).
- **Encadenamiento opcional `?.`**: `x?.trim()` devuelve `undefined` si `x` es `undefined`.
- **Narrowing con `if`**: dentro de `if (telefono)`, el tipo pasa de `string | undefined` a `string`.
- **Operador `in`**: `"telefono" in u` dice si la propiedad existe.
- **Spread condicional**: `...(cond ? { a } : {})`.
- Tema de Aprender: objetos e interfaces en TypeScript.
