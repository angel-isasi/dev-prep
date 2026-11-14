## En una frase

Una **unión** (`A | B`) dice "puede ser esto o aquello", y el **narrowing** es cómo TypeScript va descartando opciones a medida que tu código hace comprobaciones (`if`, `switch`, `typeof`...), hasta saber exactamente qué tienes.

## Lo esencial

### Uniones

```ts
let id: string | number;
id = 42;      // ok
id = "A-42";  // ok
id = true;    // error: boolean no está en la unión

function mostrar(id: string | number) {
  id.toUpperCase(); // error: toUpperCase no existe en 'number'
}
```

Con una unión **solo puedes usar lo que tienen en común todos los tipos**. Para usar algo específico, primero tienes que acotar.

### Tipos literales

Un literal es un valor exacto usado como tipo. Unidos, sirven como una lista cerrada de opciones:

```ts
type Talla = "S" | "M" | "L";
type Estado = "pendiente" | "pagado" | "anulado";

let t: Talla = "M";
t = "XL"; // error: El tipo '"XL"' no se puede asignar al tipo 'Talla'.
```

Es como un enum, pero más simple. VS Code te autocompleta las opciones al escribir las comillas.

### Narrowing: acotar el tipo

Dentro de cada rama, TypeScript **sabe** qué tipo quedó:

```ts
// typeof: para primitivos (string, number, boolean, undefined, object, function)
function formatear(valor: string | number) {
  if (typeof valor === "string") {
    return valor.trim();      // aquí valor es string
  }
  return valor.toFixed(2);    // aquí ya solo puede ser number
}

// igualdad: comparar con un valor concreto
function largo(texto: string | null) {
  if (texto === null) return 0;
  return texto.length;        // aquí texto es string
}

// in: ¿el objeto tiene esta propiedad?
type Pez = { nadar: () => void };
type Ave = { volar: () => void };
function mover(animal: Pez | Ave) {
  if ("nadar" in animal) animal.nadar(); // Pez
  else animal.volar();                    // Ave
}

// instanceof: para clases (Date, Error, tus clases)
function aTexto(f: Date | string) {
  return f instanceof Date ? f.toISOString() : f;
}
```

Ojo: `typeof null` es `"object"`, así que `typeof x === "object"` no descarta `null`.

### Uniones discriminadas

El patrón más útil del tema: varios tipos de objeto que comparten una propiedad literal (el **discriminante**, normalmente `tipo` o `estado`):

```ts
type Respuesta =
  | { estado: "cargando" }
  | { estado: "ok"; datos: string[] }
  | { estado: "error"; mensaje: string };

function mostrar(r: Respuesta): string {
  switch (r.estado) {
    case "cargando":
      return "Cargando...";
    case "ok":
      return r.datos.join(", ");   // aquí TS sabe que existe datos
    case "error":
      return `Error: ${r.mensaje}`; // y aquí que existe mensaje
  }
}
```

Así es imposible escribir `r.datos` cuando el estado es `"error"`: tsc no te deja. Es la forma típica de modelar peticiones, acciones de un reducer o pasos de un formulario.

### never y exhaustividad

`never` es el tipo "vacío": **ningún valor** cabe ahí. Aparece cuando ya descartaste todas las opciones. Se usa para que tsc te avise si olvidaste un caso:

```ts
type Figura =
  | { tipo: "circulo"; radio: number }
  | { tipo: "cuadrado"; lado: number };

function area(f: Figura): number {
  switch (f.tipo) {
    case "circulo":
      return Math.PI * f.radio ** 2;
    case "cuadrado":
      return f.lado ** 2;
    default: {
      const imposible: never = f; // aquí f es never: ya no queda ninguna opción
      return imposible;
    }
  }
}
```

Si mañana alguien agrega `{ tipo: "triangulo"; ... }` a `Figura` y no lo maneja, la línea del `never` da error: "El tipo '{ tipo: "triangulo"; ... }' no se puede asignar al tipo 'never'". El compilador te muestra **todos** los lugares que hay que actualizar.

## Errores típicos

**1. Usar un método que no es común a toda la unión**

```ts
function f(x: string | string[]) {
  return x.toUpperCase(); // error: no existe en string[]
}
```
Acota primero: `if (typeof x === "string") ... else ...` o `Array.isArray(x)`.

**2. Usar `typeof` con arrays o null**

```ts
if (typeof x === "array") {} // nunca es verdad: typeof de un array es "object"
if (typeof x === "object") { x.a } // x aún puede ser null
```
Usa `Array.isArray(x)` y compara `x !== null`.

**3. Perder el literal con `let`**

```ts
let talla = "M";              // tipo string, no "M"
const t: Talla = talla;       // error: string no es asignable a Talla
```
Anota: `let talla: Talla = "M";` o usa `const`.

**4. Discriminante sin literal**

```ts
type A = { tipo: string; x: number };
type B = { tipo: string; y: number };
```
Si `tipo` es `string`, el `switch` no puede distinguir. El discriminante debe ser un **literal**: `tipo: "a"` y `tipo: "b"`.

**5. Olvidar un caso del switch**

Sin la comprobación con `never`, un caso nuevo cae al vacío y la función devuelve `undefined` sin aviso. Agrega el `default` con `never` en los switch sobre uniones.

## Chuleta

| Comprobación | Sirve para |
|---|---|
| `typeof x === "string"` | Primitivos |
| `x === null` / `x !== undefined` | Quitar null o undefined |
| `Array.isArray(x)` | Arrays |
| `"prop" in x` | Objetos con distinta forma |
| `x instanceof Date` | Instancias de una clase |
| `switch (x.tipo)` | Uniones discriminadas |
| `const n: never = x` | Comprobar que no falta ningún caso |

```ts
type Estado = "a" | "b";                     // literales
type R = { tipo: "ok"; v: number } | { tipo: "error"; msg: string };
```

## En la entrevista

**¿Qué es una unión en TypeScript?**
Un tipo que acepta uno de varios tipos, como `string | number`. Solo puedes usar lo que tienen en común hasta que acotas el tipo con una comprobación.

**¿Qué es el narrowing?**
Es cómo TypeScript reduce una unión a un tipo más concreto según las comprobaciones del código: `typeof`, `instanceof`, `in`, comparaciones de igualdad o un `switch` sobre una propiedad.

**¿Qué es una unión discriminada?**
Una unión de objetos que comparten una propiedad con un valor literal distinto en cada uno, como `estado: "ok"` o `estado: "error"`. Al revisar esa propiedad, TypeScript sabe exactamente cuál de los objetos tienes y qué propiedades existen.

**¿Para qué sirve `never`?**
Representa un valor que no puede existir. Se usa para comprobar exhaustividad: si asignas a `never` el valor en el `default` de un switch, tsc avisa cuando aparece un caso nuevo sin manejar.
