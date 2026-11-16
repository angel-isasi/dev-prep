## Idea clave

No puedes probar todas las páginas posibles, pero no hace falta: la función trata igual a todas las páginas "del medio". La técnica es la **partición de equivalencia**: divides las entradas en **grupos que se comportan igual** y pruebas un representante de cada grupo, más los bordes entre grupos. Para `pagina` los grupos son: menor que 1, la primera, del medio, la última y mayor que el total. Para la lista: vacía, que divide exacto y que no divide exacto.

## Paso a paso

1. **Dibuja los grupos de `pagina`** con 10 elementos de 3 en 3 (4 páginas):

   ```
   ... -1  0 | 1 | 2  3 | 4 | 5  6 ... 99
    no existe |1ra| medio|últ| no existe
   ```

2. **Prueba un representante de cada grupo.** La página 2 (medio) ya venía de ejemplo. Agrega la 1, la 4, la 0 y la 99.
3. **Elige una lista que no divida exacto.** Con 9 elementos de 3 en 3, `Math.ceil` y `Math.floor` dan lo mismo (3). Con 10, `ceil` da 4 y `floor` da 3: la diferencia aparece.
4. **Compara el objeto completo.** `toEqual({ items, pagina, totalPaginas })` revisa las tres partes. La versión que no corrige la página 99 devuelve `items: []` **y** `pagina: 99`; si solo miraras `items.length > 0` en otra página, se te escaparía.
5. **No olvides la lista vacía.** Es un grupo por sí solo: `0 / 3` es `0`, y sin `Math.max(1, ...)` la función diría que hay 0 páginas y que estás en la página 0.

## Por qué funciona

| Mutante | Qué rompe | Test que lo atrapa |
|---|---|---|
| Cuenta páginas desde 0 | páginas desde 1 | página 1 da `[1, 2, 3]` |
| Redondea hacia abajo | total hacia arriba | página 4 da `[10]` con `totalPaginas: 4` |
| No corrige página mayor | página mayor que el total | página 99 muestra la 4 |
| No corrige página menor | página menor que 1 | página 0 muestra la 1 |
| 0 páginas con lista vacía | lista vacía tiene 1 página | `[]` da `totalPaginas: 1` |

El ejemplo de la página 2 solo atrapa a la versión que cuenta desde 0. Las otras cuatro fallan en **bordes o grupos raros**, justo donde la gente no suele mirar.

## Errores comunes

- **Probar varias páginas del mismo grupo.** Las páginas 2 y 3 se calculan igual: dos tests ahí cuestan el doble y atrapan lo mismo. Mejor un test por grupo.
- **Usar datos que dividen exacto.** 9 de 3 en 3, o 10 de 5 en 5. El redondeo nunca se pone a prueba.
- **Comparar solo `items`.** El objeto tiene tres partes y cualquiera puede estar mal. Si el componente de paginación usa `pagina` para resaltar el botón activo, un `pagina: 99` rompe la interfaz aunque `items` esté bien.
- **Escribir el esperado sin pensar en la regla.** ¿Qué debe hacer la página 0? El enunciado dice "se muestra la página 1". Si no hubiera regla, ese sería el momento de preguntarle al equipo, no de adivinar.

## Otra forma de resolverlo

Una tabla con una fila por grupo hace visible que no te saltaste ninguno:

```js
const casos = [
  ["menor que 1", 0, { items: [1, 2, 3], pagina: 1, totalPaginas: 4 }],
  ["primera", 1, { items: [1, 2, 3], pagina: 1, totalPaginas: 4 }],
  ["del medio", 2, { items: [4, 5, 6], pagina: 2, totalPaginas: 4 }],
  ["última", 4, { items: [10], pagina: 4, totalPaginas: 4 }],
  ["mayor que el total", 99, { items: [10], pagina: 4, totalPaginas: 4 }],
];
for (const [grupo, pagina, esperado] of casos) {
  test(`página ${grupo}`, () => {
    expect(paginar(numeros, pagina, 3)).toEqual(esperado);
  });
}
```

## Cómo explicarlo en la entrevista

> "Usé partición de equivalencia: separé las páginas en grupos que la función trata igual (menor que 1, primera, del medio, última y mayor que el total) y probé una de cada grupo. Elegí 10 elementos de 3 en 3 para que la última página quedara incompleta y se notara un error de redondeo. Y comparé el objeto completo con `toEqual`, porque la página que devuelve también la usa la interfaz."

## Conceptos

- **Partición de equivalencia**: agrupar entradas que producen el mismo comportamiento y probar un representante por grupo.
- **Valor límite**: los bordes entre grupos (`0` y `1`, `4` y `5`).
- **`Math.ceil` y `Math.floor`**: redondean hacia arriba y hacia abajo; solo difieren cuando la división no es exacta.
- **`slice(inicio, fin)`**: copia del índice `inicio` hasta antes de `fin`; con índices negativos cuenta desde el final, por eso una página 0 sin corregir devuelve basura.
- **Clamping**: limitar un valor a un rango con `Math.min(Math.max(min, valor), max)`.
