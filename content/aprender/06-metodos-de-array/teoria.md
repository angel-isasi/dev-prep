## En una frase

`map` transforma cada elemento, `filter` se queda con algunos y `reduce` junta todo en un solo valor; los tres **devuelven algo nuevo** y no tocan el array original.

## Lo esencial

### Los tres en una tabla

| Método | Pregunta que responde | Devuelve | Largo del resultado |
|---|---|---|---|
| `map(fn)` | "¿Cómo queda cada elemento?" | Array nuevo | El **mismo** que el original |
| `filter(fn)` | "¿Cuáles me quedo?" | Array nuevo | Igual o **menor** |
| `reduce(fn, inicial)` | "¿Qué resumen saco de todos?" | **Un solo valor** (número, texto, objeto, array...) | No aplica |
| `forEach(fn)` | "Haz algo con cada uno" | `undefined` | No aplica |

Todos llaman a tu función con `(elemento, indice, array)`. Casi siempre solo usas el primero.

### map: transformar

```js
const precios = [10, 20, 30];
precios.map((p) => p * 2);        // [20, 40, 60]
precios.map((p, i) => `${i}: ${p}`); // ["0: 10", "1: 20", "2: 30"]

const alumnos = [{ nombre: "Ana", nota: 15 }, { nombre: "Luis", nota: 9 }];
alumnos.map((a) => a.nombre);     // ["Ana", "Luis"]
precios;                          // [10, 20, 30]  (no cambió)
```

### filter: quedarte con algunos

La función devuelve `true` (se queda) o `false` (sale).

```js
[1, 2, 3, 4, 5].filter((n) => n % 2 === 0);   // [2, 4]
alumnos.filter((a) => a.nota >= 11);          // [{ nombre: "Ana", nota: 15 }]
alumnos.filter((a) => a.nota > 20);           // []  (nunca undefined)
```

### reduce: juntar todo en un valor

`reduce` recorre el array llevando un **acumulador**. Lo que devuelves en cada vuelta es el acumulador de la siguiente.

```js
[5, 10, 15].reduce((acc, n) => acc + n, 0);
// vuelta 1: acc = 0,  n = 5   → 5
// vuelta 2: acc = 5,  n = 10  → 15
// vuelta 3: acc = 15, n = 15  → 30
// resultado: 30
```

**Contar** (el acumulador es un objeto):

```js
const votos = ["sí", "no", "sí", "sí"];
votos.reduce((acc, v) => {
  acc[v] = (acc[v] ?? 0) + 1;
  return acc;                     // ¡no olvides devolverlo!
}, {});
// { sí: 3, no: 1 }
```

**Agrupar** (el acumulador es un objeto de arrays):

```js
const personas = [
  { nombre: "Ana", ciudad: "Lima" },
  { nombre: "Luis", ciudad: "Cusco" },
  { nombre: "Rosa", ciudad: "Lima" },
];
personas.reduce((acc, p) => {
  acc[p.ciudad] ??= [];           // si no existe el grupo, créalo
  acc[p.ciudad].push(p.nombre);
  return acc;
}, {});
// { Lima: ["Ana", "Rosa"], Cusco: ["Luis"] }
```

Pasa **siempre** el valor inicial (`0`, `{}`, `[]`, `""`): evita errores con arrays vacíos y deja claro qué tipo devuelves.

### Encadenar

Como `map` y `filter` devuelven arrays, puedes encadenarlos. Léelo como una receta, de arriba abajo:

```js
const pedidos = [
  { plato: "ceviche", precio: 35, pagado: true },
  { plato: "lomo", precio: 40, pagado: false },
  { plato: "ají de gallina", precio: 25, pagado: true },
];

const totalPagado = pedidos
  .filter((p) => p.pagado)        // solo los pagados
  .map((p) => p.precio)           // [35, 25]
  .reduce((acc, n) => acc + n, 0); // 60
```

Filtra **antes** de transformar: así `map` trabaja con menos elementos.

### forEach no devuelve nada

```js
const r = [1, 2, 3].forEach((n) => n * 2);
r; // undefined
```

Úsalo solo para efectos (imprimir, guardar, tocar el DOM). Si quieres un array nuevo, usa `map`.

### ¿Cuándo usar un for?

| Situación | Mejor opción |
|---|---|
| Transformar, filtrar o sumar | `map` / `filter` / `reduce` |
| Cortar apenas encuentras algo | `find`, `some`, o `for...of` con `break` |
| Usar `await` dentro, uno por uno | `for...of` |
| Lógica larga con varias variables | `for...of` (más legible que un `reduce` gigante) |

`forEach`, `map` y `filter` **no se pueden detener** con `break`: siempre recorren todo.

## Errores típicos

**1. Olvidar el `return` con llaves**

```js
[1, 2, 3].map((n) => { n * 2 }); // [undefined, undefined, undefined]
```
Con llaves `{}` la función necesita `return`. Escribe `(n) => n * 2` o `(n) => { return n * 2; }`.

**2. Usar `map` cuando querías `filter`**

```js
[1, 2, 3, 4].map((n) => n > 2); // [false, false, true, true]
```
`map` devuelve el resultado de la condición para cada uno. Para quedarte con los elementos usa `filter`.

**3. No devolver el acumulador en `reduce`**

```js
["a", "b"].reduce((acc, l) => { acc[l] = true; }, {});
// TypeError: Cannot set properties of undefined (setting 'b')
```
En la segunda vuelta `acc` es `undefined` porque la primera no devolvió nada. Termina con `return acc;`.

**4. `reduce` sin valor inicial sobre un array vacío**

```js
[].reduce((acc, n) => acc + n); // TypeError: Reduce of empty array with no initial value
[].reduce((acc, n) => acc + n, 0); // 0
```

**5. Guardar lo que devuelve `forEach`**

```js
const dobles = nums.forEach((n) => n * 2); // undefined
```
`forEach` siempre devuelve `undefined`. Usa `map`.

**6. Pasar una función que recibe más argumentos de los que crees**

```js
["1", "2", "3"].map(parseInt); // [1, NaN, NaN]
```
`map` pasa `(elemento, indice)`, y `parseInt` usa el índice como base numérica. Escribe `.map((s) => parseInt(s))` o `.map(Number)`.

## Chuleta

| Método | Qué hace | Devuelve | ¿Muta? |
|---|---|---|---|
| `map(fn)` | Transforma cada elemento | Array nuevo, mismo largo | No |
| `filter(fn)` | Se queda con los que dan `true` | Array nuevo, igual o más corto | No |
| `reduce(fn, ini)` | Acumula en un solo valor | Lo que acumules | No |
| `forEach(fn)` | Ejecuta algo por cada uno | `undefined` | No (pero tu `fn` sí podría) |
| `find(fn)` | Primer elemento que cumple | Elemento o `undefined` | No |
| `some(fn)` / `every(fn)` | ¿Alguno? / ¿Todos? | `true`/`false` | No |
| `flatMap(fn)` | `map` y aplana un nivel | Array nuevo | No |

Plantillas de `reduce`:
- Sumar: `arr.reduce((acc, n) => acc + n, 0)`
- Contar: `arr.reduce((acc, x) => { acc[x] = (acc[x] ?? 0) + 1; return acc; }, {})`
- Agrupar: `arr.reduce((acc, x) => { (acc[x.k] ??= []).push(x); return acc; }, {})`

## En la entrevista

**¿Qué diferencia hay entre `map` y `forEach`?**
`map` devuelve un array nuevo con lo que retorna tu función; `forEach` devuelve `undefined` y solo sirve para efectos secundarios como imprimir o modificar el DOM.

**¿Para qué sirve el valor inicial de `reduce`?**
Es el valor del acumulador en la primera vuelta; sin él, `reduce` usa el primer elemento y lanza un error si el array está vacío, así que conviene pasarlo siempre.

**¿`map` y `filter` modifican el array original?**
No, devuelven un array nuevo; pero si los elementos son objetos y tu función los modifica adentro, esos objetos sí cambian, porque se comparten por referencia.

**¿Cómo implementarías `map` tú mismo?**
Creo un array vacío, recorro el original con un `for`, hago `push` de `fn(elemento, indice, array)` en cada vuelta y devuelvo el array nuevo.

**¿Cuándo preferirías un `for` en lugar de estos métodos?**
Cuando necesito cortar el recorrido antes (`break`), usar `await` en orden dentro del bucle, o cuando la lógica es tan larga que un `reduce` se vuelve difícil de leer.
