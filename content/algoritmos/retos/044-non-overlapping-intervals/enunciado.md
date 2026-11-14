Escribe la función `intervalosAQuitar(intervalos)` que reciba una lista de intervalos `[inicio, fin]` y devuelva la **cantidad mínima** de intervalos que hay que quitar para que los que quedan **no se superpongan** entre sí.

Piénsalo como reservas de una sala de reuniones: quieres cancelar la menor cantidad posible de reuniones para que ninguna choque con otra.

## Reglas

- En cada intervalo, `inicio < fin`.
- **Aquí tocarse NO es superponerse**: `[1, 2]` y `[2, 3]` pueden quedarse los dos (una reunión termina a las 2 y la otra empieza a las 2). Ojo, es distinto que en Merge Intervals.
- Los intervalos pueden venir **desordenados** y puede haber repetidos.
- Si la lista está vacía, devuelve `0`.
- No modifiques el arreglo original.

## Ejemplos

```js
intervalosAQuitar([[1, 2], [2, 3], [3, 4], [1, 3]]);   // 1   quitas [1, 3]
intervalosAQuitar([[1, 2], [1, 2], [1, 2]]);           // 2   solo puede quedar uno
intervalosAQuitar([[1, 2], [2, 3]]);                   // 0   se tocan, no chocan
intervalosAQuitar([[1, 100], [2, 3], [4, 5], [6, 7]]); // 1   quitas [1, 100]
```

## Reto extra

Probar todas las formas de quitar intervalos es exponencial. Con una idea **greedy** (voraz) y un ordenamiento se resuelve en **O(n log n)**. Pista para pensar: ¿qué reunión te conviene conservar primero, la que empieza antes o la que **termina** antes?
