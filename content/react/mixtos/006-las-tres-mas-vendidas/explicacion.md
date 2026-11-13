## Idea clave

Convierte el objeto en un arreglo de pares con `Object.entries`, **ordénalo** por la cantidad (de mayor a menor) y **corta** los tres primeros con `slice`. Recién entonces lo pintas.

## Paso a paso

1. **Objeto a arreglo.** `Object.entries({ Margarita: 40, Pepperoni: 55 })` da `[["Margarita", 40], ["Pepperoni", 55]]`.
2. **Ordena por cantidad.** El comparador recibe dos pares. Con desestructuración `([, a], [, b])` ignoras el nombre (la coma inicial "salta" la posición 0) y te quedas con las cantidades. `b - a` pone primero la mayor.
3. **Corta.** `slice(0, 3)` devuelve como máximo 3 elementos; si hay menos, devuelve los que haya, sin error.
4. **Pinta.** Desestructura cada par en el `map` (`([nombre, cantidad])`) y usa el nombre como `key`, porque las claves de un objeto son únicas.

```jsx
export function MasVendidas({ ventas }) {
  const top = Object.entries(ventas)
    .toSorted(([, cantidadA], [, cantidadB]) => cantidadB - cantidadA)
    .slice(0, 3);

  return (
    <ol>
      {top.map(([nombre, cantidad]) => (
        <li key={nombre}>
          {nombre} ({cantidad})
        </li>
      ))}
    </ol>
  );
}
```

## Por qué funciona

Con `{ Margarita: 40, Hawaiana: 12, Pepperoni: 55, Vegana: 8 }`:

| Paso | Resultado |
|---|---|
| `Object.entries` | `[["Margarita", 40], ["Hawaiana", 12], ["Pepperoni", 55], ["Vegana", 8]]` |
| `toSorted` (b - a) | `[["Pepperoni", 55], ["Margarita", 40], ["Hawaiana", 12], ["Vegana", 8]]` |
| `slice(0, 3)` | `[["Pepperoni", 55], ["Margarita", 40], ["Hawaiana", 12]]` |

En el JSX, `{nombre} ({cantidad})` produce el texto `Pepperoni (55)`: los paréntesis y el espacio son texto literal entre las dos expresiones.

`Object.entries` crea un arreglo **nuevo**, así que ni siquiera `sort` modificaría el objeto `ventas`. Aun así, `toSorted` deja claro que no se muta nada.

## Errores comunes

- **Intentar `ventas.map(...)`.** Los objetos no tienen `map`: sale `ventas.map is not a function`.
- **Ordenar al revés** (`a - b`): obtienes las tres **menos** vendidas.
- **Hacer `slice` antes de ordenar.** Te quedas con las tres primeras del objeto, no con las tres más vendidas.
- **Usar `Object.keys` y luego `ventas[nombre]` en cada comparación.** Funciona, pero es más ruido; `entries` ya trae el valor.
- **Usar el índice como `key`.** El nombre es único y estable.

## Otra forma de resolverlo

Ordenando solo los nombres con `Object.keys`:

```jsx
const top = Object.keys(ventas)
  .toSorted((a, b) => ventas[b] - ventas[a])
  .slice(0, 3);

return (
  <ol>
    {top.map((nombre) => (
      <li key={nombre}>{nombre} ({ventas[nombre]})</li>
    ))}
  </ol>
);
```

**¿Cuándo conviene?** Cuando el valor lo necesitas poco o es pesado de copiar. Con datos simples como estos, `entries` es más directo. Si el top se calculara sobre miles de elementos en cada tecla, lo envolverías en `useMemo`.

## Cómo explicarlo en la entrevista

> "Como `ventas` es un objeto, primero lo convierto en un arreglo de pares con `Object.entries`. Luego lo ordeno por la cantidad de mayor a menor con `toSorted`, desestructurando cada par en el comparador, y con `slice(0, 3)` me quedo con el top 3; si hay menos, `slice` no falla. Todo se calcula en el render a partir de la prop, sin estado, y uso el nombre como `key` porque las claves de un objeto son únicas."

## Conceptos

- **`Object.entries`**: objeto a arreglo de pares `[clave, valor]`.
- **Desestructuración de arreglos**: `[, b]` ignora la primera posición.
- **`toSorted` con comparador**: `b - a` ordena de mayor a menor.
- **`slice(inicio, fin)`**: copia un tramo del arreglo; no falla si es más corto.
- **Estado derivado**: el top se calcula, no se guarda.
- **`key` estable**: el nombre de la pizza.
