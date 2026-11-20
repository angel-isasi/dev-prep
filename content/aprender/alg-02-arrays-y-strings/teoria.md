## En una frase

Casi todo problema de arrays o strings se resuelve **recorriendo con índices**, y cuando necesitas comparar posiciones, **dos punteros** (dos índices que se mueven con una regla) evitan el bucle anidado y bajan de O(n²) a O(n).

## Lo esencial

### Recorrer con índice

```js
const s = "hola";
for (let i = 0; i < s.length; i++) {
  console.log(i, s[i], s[i + 1]); // con el índice ves el actual y el siguiente
}
// el último s[i + 1] es undefined: cuida los bordes
```

`for...of` es más limpio cuando solo necesitas el valor; usa el índice cuando comparas vecinos o posiciones.

### Los strings no se cambian

```js
let s = "gato";
s[0] = "p";           // no cambia nada (en un módulo, que es modo estricto, lanza TypeError)
s = "p" + s.slice(1); // "pato": se crea un string nuevo

// Construir en un bucle: junta en un array y une al final
const partes = [];
for (const letra of "abc") partes.push(letra.toUpperCase());
partes.join(""); // "ABC"
```

Para "voltear" o modificar, pasa a array: `[...s].reverse().join("")`.

### Dos punteros desde los extremos

Uno empieza al inicio, otro al final, y se acercan. Sirve para **comparar simétricos** o cuando el array está **ordenado**.

```js
function esPalindromo(s) {
  let izq = 0;
  let der = s.length - 1;
  while (izq < der) {
    if (s[izq] !== s[der]) return false;
    izq++;
    der--;
  }
  return true;
}
esPalindromo("reconocer"); // true
```

En un array ordenado, la suma de los extremos te dice a quién mover:

```js
// ¿Hay un par que sume `objetivo`? (nums ordenado de menor a mayor)
function hayPar(nums, objetivo) {
  let izq = 0;
  let der = nums.length - 1;
  while (izq < der) {
    const suma = nums[izq] + nums[der];
    if (suma === objetivo) return true;
    if (suma < objetivo) izq++; // necesito más: subo el pequeño
    else der--;                 // me pasé: bajo el grande
  }
  return false;
}
```

O(n) de tiempo y O(1) de espacio, contra O(n²) de probar todos los pares.

### Lento y rápido (en el mismo array)

Un puntero **lee** todo (rápido) y otro marca **dónde escribir** (lento). Así filtras "en el lugar" sin crear otro array.

```js
// Deja al inicio solo los pares y devuelve cuántos quedaron
function soloPares(nums) {
  let escribir = 0;
  for (let leer = 0; leer < nums.length; leer++) {
    if (nums[leer] % 2 === 0) {
      nums[escribir] = nums[leer];
      escribir++;
    }
  }
  return escribir;
}
const a = [3, 2, 7, 4, 6];
soloPares(a); // 3, y a empieza con [2, 4, 6, ...]
```

### Cuándo pensar en dos punteros

- El array está **ordenado** y buscas un par o un trío.
- Comparas el inicio con el final (palíndromos, invertir).
- Te piden modificar **en el lugar** (in-place), sin memoria extra.
- Juntas dos arrays ordenados.

## Errores típicos

**1. `izq <= der` en vez de `izq < der`.** En un palíndromo, cuando se cruzan ya comparaste todo; con `<=` comparas el centro consigo mismo (no rompe, pero en otros problemas usa dos veces el mismo elemento).

**2. Salirte del array.** `s[i + 1]` en la última vuelta es `undefined`. Revisa qué pasa en el primer y el último índice.

**3. Usar dos punteros en un array sin ordenar.** La regla "si la suma es poca, sube el izquierdo" solo funciona si está ordenado. Si no lo está, ordena primero (O(n log n)) o usa un `Map`.

**4. Concatenar strings dentro de un bucle grande.** `res = res + algo` en cada vuelta copia el string entero. Para textos largos junta en un array y usa `join`.

**5. Olvidar mover un puntero.** Si en alguna rama ni `izq` ni `der` cambian, el `while` no termina nunca.

## Chuleta

| Situación | Técnica |
|---|---|
| Comparar inicio con final | Dos punteros desde los extremos |
| Par que suma X en array ordenado | Extremos: poca suma, sube `izq`; mucha, baja `der` |
| Quitar o mover elementos sin otro array | Lento (escribe) y rápido (lee) |
| Construir un string | `push` a un array y `join("")` |

- `while (izq < der)` y en cada vuelta se mueve al menos uno.
- Dos punteros: O(n) de tiempo y O(1) de espacio.

## En la entrevista

**¿Qué es la técnica de dos punteros?**
Usar dos índices que recorren el array con una regla, por ejemplo uno desde cada extremo. Reemplaza el bucle anidado de comparar todos los pares y deja la solución en O(n).

**¿Por qué necesita que el array esté ordenado para buscar un par?**
Porque con el orden sabes qué hacer: si la suma es menor que el objetivo, solo subir el izquierdo la aumenta; si es mayor, solo bajar el derecho la reduce. Sin orden no hay forma de decidir.

**¿Qué significa resolver algo in-place?**
Modificar el mismo array que te dan, sin crear otro del mismo tamaño. La memoria extra queda en O(1).

**¿Los strings en JavaScript se pueden modificar?**
No, son inmutables: `s[0] = "x"` no cambia el string. Cada cambio crea un string nuevo, por eso para construir uno largo conviene juntar partes en un array y unirlas al final.
