## En una frase

Un array es una lista ordenada de valores a la que accedes por posición (empezando en 0), y la gran pregunta con cada método es: **¿cambia el array original o me devuelve uno nuevo?**

## Lo esencial

### Crear, leer y medir

```js
const frutas = ["mango", "lúcuma", "piña"];

frutas[0];                  // "mango"   (el primero es el índice 0)
frutas[frutas.length - 1];  // "piña"    (el último)
frutas.at(-1);              // "piña"    (at acepta negativos)
frutas[10];                 // undefined (no da error)
frutas.length;              // 3

Array.isArray(frutas);      // true
typeof frutas;              // "object"  (por eso se usa Array.isArray)
```

### Agregar y quitar (estos mutan)

```js
const nums = [2, 3];
nums.push(4);      // 3        devuelve el nuevo length → [2, 3, 4]
nums.unshift(1);   // 4        agrega al inicio         → [1, 2, 3, 4]
nums.pop();        // 4        devuelve lo que quitó    → [1, 2, 3]
nums.shift();      // 1        quita el primero         → [2, 3]
```

Ojo: `push` devuelve el **largo**, no el array.

### slice vs splice

| | `slice(inicio, fin)` | `splice(inicio, cuántos, ...nuevos)` |
|---|---|---|
| ¿Muta? | No | **Sí** |
| Devuelve | Una copia del tramo (sin incluir `fin`) | Los elementos que **quitó** |
| Uso típico | Copiar o recortar | Borrar o insertar en medio |

```js
const a = [10, 20, 30, 40, 50];
a.slice(1, 3);        // [20, 30]       a sigue igual
a.slice(-2);          // [40, 50]       los dos últimos

const b = [10, 20, 30, 40, 50];
b.splice(1, 2);       // [20, 30]       lo que quitó
b;                    // [10, 40, 50]   el original cambió
b.splice(1, 0, 99);   // []             no quitó nada, insertó
b;                    // [10, 99, 40, 50]
```

### Buscar

```js
const edades = [15, 22, 17, 30];

edades.includes(22);              // true
edades.indexOf(22);               // 1    (-1 si no está)
edades.find((e) => e >= 18);      // 22   (el primer elemento que cumple)
edades.findIndex((e) => e >= 18); // 1    (su posición, -1 si ninguno)
edades.some((e) => e >= 18);      // true (¿al menos uno?)
edades.every((e) => e >= 18);     // false (¿todos?)
```

Si buscas un valor exacto, usa `includes`/`indexOf`. Si buscas por una condición (por ejemplo, en un array de objetos), usa `find`/`findIndex`.

### Ordenar con sort

`sort()` **muta** y, sin argumento, compara como **texto**:

```js
[10, 1, 2].sort();                 // [1, 10, 2]  ¡"10" va antes que "2"!
[10, 1, 2].sort((a, b) => a - b);  // [1, 2, 10]  ascendente
[10, 1, 2].sort((a, b) => b - a);  // [10, 2, 1]  descendente
```

El comparador devuelve un número: negativo si `a` va antes, positivo si `b` va antes, 0 si da igual. Para no tocar el original: `[...nums].sort(...)` o `nums.toSorted(...)`.

### Spread y destructuring

```js
const a = [1, 2];
const b = [3, 4];
const copia = [...a];          // [1, 2]  (array nuevo)
const juntos = [...a, ...b];   // [1, 2, 3, 4]
const conCero = [0, ...a];     // [0, 1, 2]

const [primero, segundo] = [10, 20, 30]; // primero = 10, segundo = 20
const [cabeza, ...resto] = [10, 20, 30]; // cabeza = 10, resto = [20, 30]
let x = 1, y = 2;
[x, y] = [y, x];                         // intercambio: x = 2, y = 1
```

### Mutar vs no mutar

| Mutan el original | Devuelven algo nuevo |
|---|---|
| `push`, `pop`, `shift`, `unshift` | `slice`, `concat`, `[...arr]` |
| `splice` | `map`, `filter` |
| `sort`, `reverse` | `toSorted`, `toReversed` |
| `fill` | `flat`, `join` (devuelve texto) |

En React y en funciones "puras" no mutes lo que te pasaron: copia primero.

## Errores típicos

**1. Ordenar números sin comparador**

```js
[5, 25, 100].sort(); // [100, 25, 5]
```
Compara como texto ("1" < "2" < "5"). Usa `.sort((a, b) => a - b)`.

**2. Creer que `sort` o `reverse` no tocan el original**

```js
function ordenar(lista) {
  return lista.sort((a, b) => a - b); // ¡también cambia la lista de quien te llamó!
}
```
Copia primero: `[...lista].sort(...)` o usa `lista.toSorted(...)`.

**3. Guardar lo que devuelve `push`**

```js
const lista = [1, 2];
const nueva = lista.push(3);
nueva; // 3, no [1, 2, 3]
```
`push` devuelve el largo. Si quieres un array nuevo: `const nueva = [...lista, 3]`.

**4. Confundir `slice` con `splice`**

```js
const a = [1, 2, 3, 4];
a.splice(0, 2); // [1, 2]
a;              // [3, 4]   querías copiar y borraste
```
`slice` copia, `splice` corta el original.

**5. "Copiar" con `=`**

```js
const original = [1, 2];
const copia = original;
copia.push(3);
original; // [1, 2, 3]
```
`=` copia la referencia, no el array. Usa `[...original]`.

**6. Usar `indexOf` como booleano**

```js
if ([5, 6].indexOf(5)) { /* nunca entra */ }
```
`indexOf` devuelve `0` (falsy) cuando está en la primera posición. Usa `includes` o compara con `!== -1`.

## Chuleta

| Método | Qué hace | Devuelve | ¿Muta? |
|---|---|---|---|
| `push(x)` / `unshift(x)` | Agrega al final / al inicio | Nuevo `length` | Sí |
| `pop()` / `shift()` | Quita el último / el primero | El elemento quitado | Sí |
| `slice(i, f)` | Copia un tramo | Array nuevo | No |
| `splice(i, n, ...x)` | Quita o inserta | Array con lo quitado | Sí |
| `includes(x)` | ¿Está x? | `true`/`false` | No |
| `indexOf(x)` | Posición de x | Índice o `-1` | No |
| `find(fn)` | Primer elemento que cumple | Elemento o `undefined` | No |
| `findIndex(fn)` | Posición del primero que cumple | Índice o `-1` | No |
| `some(fn)` / `every(fn)` | ¿Alguno? / ¿Todos? | `true`/`false` | No |
| `sort(fn)` | Ordena | El mismo array | Sí |
| `toSorted(fn)` | Ordena una copia | Array nuevo | No |
| `reverse()` | Invierte | El mismo array | Sí |
| `join(sep)` | Une en texto | String | No |
| `[...a, ...b]` | Copia o une | Array nuevo | No |

Truco: `[].some(fn)` es `false` y `[].every(fn)` es `true`.

## En la entrevista

**¿Qué diferencia hay entre `slice` y `splice`?**
`slice` devuelve una copia de un tramo sin tocar el original; `splice` modifica el original quitando o insertando elementos y devuelve lo que quitó.

**¿Por qué `[10, 1, 2].sort()` da `[1, 10, 2]`?**
Porque sin comparador `sort` convierte los elementos a texto y los ordena alfabéticamente; para números se pasa `(a, b) => a - b`.

**¿Cómo copias un array? ¿Es una copia profunda?**
Con `[...arr]`, `arr.slice()` o `Array.from(arr)`; las tres son copias superficiales: si adentro hay objetos, la copia comparte esos mismos objetos.

**¿Cuándo usarías `find` en vez de `filter`?**
`find` cuando quieres el primer elemento que cumple (devuelve el elemento o `undefined`); `filter` cuando quieres todos los que cumplen (siempre devuelve un array).

**¿Cómo sabes si algo es un array?**
Con `Array.isArray(x)`, porque `typeof` de un array devuelve `"object"`.
