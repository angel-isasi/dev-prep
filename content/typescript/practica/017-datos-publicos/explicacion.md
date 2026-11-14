## Idea clave

`Omit<T, K>` crea un tipo **sin** ciertas propiedades y `Pick<T, K>` uno **solo con** ciertas propiedades, los dos a partir de un tipo que ya tienes. Los tipos no borran nada en tiempo de ejecución: además tienes que crear objetos nuevos que de verdad no lleven el `password`.

## Paso a paso

1. **Deriva los tipos, no los copies.** Podrías escribir a mano `interface UsuarioPublico { id; nombre; email; rol }`, pero si mañana agregas `telefono` a `Usuario`, tendrías que acordarte de agregarlo también ahí. Derivando, se actualizan solos:

   ```ts
   export type UsuarioPublico = Omit<Usuario, "password">;
   export type ResumenUsuario = Pick<Usuario, "id" | "nombre">;
   ```

   En `Pick` y `Omit`, el segundo parámetro es una unión de nombres de propiedades: `"id" | "nombre"`.

2. **Los tipos desaparecen al ejecutar.** TypeScript se borra al compilar. Si haces `return usuario` con tipo `UsuarioPublico`, TypeScript no se queja (un `Usuario` tiene todo lo que pide `UsuarioPublico` y más), pero el objeto **sigue llevando el `password`** y llegaría a la pantalla. El tipo protege el código que escribes; el valor lo tienes que limpiar tú.

3. **Quita `password` con desestructuración y resto.** Esta línea saca `password` a una variable y junta todo lo demás en un objeto nuevo:

   ```ts
   const { password: _password, ...publico } = usuario;
   return publico;
   ```

   `password: _password` renombra la variable; el guion bajo es la convención para "no la uso a propósito". `...publico` crea un objeto nuevo, así el original no se toca.

4. **Arma el resumen a mano.** Para quedarte con dos propiedades, lo más claro es escribirlas:

   ```ts
   return { id: usuario.id, nombre: usuario.nombre };
   ```

## Por qué funciona

Con `ana = { id: 1, nombre: "Ana", email: "ana@correo.com", password: "secreta123", rol: "cliente" }`:

| Expresión | Valor | Tipo |
|---|---|---|
| `_password` | `"secreta123"` | `string` (se descarta) |
| `publico` | `{ id: 1, nombre: "Ana", email: "ana@correo.com", rol: "cliente" }` | `Omit<Usuario, "password">` |
| `resumen(ana)` | `{ id: 1, nombre: "Ana" }` | `ResumenUsuario` (el `Pick`) |
| `ana` después | sin cambios, conserva su `password` | `Usuario` |

`"password" in publico` es `false` porque la propiedad nunca se copió. Y en los tipos, `datosPublicos(ana).password` da error: "La propiedad 'password' no existe en el tipo `Omit<Usuario, "password">`". Si alguien intenta mostrarla, TypeScript lo frena antes de ejecutar.

## Errores comunes

- **Devolver el mismo usuario con el tipo cambiado.** Compila, pero el `password` viaja dentro del objeto. Lo detecta el test "la propiedad password no existe".
- **Usar `delete usuario.password`.** Modifica el original (el test "no modifica el usuario original" falla) y además TypeScript se queja porque `password` no es opcional.
- **Poner `password: undefined` o `""`.** La propiedad sigue existiendo: `"password" in obj` es `true` y aparece en `Object.keys`.
- **Usar spread para el resumen** (`{ ...usuario }`): copia todo. Para quedarte con pocas propiedades, escríbelas.
- **Confundir `Pick` y `Omit`.** `Pick` = "me quedo con estas"; `Omit` = "todas menos estas". Elige el que te obligue a escribir menos nombres.

## Otra forma de resolverlo

**`datosPublicos` armado a mano**:

```ts
export function datosPublicos(usuario: Usuario): UsuarioPublico {
  return { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol };
}
```

Es explícito, pero si agregas un campo a `Usuario`, este código no lo copia (aunque TypeScript te avisaría porque falta en `UsuarioPublico`). La desestructuración con resto copia automáticamente todo menos lo que excluyes.

**`resumen` con desestructuración** en los parámetros: `export const resumen = ({ id, nombre }: Usuario): ResumenUsuario => ({ id, nombre });`. Es corto y muy común en React para las props.

En proyectos reales, este mismo patrón aparece en el backend: antes de responder con `res.json(usuario)`, se quita el `password` para no filtrarlo.

## Cómo explicarlo en la entrevista

> "Derivé los tipos del Usuario original: Omit para quitar password y Pick para quedarme con id y nombre, así si Usuario cambia, estos tipos se actualizan solos. Pero los tipos no existen en tiempo de ejecución, así que también limpio el valor: con desestructuración y resto saco password y devuelvo un objeto nuevo con lo demás, sin mutar el original. El resumen lo armo a mano con las dos propiedades. Con eso, intentar leer password de los datos públicos es un error de compilación."

## Conceptos

- **`Omit<T, K>`**: `T` sin las propiedades `K`.
- **`Pick<T, K>`**: `T` solo con las propiedades `K`.
- **Tipos derivados**: se calculan a partir de otro tipo y se mantienen sincronizados.
- **Borrado de tipos**: TypeScript no existe al ejecutar; los tipos no quitan propiedades de un objeto.
- **Desestructuración con resto (`const { a, ...resto } = obj`)**: separa propiedades y junta el resto en un objeto nuevo.
- **Operador `in`**: comprueba si una propiedad existe en un objeto.
- **Seguridad**: nunca enviar contraseñas al cliente ni mostrarlas.
- Repasa el tema de Aprender "TS: utility types" y, en la Referencia, la desestructuración de objetos.
