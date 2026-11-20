## En una frase

La **recursión** resuelve un problema llamándose a sí misma con una versión más chica hasta llegar a un **caso base** que se responde directo; la **búsqueda binaria** encuentra un valor en un array **ordenado** descartando la mitad en cada paso, en O(log n).

## Lo esencial

### Las dos partes de toda recursión

```js
function sumar(nums, i = 0) {
  if (i === nums.length) return 0;       // 1. caso base: nada que sumar
  return nums[i] + sumar(nums, i + 1);   // 2. caso recursivo: este + el resto
}
sumar([4, 2, 7]); // 4 + (2 + (7 + 0)) = 13
```

Cada llamada espera a la siguiente en la **pila de llamadas**. Sin caso base (o si nunca lo alcanzas) la pila se llena: `RangeError: Maximum call stack size exceeded`.

Para escribirla pregúntate: ¿cuál es la versión más chica del problema? ¿y cuál es tan chica que la respondo sin pensar?

### Donde brilla: estructuras anidadas

Un árbol es un nodo con hijos que también son árboles. La recursión sigue esa misma forma.

```js
// Nodo: { val, left, right }. ¿Cuánto suman todos los valores?
function sumaArbol(nodo) {
  if (!nodo) return 0;                    // árbol vacío
  return nodo.val + sumaArbol(nodo.left) + sumaArbol(nodo.right);
}
```

Confía en que la llamada recursiva ya resuelve el subárbol: tú solo combinas.

### Memoización: no calcular dos veces

```js
function fib(n, memo = new Map()) {
  if (n <= 1) return n;
  if (memo.has(n)) return memo.get(n);
  const r = fib(n - 1, memo) + fib(n - 2, memo);
  memo.set(n, r);
  return r;
}
fib(50); // 12586269025, al instante
```

Sin el `memo`, `fib(50)` repite los mismos cálculos miles de millones de veces: O(2ⁿ). Con él, cada `n` se calcula una vez: O(n). Esa es la base de la **programación dinámica**.

### Backtracking: probar, explorar, deshacer

Para generar todas las opciones (combinaciones, caminos), eliges algo, sigues recursivamente y luego **deshaces** la elección para probar la siguiente.

```js
function todasLasCadenas(letras, largo) {
  const res = [];
  const actual = [];
  function explorar() {
    if (actual.length === largo) {
      res.push(actual.join(""));
      return;
    }
    for (const l of letras) {
      actual.push(l);  // elijo
      explorar();      // exploro
      actual.pop();    // deshago
    }
  }
  explorar();
  return res;
}
todasLasCadenas(["a", "b"], 2); // ["aa", "ab", "ba", "bb"]
```

### Búsqueda binaria

```js
function buscar(nums, objetivo) {
  let izq = 0;
  let der = nums.length - 1;
  while (izq <= der) {
    const medio = Math.floor((izq + der) / 2);
    if (nums[medio] === objetivo) return medio;
    if (nums[medio] < objetivo) izq = medio + 1; // está a la derecha
    else der = medio - 1;                          // está a la izquierda
  }
  return -1; // aquí `izq` es donde debería insertarse
}
buscar([1, 3, 5, 7, 9, 11], 7); // 3
```

Con un millón de elementos, a lo mucho unos 20 pasos. **Solo funciona si está ordenado**, o si al mirar el medio puedes saber de qué lado está la respuesta.

## Errores típicos

**1. Caso base que nunca llega.** `function f(n) { return f(n - 1); }` o un `n` que salta el caso base (`n -= 2` con `n` impar y base `n === 0`).

**2. Olvidar el `return` en la llamada recursiva.** `sumar(nums, i + 1)` sin `return` hace que la función devuelva `undefined`.

**3. Búsqueda binaria con bucle infinito.** Escribir `izq = medio` en vez de `medio + 1` puede dejar el rango igual para siempre.

**4. Olvidar `Math.floor`.** `(0 + 5) / 2` es `2.5`, y `nums[2.5]` es `undefined`.

**5. Compartir el array en backtracking sin copiarlo.** `res.push(actual)` guarda la misma referencia que después vacías con `pop`: al final todo queda `[]`. Guarda una copia: `res.push([...actual])`.

## Chuleta

| Técnica | Idea | Costo |
|---|---|---|
| Recursión | caso base + caso más chico | según cuántas llamadas haga |
| Recorrer un árbol | `if (!nodo) return ...;` y combinar hijos | O(n) |
| Memoización | guardar resultados en un `Map` | cada estado una vez |
| Backtracking | elegir, explorar, deshacer | exponencial (todas las opciones) |
| Búsqueda binaria | `while (izq <= der)`, `medio`, descartar mitad | O(log n) |

- Búsqueda binaria: `izq = medio + 1` y `der = medio - 1`, nunca `medio` a secas en esta plantilla.
- Al terminar sin encontrarlo, `izq` es la posición donde iría.

## En la entrevista

**¿Qué es la recursión y qué necesita para funcionar?**
Es una función que se llama a sí misma con un problema más pequeño. Necesita un caso base que se responda sin recursión y que cada llamada se acerque a ese caso; si no, la pila de llamadas se desborda.

**¿Recursión o bucle?**
La recursión es más clara para estructuras anidadas como árboles o para backtracking. Un bucle usa menos memoria porque no apila llamadas, y en JavaScript no hay riesgo de desbordar la pila con entradas grandes.

**¿Qué es la memoización?**
Guardar el resultado de una llamada para no repetirla. Convierte una recursión que recalcula lo mismo, como Fibonacci, de exponencial a lineal.

**¿Qué requisito tiene la búsqueda binaria y cuál es su complejidad?**
Que los datos estén ordenados, o que al mirar el medio puedas saber en qué mitad está la respuesta. Descarta la mitad en cada paso, así que es O(log n).
