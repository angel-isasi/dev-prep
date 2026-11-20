## En una frase

Cuando el problema habla de un **tramo seguido** (subarreglo o subcadena), una **ventana deslizante** mantiene el tramo actual entre dos índices y lo actualiza al moverse, en lugar de recalcular cada tramo desde cero: de O(n²) a O(n).

## Lo esencial

### Ventana de tamaño fijo

Suma máxima de `k` elementos seguidos. En vez de sumar cada grupo de nuevo, al avanzar **sumas el que entra y restas el que sale**.

```js
function sumaMaxima(nums, k) {
  let suma = 0;
  for (let i = 0; i < k; i++) suma += nums[i]; // la primera ventana
  let mejor = suma;
  for (let der = k; der < nums.length; der++) {
    suma += nums[der] - nums[der - k];         // entra der, sale der - k
    mejor = Math.max(mejor, suma);
  }
  return mejor;
}
sumaMaxima([2, 1, 5, 1, 3, 2], 3); // 9  (5 + 1 + 3)
```

### Ventana de tamaño variable

La ventana **crece por la derecha** en cada paso y **se encoge por la izquierda** mientras deje de cumplir la condición. Esta es la plantilla:

```js
let izq = 0;
for (let der = 0; der < datos.length; der++) {
  // 1. meter datos[der] en la ventana
  while (/* la ventana ya no cumple */) {
    // 2. sacar datos[izq] de la ventana
    izq++;
  }
  // 3. la ventana [izq, der] es válida: actualizar la mejor respuesta
}
```

Ejemplo: el tramo más largo que tiene como máximo 2 letras distintas.

```js
function masLargoConDos(s) {
  const cuenta = new Map(); // letra -> cuántas hay dentro de la ventana
  let izq = 0;
  let mejor = 0;
  for (let der = 0; der < s.length; der++) {
    cuenta.set(s[der], (cuenta.get(s[der]) ?? 0) + 1);
    while (cuenta.size > 2) {
      cuenta.set(s[izq], cuenta.get(s[izq]) - 1);
      if (cuenta.get(s[izq]) === 0) cuenta.delete(s[izq]);
      izq++;
    }
    mejor = Math.max(mejor, der - izq + 1);
  }
  return mejor;
}
masLargoConDos("eceba"); // 3  ("ece")
```

`izq` y `der` solo avanzan: cada elemento entra una vez y sale una vez. Por eso es O(n) aunque haya un `while` adentro.

### Lo que recuerdas mientras avanzas

A veces la "ventana" es solo algo que vas arrastrando en una pasada:

```js
// Mejor diferencia entre un número y otro que vino ANTES y es menor
let minimo = Infinity;
let mejor = 0;
for (const n of [7, 2, 8, 1, 4]) {
  minimo = Math.min(minimo, n); // lo más bajo visto hasta aquí
  mejor = Math.max(mejor, n - minimo);
}
// mejor = 6 (8 - 2)
```

Y otras veces decides en cada paso si **sigues el tramo o empiezas uno nuevo**: si lo que traes acumulado ya resta, conviene empezar de cero desde el actual.

### Cuando la ventana no sirve

La ventana necesita que agrandar el tramo empeore (o mejore) siempre en la misma dirección. Con **números negativos** eso se rompe: sumar un elemento puede bajar la suma. Ahí se usan **sumas de prefijos** con un `Map`:

```js
// prefijo[i] = suma de todo hasta i. La suma del tramo (j, i] es prefijo[i] - prefijo[j].
const nums = [3, -1, 2];
let prefijo = 0;
const prefijos = [];
for (const n of nums) {
  prefijo += n;
  prefijos.push(prefijo); // [3, 2, 4]
}
// tramo de la posición 1 a la 2: 4 - 3 = 1  (-1 + 2)
```

## Errores típicos

**1. Largo de la ventana mal calculado.** De `izq` a `der`, incluidos los dos, hay `der - izq + 1` elementos, no `der - izq`.

**2. Usar `if` en vez de `while` al encoger.** A veces hay que sacar varios elementos de la izquierda para que la ventana vuelva a ser válida.

**3. No borrar del Map las cuentas en 0.** Si dejas `{ a: 0 }`, `cuenta.size` sigue contando esa letra y la ventana se encoge de más.

**4. Aplicar la ventana a subsecuencias.** Una subsecuencia puede saltarse elementos (`"ace"` en `"abcde"`); la ventana solo sirve para tramos **seguidos**.

**5. Usar ventana con negativos.** Si los números pueden ser negativos, encoger no siempre baja la suma. Piensa en sumas de prefijos.

## Chuleta

| Señal en el enunciado | Qué hacer |
|---|---|
| "k elementos seguidos" | Ventana fija: suma el que entra, resta el que sale |
| "subcadena o subarreglo más largo / más corto que cumpla..." | Ventana variable con `izq` y `der` |
| "sin repetidos", "como máximo k distintos" | Ventana variable + `Map` o `Set` |
| Suma exacta con negativos | Sumas de prefijos + `Map` |

- Largo: `der - izq + 1`.
- `der` avanza en el `for`; `izq` avanza en el `while`. Los dos solo van hacia adelante: O(n).

## En la entrevista

**¿Qué es la técnica de ventana deslizante?**
Mantener un tramo seguido entre dos índices e ir moviéndolo: la derecha agrega elementos y la izquierda los quita cuando el tramo deja de cumplir la condición. Así evito recalcular cada tramo y la solución queda en O(n).

**¿Por qué es O(n) si tiene un while dentro de un for?**
Porque los dos punteros solo avanzan. Cada elemento entra a la ventana una vez y sale como mucho una vez, así que el total de pasos es como mucho 2n.

**¿Cuándo no puedes usar una ventana?**
Cuando agrandar el tramo no cambia el resultado siempre en la misma dirección, por ejemplo una suma con números negativos. Ahí uso sumas de prefijos con un `Map`.

**¿Qué diferencia hay entre subarreglo y subsecuencia?**
Un subarreglo (o subcadena) es un tramo seguido. Una subsecuencia mantiene el orden pero puede saltarse elementos. La ventana deslizante solo sirve para tramos seguidos.
