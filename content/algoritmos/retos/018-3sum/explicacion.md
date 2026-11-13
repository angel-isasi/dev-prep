## Idea clave

**Ordena** el arreglo, **fija** un número y busca los otros dos con **dos punteros** desde los extremos del resto: si la suma es chica, mueve el izquierdo; si es grande, el derecho. Como está ordenado, los repetidos quedan juntos y saltarlos evita tríos duplicados.

## Paso a paso

1. **La solución directa** (dila en voz alta): tres bucles anidados que prueban todos los tríos, y un `Set` con una clave de cada trío ordenado para no repetir. Es O(n³).

   ```js
   const vistos = new Set();
   const resultado = [];
   for (let i = 0; i < nums.length; i++)
     for (let j = i + 1; j < nums.length; j++)
       for (let k = j + 1; k < nums.length; k++)
         if (nums[i] + nums[j] + nums[k] === 0) {
           const trio = [nums[i], nums[j], nums[k]].sort((x, y) => x - y);
           const clave = trio.join(",");
           if (!vistos.has(clave)) { vistos.add(clave); resultado.push(trio); }
         }
   return resultado;
   ```

2. **Ordena una copia** con comparador numérico: `[...nums].sort((x, y) => x - y)`. La copia evita modificar la entrada.
3. **Fija el primer número** `a[i]` y reduce el problema a "dos números en el resto que sumen `-a[i]`".
4. **Dos punteros sobre el resto ordenado**: `izq = i + 1`, `der = final`.
   - Suma igual a 0: guardaste un trío.
   - Suma menor que 0: necesitas un número más grande, así que `izq++`.
   - Suma mayor que 0: necesitas uno más chico, así que `der--`.
5. **Evita duplicados en dos lugares**:
   - Si `a[i]` es igual a `a[i - 1]`, ya probaste todos los tríos que empiezan con ese valor: `continue`.
   - Al encontrar un trío, avanza `izq` mientras el siguiente sea igual, y retrocede `der` mientras el anterior sea igual. Después mueve los dos una vez más.
6. **El bucle de `i` llega hasta `a.length - 3`**, porque necesitas al menos dos números después de él.

```js
export function tresSuma(nums) {
  const a = [...nums].sort((x, y) => x - y);
  const resultado = [];

  for (let i = 0; i < a.length - 2; i++) {
    if (i > 0 && a[i] === a[i - 1]) continue;
    let izq = i + 1;
    let der = a.length - 1;
    while (izq < der) {
      const suma = a[i] + a[izq] + a[der];
      if (suma === 0) {
        resultado.push([a[i], a[izq], a[der]]);
        while (izq < der && a[izq] === a[izq + 1]) izq++;
        while (izq < der && a[der] === a[der - 1]) der--;
        izq++;
        der--;
      } else if (suma < 0) izq++;
      else der--;
    }
  }

  return resultado;
}
```

## Por qué funciona

Recorrido con `tresSuma([-1, 0, 1, 2, -1, -4])`. Ordenado: `[-4, -1, -1, 0, 1, 2]` (índices 0 a 5).

| `i` (`a[i]`) | `izq` (valor) | `der` (valor) | Suma | Acción |
|---|---|---|---|---|
| 0 (-4) | 1 (-1) | 5 (2) | -3 | `izq++` |
| 0 (-4) | 2 (-1) | 5 (2) | -3 | `izq++` |
| 0 (-4) | 3 (0) | 5 (2) | -2 | `izq++` |
| 0 (-4) | 4 (1) | 5 (2) | -1 | `izq++`, se juntan: termina |
| 1 (-1) | 2 (-1) | 5 (2) | **0** | guarda `[-1, -1, 2]`, `izq = 3`, `der = 4` |
| 1 (-1) | 3 (0) | 4 (1) | **0** | guarda `[-1, 0, 1]`, se cruzan |
| 2 (-1) | | | | igual a `a[1]`: **se salta** |
| 3 (0) | 4 (1) | 5 (2) | 3 | `der--`, se juntan: termina |

Resultado: `[[-1, -1, 2], [-1, 0, 1]]`. Sin el salto en `i = 2`, el segundo -1 volvería a encontrar `[-1, 0, 1]`.

**Por qué los dos punteros no se pierden ningún trío**: con el arreglo ordenado, si la suma es muy chica, ningún número a la izquierda de `izq` sirve con este `der` (son aún más chicos), así que descartar `izq` es seguro. Es el mismo razonamiento de Container With Most Water.

## Errores comunes

- **Ordenar sin comparador.** `[-1, -4, 2].sort()` compara como texto y da `[-1, -4, 2]`: el arreglo no queda ordenado y los punteros fallan.
- **No saltar los `i` repetidos.** Con `[-1, 0, 1, 2, -1, -4]` aparece `[-1, 0, 1]` dos veces. Lo reconoces en el test del ejemplo o en el de `[0, 0, 0, 0]`.
- **Saltar repetidos comparando con el siguiente** (`a[i] === a[i + 1]`) en vez del anterior. Te saltas el primero de un grupo y pierdes tríos como `[-1, -1, 2]`.
- **Olvidar mover `izq` y `der` después de guardar un trío.** El `while` se queda en la misma suma 0 para siempre (bucle infinito).
- **Ordenar el arreglo original con `nums.sort`.** Funciona, pero modifica la entrada de quien te llamó. Lo reconoces en el último test.

## Otra forma de resolverlo

**Tres bucles con un `Set` de claves** (paso 1): O(n³) de tiempo y O(t) de memoria para las claves, donde t es la cantidad de tríos. Fácil de escribir bien, pero con 1000 números ya son unos 166 millones de tríos.

**Fijar uno y hacer Two Sum con un `Set`**: para cada `i`, recorres el resto buscando `-(a[i] + a[j])` en un `Set`. También es O(n²), pero evitar duplicados es más complicado sin ordenar.

**¿Cuál conviene?** Ordenar más dos punteros: O(n²) de tiempo, O(1) de memoria extra aparte de la copia ordenada y del resultado, y los duplicados se manejan solo con comparaciones de vecinos. Es la respuesta esperada.

## Cómo explicarlo en la entrevista

> "La solución directa son tres bucles anidados con un Set para no repetir tríos, que es O(n³). Para mejorarlo, ordeno una copia del arreglo. Luego fijo un número y busco en el resto dos que sumen su opuesto, con dos punteros desde los extremos: si la suma es chica muevo el izquierdo y si es grande, el derecho. Para no repetir tríos, salto los valores iguales al fijar y al mover los punteros, lo que funciona porque el arreglo está ordenado. Queda O(n²) de tiempo, porque el ordenamiento, O(n log n), cuesta menos que eso, y O(n) de memoria por la copia."

## Conceptos

- **Reducir a un problema conocido**: fijar un elemento convierte 3Sum en un Two Sum sobre un arreglo ordenado.
- **Ordenar para simplificar**: con datos ordenados, los repetidos quedan juntos y los punteros saben hacia dónde moverse.
- **Dos punteros sobre arreglo ordenado**: suma chica, avanza el izquierdo; suma grande, retrocede el derecho.
- **Comparador numérico**: `sort((x, y) => x - y)`; sin él, `sort` ordena como texto.
- **Deduplicar sin `Set`**: saltar vecinos iguales en un arreglo ordenado.
