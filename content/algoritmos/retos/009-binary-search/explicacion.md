## Idea clave

Como el arreglo está ordenado, mirar el elemento del **medio** te dice en qué mitad está el objetivo. Descartas la otra mitad entera y repites. Cada paso divide el problema a la mitad: O(log n).

## Paso a paso

1. **La solución directa** (dila en voz alta): recorrer el arreglo hasta encontrar el objetivo. Es O(n) y no aprovecha que está ordenado.

   ```js
   for (let i = 0; i < nums.length; i++) {
     if (nums[i] === objetivo) return i;
   }
   return -1;
   ```

2. **Define el rango de búsqueda** con dos índices: `izq = 0` y `der = nums.length - 1`. El objetivo, si está, siempre se encuentra entre ellos (inclusive).
3. **Mira el medio**: `medio = Math.floor((izq + der) / 2)`. El `Math.floor` es necesario porque `(0 + 5) / 2` da 2.5, y un índice no puede tener decimales.
4. **Decide qué mitad descartar**:
   - Si `nums[medio] === objetivo`, lo encontraste.
   - Si `nums[medio] < objetivo`, todo lo que está a la izquierda del medio (incluido él) es todavía más chico: `izq = medio + 1`.
   - Si es mayor, todo lo de la derecha sobra: `der = medio - 1`.
5. **Repite mientras `izq <= der`.** El `<=` es importante: cuando `izq === der` queda **un** elemento por revisar. Si los índices se cruzan, el rango está vacío y el objetivo no está.

```js
export function busquedaBinaria(nums, objetivo) {
  let izq = 0;
  let der = nums.length - 1;

  while (izq <= der) {
    const medio = Math.floor((izq + der) / 2);
    if (nums[medio] === objetivo) return medio;
    if (nums[medio] < objetivo) izq = medio + 1;
    else der = medio - 1;
  }

  return -1;
}
```

## Por qué funciona

Recorrido con `busquedaBinaria([-1, 0, 3, 5, 9, 12], 9)`:

| `izq` | `der` | `medio` | `nums[medio]` | Decisión |
|---|---|---|---|---|
| 0 | 5 | 2 | 3 | 3 < 9: `izq = 3` |
| 3 | 5 | 4 | **9** | encontrado: devuelve 4 |

Ahora un valor que **no** está, `busquedaBinaria([-1, 0, 3, 5, 9, 12], 2)`:

| `izq` | `der` | `medio` | `nums[medio]` | Decisión |
|---|---|---|---|---|
| 0 | 5 | 2 | 3 | 3 > 2: `der = 1` |
| 0 | 1 | 0 | -1 | -1 < 2: `izq = 1` |
| 1 | 1 | 1 | 0 | 0 < 2: `izq = 2` |
| 2 | 1 | | | `izq > der`: devuelve -1 |

En la tercera fila `izq` y `der` valen lo mismo: queda un solo candidato. Con `izq < der` el bucle no lo habría revisado.

Con el arreglo vacío, `der = -1` y el `while` no entra nunca: devuelve -1 sin casos especiales.

## Errores comunes

- **Usar `izq < der`** en vez de `<=`. Te saltas el último candidato: `busquedaBinaria([5], 5)` devuelve -1. Lo reconoces en el test de un solo elemento o al buscar el primero o el último.
- **Mover con `izq = medio` o `der = medio`** en esta versión. Si `izq` y `der` quedan a distancia 1, `medio` no cambia y el bucle se repite para siempre. Siempre `medio + 1` o `medio - 1`.
- **Olvidar `Math.floor`.** `medio` sería 2.5, `nums[2.5]` es `undefined` y las comparaciones fallan en silencio.
- **Usarla en un arreglo desordenado.** No da error, pero descarta mitades equivocadas y devuelve -1 aunque el valor esté.
- **Devolver `true`/`false` o el valor** en vez del índice.

## Otra forma de resolverlo

**Búsqueda lineal** (paso 1): O(n) de tiempo, O(1) de memoria. Funciona aunque el arreglo no esté ordenado; es la que usa `indexOf` por dentro.

**Búsqueda binaria recursiva**: la misma idea, pasando `izq` y `der` como parámetros. Usa O(log n) de memoria por la pila de llamadas:

```js
function buscar(nums, objetivo, izq = 0, der = nums.length - 1) {
  if (izq > der) return -1;
  const medio = Math.floor((izq + der) / 2);
  if (nums[medio] === objetivo) return medio;
  return nums[medio] < objetivo
    ? buscar(nums, objetivo, medio + 1, der)
    : buscar(nums, objetivo, izq, medio - 1);
}
```

**¿Cuál conviene?** La iterativa: misma velocidad, O(1) de memoria y menos riesgo. La lineal solo si el arreglo no está ordenado o es muy chico.

## Cómo explicarlo en la entrevista

> "Como el arreglo está ordenado, no necesito recorrerlo entero, que sería O(n). Uso búsqueda binaria: miro el elemento del medio; si es menor que el objetivo, descarto la mitad izquierda, y si es mayor, la derecha. En cada paso divido el problema a la mitad, así que es O(log n) de tiempo y O(1) de memoria. Uso izq menor o igual que der para no saltarme el caso en que queda un solo elemento, y muevo los límites a medio más uno o medio menos uno para no quedarme en un bucle infinito."

## Conceptos

- **Búsqueda binaria**: dividir el rango de búsqueda a la mitad en cada paso. Requiere datos ordenados.
- **O(log n)**: duplicar el tamaño de la entrada solo agrega un paso más.
- **Rango cerrado `[izq, der]`**: ambos extremos incluidos; por eso la condición es `izq <= der`.
- **`Math.floor`**: redondea hacia abajo para obtener un índice entero.
- **Invariante**: algo que se mantiene verdadero en cada vuelta. Aquí: "si el objetivo está, está entre `izq` y `der`".
