## Idea clave

`Partial<Usuario>` es el tipo "algunas propiedades de `Usuario`, todas opcionales", sin escribir otra interfaz. Para aplicar los cambios sin mutar, creas un objeto nuevo con spread: primero el usuario, encima los cambios y al final el `id` original para protegerlo.

## Paso a paso

1. **Qué tipo tienen los cambios.** No es `Usuario`: ese exige las cuatro propiedades y el formulario solo manda lo que cambió. Podrías escribir otra interfaz con todo opcional, pero se desincronizaría cuando agregues un campo. `Partial<T>` la genera sola:

   ```ts
   // Partial<Usuario> equivale a:
   // { id?: number; nombre?: string; email?: string; activo?: boolean }
   ```

2. **Por qué no `any`.** Con `cambios: any`, `{ edad: 20 }` o `{ activo: "si" }` pasarían sin aviso y terminarías con un usuario con `activo: "si"`. Con `Partial<Usuario>`, TypeScript rechaza las dos cosas.

3. **Crea un objeto nuevo con spread.** `{ ...usuario }` copia las propiedades a un objeto nuevo. Si después pones `...cambios`, las propiedades de `cambios` sobrescriben las anteriores, porque en un objeto literal **la última asignación gana**.

4. **Protege el `id`.** Poniendo `id: usuario.id` al final, aunque `cambios` traiga un `id`, se vuelve a escribir el original:

   ```ts
   return { ...usuario, ...cambios, id: usuario.id };
   ```

## Por qué funciona

Recorrido con `actualizarUsuario(ana, { id: 99, nombre: "Ana" })`, propiedad por propiedad en el orden en que se escriben:

| Paso | Origen | `id` | `nombre` | `email` | `activo` |
|---|---|---|---|---|---|
| 1 | `...usuario` | 1 | `"Ana"` | `"ana@correo.com"` | `true` |
| 2 | `...cambios` | **99** | `"Ana"` | `"ana@correo.com"` | `true` |
| 3 | `id: usuario.id` | **1** | `"Ana"` | `"ana@correo.com"` | `true` |

El resultado es un objeto nuevo (otra referencia), así que `ana` no cambia y `nueva !== ana`. Por eso el test "no modifica el usuario original" pasa, y por eso React, que compara referencias, detecta el cambio de estado.

## Errores comunes

- **Mutar el original con `Object.assign(usuario, cambios)`.** Devuelve el mismo objeto modificado: `ana.nombre` ya no es `"Ana"` y el resultado es `toBe(ana)`. Si usas `Object.assign`, el primer argumento debe ser `{}`.
- **Poner los cambios antes del usuario** (`{ ...cambios, ...usuario }`): el usuario original pisa los cambios y nada se actualiza.
- **Olvidar proteger el `id`.** El test "el id nunca cambia" falla con `99`.
- **Dejar `cambios: any`.** Los tests de valores pasan, pero tsc reporta las directivas `@ts-expect-error` no usadas.
- **Devolver el usuario sin copiar cuando `cambios` está vacío.** El test pide una copia (`not.toBe`): spread siempre crea un objeto nuevo, así no necesitas un caso especial.

## Otra forma de resolverlo

**Con `Object.assign`** sobre un objeto vacío:

```ts
export function actualizarUsuario(usuario: Usuario, cambios: Partial<Usuario>): Usuario {
  return Object.assign({}, usuario, cambios, { id: usuario.id });
}
```

Hace lo mismo y era lo habitual antes del spread. El spread es más corto y más común hoy.

**Que el tipo no permita cambiar el `id`:** `cambios: Partial<Omit<Usuario, "id">>`. Así `{ id: 99 }` sería un error de tipos y el `id` queda protegido antes de ejecutar. Es la opción más estricta; aquí además lo protegemos en tiempo de ejecución porque los datos pueden venir de fuera (un formulario, una API) donde TypeScript ya no vigila. `Omit` lo practicas en el ejercicio siguiente.

## Cómo explicarlo en la entrevista

> "Tipé los cambios como Partial de Usuario, que vuelve opcionales todas las propiedades; así acepto solo lo que cambió y TypeScript rechaza propiedades inventadas o de tipo incorrecto. Para no mutar el original devuelvo un objeto nuevo con spread: primero el usuario, luego los cambios, que sobrescriben, y al final el id original para que no se pueda cambiar. Es el mismo patrón que usas en React para actualizar el estado de un objeto."

## Conceptos

- **Utility types**: tipos genéricos que trae TypeScript para transformar otros tipos.
- **`Partial<T>`**: todas las propiedades de `T` se vuelven opcionales.
- **Spread de objetos (`{ ...obj }`)**: copia superficial en un objeto nuevo; lo último escrito gana.
- **Inmutabilidad**: devolver datos nuevos en lugar de modificar los recibidos.
- **Referencia vs contenido**: `toBe` compara referencias; `toEqual`, contenido.
- **Comprobación de propiedades de más**: en un objeto literal, TypeScript rechaza propiedades que el tipo no tiene.
- Repasa el tema de Aprender "TS: utility types" y, en la Referencia, el spread y `Object.assign`.
