## Idea clave

Los tres son un `for` sobre `this` (el arreglo). `map` guarda lo que devuelve el callback, `filter` guarda el elemento si el callback dice que sí, y `reduce` va pasando un acumulador de vuelta en vuelta. El detalle fino: `reduce` **sin** valor inicial usa el primer elemento como acumulador y empieza desde el segundo.

## Paso a paso

1. **Usa `function`, no flecha**, para que `this` sea el arreglo sobre el que se llama el método.
2. **`miMap`**: arreglo nuevo; en cada vuelta, `push(callback(this[i], i, this))`.
3. **`miFilter`**: arreglo nuevo; en cada vuelta, si `callback(this[i], i, this)` es verdadero, `push(this[i])`.
4. **`miReduce`**: empieza con `acumulador = inicial` e `i = 0`.
5. Si `arguments.length < 2` (no te pasaron inicial): si el arreglo está vacío, lanza `TypeError`; si no, `acumulador = this[0]` e `i = 1`.
6. Recorre desde `i` haciendo `acumulador = callback(acumulador, this[i], i, this)` y devuelve el acumulador.

```js
Array.prototype.miMap = function (callback) {
  const resultado = [];
  for (let i = 0; i < this.length; i++) {
    resultado.push(callback(this[i], i, this));
  }
  return resultado;
};

Array.prototype.miFilter = function (callback) {
  const resultado = [];
  for (let i = 0; i < this.length; i++) {
    if (callback(this[i], i, this)) resultado.push(this[i]);
  }
  return resultado;
};

Array.prototype.miReduce = function (callback, inicial) {
  let i = 0;
  let acumulador = inicial;

  if (arguments.length < 2) {
    if (this.length === 0) throw new TypeError("reduce de un arreglo vacío sin valor inicial");
    acumulador = this[0];
    i = 1;
  }

  for (; i < this.length; i++) {
    acumulador = callback(acumulador, this[i], i, this);
  }
  return acumulador;
};
```

## Por qué funciona

`miReduce` con `[1, 2, 3].miReduce((a, b) => a + b)`, **sin** inicial:

| Vuelta | `i` | `acumulador` antes | `this[i]` | `acumulador` después |
|---|---|---|---|---|
| preparación | | `this[0]` = 1 | | 1 |
| 1 | 1 | 1 | 2 | 3 |
| 2 | 2 | 3 | 3 | 6 |

Con inicial `10`, el acumulador arranca en 10 y la primera vuelta es con `i = 0`: 10 + 1 = 11, 11 + 2 = 13, 13 + 3 = 16.

¿Por qué `arguments.length` y no `inicial === undefined`? Porque alguien puede pasar `undefined` a propósito como valor inicial, y eso es distinto de no pasar nada. `arguments` es un objeto especial de las funciones normales que cuenta cuántos argumentos llegaron de verdad.

## Errores comunes

- **Definir los métodos con flecha.** `this` no es el arreglo sino el `this` del módulo (`undefined`). Lo reconoces por "Cannot read properties of undefined (reading 'length')".
- **Empezar `miReduce` siempre en `i = 0` aunque no haya inicial.** Sumas el primer elemento dos veces: `[1, 2, 3]` da 7. Lo reconoces porque el test de vueltas recibe `[0, 1, 2]`.
- **Revisar `if (!inicial)` para saber si te pasaron valor inicial.** Con `inicial = 0` lo tratas como "no hay", y `[1, 2, 3].miReduce(fn, 0)` empieza mal.
- **En `miFilter`, guardar el resultado del callback en vez del elemento.** Recibes `[true, true]` en vez de `[2, 4]`.
- **Olvidar pasar `i` y `this` al callback.** Los callbacks que usan el índice reciben `undefined`. Lo reconoces porque el test de `"0:10/2"` falla con "Cannot read properties of undefined (reading 'length')": el callback intentó leer `arr.length` y `arr` no llegó.

## Otra forma de resolverlo

En código serio, los polyfills se definen con `Object.defineProperty`, para que el método **no aparezca** al recorrer el arreglo con `for...in`:

```js
Object.defineProperty(Array.prototype, "miMap", {
  value: function (callback) {
    const resultado = [];
    for (let i = 0; i < this.length; i++) resultado.push(callback(this[i], i, this));
    return resultado;
  },
  writable: true,
  configurable: true,
  enumerable: false,
});
```

Con la asignación normal (`Array.prototype.miMap = ...`) la propiedad queda "enumerable" y un `for (const k in [1, 2])` mostraría `"0"`, `"1"` y también `"miMap"`. Por eso, en proyectos reales, **no se modifican los prototipos nativos**: se escriben funciones normales como `miMap(arreglo, callback)`. Aquí lo hacemos para practicar `this`.

## Cómo explicarlo en la entrevista

> "Dentro del método, `this` es el arreglo, así que uso `function` y no flecha. `map` aplica el callback a cada elemento y guarda el resultado en un arreglo nuevo; `filter` guarda solo los que pasan la condición; `reduce` acumula. Los tres le pasan al callback el elemento, el índice y el arreglo. El detalle de `reduce` es que, sin valor inicial, usa el primer elemento como acumulador y empieza desde el segundo, y si el arreglo está vacío lanza `TypeError`. Los tres son O(n) y ninguno modifica el original."

## Conceptos

- **Polyfill**: código que implementa una función nativa para entornos que no la tienen.
- **`Array.prototype`**: el objeto del que heredan todos los arreglos sus métodos.
- **`this` en métodos de prototipo**: es el objeto sobre el que se llamó el método.
- **`arguments`**: objeto con los argumentos que recibió una función normal; no existe en flechas.
- **Valor inicial de `reduce`**: si falta, el acumulador es el primer elemento.
- **`Object.defineProperty`**: define una propiedad con opciones como `enumerable: false`.
