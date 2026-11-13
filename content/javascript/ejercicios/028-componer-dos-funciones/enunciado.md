Escribe la función `componer(f, g)` que devuelva una función nueva que recibe un valor `x` y devuelve `f(g(x))`: primero aplica `g` y, al resultado, le aplica `f`.

## Reglas

- `componer` no ejecuta nada todavía: devuelve una función.
- El orden importa: **primero `g`, después `f`** (se lee de derecha a izquierda, como en matemáticas).
- La función devuelta recibe un solo valor.

## Ejemplos

```js
const sinEspacios = (s) => s.trim();
const gritar = (s) => s.toUpperCase() + "!";

const limpiarYGritar = componer(gritar, sinEspacios);
limpiarYGritar("  ica ");       // "ICA!"

const sumar1 = (n) => n + 1;
const doble = (n) => n * 2;
componer(doble, sumar1)(5);     // 12  -> doble(sumar1(5)) = doble(6)
componer(sumar1, doble)(5);     // 11  -> sumar1(doble(5)) = sumar1(10)
```

## Por qué importa

Componer es armar funciones grandes juntando funciones pequeñas, como piezas de Lego: limpiar un texto, validarlo y formatearlo en un solo paso. Es una idea central de la programación funcional, aparece en librerías como Redux y te la pueden preguntar como "implementa `compose`".
