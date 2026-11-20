## En una frase

Un `Set` es una colección de **valores sin repetir** que responde "¿está esto aquí?" en **O(1)**; úsalo cuando solo te importa si algo existe, no cuántas veces ni con qué dato asociado (para eso está `Map`).

## Lo esencial

### Lo básico

```js
const vistos = new Set([1, 2, 2, 3]); // Set { 1, 2, 3 }: el 2 repetido se ignora
vistos.add(4);       // agrega
vistos.add(1);       // ya estaba: no pasa nada
vistos.has(2);       // true, en O(1)
vistos.delete(3);    // lo quita
vistos.size;         // 3

for (const v of vistos) console.log(v); // en orden de inserción
```

### Quitar duplicados

```js
const nums = [3, 1, 3, 2, 1];
const unicos = [...new Set(nums)]; // [3, 1, 2], respeta el orden de aparición

const letras = new Set("banana").size; // 3 letras distintas: b, a, n
```

Es O(n) de tiempo. La versión con `filter` e `indexOf` hace lo mismo en O(n²).

### ¿Ya lo vi?

```js
function primerRepetido(nums) {
  const vistos = new Set();
  for (const n of nums) {
    if (vistos.has(n)) return n;
    vistos.add(n);
  }
  return null;
}
primerRepetido([5, 2, 8, 2, 5]); // 2
```

La misma idea detecta **ciclos**: si un proceso vuelve a un estado que ya guardaste, va a repetirse para siempre.

```js
// ¿Llega a 0 si repito n = (n * 3 + 1) % 7? (regla inventada para el ejemplo)
function llegaACero(n) {
  const vistos = new Set();
  while (n !== 0) {
    if (vistos.has(n)) return false; // ciclo: nunca llegará
    vistos.add(n);
    n = (n * 3 + 1) % 7;
  }
  return true;
}
llegaACero(4); // true:  4 -> 6 -> 5 -> 2 -> 0
llegaACero(3); // false: 3 -> 3 -> ... se queda dando vueltas
```

### Operaciones de conjuntos

```js
const a = new Set([1, 2, 3, 4]);
const b = new Set([3, 4, 5]);

const interseccion = [...a].filter((x) => b.has(x)); // [3, 4]
const diferencia = [...a].filter((x) => !b.has(x));  // [1, 2]
const union = new Set([...a, ...b]);                 // Set { 1, 2, 3, 4, 5 }
```

Convierte a `Set` el array en el que vas a **buscar**, no el que recorres: así cada `has` es O(1) y el total queda en O(n + m).

### Set solo compara valores simples

```js
const s = new Set();
s.add([1, 2]);
s.has([1, 2]); // false: son dos arrays distintos (otra referencia)

s.add("1,2");  // si necesitas pares, guárdalos como texto
s.has("1,2");  // true
```

Para recordar posiciones de una matriz, un truco común es la clave `` `${fila},${col}` ``, o dos `Set` separados: uno de filas y otro de columnas.

## Errores típicos

**1. Usar `set.length`.** Un `Set` no tiene `length`: es `set.size`.

**2. Acceder por índice.** `set[0]` es `undefined`. Si necesitas posiciones, pásalo a array con `[...set]`.

**3. Esperar que encuentre arrays u objetos iguales.** `Set` compara por referencia: dos `[1, 2]` distintos no son el mismo. Usa una clave de texto.

**4. Usar Set cuando necesitas contar.** `new Set([1, 1, 1]).size` es 1: pierdes cuántas veces apareció. Para eso, un `Map` con conteo.

**5. Buscar en el array en lugar del Set.** Crear el `Set` y después escribir `arr.includes(x)` deja todo en O(n²) otra vez.

## Chuleta

| Necesitas | Escribe |
|---|---|
| Quitar duplicados | `[...new Set(arr)]` |
| ¿Cuántos distintos? | `new Set(arr).size` |
| ¿Ya apareció? | `if (vistos.has(x)) ...; vistos.add(x)` |
| Intersección | `a.filter((x) => setB.has(x))` |
| Diferencia | `a.filter((x) => !setB.has(x))` |
| Par como clave | `` set.add(`${f},${c}`) `` |

- `Set`: solo "existe o no". `Map`: existe y además guarda un dato.
- `add`, `has` y `delete` son O(1) en promedio.

## En la entrevista

**¿Cuál es la diferencia entre Set y Map?**
`Set` guarda solo valores únicos y responde si existen. `Map` guarda pares clave y valor. Si además de saber que algo existe necesito contar o recordar un índice, uso `Map`.

**¿Cómo eliminarías los duplicados de un array?**
Con `[...new Set(arr)]`, que es O(n) y mantiene el orden de la primera aparición. Con `filter` e `indexOf` también funciona, pero es O(n²).

**¿Por qué `set.has` es más rápido que `array.includes`?**
Porque el `Set` es una tabla hash: calcula dónde estaría el valor y lo revisa directo, O(1) en promedio. `includes` recorre el array, O(n).

**¿Cómo detectarías que un proceso entra en un ciclo?**
Guardo cada estado en un `Set`. Si llego a uno que ya estaba, el proceso se va a repetir para siempre y puedo cortar.
