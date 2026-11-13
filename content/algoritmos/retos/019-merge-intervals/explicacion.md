## Idea clave

Si **ordenas por inicio**, los intervalos que se superponen quedan juntos. Así basta recorrerlos una vez comparando cada uno con **el último** del resultado: si empieza antes de que el último termine, los fusionas extendiendo el final; si no, empieza un intervalo nuevo.

## Paso a paso

1. **La solución directa** (dila en voz alta): sin ordenar, compara cada pareja de intervalos; si dos se superponen, fusiónalos y vuelve a empezar, hasta que ya no haya cambios. Funciona, pero cada ronda es O(n²) y puede haber muchas rondas: O(n³) en el peor caso.
2. **Ordena una copia por inicio**: `[...intervalos].sort((a, b) => a[0] - b[0])`. Usamos copia para no modificar la entrada.
3. **Cuándo se superponen**: con todo ordenado por inicio, el intervalo actual se superpone con el último del resultado si `inicio <= ultimo[1]`. El `<=` hace que tocarse en un punto (`[1, 4]` y `[4, 5]`) cuente.
4. **Si se superponen, extiende**: `ultimo[1] = Math.max(ultimo[1], fin)`. El `Math.max` es necesario porque el actual puede estar **contenido** en el último (`[1, 4]` y `[2, 3]`): su fin es menor y no debe acortar nada.
5. **Si no, agrega una copia**: `resultado.push([inicio, fin])`. Es un arreglo nuevo, así que cuando después cambies `ultimo[1]` no tocas el intervalo original del usuario.
6. **¿Por qué solo comparar con el último?** Porque los intervalos anteriores del resultado terminan antes de que empiece el último (si no, ya se habrían fusionado con él), y el actual empieza después que todos ellos.

```js
export function fusionar(intervalos) {
  const ordenados = [...intervalos].sort((a, b) => a[0] - b[0]);
  const resultado = [];

  for (const [inicio, fin] of ordenados) {
    const ultimo = resultado[resultado.length - 1];
    if (ultimo && inicio <= ultimo[1]) {
      ultimo[1] = Math.max(ultimo[1], fin);
    } else {
      resultado.push([inicio, fin]);
    }
  }

  return resultado;
}
```

## Por qué funciona

Recorrido con `fusionar([[8, 10], [1, 3], [2, 6], [15, 18]])`. Ordenados por inicio: `[[1, 3], [2, 6], [8, 10], [15, 18]]`.

| Actual | Último del resultado | ¿Se superpone? (`inicio <= ultimo[1]`) | `resultado` después |
|---|---|---|---|
| `[1, 3]` | (ninguno) | | `[[1, 3]]` |
| `[2, 6]` | `[1, 3]` | 2 <= 3, sí | `[[1, 6]]` (fin = max(3, 6)) |
| `[8, 10]` | `[1, 6]` | 8 <= 6, no | `[[1, 6], [8, 10]]` |
| `[15, 18]` | `[8, 10]` | 15 <= 10, no | `[[1, 6], [8, 10], [15, 18]]` |

Con `[[1, 4], [2, 3]]`: el `[2, 3]` se superpone (2 <= 4) y el fin queda `Math.max(4, 3) = 4`. Sin el `Math.max` quedaría `[1, 3]`, perdiendo el tramo del 3 al 4.

## Errores comunes

- **No ordenar.** Con `[[8, 10], [1, 3], [2, 6]]`, al llegar `[1, 3]` compruebas `1 <= 10`, crees que se superpone con `[8, 10]` y lo "fusionas" en `[8, 10]`: el tramo del 1 al 3 desaparece. Lo reconoces en el test "vienen desordenados".
- **Ordenar con `sort()` sin comparador.** Ordena como texto: `[[10, 11], [2, 3]]` queda igual, porque `"10,11"` va antes que `"2,3"`.
- **Asignar `ultimo[1] = fin` sin `Math.max`.** Un intervalo contenido acorta el resultado. Lo reconoces en el test `[[1, 4], [2, 3]]`.
- **Usar `<` en vez de `<=`.** `[1, 4]` y `[4, 5]` quedan separados. Lo reconoces en el test "se tocan en un punto".
- **Agregar el intervalo original** con `resultado.push(intervalo)` en lugar de una copia. Al extender `ultimo[1]` modificas el arreglo del usuario. Lo reconoces en el test "no modifica el arreglo original".

## Otra forma de resolverlo

**Fusionar por rondas sin ordenar** (paso 1): O(n³) en el peor caso. Solo vale como idea inicial.

**Ordenar y usar `reduce`**: la misma lógica escrita de forma funcional. Mismo costo, más compacta, pero un poco más difícil de leer para algunos:

```js
return [...intervalos]
  .sort((a, b) => a[0] - b[0])
  .reduce((res, [inicio, fin]) => {
    const ultimo = res[res.length - 1];
    if (ultimo && inicio <= ultimo[1]) ultimo[1] = Math.max(ultimo[1], fin);
    else res.push([inicio, fin]);
    return res;
  }, []);
```

**¿Cuál conviene?** Ordenar y recorrer, con `for...of` o con `reduce`. El costo total es O(n log n) por el ordenamiento; el recorrido en sí es O(n).

## Cómo explicarlo en la entrevista

> "Sin ordenar tendría que comparar cada pareja de intervalos, que es al menos O(n²). Si ordeno por inicio, los que se superponen quedan juntos. Recorro y comparo cada uno con el último del resultado: si empieza antes o justo cuando termina el último, los fusiono extendiendo el final con el máximo; si no, lo agrego como nuevo. Uso el máximo porque un intervalo puede estar totalmente contenido en otro. Es O(n log n) de tiempo por el ordenamiento y O(n) de memoria para la copia y el resultado."

## Conceptos

- **Ordenar como paso previo**: muchos problemas de intervalos se vuelven lineales después de ordenar.
- **Comparador para arreglos**: `sort((a, b) => a[0] - b[0])` ordena por el primer elemento.
- **Desestructuración en el `for`**: `for (const [inicio, fin] of lista)`.
- **Superposición de intervalos ordenados**: `actual.inicio <= anterior.fin`.
- **Copias vs referencias**: `push([inicio, fin])` crea un arreglo nuevo; `push(intervalo)` comparte el del usuario.
