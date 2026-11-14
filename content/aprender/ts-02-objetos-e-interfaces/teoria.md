## En una frase

Con `interface` o `type` le pones **nombre a la forma de un objeto** (qué propiedades tiene y de qué tipo), y TypeScript revisa que cada objeto cumpla esa forma: ni le falte nada ni tenga propiedades inventadas.

## Lo esencial

### Describir un objeto

```ts
interface Usuario {
  id: number;
  nombre: string;
  email: string;
}

const ana: Usuario = { id: 1, nombre: "Ana", email: "ana@mail.pe" };

const luis: Usuario = { id: 2, nombre: "Luis" };
// error: La propiedad "email" falta en el tipo "{ id: number; nombre: string; }", pero es obligatoria en el tipo "Usuario".

const rosa: Usuario = { id: 3, nombre: "Rosa", email: "r@mail.pe", edad: 20 };
// error: El literal de objeto solo puede especificar propiedades conocidas y 'edad' no existe en el tipo 'Usuario'.
```

Una vez que tienes el tipo, lo usas en funciones y el editor te autocompleta las propiedades:

```ts
function saludar(u: Usuario): string {
  return `Hola, ${u.nombre}`; // al escribir "u." VS Code te muestra id, nombre, email
}
```

### interface vs type

Las dos formas sirven para objetos:

```ts
interface Producto {
  nombre: string;
  precio: number;
}

type Producto2 = {
  nombre: string;
  precio: number;
};
```

| | `interface` | `type` |
|---|---|---|
| Objetos | Sí | Sí |
| Uniones (`"a" \| "b"`), tuplas, primitivos | No | **Sí** |
| Extender | `interface B extends A { }` | `type B = A & { }` |
| Se puede reabrir (declararla dos veces y se fusiona) | Sí | No |

Regla simple: **`interface` para objetos** (sobre todo los que otros podrían extender) y **`type` para todo lo demás** (uniones, tuplas, alias). Muchos equipos usan solo `type`; lo importante es ser consistente.

```ts
interface Persona { nombre: string }
interface Empleado extends Persona { sueldo: number }   // tiene nombre y sueldo

type Animal = { nombre: string };
type Perro = Animal & { raza: string };                 // intersección: ambas cosas
```

### Opcionales y readonly

```ts
interface Perfil {
  readonly id: number;   // no se puede cambiar después de crear el objeto
  nombre: string;
  telefono?: string;     // opcional: puede no estar (su tipo es string | undefined)
}

const p: Perfil = { id: 1, nombre: "Ana" }; // ok sin telefono
p.id = 2;                                   // error: No se puede asignar a "id" porque es una propiedad de solo lectura.
p.telefono.length;                          // error: "p.telefono" es posiblemente "undefined".
p.telefono?.length;                         // ok: undefined si no hay teléfono
```

`readonly` solo lo revisa tsc: en tiempo de ejecución el objeto se puede cambiar igual. Para arrays existe `readonly string[]` (no deja usar `push` ni `sort`).

### Objetos anidados

Puedes escribir el objeto interno en línea o, mejor, darle su propio nombre:

```ts
interface Direccion {
  calle: string;
  distrito: string;
}

interface Cliente {
  nombre: string;
  direccion: Direccion;         // un objeto dentro de otro
  pedidos: { id: number; total: number }[]; // array de objetos en línea
}

const c: Cliente = {
  nombre: "Ana",
  direccion: { calle: "Av. Arequipa 123", distrito: "Lince" },
  pedidos: [{ id: 1, total: 45.5 }],
};
```

### Firmas de índice y Record

Cuando **no conoces los nombres de las claves** de antemano (un diccionario), usas una firma de índice:

```ts
interface Stock {
  [producto: string]: number;   // cualquier clave string, valor number
}
const stock: Stock = { manzana: 10, pera: 4 };
stock.platano = 7;              // ok
stock.kiwi = "muchos";          // error: string no es number
```

`Record<Clave, Valor>` es lo mismo, más corto, y además acepta un conjunto fijo de claves:

```ts
const precios: Record<string, number> = { cafe: 6, te: 4 };

type Dia = "lun" | "mar" | "mie";
const horas: Record<Dia, number> = { lun: 8, mar: 6, mie: 7 }; // obliga a tener las 3
```

## Errores típicos

**1. Agregar una propiedad que el tipo no tiene**

```ts
const u: Usuario = { id: 1, nombre: "Ana", email: "a@a.pe", rol: "admin" };
// error: 'rol' no existe en el tipo 'Usuario'
```
Si de verdad la necesitas, agrégala al tipo (opcional si no siempre está).

**2. Usar una opcional sin comprobarla**

```ts
function largo(p: Perfil) {
  return p.telefono.length; // error: es posiblemente "undefined"
}
```
Usa `p.telefono?.length ?? 0` o un `if (p.telefono)`.

**3. Creer que `readonly` congela el objeto**

```ts
const p: Perfil = { id: 1, nombre: "Ana" };
(p as any).id = 9; // en ejecución cambia sin problema
```
`readonly` es una regla de tsc, no de JavaScript. Para congelar de verdad: `Object.freeze`.

**4. Intentar una unión con interface**

```ts
interface Estado = "activo" | "inactivo"; // error de sintaxis
```
Las uniones solo se escriben con `type`: `type Estado = "activo" | "inactivo";`.

**5. Firma de índice que choca con otras propiedades**

```ts
interface Config {
  [clave: string]: number;
  nombre: string; // error: La propiedad "nombre" de tipo "string" no se puede asignar al tipo de índice "string" "number".
}
```
Todas las propiedades deben encajar con el tipo del índice. Usa `number | string` o separa el diccionario en su propia propiedad.

## Chuleta

```ts
interface A { x: number; y?: string; readonly id: number }
interface B extends A { z: boolean }
type C = { x: number };
type D = C & { w: string };          // intersección
type Estado = "on" | "off";          // solo con type
interface Dic { [clave: string]: number }
type Dic2 = Record<string, number>;
type PorDia = Record<"lun" | "mar", number>;
```

- `?` = opcional (`T | undefined`). `readonly` = no reasignar.
- `interface` para objetos, `type` para uniones, tuplas y alias.
- Tipos con nombre en **PascalCase**: `Usuario`, `Pedido`.

## En la entrevista

**¿Cuál es la diferencia entre `interface` y `type`?**
Las dos describen objetos. `type` además puede representar uniones, tuplas y primitivos; `interface` se puede extender con `extends` y se fusiona si se declara dos veces. Uso `interface` para formas de objetos y `type` para uniones y alias.

**¿Qué significa el `?` en una propiedad?**
Que es opcional: el objeto puede no tenerla, así que su tipo es `T | undefined` y hay que comprobarla antes de usarla.

**¿Qué hace `readonly`?**
Hace que tsc marque error si intentas reasignar esa propiedad. No tiene efecto en tiempo de ejecución; para eso existe `Object.freeze`.

**¿Cómo tipas un objeto que funciona como diccionario?**
Con una firma de índice `{ [clave: string]: number }` o con `Record<string, number>`. Si las claves son un conjunto conocido, `Record<"a" | "b", number>` obliga a que estén todas.
