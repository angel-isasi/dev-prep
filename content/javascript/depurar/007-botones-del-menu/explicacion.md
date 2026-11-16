## Idea clave

Una función **recuerda la variable**, no el valor que tenía cuando se creó (eso es un closure). Con `var`, el bucle tiene **una sola** `i` compartida por todas las flechas. Cuando llamas a cualquiera de ellas, el bucle ya terminó e `i` vale `opciones.length`. Con `let`, cada vuelta del `for` tiene su propia `i`, y cada flecha recuerda la suya.

## Paso a paso

1. **Lee el síntoma.** Todos los botones dicen lo mismo, y el número es **4** con 3 opciones: un valor que solo existe cuando el bucle ya terminó.
2. **Reprodúcelo.** `crearAcciones(["A", "B"])[0]()` da `"Elegiste: undefined (n.º 3)"`. El número siempre es `length + 1`.
3. **Piensa en el momento.** Las flechas no se ejecutan dentro del bucle: se ejecutan después, al hacer clic. Lo que importa es cuánto vale `i` **en ese momento**.
4. **Cambia `var` por `let`.**

```js
for (let i = 0; i < opciones.length; i++) {
  acciones.push(() => `Elegiste: ${opciones[i]} (n.º ${i + 1})`);
}
```

## Por qué funciona

| | Con `var` | Con `let` |
|---|---|---|
| Cuántas `i` hay | una para toda la función | una nueva por cada vuelta |
| Qué recuerda la flecha 0 | la `i` compartida | la `i` de la vuelta 0 |
| Valor al llamarla después | `3` (el final del bucle) | `0` |

`var` tiene alcance de **función**: vive fuera del bloque del `for`. `let` tiene alcance de **bloque**, y el `for` crea un bloque (y una `i`) nuevo por vuelta, copiando el valor de la vuelta anterior antes de hacer `i++`.

## Errores comunes

- **Restar 1** (`opciones[i - 1]`). Todos los botones dirían "Salir": sigues teniendo una sola variable compartida, solo que ahora apunta a la última opción.
- **Pensar que el problema es el template string** y cambiarlo por concatenación con `+`. El texto se arma bien; el dato que recibe es el que está mal.
- **Declarar `let i` antes del bucle** (`let i; for (i = 0; ...)`). Al estar fuera del `for`, vuelve a ser una sola variable para todas las vueltas, igual que con `var`.

## Otra forma de resolverlo

`map` crea una función por elemento, y cada llamada al callback tiene sus propios parámetros, así que no hay variable compartida:

```js
export function crearAcciones(opciones) {
  return opciones.map((opcion, i) => () => `Elegiste: ${opcion} (n.º ${i + 1})`);
}
```

Antes de que existiera `let`, el truco era una función que se llama de inmediato (IIFE) para "congelar" el valor: `(function (j) { acciones.push(() => opciones[j]); })(i)`.

## Cómo explicarlo en la entrevista

> "Es el clásico del closure con `var` en un bucle. Las funciones se ejecutan después de que el bucle terminó, y todas recuerdan la misma `i`, porque `var` tiene alcance de función. Al llamarlas, `i` ya vale la longitud del arreglo. Con `let`, que tiene alcance de bloque, cada vuelta crea su propia `i` y cada función recuerda la suya."

## Conceptos

- **Closure**: una función recuerda las variables del lugar donde se creó, aunque se ejecute después.
- **Alcance de función (`var`)**: la variable existe en toda la función, no solo dentro del bloque.
- **Alcance de bloque (`let`, `const`)**: la variable existe solo dentro de las llaves donde se declaró.
- **`let` en un `for`**: crea una variable nueva en cada vuelta.
- **IIFE**: función que se declara y se llama en el mismo momento: `(function () { ... })()`.
