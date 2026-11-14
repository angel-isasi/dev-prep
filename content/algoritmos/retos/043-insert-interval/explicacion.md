## Idea clave

Como la lista ya está ordenada, los intervalos aparecen en **tres grupos seguidos**: los que terminan antes de que empiece `nuevo` (se copian), los que se superponen con `nuevo` (se absorben estirando su inicio y su fin) y los que empiezan después de que `nuevo` termina (se copian). Tres `while` con el mismo índice y listo: una sola pasada.

## Paso a paso

1. **La solución directa** (dila en voz alta): agrega `nuevo` a una copia de la lista, ordénala por inicio y fusiona como en Merge Intervals. Funciona y reutiliza algo conocido, pero el ordenamiento cuesta O(n log n) cuando la lista **ya estaba ordenada**.
2. **Piensa en los grupos.** Un intervalo `[a, b]` de la lista:
   - está **antes** de `nuevo` si `b < nuevo.inicio` (termina antes de que empiece);
   - está **después** si `a > nuevo.fin` (empieza después de que termina);
   - en cualquier otro caso **se superpone**.
   Como la lista está ordenada, primero vienen todos los de "antes", luego los que se superponen y al final los de "después".
3. **Grupo 1**: mientras `intervalos[i][1] < inicio`, copia el intervalo al resultado y avanza `i`. El `<` estricto hace que `[1, 5]` con `nuevo = [5, 7]` **no** entre aquí, porque se tocan.
4. **Grupo 2**: mientras `intervalos[i][0] <= fin`, ese intervalo se superpone. Absórbelo: `inicio = Math.min(inicio, a)` y `fin = Math.max(fin, b)`. Al terminar, agrega `[inicio, fin]` una sola vez. Si ningún intervalo se superponía, este `while` no da ninguna vuelta y simplemente agregas `nuevo` en su sitio.
5. **Grupo 3**: copia todo lo que queda.
6. **No toques la entrada**: `let [inicio, fin] = nuevo` copia los dos números en variables, y `[...intervalos[i]]` copia cada intervalo.

```js
export function insertarIntervalo(intervalos, nuevo) {
  const resultado = [];
  let [inicio, fin] = nuevo;
  let i = 0;

  while (i < intervalos.length && intervalos[i][1] < inicio) {
    resultado.push([...intervalos[i]]);
    i++;
  }

  while (i < intervalos.length && intervalos[i][0] <= fin) {
    inicio = Math.min(inicio, intervalos[i][0]);
    fin = Math.max(fin, intervalos[i][1]);
    i++;
  }
  resultado.push([inicio, fin]);

  while (i < intervalos.length) {
    resultado.push([...intervalos[i]]);
    i++;
  }

  return resultado;
}
```

## Por qué funciona

Recorrido con `insertarIntervalo([[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], [4, 8])`. Al inicio `inicio = 4` y `fin = 8`.

| `i` | Intervalo | Pregunta | Grupo | `inicio`, `fin` | `resultado` |
|---|---|---|---|---|---|
| 0 | `[1, 2]` | ¿2 < 4? sí | antes | 4, 8 | `[[1, 2]]` |
| 1 | `[3, 5]` | ¿5 < 4? no. ¿3 <= 8? sí | se superpone | 3, 8 | `[[1, 2]]` |
| 2 | `[6, 7]` | ¿6 <= 8? sí | se superpone | 3, 8 | `[[1, 2]]` |
| 3 | `[8, 10]` | ¿8 <= 8? sí | se superpone | 3, 10 | `[[1, 2]]` |
| 4 | `[12, 16]` | ¿12 <= 10? no | (fin del grupo 2) | 3, 10 | `[[1, 2], [3, 10]]` |
| 4 | `[12, 16]` | lo que queda | después | | `[[1, 2], [3, 10], [12, 16]]` |

Fíjate en `[8, 10]`: empieza justo donde termina el nuevo (8), y por el `<=` se fusiona. Y en `[3, 5]`: empieza antes que el nuevo, por eso `Math.min` baja el inicio de 4 a 3.

## Errores comunes

- **Usar `<=` en el grupo 1 o `<` en el grupo 2.** Los intervalos que solo se tocan quedan separados. Lo reconoces en el test "tocarse en un punto cuenta como superponerse".
- **Olvidar `Math.min` en el inicio.** Con `[[1, 3]]` y `nuevo = [2, 5]` darías `[2, 5]` y perderías el tramo del 1 al 2. Falla el ejemplo clásico.
- **Olvidar `Math.max` en el fin.** Si `nuevo` queda dentro de un intervalo grande (`[3, 4]` dentro de `[1, 10]`), el resultado se acorta a `[1, 4]`. Lo reconoces en el test "queda dentro de uno".
- **Insertar `nuevo` solo cuando encuentras un intervalo mayor.** Si la lista está vacía o `nuevo` va al final, nunca se inserta. Lo reconoces en los tests "lista vacía" y "al final".
- **Modificar `nuevo` directamente** (`nuevo[1] = Math.max(...)`). Cambias el arreglo de quien llamó a la función. Lo reconoces en el test "no modifica la lista original, sus intervalos ni el nuevo".

## Otra forma de resolverlo

**Agregar, ordenar y fusionar** (paso 1): O(n log n) de tiempo y O(n) de memoria. Es más corta si ya tienes Merge Intervals en la cabeza:

```js
const todos = [...intervalos, nuevo].sort((a, b) => a[0] - b[0]);
const resultado = [];
for (const [inicio, fin] of todos) {
  const ultimo = resultado[resultado.length - 1];
  if (ultimo && inicio <= ultimo[1]) ultimo[1] = Math.max(ultimo[1], fin);
  else resultado.push([inicio, fin]);
}
return resultado;
```

**¿Cuál conviene?** La de los tres grupos es O(n) porque aprovecha que la lista ya viene ordenada, y es lo que busca el entrevistador. La de ordenar es una buena respuesta de arranque: dila, explica que no aprovecha el orden y luego mejórala.

## Cómo explicarlo en la entrevista

> "Una opción rápida es agregar el nuevo intervalo, ordenar y fusionar como en Merge Intervals, pero eso es O(n log n) y la lista ya viene ordenada. Aprovechando el orden, los intervalos forman tres grupos seguidos: los que terminan antes de que empiece el nuevo, que copio tal cual; los que se superponen, que absorbo estirando el inicio con el mínimo y el fin con el máximo; y los que empiezan después, que también copio. Lo hago con tres while sobre el mismo índice, así que es una sola pasada: O(n) de tiempo y O(n) de memoria para el resultado."

## Conceptos

- **Aprovechar que la entrada ya está ordenada**: evita ordenar de nuevo y baja de O(n log n) a O(n).
- **Superposición de intervalos**: `[a, b]` y `[c, d]` se superponen si `a <= d` y `c <= b`.
- **Varios `while` con un mismo índice**: cada uno consume un tramo y el siguiente continúa donde quedó.
- **Desestructuración**: `let [inicio, fin] = nuevo` copia los valores en variables propias.
- **Copias vs referencias**: `[...intervalo]` crea un arreglo nuevo con los mismos números.
