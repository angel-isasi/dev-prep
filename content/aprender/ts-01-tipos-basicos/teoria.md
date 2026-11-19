## En una frase

TypeScript es **JavaScript con tipos**: tú dices qué forma tienen tus datos y el compilador (`tsc`) te avisa de los errores **antes de ejecutar**; al final los tipos se borran y queda JavaScript normal.

## Lo esencial

### Por qué existe

En JavaScript muchos errores aparecen recién cuando el código corre (o peor, cuando lo usa un cliente):

```js
function precioConIgv(precio) {
  return precio * 1.18;
}
precioConIgv("100"); // 118 (JS convierte el texto, a veces "funciona")
precioConIgv();      // NaN, y nadie se entera hasta que se ve en pantalla
```

Con TypeScript el mismo error se ve **mientras escribes**:

```ts
function precioConIgv(precio: number): number {
  return precio * 1.18;
}
precioConIgv("100");
// solucion.ts, línea 4: No se puede asignar un argumento de tipo "string" al parámetro de tipo "number".
```

Así se ve un error de `tsc` en la app: archivo, línea y un mensaje que casi siempre dice "no se puede asignar X a Y". Léelo así: **qué le diste** (X) y **qué esperaba** (Y). En la terminal o en VS Code verás además un código como `TS2345` (y el mensaje puede salir en inglés: "Argument of type 'string' is not assignable to parameter of type 'number'").

En dev-prep, después de los tests aparece el caso **"Tus tipos compilan sin errores (tsc)"**: revisa tus tipos en modo estricto. VS Code además los subraya en rojo mientras escribes (pasa el mouse encima para leer el mensaje).

### Anotaciones e inferencia

Una **anotación** es `: tipo` después del nombre. Pero no hace falta anotar todo: TypeScript **infiere** el tipo a partir del valor.

```ts
let nombre: string = "Ana";   // anotado (redundante)
let edad = 20;                // inferido: number
edad = "veinte";              // error: El tipo 'string' no se puede asignar al tipo 'number'.

const ciudad = "Lima";        // tipo: "Lima" (const no cambia, el tipo es el valor exacto)
```

Regla práctica: **anota los parámetros de las funciones** (ahí no hay de dónde inferir) y deja que infiera las variables con valor inicial.

### Tipos primitivos

```ts
const texto: string = "hola";
const cantidad: number = 3.5;      // enteros y decimales son number
const activo: boolean = true;
const nada: null = null;
const sinDefinir: undefined = undefined;

let apodo: string | null = null;   // "texto o null" (las uniones se ven en el tema 3)
apodo = "Lucho";
```

En modo estricto, `null` y `undefined` **no** caben en un `string`: tienes que decirlo con `| null`. Esto atrapa el clásico "Cannot read properties of null".

### Arrays y tuplas

```ts
const notas: number[] = [14, 17, 12];      // array de números
const nombres: Array<string> = ["Ana"];    // misma cosa, otra forma de escribirlo
notas.push("veinte");                      // error: string no es number

const punto: [number, number] = [3, 4];    // tupla: largo y tipo por posición fijos
const fila: [string, number] = ["Ana", 17];
const malo: [string, number] = [17, "Ana"]; // error: el orden importa
```

Una tupla es un array donde **cada posición tiene su tipo**. La ves en `useState`: devuelve `[valor, setValor]`.

### any vs unknown

```ts
let a: any = JSON.parse('{"x": 1}');
a.loQueSea.otraCosa();  // tsc no se queja... y explota al ejecutar

let u: unknown = JSON.parse('{"x": 1}');
u.x;                    // error: "u" es de tipo "unknown".
if (typeof u === "number") {
  u.toFixed(2);         // aquí sí: ya comprobaste que es number
}
```

- `any` **apaga** TypeScript para esa variable: todo vale. Evítalo.
- `unknown` dice "no sé qué es, **compruébalo antes de usarlo**". Es la opción segura para datos externos (JSON, respuestas de API, `catch`).

### Los tipos desaparecen

```ts
// precio.ts (lo que escribes)
function precioConIgv(precio: number): number {
  return precio * 1.18;
}
```
```js
// precio.js (lo que genera tsc o Vite)
function precioConIgv(precio) {
  return precio * 1.18;
}
```

El navegador y Node ejecutan JavaScript. Por eso los tipos **no validan nada en tiempo de ejecución**: si un dato llega mal de una API, TypeScript no lo detiene; tienes que comprobarlo tú.

## Errores típicos

**1. Usar `any` para "que deje de quejarse"**

```ts
function primerPrecio(items: any) {
  return items[0].precio.toFixed(2);
}
```
Compila, pero perdiste toda la ayuda. Describe el tipo real (`{ precio: number }[]`) o usa `unknown` y comprueba.

**2. Anotar con mayúscula**

```ts
let nombre: String = "Ana"; // funciona, pero es el objeto envoltorio
```
Usa siempre los tipos en minúscula: `string`, `number`, `boolean`.

**3. Olvidar que un valor puede ser `null`**

```ts
const boton = document.querySelector("button"); // HTMLButtonElement | null
boton.addEventListener("click", () => {});      // error: "boton" es posiblemente "null".
```
Comprueba antes: `if (boton) { ... }` o `boton?.addEventListener(...)`.

**4. Creer que TypeScript valida en tiempo de ejecución**

```ts
const datos: { edad: number } = await respuesta.json(); // tsc te cree
datos.edad.toFixed(); // si la API mandó "20", explota igual
```
Los tipos se borran al compilar. Para datos externos, valida tú.

**5. Anotar todo, incluso lo obvio**

```ts
const total: number = 0;
const nombres: string[] = ["Ana", "Luis"];
```
No es error, pero ensucia. Deja inferir y anota parámetros y retornos.

## Chuleta

| Escribes | Significa |
|---|---|
| `x: string` / `number` / `boolean` | Primitivos |
| `x: null` / `undefined` | Solo ese valor |
| `x: string \| null` | Texto o null |
| `x: number[]` o `Array<number>` | Array de números |
| `x: [string, number]` | Tupla: posición 0 string, posición 1 number |
| `x: any` | Sin revisión (evitar) |
| `x: unknown` | Desconocido: compruébalo antes de usarlo |
| `function f(a: number): string` | Parámetro number, devuelve string |

- Anota parámetros, deja inferir variables.
- `tsc` revisa; Vite y Node ejecutan el JS sin tipos.
- Modo estricto: `null` y `undefined` hay que declararlos.

## En la entrevista

**¿Qué es TypeScript y qué ventajas tiene?**
Es un superconjunto de JavaScript que agrega tipos estáticos. Detecta errores antes de ejecutar, da autocompletado y hace más seguro refactorizar; al compilar se convierte en JavaScript normal.

**¿Qué diferencia hay entre `any` y `unknown`?**
Con `any` TypeScript deja de revisar y permite cualquier operación. Con `unknown` no puedes usar el valor hasta comprobar su tipo con `typeof`, `instanceof` u otra verificación, así que es la opción segura.

**¿TypeScript valida los datos en tiempo de ejecución?**
No. Los tipos se borran al compilar; solo existen para el compilador y el editor. Los datos que vienen de fuera (APIs, formularios) hay que validarlos con código.

**¿Qué es la inferencia de tipos?**
Es que TypeScript deduce el tipo a partir del valor, por ejemplo `let edad = 20` es `number` sin anotarlo. Por eso solo se anota donde no hay de dónde deducir, como los parámetros.

**¿Qué es una tupla?**
Un array de largo fijo donde cada posición tiene su propio tipo, como `[string, number]`. `useState` devuelve una tupla `[valor, setValor]`.
