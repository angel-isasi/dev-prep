## Idea clave

Un iterador es un objeto que **recuerda por dónde va**. Lo logras con un **closure**: la variable `indice` vive dentro de `crearIterador`, y el método `siguiente` la sigue viendo y modificando después de que `crearIterador` terminó. Cada llamada a `crearIterador` crea un `indice` nuevo, por eso cada iterador lleva su propia cuenta.

## Paso a paso

1. **Crea el contador** `let indice = 0` dentro de `crearIterador`. Usa `let` porque va a cambiar.
2. **Devuelve un objeto** con el método `siguiente`. Ese objeto es el iterador.
3. **En `siguiente`, pregunta si quedan elementos**: `indice < lista.length`. Los índices válidos van de `0` a `length - 1`.
4. **Si quedan**: guarda `lista[indice]`, suma 1 a `indice` y devuelve `{ valor, listo: false }`. La forma corta `{ valor }` equivale a `{ valor: valor }`.
5. **Si no quedan**: devuelve `{ valor: undefined, listo: true }`. Como `indice` ya no avanza, todas las llamadas siguientes caen aquí también.

```js
export function crearIterador(lista) {
  let indice = 0;

  return {
    siguiente() {
      if (indice < lista.length) {
        const valor = lista[indice];
        indice++;
        return { valor, listo: false };
      }
      return { valor: undefined, listo: true };
    },
  };
}
```

## Por qué funciona

Con `const it = crearIterador(["a", "b"])`, `lista.length` es 2. Esto devuelve cada llamada:

| Llamada | `indice` antes | `indice < 2` | Devuelve | `indice` después |
|---|---|---|---|---|
| 1.ª `it.siguiente()` | `0` | sí | `{ valor: "a", listo: false }` | `1` |
| 2.ª `it.siguiente()` | `1` | sí | `{ valor: "b", listo: false }` | `2` |
| 3.ª `it.siguiente()` | `2` | no | `{ valor: undefined, listo: true }` | `2` |
| 4.ª `it.siguiente()` | `2` | no | `{ valor: undefined, listo: true }` | `2` |

¿Por qué `indice` no se reinicia en cada llamada? Porque `let indice = 0` se ejecuta **una sola vez**, cuando llamas a `crearIterador`. Después, `siguiente` solo lee y cambia esa misma variable. Si haces `crearIterador(lista)` otra vez, se ejecuta de nuevo y nace otro `indice` independiente: por eso `it1` e `it2` del test no se mezclan.

El test de valores falsy (`[0, ""]`) pasa porque la condición mira la **posición** (`indice < lista.length`), no el valor. `0` y `""` se entregan como cualquier otro elemento.

## Errores comunes

- **Declarar `let indice = 0` dentro de `siguiente`.** Se reinicia en cada llamada y siempre devuelves el primer elemento: `"a"`, `"a"`, `"a"`... Lo reconoces porque el segundo valor sale igual al primero.
- **Guardar el índice en una variable fuera de la función** (al nivel del archivo). Todos los iteradores comparten la misma posición; falla "cada iterador recuerda su propia posición".
- **Decidir si terminó con el valor:** `if (lista[indice])`. Un `0`, un `""` o un `false` en la lista se toman como "ya terminé". Compara la posición con `length`.
- **Usar `indice <= lista.length`.** Das una vuelta de más y devuelves `{ valor: undefined, listo: false }` antes de terminar.
- **Vaciar la lista con `lista.shift()`.** Entregas los valores bien, pero destruyes el arreglo original y no puede haber dos iteradores sobre la misma lista.

## Otra forma de resolverlo

El protocolo real de JavaScript usa `next` y `{ value, done }`. Si lo implementas así y agregas `[Symbol.iterator]`, tu objeto funciona con `for...of` y con spread:

```js
function crearIteradorReal(lista) {
  let indice = 0;
  return {
    next() {
      return indice < lista.length
        ? { value: lista[indice++], done: false }
        : { value: undefined, done: true };
    },
    [Symbol.iterator]() {
      return this;
    },
  };
}

[...crearIteradorReal(["a", "b"])]; // ["a", "b"]
```

`lista[indice++]` lee con el valor actual de `indice` y **después** suma 1 (por eso es `++` a la derecha). Y con un generador, JavaScript arma todo esto por ti:

```js
function* crearIteradorGenerador(lista) {
  for (const elemento of lista) yield elemento;
}
```

**¿Cuál conviene?** Para entender cómo funciona `for...of`, hazlo a mano una vez. En código real, usa un generador (`function*`): es más corto y no puedes equivocarte con el índice. Los arreglos ya traen su propio iterador: `["a", "b"][Symbol.iterator]()`.

## Cómo explicarlo en la entrevista

> "Un iterador es un objeto con un método que devuelve el siguiente elemento y avisa cuando ya no hay más. Guardo la posición en una variable `indice` dentro de `crearIterador`, y el método `siguiente` la recuerda gracias al closure. En cada llamada comparo el índice con la longitud: si quedan elementos, devuelvo el actual con `listo: false` y avanzo; si no, devuelvo `listo: true`. Cada llamada a `crearIterador` crea su propio índice, así que los iteradores son independientes. Es lo mismo que hace `for...of` con `next()` y `done`."

## Conceptos

- **Iterador**: objeto que entrega los elementos de una colección uno por uno al llamar a su método (en JavaScript real, `next()`).
- **Closure**: una función que recuerda las variables del lugar donde fue creada, aunque ese lugar ya terminó de ejecutarse.
- **Protocolo de iteración**: `next()` devuelve `{ value, done }`; es lo que usan `for...of`, spread y `Array.from`.
- **`Symbol.iterator`**: el método que `for...of` busca para pedirle un iterador a un objeto.
- **`indice++` (postincremento)**: usa el valor actual y luego le suma 1.
- **Valores falsy**: `0`, `""`, `false`, `null`, `undefined` y `NaN`; por eso no se usan para decidir si una lista terminó.
