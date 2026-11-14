## Idea clave

Si cortas un arreglo rotado por la mitad, **al menos una de las dos mitades está ordenada**. En cada paso de la búsqueda binaria averiguas cuál es (comparando `nums[izq]` con `nums[medio]`) y preguntas si el objetivo cae dentro de su rango. Si cae, te quedas con esa mitad; si no, con la otra. Así descartas la mitad en cada paso: O(log n).

## Paso a paso

1. **La solución directa** (dila en voz alta): `nums.indexOf(objetivo)` o un `for` que compare uno por uno. Es O(n) y correcta, pero no usa que el arreglo está casi ordenado. Es el punto de partida, no la respuesta.
2. **¿Por qué la búsqueda binaria normal no sirve?** Busca el 0 en `[4, 5, 6, 7, 0, 1, 2]`. El medio es 7; como 0 < 7, la binaria normal se va a la izquierda... donde están 4, 5 y 6. Nunca lo encuentra. En un arreglo rotado, "es menor que el medio" ya no significa "está a la izquierda".
3. **La observación clave.** El arreglo son dos tramos ordenados: `4, 5, 6, 7` y `0, 1, 2`. Cortes donde cortes, la caída queda en una sola de las dos mitades, así que **la otra mitad está ordenada**:
   - Corte en el 7: izquierda `[4, 5, 6, 7]` ordenada, derecha `[7, 0, 1, 2]` no.
   - Corte en el 1 (dentro de `[0, 1, 2]`): izquierda `[0, 1]` ordenada, y también la derecha `[1, 2]`.
4. **¿Cuál mitad está ordenada?** Si `nums[izq] <= nums[medio]`, de `izq` a `medio` no hay caída: la **izquierda** está ordenada. Si no, la caída está a la izquierda y la **derecha** está ordenada. El `<=` (y no `<`) importa cuando `izq === medio`: un tramo de un solo elemento está ordenado.
5. **¿El objetivo está en la mitad ordenada?** En un tramo ordenado basta mirar sus extremos:
   - Izquierda ordenada: está ahí si `nums[izq] <= objetivo < nums[medio]`. Entonces `der = medio - 1`; si no, `izq = medio + 1`.
   - Derecha ordenada: está ahí si `nums[medio] < objetivo <= nums[der]`. Entonces `izq = medio + 1`; si no, `der = medio - 1`.
   Con la mitad desordenada no puedes preguntar nada fácil, por eso **siempre preguntas por la ordenada** y, si no está ahí, vas a la otra.
6. **Repite mientras `izq <= der`.** Con `<=` revisas también el último elemento que queda. Si el bucle termina sin encontrarlo, devuelve -1. El arreglo vacío no entra al bucle y da -1 directo.
7. **Costo**: O(log n) de tiempo y O(1) de memoria.

```js
export function buscarEnRotado(nums, objetivo) {
  let izq = 0;
  let der = nums.length - 1;

  while (izq <= der) {
    const medio = Math.floor((izq + der) / 2);
    if (nums[medio] === objetivo) return medio;

    if (nums[izq] <= nums[medio]) {
      if (nums[izq] <= objetivo && objetivo < nums[medio]) der = medio - 1;
      else izq = medio + 1;
    } else {
      if (nums[medio] < objetivo && objetivo <= nums[der]) izq = medio + 1;
      else der = medio - 1;
    }
  }

  return -1;
}
```

## Por qué funciona

Recorrido con `buscarEnRotado([4, 5, 6, 7, 0, 1, 2], 0)` (posiciones 0 a 6):

| `izq` | `der` | `medio` | `nums[medio]` | Mitad ordenada | ¿El 0 cae en su rango? | Qué haces |
|---|---|---|---|---|---|---|
| 0 | 6 | 3 | 7 | izquierda `[4..7]` (4 <= 7) | no: 0 < 4 | `izq = 4` |
| 4 | 6 | 5 | 1 | izquierda `[0..1]` (0 <= 1) | sí: 0 <= 0 < 1 | `der = 4` |
| 4 | 4 | 4 | **0** | | | ¡encontrado! devuelve **4** |

En la primera vuelta, la mitad `[4, 5, 6, 7]` está ordenada y va de 4 a 7: el 0 no puede estar ahí. Por eso la descartas entera, aunque 0 < 7.

Recorrido con `buscarEnRotado([3, 1], 1)`, el caso de dos elementos:

| `izq` | `der` | `medio` | `nums[medio]` | Mitad ordenada | ¿El 1 cae en su rango? | Qué haces |
|---|---|---|---|---|---|---|
| 0 | 1 | 0 | 3 | izquierda `[3]` (3 <= 3) | no: 1 < 3 | `izq = 1` |
| 1 | 1 | 1 | **1** | | | devuelve **1** |

Aquí `izq === medio`, y el `<=` de `nums[izq] <= nums[medio]` reconoce que el tramo `[3]` está ordenado.

## Errores comunes

- **Hacer búsqueda binaria normal** (solo comparar el objetivo con `nums[medio]`). Lo reconoces en el ejemplo clásico: buscas el 0 a la izquierda del 7 y devuelves -1.
- **Revisar solo un extremo del rango** (por ejemplo, solo `objetivo < nums[medio]`). En la primera vuelta del ejemplo, 0 < 7 te manda a la izquierda ordenada `[4..7]`, donde el 0 no está. Necesitas los **dos** extremos: `nums[izq] <= objetivo`.
- **`nums[izq] < nums[medio]` en vez de `<=`.** Cuando `izq === medio`, crees que la izquierda no está ordenada y tomas la decisión equivocada. Lo reconoces en el test `[3, 1]` buscando el 1.
- **Olvidar el `=` en los extremos del rango** (`objetivo < nums[der]` en vez de `<=`). Si el objetivo es justo el borde, lo descartas. Lo reconoces en el test de los bordes `[5, 1, 3]` buscando el 3.
- **`while (izq < der)`.** Cuando queda un solo elemento no lo revisas. Lo reconoces en el test `[1]` buscando el 1: das -1.
- **Devolver el valor en vez de la posición.** Te piden el índice.

## Otra forma de resolverlo

**Encontrar primero el punto de rotación y luego buscar**: con la búsqueda binaria del reto "Find Minimum in Rotated Sorted Array" encuentras la posición del mínimo. Eso parte el arreglo en dos tramos ordenados; decides en cuál puede estar el objetivo y haces una búsqueda binaria normal ahí. Son dos búsquedas binarias: O(log n) de tiempo y O(1) de memoria.

```js
// 1. Posición del mínimo (inicio del segundo tramo).
let izq = 0;
let der = nums.length - 1;
while (izq < der) {
  const medio = Math.floor((izq + der) / 2);
  if (nums[medio] > nums[der]) izq = medio + 1;
  else der = medio;
}
const inicio = izq;
// 2. Elegir el tramo y hacer binaria normal en él.
if (objetivo >= nums[inicio] && objetivo <= nums[nums.length - 1]) {
  izq = inicio;
  der = nums.length - 1;
} else {
  izq = 0;
  der = inicio - 1;
}
while (izq <= der) {
  const medio = Math.floor((izq + der) / 2);
  if (nums[medio] === objetivo) return medio;
  if (nums[medio] < objetivo) izq = medio + 1;
  else der = medio - 1;
}
return -1;
```

**`indexOf`**: O(n), una línea. Sirve para comprobar tus resultados mientras practicas.

**¿Cuál conviene?** Las dos binarias son O(log n). La de "dos pasos" es más fácil de razonar porque reutiliza piezas que ya conoces; la de una pasada es más corta y es la que suelen esperar. Si te trabas con las condiciones de la de una pasada, propón la de dos pasos: es igual de eficiente.

## Cómo explicarlo en la entrevista

> "Un recorrido lineal sería O(n), pero el arreglo está ordenado y rotado, así que busco O(log n). La búsqueda binaria normal no sirve, porque ser menor que el medio ya no significa estar a la izquierda. La clave es que, al cortar por la mitad, al menos una mitad queda ordenada; lo sé comparando el primer elemento con el del medio. En la mitad ordenada puedo saber si el objetivo está mirando sus dos extremos: si está, me quedo con esa mitad; si no, con la otra. Repito hasta encontrarlo o hasta que izquierda pase a derecha, y en ese caso devuelvo menos uno. Es O(log n) de tiempo y O(1) de memoria."

## Conceptos

- **Búsqueda binaria**: descartar la mitad del espacio de búsqueda en cada paso.
- **Arreglo rotado**: dos tramos ordenados; al cortarlo, al menos una mitad queda ordenada.
- **Decidir por la mitad ordenada**: solo en un tramo ordenado sabes con dos comparaciones si un valor puede estar ahí.
- **Rangos con extremos incluidos o excluidos**: `<=` vs `<` decide si revisas los bordes; un error aquí pierde el primer o el último elemento.
- **`izq <= der`**: la condición de la binaria que busca un valor exacto, para revisar también el último candidato.
