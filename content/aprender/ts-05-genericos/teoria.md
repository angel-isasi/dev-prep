## En una frase

Un genérico es un **tipo como parámetro** (`<T>`): escribes la función o el tipo una sola vez y TypeScript lo adapta al tipo con el que lo uses, sin perder información como pasaría con `any`.

## Lo esencial

### El problema que resuelven

Quieres una función que devuelva el primer elemento de **cualquier** array:

```ts
function primeroNum(lista: number[]): number | undefined { return lista[0]; }
function primeroTxt(lista: string[]): string | undefined { return lista[0]; }
// ...una por cada tipo: no escala

function primeroAny(lista: any[]): any { return lista[0]; }
const x = primeroAny(["a", "b"]); // x es any: perdiste el tipo, x.toFixed() compila y explota
```

Con un genérico, el tipo de salida **depende** del tipo de entrada:

```ts
function primero<T>(lista: T[]): T | undefined {
  return lista[0];
}

const a = primero([10, 20]);       // a: number | undefined
const b = primero(["Ana", "Luis"]); // b: string | undefined
b?.toUpperCase();                  // ok, TS sabe que es string
```

`T` es como una variable, pero de tipos. Al llamar la función, TypeScript **infiere** `T` mirando los argumentos. También puedes darlo explícito: `primero<number>([10, 20])`.

### Varios parámetros de tipo

```ts
function par<A, B>(a: A, b: B): [A, B] {
  return [a, b];
}
par("edad", 20); // [string, number]

function mapear<T, R>(lista: T[], fn: (x: T) => R): R[] {
  const res: R[] = [];
  for (const x of lista) res.push(fn(x));
  return res;
}
mapear([1, 2, 3], (n) => `#${n}`); // string[]
```

Así está tipado `Array.prototype.map` por dentro. Los nombres `T`, `U`, `K`, `V`, `R` son convención; puedes usar nombres largos como `TItem` si ayuda.

### Restricciones con extends

A veces `T` no puede ser **cualquier cosa**: necesitas que tenga cierta forma.

```ts
function masLargo<T>(a: T, b: T): T {
  return a.length >= b.length ? a : b; // error: La propiedad 'length' no existe en el tipo 'T'.
}

function masLargo2<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b; // ok: T tiene length seguro
}
masLargo2("hola", "sol");     // "hola" (string tiene length)
masLargo2([1, 2], [1, 2, 3]); // [1, 2, 3]
masLargo2(10, 20);            // error: number no tiene length
```

`T extends X` se lee "T puede ser cualquier tipo, **siempre que** cumpla X".

### keyof en restricciones

`keyof Tipo` da la unión de sus claves. Combinado con genéricos, permite leer propiedades de forma segura:

```ts
interface Producto { nombre: string; precio: number }
type Claves = keyof Producto; // "nombre" | "precio"

function obtener<T, K extends keyof T>(obj: T, clave: K): T[K] {
  return obj[clave];
}

const p: Producto = { nombre: "Café", precio: 6 };
obtener(p, "precio");  // number
obtener(p, "nombre");  // string
obtener(p, "stock");   // error: '"stock"' no se puede asignar a '"nombre" | "precio"'
```

`T[K]` es el tipo de la propiedad `K` dentro de `T` (como acceder a un objeto, pero con tipos). Este patrón aparece en funciones como `ordenarPor(lista, "precio")` o `agruparPor(lista, "categoria")`.

### Tipos e interfaces genéricas

No solo funciones: los tipos también pueden recibir parámetros.

```ts
interface Respuesta<T> {
  ok: boolean;
  datos: T;
}
const r1: Respuesta<string[]> = { ok: true, datos: ["a", "b"] };
const r2: Respuesta<{ id: number }> = { ok: true, datos: { id: 1 } };

type Caja<T> = { valor: T };

// Valor por defecto para el parámetro de tipo
type Paginado<T = string> = { items: T[]; pagina: number };
const pag: Paginado = { items: ["x"], pagina: 1 }; // T = string
```

Ya usaste genéricos sin saberlo: `Array<number>`, `Promise<string>`, `Record<string, number>` y `useState<number>()`.

## Errores típicos

**1. Usar `any` en lugar de un genérico**

```ts
function ultimo(lista: any[]): any { return lista.at(-1); }
```
El resultado es `any` y pierdes el tipo. Con `<T>(lista: T[]): T | undefined` lo conservas.

**2. Usar propiedades de `T` sin restricción**

```ts
function nombreDe<T>(x: T) { return x.nombre; } // error: 'nombre' no existe en 'T'
```
Restringe: `<T extends { nombre: string }>`.

**3. Genérico que no aporta nada**

```ts
function log<T>(x: T): void { console.log(x); }
```
Si `T` aparece una sola vez, no conecta nada; basta con `x: unknown`. Un genérico sirve cuando **relaciona** dos cosas (entrada con salida, o dos parámetros).

**4. Pasar una clave como string suelto**

```ts
function leer<T>(obj: T, clave: string) { return obj[clave]; } // error de índice
```
Usa `K extends keyof T` para que solo acepte claves reales.

**5. Forzar el tipo cuando la inferencia basta**

```ts
primero<number>([1, 2]); // funciona, pero sobra
```
Deja que TS infiera. Pásalo explícito solo cuando no hay de dónde deducirlo, como `useState<string | null>(null)`.

## Chuleta

```ts
function f<T>(x: T): T { ... }                       // T se infiere al llamar
function g<T, R>(xs: T[], fn: (x: T) => R): R[]      // dos parámetros de tipo
function h<T extends { id: number }>(x: T)           // restricción
function get<T, K extends keyof T>(o: T, k: K): T[K] // clave segura
interface Resp<T> { datos: T }                       // tipo genérico
type Pag<T = string> = { items: T[] }                // con valor por defecto
```

- `keyof T` = unión de claves. `T[K]` = tipo de esa propiedad.
- Si `T` aparece una sola vez, probablemente no necesitas genérico.

## En la entrevista

**¿Qué son los genéricos y para qué sirven?**
Son parámetros de tipo que permiten escribir funciones o tipos reutilizables que funcionan con distintos tipos sin perder la información. Por ejemplo, `primero<T>(lista: T[]): T` devuelve un number si le pasas números y un string si le pasas textos.

**¿En qué se diferencian de usar `any`?**
`any` apaga la revisión y el resultado queda sin tipo. Un genérico conserva y conecta los tipos: lo que entra determina lo que sale, y tsc sigue revisando.

**¿Qué hace `extends` en un genérico?**
Pone una restricción: `T extends { length: number }` acepta cualquier tipo que tenga `length`. Así puedes usar esa propiedad dentro de la función.

**¿Qué es `keyof` y cómo se usa con genéricos?**
`keyof T` es la unión de las claves de `T`. Con `K extends keyof T` una función solo acepta claves que existen en el objeto, y `T[K]` da el tipo exacto del valor.
