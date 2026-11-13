Escribe la función `crearMultiplicador(factor)` que **devuelva una función**. Esa función nueva recibe un número `n` y devuelve `n * factor`.

Es una "fábrica": cada vez que la llamas, fabrica una función distinta que recuerda su propio `factor`.

## Reglas

- `crearMultiplicador` no multiplica nada: solo devuelve una función.
- La función devuelta recibe un solo número y devuelve el producto.
- Cada función fabricada es independiente: `doble` siempre multiplica por 2 aunque después crees un `triple`.

## Ejemplos

```js
const triple = crearMultiplicador(3);
triple(5);                    // 15
triple(10);                   // 30

const doble = crearMultiplicador(2);
doble(5);                     // 10

crearMultiplicador(10)(2);    // 20  (fabricas y llamas en la misma línea)
```

## Por qué importa

Es el ejemplo más pequeño de **closure**, la pregunta teórica más repetida en entrevistas de JavaScript. Si puedes explicar por qué `triple` sigue "recordando" el 3 después de que `crearMultiplicador` ya terminó, tienes la mitad de la respuesta.
