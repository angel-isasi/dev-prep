## Idea clave

Una función generadora (`function*`) se puede **pausar**: cada `yield` entrega un valor y congela la función ahí mismo, con todas sus variables, hasta que alguien pida el siguiente. Por eso un `while (true)` no se cuelga: solo da una vuelta por cada valor pedido. `tomar` pide valores con `for...of` y corta con `break` cuando ya tiene suficientes.

## Paso a paso

**`fibonacci`**

1. **Arranca con los dos primeros**: `let [a, b] = [0, 1]`. `a` es el número que toca entregar y `b` el que viene después.
2. **Bucle infinito** `while (true)`.
3. **`yield a`**: entrega el actual y pausa. La función se queda esperando aquí.
4. **Avanza los dos a la vez** con desestructuración: `[a, b] = [b, a + b]`. El nuevo `a` es el viejo `b`, y el nuevo `b` es la suma. Se calcula todo el lado derecho primero con los valores viejos, y después se asigna.

**`tomar`**

1. **Crea el arreglo** `resultado`.
2. **Si `cantidad` es 0 o menos**, devuelve `[]` sin tocar el iterable.
3. **Recorre con `for...of`**: en cada vuelta, `for...of` llama a `next()` del generador por debajo.
4. **Agrega el valor** y, **si ya tienes `cantidad`, `break`**. Al salir del bucle, `for...of` cierra el generador.
5. Si el iterable se acaba antes (un arreglo corto), el bucle termina solo y devuelves lo que juntaste.

```js
export function* fibonacci() {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

export function tomar(iterable, cantidad) {
  const resultado = [];
  if (cantidad <= 0) return resultado;

  for (const valor of iterable) {
    resultado.push(valor);
    if (resultado.length === cantidad) break;
  }
  return resultado;
}
```

## Por qué funciona

Llamar a `fibonacci()` **no ejecuta nada** todavía: solo crea el generador, pausado antes de la primera línea. Cada `next()` lo hace correr hasta el siguiente `yield`:

| Llamada | Qué corre | Devuelve | `a`, `b` mientras está pausado |
|---|---|---|---|
| 1.º `next()` | inicializa y llega al `yield a` | `{ value: 0, done: false }` | `0`, `1` |
| 2.º `next()` | `[a, b] = [1, 0 + 1]`, vuelve al `yield` | `{ value: 1, done: false }` | `1`, `1` |
| 3.º `next()` | `[a, b] = [1, 1 + 1]` | `{ value: 1, done: false }` | `1`, `2` |
| 4.º `next()` | `[a, b] = [2, 1 + 2]` | `{ value: 2, done: false }` | `2`, `3` |
| 5.º `next()` | `[a, b] = [3, 2 + 3]` | `{ value: 3, done: false }` | `3`, `5` |

Con `tomar(fibonacci(), 3)`:

| Vuelta | `valor` | `resultado` | ¿`length === 3`? |
|---|---|---|---|
| 1 | `0` | `[0]` | no |
| 2 | `1` | `[0, 1]` | no |
| 3 | `1` | `[0, 1, 1]` | sí → `break` |

Después del `break` nadie vuelve a llamar `next()`, así que el `while (true)` se queda pausado para siempre y no consume nada. El generador solo calculó los 3 números que se pidieron.

## Errores comunes

- **Olvidar el asterisco:** `function fibonacci()`. `yield` dentro de una función normal es un error de sintaxis: "Unexpected strict mode reserved word". En este ejercicio el asterisco ya viene en el archivo de inicio: no lo borres.
- **Avanzar en dos líneas:** `a = b; b = a + b;`. En la segunda línea `a` ya cambió y la sucesión sale mal: `0, 1, 2, 4, 8...`. Usa la desestructuración o una variable temporal.
- **No contemplar `cantidad = 0`.** Con el `if` después del `push`, `resultado` ya tiene 1 elemento cuando preguntas por primera vez, así que `length === 0` nunca se cumple y con `fibonacci()` el bucle es infinito: el test se queda colgado. Por eso va el `if (cantidad <= 0)` antes del bucle. (Poner el `if ... break` al **inicio** de cada vuelta también evita el problema, pero le pide al generador un valor de más que luego descartas.)
- **Hacer `[...fibonacci()]` o `Array.from(fibonacci())`.** Intentan sacar **todos** los valores de un generador infinito: los tests se cuelgan hasta que se acaba el tiempo o la memoria.
- **Reusar el mismo generador.** Un generador solo se recorre una vez: después de `tomar(gen, 3)`, el mismo `gen` ya está cerrado. Para empezar de nuevo, llama otra vez a `fibonacci()`.

## Otra forma de resolverlo

`tomar` usando `next()` directamente, sin `for...of`:

```js
export function tomar(iterable, cantidad) {
  const iterador = iterable[Symbol.iterator]();
  const resultado = [];
  while (resultado.length < cantidad) {
    const { value, done } = iterador.next();
    if (done) break;
    resultado.push(value);
  }
  return resultado;
}
```

Aquí ves lo que `for...of` hace por ti: pedir el iterador con `[Symbol.iterator]()` y llamar `next()` hasta que `done` sea `true`. Esta versión maneja el `cantidad = 0` sola, porque el `while` ni empieza.

Y en Node 22 y navegadores modernos existen los **helpers de iteradores**, que hacen esto en una línea:

```js
fibonacci().take(8).toArray(); // [0, 1, 1, 2, 3, 5, 8, 13]
```

**¿Cuál conviene?** En una entrevista, escribe la versión con `for...of` y `break`: es la más clara. La de `next()` conviene si te preguntan "¿qué hace `for...of` por dentro?". `take` es lo más corto, pero menciona que es reciente por si el entorno es antiguo.

## Cómo explicarlo en la entrevista

> "Uso una función generadora porque la sucesión es infinita y quiero calcular los números solo cuando los piden. Guardo el actual y el siguiente; en cada vuelta hago `yield` del actual y avanzo los dos con desestructuración. El `while (true)` no se cuelga porque el `yield` pausa la función. Para `tomar` recorro con `for...of`, que llama a `next()` por debajo, y hago `break` apenas tengo los que necesito; eso además cierra el generador. Reviso aparte el caso de cantidad cero."

## Conceptos

- **Función generadora (`function*`)**: función que se puede pausar y reanudar; al llamarla devuelve un generador, no ejecuta su cuerpo.
- **`yield`**: entrega un valor y pausa el generador hasta el próximo `next()`.
- **`next()`**: reanuda el generador y devuelve `{ value, done }`.
- **Evaluación perezosa (lazy)**: calcular un valor solo cuando se necesita; permite secuencias infinitas.
- **Desestructuración con intercambio**: `[a, b] = [b, a + b]` calcula el lado derecho completo antes de asignar.
- **`for...of` + `break`**: recorre cualquier iterable; `break` sale del bucle y cierra el generador.
- **Iterable**: todo lo que tiene `[Symbol.iterator]`: arreglos, strings, `Map`, `Set` y generadores.
