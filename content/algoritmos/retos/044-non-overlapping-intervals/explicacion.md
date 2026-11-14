## Idea clave

Quitar la menor cantidad es lo mismo que **conservar la mayor cantidad** de intervalos sin choques. Para eso, la decisión voraz (greedy) correcta es: **ordena por fin** y conserva siempre el que **termina antes**, porque deja más espacio libre para los siguientes. Todo intervalo que choque con el último conservado se cuenta como quitado.

## Paso a paso

1. **La solución directa** (dila en voz alta): probar todos los subconjuntos de intervalos, quedarte con el más grande que no tenga choques y devolver `n - tamaño`. Son 2ⁿ subconjuntos: con 30 intervalos ya son más de mil millones. Sirve para entender la pregunta, no para resolverla.
2. **Cambia la pregunta.** "Mínimo a quitar" = "máximo a conservar". Ahora piensa como alguien que reserva una sola sala: quieres meter la mayor cantidad de reuniones.
3. **¿Cuál conservas primero?** La que **termina antes**. Cualquiera que elijas en su lugar terminaría igual o más tarde, y solo podría estorbar más a las siguientes, nunca menos. Ojo: no sirve "la que empieza antes" ni "la más corta" (mira los errores comunes).
4. **Ordena una copia por fin**: `[...intervalos].sort((a, b) => a[1] - b[1])`. La copia evita modificar la entrada.
5. **Recorre guardando `finUltimo`**, el fin del último intervalo que conservaste. Empieza en `-Infinity` para que el primero siempre se conserve.
6. **Decide con una comparación**: si `inicio >= finUltimo`, no choca (el `>=` permite que se toquen), así que lo conservas y actualizas `finUltimo = fin`. Si no, choca: `quitados++`. No hace falta comparar con nada más, porque el último conservado es el que termina más tarde de todos los conservados.

```js
export function intervalosAQuitar(intervalos) {
  const ordenados = [...intervalos].sort((a, b) => a[1] - b[1]);
  let quitados = 0;
  let finUltimo = -Infinity;

  for (const [inicio, fin] of ordenados) {
    if (inicio >= finUltimo) {
      finUltimo = fin;
    } else {
      quitados++;
    }
  }

  return quitados;
}
```

## Por qué funciona

Recorrido con `intervalosAQuitar([[1, 2], [2, 3], [3, 4], [1, 3]])`. Ordenados por fin: `[[1, 2], [2, 3], [1, 3], [3, 4]]` (el `sort` de JavaScript es estable: `[2, 3]` y `[1, 3]` terminan igual y conservan su orden original).

| Intervalo | `finUltimo` antes | ¿`inicio >= finUltimo`? | Decisión | `finUltimo` después | `quitados` |
|---|---|---|---|---|---|
| `[1, 2]` | -Infinity | sí | conservo | 2 | 0 |
| `[2, 3]` | 2 | 2 >= 2, sí (se tocan) | conservo | 3 | 0 |
| `[1, 3]` | 3 | 1 >= 3, no | quito | 3 | 1 |
| `[3, 4]` | 3 | 3 >= 3, sí | conservo | 4 | 1 |

Resultado: 1. Quedan `[1, 2]`, `[2, 3]` y `[3, 4]`, que solo se tocan.

**¿Por qué "termina antes" y no "empieza antes"?** Con `[[1, 100], [2, 3], [4, 5], [6, 7]]`, si ordenas por inicio y conservas siempre el primero, te quedas con `[1, 100]` y tienes que quitar los otros tres: devuelves 3. Ordenando por fin, conservas `[2, 3]`, `[4, 5]` y `[6, 7]`, y solo quitas `[1, 100]`: devuelves 1, que es lo correcto.

**¿Por qué es seguro?** Imagina cualquier solución óptima. Su primera reunión termina en algún momento `t`. Si la cambias por la reunión que termina antes que todas (a un tiempo `<= t`), no choca con ninguna de las demás de esa solución, porque termina igual o más temprano. O sea, elegir la que termina antes **nunca empeora** la respuesta. Repites el razonamiento con lo que queda.

## Errores comunes

- **Ordenar por inicio y conservar siempre el primero.** Un intervalo largo tapa a muchos cortos. Lo reconoces en el test "uno largo que tapa a varios": devuelves 3 en vez de 1.
- **Usar `>` en vez de `>=`.** Tratas como choque a dos intervalos que solo se tocan. Lo reconoces en el test "tocarse no es superponerse": devuelves 1 en vez de 0.
- **Actualizar `finUltimo` también cuando quitas.** Un intervalo quitado ya no ocupa la sala; si mueves `finUltimo` a su fin, cuentas choques que no existen.
- **Ordenar el arreglo original** con `intervalos.sort(...)`. `sort` modifica el arreglo en el lugar. Lo reconoces en el test "no modifica el arreglo original".
- **Ordenar sin comparador.** `sort()` compara como texto, y `[[10, 20], [2, 3]]` no queda ordenado por fin.

## Otra forma de resolverlo

**Probar todos los subconjuntos** (paso 1): O(2ⁿ × n). Solo como idea inicial.

**Ordenar por inicio y, al chocar, quedarte con el que termina antes**: también es greedy y O(n log n). Cuando dos chocan, quitas uno, y el que sigue en juego es el de menor fin:

```js
const ordenados = [...intervalos].sort((a, b) => a[0] - b[0]);
let quitados = 0;
let finUltimo = -Infinity;
for (const [inicio, fin] of ordenados) {
  if (inicio >= finUltimo) {
    finUltimo = fin;
  } else {
    quitados++;
    finUltimo = Math.min(finUltimo, fin); // me quedo con el que termina antes
  }
}
return quitados;
```

**¿Cuál conviene?** Las dos son O(n log n) de tiempo (por el ordenamiento) y O(n) de memoria (por la copia). Ordenar por fin es más limpia: la decisión es una sola comparación. La de ordenar por inicio sirve si ya vienes de Merge Intervals, donde ordenaste por inicio, pero tienes que acordarte del `Math.min`.

## Cómo explicarlo en la entrevista

> "Quitar el mínimo es lo mismo que conservar el máximo de intervalos que no se superponen, como meter la mayor cantidad de reuniones en una sala. Probar todos los subconjuntos sería exponencial. Uso una estrategia greedy: ordeno por fin y siempre conservo el que termina antes, porque deja más espacio libre para los siguientes; cambiar ese por cualquier otro nunca mejora la respuesta. Recorro guardando el fin del último conservado: si el actual empieza en o después de ese fin, lo conservo; si no, lo cuento como quitado. Es O(n log n) por el ordenamiento y O(n) de memoria por la copia."

## Conceptos

- **Greedy (voraz)**: tomar en cada paso la mejor decisión local, cuando se puede justificar que no estropea la respuesta final.
- **Selección de actividades**: el problema clásico de "máximo de reuniones en una sala" se resuelve ordenando por fin.
- **Reformular el problema**: "mínimo a quitar" = total menos "máximo a conservar".
- **Comparador por fin**: `sort((a, b) => a[1] - b[1])`.
- **`sort` modifica el arreglo**: ordena una copia (`[...arr]`) si no debes tocar la entrada.
