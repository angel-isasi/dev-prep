## En una frase

Tipar una función es decir **qué recibe y qué devuelve**: así tsc revisa cada llamada (argumentos de más, de menos o del tipo equivocado) y cada `return` dentro de la función.

## Lo esencial

### Parámetros y retorno

```ts
function sumar(a: number, b: number): number {
  return a + b;
}

const restar = (a: number, b: number): number => a - b;

sumar(1, 2);     // 3
sumar(1);        // error: Se esperaban 2 argumentos, pero se obtuvieron 1.
sumar(1, 2, 3);  // error: Se esperaban 2 argumentos, pero se obtuvieron 3.
```

En JavaScript, llamar con argumentos de menos da `undefined` sin aviso; en TypeScript es un error.

El tipo de retorno se puede inferir, pero **anotarlo** tiene una ventaja: si te olvidas un `return` en alguna rama, el error aparece en la función y no en quien la usa.

```ts
function categoria(edad: number): string {
  if (edad >= 18) return "adulto";
  // error: Falta la instrucción "return" final en la función y el tipo de valor devuelto no incluye 'undefined'.
}
```

### Opcionales y por defecto

```ts
function saludar(nombre: string, titulo?: string): string {
  return titulo ? `Hola, ${titulo} ${nombre}` : `Hola, ${nombre}`;
}
saludar("Ana");          // "Hola, Ana"
saludar("Ana", "Ing.");  // "Hola, Ing. Ana"

function precioFinal(precio: number, igv = 0.18): number { // igv se infiere number
  return precio * (1 + igv);
}
precioFinal(100);        // 118
precioFinal(100, 0);     // 100
```

- `titulo?: string` es `string | undefined` dentro de la función.
- Los opcionales van **al final**: no puede haber un obligatorio después de uno opcional.
- Con valor por defecto ya no hace falta `?`: el tipo se infiere del valor.

### Parámetros rest y objetos como parámetro

```ts
function promedio(...notas: number[]): number {
  return notas.reduce((s, n) => s + n, 0) / notas.length;
}
promedio(14, 16, 18); // 16

// Destructuring: el tipo va después de todo el patrón
function crearUsuario({ nombre, edad }: { nombre: string; edad: number }) {
  return `${nombre} (${edad})`;
}
```

### Tipos de función y callbacks

Una función también tiene tipo. Se escribe como una flecha: `(parámetros) => retorno`.

```ts
type Operacion = (a: number, b: number) => number;

const multiplicar: Operacion = (a, b) => a * b; // a y b se infieren number

function aplicar(lista: number[], fn: (n: number) => number): number[] {
  return lista.map(fn);
}
aplicar([1, 2, 3], (n) => n * 10);   // [10, 20, 30]
aplicar([1, 2, 3], (n) => `${n}`);   // error: string no es asignable a number
```

Cuando pasas un callback, **no hace falta tipar sus parámetros**: TypeScript los deduce del lugar donde lo usas (por eso `arr.map((x) => ...)` ya sabe qué es `x`).

### void

`void` significa "esta función no devuelve nada útil":

```ts
function registrar(mensaje: string): void {
  console.log(mensaje);
}

type AlHacerClic = () => void;
```

Detalle curioso: un callback de tipo `() => void` **puede** devolver algo; simplemente se ignora. Por eso `[1, 2].forEach((n) => lista.push(n))` compila aunque `push` devuelva un número.

### Type guards: `x is T`

A veces la comprobación es más compleja que un `typeof`. Puedes escribir **tu propia función de narrowing** cambiando el retorno `boolean` por `parametro is Tipo`:

```ts
interface Usuario { nombre: string; email: string }

function esUsuario(x: unknown): x is Usuario {
  return (
    typeof x === "object" &&
    x !== null &&
    "nombre" in x && typeof x.nombre === "string" &&
    "email" in x && typeof x.email === "string"
  );
}

const dato: unknown = JSON.parse('{"nombre":"Ana","email":"a@a.pe"}');
if (esUsuario(dato)) {
  dato.email; // aquí dato es Usuario
}

const mezcla = [1, null, 2, null];
const nums = mezcla.filter((x): x is number => x !== null); // number[]
```

Ojo: TypeScript **confía** en tu guard. Si la comprobación de adentro está mal, el tipo mentirá.

## Errores típicos

**1. Parámetros sin tipo**

```ts
function doble(n) { return n * 2; }
// error en modo estricto: El parámetro 'n' tiene un tipo 'any' implícitamente.
```
En modo estricto los parámetros sin tipo son error. Anótalos.

**2. Opcional antes que obligatorio**

```ts
function f(a?: number, b: number) {}
// error: Un parámetro obligatorio no puede seguir a un parámetro opcional.
```
Pon los opcionales al final, o usa un objeto como parámetro.

**3. Usar un opcional como si siempre existiera**

```ts
function f(limite?: number) {
  return limite.toFixed(0); // error: "limite" es posiblemente "undefined".
}
```
Dale un valor por defecto: `limite = 10`.

**4. Confundir el tipo de función con la función**

```ts
type Fn = (n: number) => number;
const doble: Fn = (n: number): number => { n * 2 }; // error: no devuelve nada
```
Con llaves hace falta `return`. Sin llaves (`(n) => n * 2`) el retorno es implícito.

**5. Un type guard que devuelve boolean**

```ts
function esTexto(x: unknown): boolean { return typeof x === "string"; }
if (esTexto(v)) v.trim(); // error: v sigue siendo unknown
```
Para que acote, el retorno debe ser `x is string`.

## Chuleta

```ts
function f(a: number, b = 2, c?: string): string { ... }
const g = (a: number): number => a * 2;
function h(...xs: number[]): void { ... }
type Fn = (a: number, b: number) => number;
function usar(cb: (x: string) => void) { ... }
function esX(v: unknown): v is X { ... }
```

- Anota los parámetros siempre; el retorno, cuando la función es pública o tiene varias ramas.
- `?` y valores por defecto: siempre al final.
- Callbacks: sus parámetros se infieren.

## En la entrevista

**¿Qué es `void` y en qué se diferencia de `undefined`?**
`void` indica que una función no devuelve un valor útil y que quien la llama no debe usar su retorno. `undefined` es un valor concreto. En un tipo de callback `() => void`, la función puede devolver algo y simplemente se ignora.

**¿Cómo tipas un callback?**
Con un tipo de función: `(valor: string) => void`. Puede ir en línea en el parámetro o en un alias con `type`. Al pasar una función flecha, sus parámetros se infieren de ese tipo.

**¿Qué es un type guard?**
Una función cuyo retorno es `parametro is Tipo`. Si devuelve `true`, TypeScript trata el valor como ese tipo en la rama del `if`. Sirve para validar datos `unknown`, por ejemplo lo que llega de una API.

**¿Diferencia entre parámetro opcional y con valor por defecto?**
El opcional (`x?: T`) vale `undefined` si no se pasa y hay que comprobarlo. El parámetro con valor por defecto (`x = 10`) siempre tiene valor dentro de la función.
