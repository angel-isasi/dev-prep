Este reto es distinto: el archivo de inicio **ya funciona**. Tiene un componente `Padre` con un botón contador y una lista de filas (`Fila`), cada una con un botón "Borrar". El problema: cada vez que haces clic en el contador, **todas las filas se vuelven a renderizar**, aunque no cambiaron. Tu tarea es optimizarlo con `memo` y `useCallback`.

Para medirlo, el archivo exporta la variable `rendersHijo`, que `Fila` incrementa cada vez que se ejecuta.

## Reglas

- No cambies los textos: el botón dice **"Clics: N"** y cada fila muestra su texto y un botón **"Borrar"**.
- Mantén los exports: `Padre`, `Fila` y `rendersHijo`.
- Al hacer clic en "Clics: N", el número sube, pero `rendersHijo` **no debe aumentar**.
- "Borrar" quita esa fila, y al hacerlo **las demás filas no se vuelven a renderizar**.
- Necesitas las dos herramientas: `memo` sola no basta y `useCallback` sola tampoco. Descubre por qué.

## Ejemplo

```jsx
<Padre />
```

| Acción | Se ve | `rendersHijo` (sin optimizar) | `rendersHijo` (optimizado) |
|---|---|---|---|
| (inicio) | Clics: 0, filas a y b | 2 | 2 |
| Clic en "Clics: 0" | Clics: 1 | 4 | 2 |
| Clic en "Clics: 1" | Clics: 2 | 6 | 2 |
| Borrar "a" | solo la fila b | 7 | 2 |

## Por qué importa

"¿Cuándo se vuelve a renderizar un componente y cómo lo evitas?" es pregunta fija en entrevistas de React. Este ejercicio te obliga a entender **por qué** se re-renderiza un hijo y qué es la **igualdad por referencia** de las funciones.
