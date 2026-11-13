Crea el componente `MasVendidas` que recibe `ventas`, un **objeto** donde cada clave es el nombre de una pizza y cada valor la cantidad vendida, y muestra el **top 3**.

## Reglas

- Una lista ordenada `<ol>` con un `<li>` por pizza con el formato `Nombre (cantidad)`, por ejemplo `Pepperoni (55)`.
- De la más vendida a la menos vendida.
- Como máximo 3 elementos. Si hay menos de 3 pizzas, muestra las que haya.
- No modifiques la prop `ventas`.

## Ejemplo

```jsx
<MasVendidas ventas={{ Margarita: 40, Hawaiana: 12, Pepperoni: 55, Vegana: 8 }} />
```

Se ve:

```
1. Pepperoni (55)
2. Margarita (40)
3. Hawaiana (12)
```

## Por qué importa

Los datos no siempre llegan como arreglo. Muchas APIs devuelven objetos tipo "diccionario" y para ordenarlos o pintarlos con `map` primero hay que **convertirlos** en arreglo. `Object.entries` + `toSorted` + `slice` es una cadena que vas a usar muchísimo.
