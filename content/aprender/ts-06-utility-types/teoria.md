## En una frase

Los utility types son **genéricos que ya vienen con TypeScript** para transformar un tipo en otro (hacerlo opcional, quitarle campos, quedarte con algunos), así tienes **una sola fuente de verdad** y no copias el mismo tipo cinco veces.

## Lo esencial

Todos los ejemplos parten de este tipo:

```ts
interface Usuario {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
}
```

### Partial y Required

```ts
type UsuarioParcial = Partial<Usuario>;
// { id?: number; nombre?: string; email?: string; telefono?: string }

function actualizar(u: Usuario, cambios: Partial<Usuario>): Usuario {
  return { ...u, ...cambios };
}
actualizar(ana, { email: "nuevo@mail.pe" }); // solo mandas lo que cambia

type UsuarioCompleto = Required<Usuario>;
// todas obligatorias, incluso telefono
```

`Partial` es perfecto para formularios de edición y funciones de "actualizar". `Required` hace lo contrario.

### Pick y Omit

```ts
type Contacto = Pick<Usuario, "nombre" | "email">;
// { nombre: string; email: string }

type NuevoUsuario = Omit<Usuario, "id">;
// { nombre: string; email: string; telefono?: string }

function crear(datos: NuevoUsuario): Usuario {
  return { id: Date.now(), ...datos }; // el id lo pone el sistema, no quien llama
}
```

- `Pick` = **quedarte** con algunas claves.
- `Omit` = **quitar** algunas claves.

Si mañana agregas `direccion` a `Usuario`, `NuevoUsuario` la incluye solo. Esa es la gracia: no repites.

### Record

Ya lo viste en el tema 2: un objeto con claves de un tipo y valores de otro.

```ts
type Rol = "admin" | "editor" | "lector";
const permisos: Record<Rol, string[]> = {
  admin: ["leer", "escribir", "borrar"],
  editor: ["leer", "escribir"],
  lector: ["leer"],
}; // si falta un rol, tsc avisa
```

### keyof y typeof

`keyof` da la unión de las **claves de un tipo**. `typeof` (usado en una posición de tipo) da el **tipo de una variable**:

```ts
type ClavesUsuario = keyof Usuario; // "id" | "nombre" | "email" | "telefono"

const config = { tema: "oscuro", tamanoFuente: 14 };
type Config = typeof config;        // { tema: string; tamanoFuente: number }
type ClavesConfig = keyof typeof config; // "tema" | "tamanoFuente"
```

Ojo: `typeof` en una línea de código normal es el de JavaScript (`typeof x === "string"`); después de `type X =` o de `:` es el de TypeScript.

### ReturnType y Parameters

Sacan tipos **de una función**. Se combinan con `typeof` porque reciben un tipo, no la función:

```ts
function crearPedido(cliente: string, total: number) {
  return { id: 1, cliente, total, estado: "nuevo" as const };
}

type Pedido = ReturnType<typeof crearPedido>;
// { id: number; cliente: string; total: number; estado: "nuevo" }

type ArgsPedido = Parameters<typeof crearPedido>;
// [cliente: string, total: number]  (una tupla)
```

Útil cuando una librería no exporta el tipo de lo que devuelve una función.

### as const

Le dice a TypeScript: "este valor no va a cambiar, dame el tipo **más exacto** posible y hazlo `readonly`".

```ts
const roles = ["admin", "editor", "lector"];
// string[]

const roles2 = ["admin", "editor", "lector"] as const;
// readonly ["admin", "editor", "lector"]

type Rol = (typeof roles2)[number];
// "admin" | "editor" | "lector"
```

El truco `(typeof arr)[number]` (el tipo de "cualquier posición" del array) convierte una lista de valores en una unión. Así la lista existe en JavaScript (para hacer un `<select>`, por ejemplo) y el tipo sale de ella, sin escribirlo dos veces.

```ts
const COLORES = { exito: "#2e7d32", error: "#c62828" } as const;
type Color = keyof typeof COLORES; // "exito" | "error"
```

## Errores típicos

**1. Copiar el tipo en vez de derivarlo**

```ts
interface NuevoUsuario { nombre: string; email: string; telefono?: string }
```
Funciona, pero cuando cambie `Usuario` te vas a olvidar de este. Usa `Omit<Usuario, "id">`.

**2. Pasar la función en vez de su tipo**

```ts
type R = ReturnType<crearPedido>; // error: "crearPedido" hace referencia a un valor, pero aquí se usa como tipo. ¿Quiso decir "typeof crearPedido"?
```
Necesitas `ReturnType<typeof crearPedido>`.

**3. Esperar que `Partial` sea profundo**

```ts
type P = Partial<{ direccion: { calle: string; distrito: string } }>;
const x: P = { direccion: { calle: "Av. Lima" } }; // error: falta distrito
```
`Partial` solo afecta el primer nivel.

**4. Olvidar `as const` y obtener `string`**

```ts
const estados = ["activo", "inactivo"];
type Estado = (typeof estados)[number]; // string, no la unión
```
Sin `as const`, TypeScript infiere `string[]`.

**5. Escribir mal una clave en Pick u Omit**

```ts
type X = Pick<Usuario, "correo">; // error: "correo" no es una clave de Usuario
type Y = Omit<Usuario, "correo">; // NO da error: Omit acepta cualquier string
```
Con `Omit`, un error de tipeo pasa silencioso. Revisa bien los nombres.

## Chuleta

| Utility | Resultado |
|---|---|
| `Partial<T>` | Todas las propiedades opcionales |
| `Required<T>` | Todas obligatorias |
| `Readonly<T>` | Todas `readonly` |
| `Pick<T, "a" \| "b">` | Solo esas claves |
| `Omit<T, "a">` | Todas menos esas |
| `Record<K, V>` | Objeto con claves K y valores V |
| `ReturnType<typeof f>` | Lo que devuelve `f` |
| `Parameters<typeof f>` | Tupla con los parámetros de `f` |
| `keyof T` | Unión de claves de T |
| `typeof x` | Tipo de la variable x |
| `x as const` | Literales exactos y readonly |
| `(typeof arr)[number]` | Unión de los elementos de un array `as const` |

## En la entrevista

**¿Qué son los utility types?**
Son tipos genéricos que trae TypeScript para transformar otros tipos, como `Partial`, `Pick` u `Omit`. Evitan duplicar definiciones: el tipo base es la única fuente de verdad.

**¿Diferencia entre `Pick` y `Omit`?**
`Pick<T, K>` se queda solo con las claves indicadas; `Omit<T, K>` copia todas menos esas. Por ejemplo, `Omit<Usuario, "id">` para los datos de un usuario nuevo.

**¿Cuándo usarías `Partial`?**
Para actualizaciones parciales: una función `actualizar(id, cambios: Partial<Usuario>)` acepta cualquier subconjunto de campos. También para el estado inicial de un formulario.

**¿Qué hace `as const`?**
Hace que TypeScript infiera el tipo más literal posible y lo marque como `readonly`. Con un array, `(typeof arr)[number]` da la unión de sus valores.

**¿Qué diferencia hay entre `keyof` y `typeof`?**
`keyof` toma un tipo y devuelve la unión de sus claves. `typeof`, en posición de tipo, toma una variable y devuelve su tipo. Se combinan como `keyof typeof objeto`.
