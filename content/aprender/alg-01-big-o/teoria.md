## En una frase

Big O describe **cómo crece** el trabajo (tiempo) o la memoria (espacio) de tu solución cuando la entrada se hace más grande: no mide segundos, mide la forma del crecimiento en el peor caso.

## Lo esencial

### Contar pasos, no segundos

```js
function suma(nums) {
  let total = 0;
  for (const n of nums) total += n; // una vuelta por elemento
  return total;
}
```

Si `nums` tiene n elementos, el bucle da n vueltas: es **O(n)**. Con 10 elementos o con un millón la forma es la misma: el doble de datos, el doble de trabajo.

### Las que vas a ver siempre

| Big O | Nombre | Ejemplo típico | Con n = 1 000 |
|---|---|---|---|
| O(1) | constante | `arr[i]`, `map.get(k)`, `set.has(x)` | 1 paso |
| O(log n) | logarítmica | búsqueda binaria | unos 10 pasos |
| O(n) | lineal | un bucle sobre el array | 1 000 |
| O(n log n) | casi lineal | `sort` | unos 10 000 |
| O(n²) | cuadrática | dos bucles anidados | 1 000 000 |
| O(2ⁿ) | exponencial | probar todos los subconjuntos | imposible |

### Reglas para calcularla

```js
function ejemplo(nums) {
  console.log(nums[0]);                 // O(1)
  for (const n of nums) console.log(n); // O(n)
  for (const a of nums) {               // O(n²): por cada a, recorro todo otra vez
    for (const b of nums) console.log(a, b);
  }
}
// O(1) + O(n) + O(n²)  ->  O(n²)
```

1. Bucles **seguidos se suman**: O(n) + O(n) = O(2n) = O(n). Las constantes se botan.
2. Bucles **anidados se multiplican**: O(n) · O(n) = O(n²).
3. Te quedas con el término que más crece.
4. Si hay dos entradas distintas, usa dos letras: recorrer `a` y luego `b` es O(a + b), no O(n).

### Los métodos también cuestan

```js
nums.push(x);      // O(1)
nums.pop();        // O(1)
nums.includes(x);  // O(n): recorre hasta encontrarlo
nums.indexOf(x);   // O(n)
nums.shift();      // O(n): mueve a todos los demás una posición
nums.slice();      // O(n): copia
nums.sort();       // O(n log n)
```

Un `includes` dentro de un `for` es un **bucle anidado escondido**: O(n²).

### Espacio

```js
const dobles = (nums) => nums.map((n) => n * 2); // array nuevo de tamaño n: O(n) de espacio

function maximo(nums) {
  let max = -Infinity;                            // una sola variable: O(1) de espacio
  for (const n of nums) if (n > max) max = n;
  return max;
}
```

Muchas veces se **cambia espacio por tiempo**: un `Set` que ocupa O(n) convierte una búsqueda de O(n) en O(1).

### Del O(n²) al O(n)

```js
// Fuerza bruta: compara cada par. O(n²) de tiempo, O(1) de espacio
function tieneDuplicado(nums) {
  for (let i = 0; i < nums.length; i++)
    for (let j = i + 1; j < nums.length; j++)
      if (nums[i] === nums[j]) return true;
  return false;
}

// Con memoria: O(n) de tiempo, O(n) de espacio
function tieneDuplicadoRapido(nums) {
  const vistos = new Set();
  for (const n of nums) {
    if (vistos.has(n)) return true;
    vistos.add(n);
  }
  return false;
}
```

En la entrevista primero cuenta la fuerza bruta con su Big O y después mejórala: así muestras que sabes medir.

## Errores típicos

**1. Olvidar el costo de los métodos.** Esto parece un solo bucle, pero es O(n²):

```js
const unicos = [];
for (const n of nums) if (!unicos.includes(n)) unicos.push(n);
```

Con un `Set` es O(n): `[...new Set(nums)]`.

**2. Escribir O(2n) u O(n + 5).** Las constantes no se escriben: dos pasadas siguen siendo O(n).

**3. Dar el mejor caso.** Si lo que buscas está primero terminas en un paso, pero la complejidad se da para el peor caso: O(n).

**4. Creer que menos líneas es más rápido.** Una línea puede esconder mucho trabajo:

```js
const minimo = [...nums].sort((a, b) => a - b)[0]; // O(n log n)

let min = Infinity;
for (const n of nums) if (n < min) min = n;       // O(n)
```

**5. No contar el espacio.** Si te piden "sin memoria extra", crear un `Map`, un `Set` o un array del tamaño de la entrada ya es O(n) de espacio.

## Chuleta

| Código | Tiempo |
|---|---|
| `arr[i]`, `push`, `pop`, `map.get`, `set.has` | O(1) |
| Partir a la mitad en cada paso | O(log n) |
| Un bucle, `includes`, `indexOf`, `find`, `shift`, `slice`, `[...arr]` | O(n) |
| `sort` | O(n log n) |
| Dos bucles anidados sobre lo mismo | O(n²) |

- Seguidos se suman, anidados se multiplican, las constantes se botan.
- Espacio: cuenta las estructuras nuevas que crecen con la entrada.
- Primero fuerza bruta con su Big O, después la mejora.

## En la entrevista

**¿Qué es la notación Big O?**
Es la forma de describir cómo crece el tiempo o la memoria de un algoritmo cuando crece la entrada, normalmente en el peor caso. Ignora las constantes porque lo que importa es la tendencia con entradas grandes.

**¿Qué complejidad tiene buscar un valor en un array y en un Set?**
En un array, `includes` es O(n) porque revisa los elementos uno por uno. En un `Set`, `has` es O(1) en promedio, porque usa una tabla hash.

**¿Por qué O(n log n) es mucho mejor que O(n²)?**
Con un millón de elementos, n log n son unos 20 millones de pasos y n² es un billón. La diferencia es la que separa un segundo de horas.

**¿Qué es la complejidad de espacio?**
La memoria extra que usa tu solución además de la entrada. Un bucle con un par de variables es O(1); crear un array o un `Map` del tamaño de la entrada es O(n).
