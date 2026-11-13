## En una frase

Una variable es un nombre que apunta a un valor: usa `const` por defecto y `let` si la vas a reasignar; cada valor es un **primitivo** (se copia) o un **objeto** (se comparte), y JavaScript los convierte entre tipos más de lo que esperas.

## Lo esencial

### let, const y var

| | `const` | `let` | `var` |
|---|---|---|---|
| ¿Se puede reasignar? | no | sí | sí |
| Ámbito | bloque `{ }` | bloque `{ }` | función |
| ¿Usarla antes de declararla? | `ReferenceError` | `ReferenceError` | da `undefined` |
| ¿Usarla hoy? | por defecto | si reasignas | no |

```js
const pi = 3.14;
pi = 3;                     // TypeError: Assignment to constant variable.

const usuario = { nombre: "Ana" };
usuario.nombre = "Rosa";    // permitido: cambias el contenido, no la variable

if (true) {
  var a = 1;
  let b = 2;
}
console.log(a);             // 1  (var ignora el bloque)
console.log(b);             // ReferenceError: b is not defined
```

### Primitivos vs objetos

Hay 7 primitivos: `string`, `number`, `boolean`, `undefined`, `null`, `bigint` y `symbol`. Todo lo demás (arrays, funciones, fechas, `{}`) es un **objeto**.

```js
let x = 5;
let y = x;      // copia el valor
y = 10;
console.log(x); // 5

const lista = [1, 2];
const otra = lista;   // copia la referencia: es el MISMO array
otra.push(3);
console.log(lista);   // [1, 2, 3]

console.log([1] === [1]); // false: son dos arrays distintos en memoria
```

### typeof

| Expresión | Resultado |
|---|---|
| `typeof "hola"` | `"string"` |
| `typeof 42`, `typeof NaN` | `"number"` |
| `typeof true` | `"boolean"` |
| `typeof undefined` | `"undefined"` |
| `typeof null` | `"object"` (error histórico) |
| `typeof [1, 2]`, `typeof {}` | `"object"` |
| `typeof function () {}` | `"function"` |

Para arrays usa `Array.isArray(valor)`; para `null`, `valor === null`.

### null vs undefined

- `undefined`: "no tiene valor todavía". Es lo que da una variable sin asignar, una propiedad que no existe o una función sin `return`.
- `null`: "vacío a propósito". Lo pones tú.

```js
let edad;
console.log(edad);          // undefined
console.log({}.nombre);     // undefined
let seleccionado = null;    // aún no hay nada seleccionado, a propósito
```

### Coerción, == y ===

JavaScript convierte tipos solo. El `+` con un string **concatena**; `-`, `*` y `/` convierten a número.

```js
"5" + 1        // "51"
"5" - 1        // 4
"5" * "2"      // 10
true + 1       // 2
Number("")     // 0
Number("12px") // NaN
```

`===` compara valor **y** tipo, sin convertir. `==` convierte antes de comparar y tiene reglas raras.

```js
"5" === 5           // false
"5" == 5            // true
0 == ""             // true
null == undefined   // true
null === undefined  // false
NaN === NaN         // false  (usa Number.isNaN)
```

### Truthy y falsy

En un `if`, todo valor se convierte a booleano. Hay **8 falsy**: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined` y `NaN`. Todo lo demás es truthy, incluidos `"0"`, `"false"`, `" "`, `[]` y `{}`.

```js
if ([]) console.log("sí");   // "sí": un array vacío es truthy
Boolean("0")                 // true
!!0                          // false
```

### Template literals

```js
const nombre = "Ana";
const edad = 20;
`Hola, ${nombre}. El próximo año tendrás ${edad + 1}.`
// "Hola, Ana. El próximo año tendrás 21."
```

Van con comillas invertidas, aceptan cualquier expresión dentro de `${}` y permiten varias líneas.

## Errores típicos

1. **Creer que `const` hace el valor inmutable.**
   ```js
   const carrito = [];
   carrito.push("polo");   // funciona: const impide reasignar, no modificar
   ```
   Para que el contenido no cambie, necesitas `Object.freeze` o no mutarlo.

2. **Usar `let` antes de declararla.**
   ```js
   console.log(total);  // ReferenceError: Cannot access 'total' before initialization
   let total = 10;
   ```
   Entre el inicio del bloque y la declaración, la variable está en la "zona muerta temporal" (TDZ). Con `var` daría `undefined`, que es peor porque no avisa.

3. **Sumar lo que viene de un input.**
   ```js
   const cantidad = input.value;  // "2", siempre es string
   cantidad + 1;                  // "21"
   ```
   Convierte primero: `Number(input.value) + 1`.

4. **Comparar con `==`.**
   ```js
   0 == ""        // true
   [] == false    // true, aunque [] es truthy
   ```
   Usa siempre `===`. La única excepción aceptada es `x == null`, que atrapa `null` y `undefined` a la vez.

5. **Detectar `NaN` con `===`.**
   ```js
   const n = Number("abc");
   n === NaN;          // false, siempre
   Number.isNaN(n);    // true
   ```

6. **Copiar un objeto con `=` y modificar la "copia".**
   ```js
   const original = { puntos: 10 };
   const copia = original;
   copia.puntos = 0;
   console.log(original.puntos);  // 0
   ```
   Para una copia superficial: `const copia = { ...original }`.

## Chuleta

| Tema | Recuerda |
|---|---|
| Declarar | `const` por defecto, `let` si reasignas, `var` nunca |
| Ámbito | `let`/`const`: bloque; `var`: función |
| Primitivos | `string number boolean undefined null bigint symbol`, se copian |
| Objetos | arrays, funciones, `{}`: se comparten por referencia |
| `typeof` | `null` da `"object"`, arrays dan `"object"`, funciones `"function"` |
| `null` / `undefined` | vacío a propósito / sin valor todavía |
| `+` con string | concatena: `"5" + 1` es `"51"` |
| Comparar | siempre `===` |
| `NaN` | `Number.isNaN(x)`, nunca `x === NaN` |
| Falsy (8) | `false 0 -0 0n "" null undefined NaN` |
| Truthy raros | `"0"`, `"false"`, `[]`, `{}` |
| Textos | `` `Hola, ${nombre}` `` |

## En la entrevista

- **¿Qué diferencia hay entre `let`, `const` y `var`?** `let` y `const` tienen ámbito de bloque y no se pueden usar antes de declararse; `const` además no se puede reasignar. `var` tiene ámbito de función y se "eleva" con valor `undefined`, por eso ya no se usa.
- **¿Qué devuelve `typeof null`?** `"object"`. Es un error de la primera versión del lenguaje que se mantiene por compatibilidad; para detectar `null` se usa `valor === null`.
- **¿Cuál es la diferencia entre `==` y `===`?** `===` compara valor y tipo sin convertir nada; `==` convierte los tipos antes de comparar, por eso `"5" == 5` es `true`. Siempre uso `===`.
- **¿Qué diferencia hay entre `null` y `undefined`?** `undefined` significa que algo no tiene valor asignado (lo pone el lenguaje); `null` es un "vacío" que pone el programador a propósito.
- **¿Qué pasa si asigno un objeto a otra variable y lo modifico?** Las dos variables apuntan al mismo objeto, así que el cambio se ve en ambas. Los primitivos, en cambio, se copian por valor.
