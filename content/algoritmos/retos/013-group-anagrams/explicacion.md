## Idea clave

Dos anagramas, con sus letras ordenadas, dan **la misma cadena**: `"eat"`, `"tea"` y `"ate"` se convierten en `"aet"`. Usas esa cadena como **clave** de un `Map` y metes cada palabra en el grupo de su clave. Una sola pasada.

## Paso a paso

1. **La solución directa** (dila en voz alta): para cada palabra, recorrer los grupos que ya tienes y comprobar con una función `esAnagrama` si pertenece a alguno. Si no, crear un grupo nuevo. Con n palabras y hasta n grupos, son O(n²) comparaciones, cada una de costo O(k), donde k es el largo de la palabra.
2. **Busca una "firma" del grupo.** En lugar de comparar palabras entre sí, calcula algo que sea igual para todos los anagramas: sus letras ordenadas. Es como ponerle una etiqueta a cada grupo.
3. **Calcula la clave**: `[...palabra].sort().join("")`.
   - `[...palabra]` convierte la cadena en un arreglo de letras (las cadenas no tienen `sort`).
   - `.sort()` las ordena alfabéticamente (para letras sueltas, el orden por defecto sirve).
   - `.join("")` las vuelve a unir en una cadena.
4. **Agrupa con un `Map`**: si la clave no existe, crea un arreglo vacío; después agrega la palabra a ese arreglo.
5. **Devuelve los grupos**: `grupos.values()` da un iterador con los arreglos; con `[...]` lo conviertes en arreglo.

```js
export function agruparAnagramas(palabras) {
  const grupos = new Map();

  for (const palabra of palabras) {
    const clave = [...palabra].sort().join("");
    if (!grupos.has(clave)) grupos.set(clave, []);
    grupos.get(clave).push(palabra);
  }

  return [...grupos.values()];
}
```

## Por qué funciona

Recorrido con `["eat", "tea", "tan", "ate", "nat", "bat"]`:

| `palabra` | `clave` | ¿Clave nueva? | `grupos` después |
|---|---|---|---|
| `"eat"` | `"aet"` | sí | `aet → [eat]` |
| `"tea"` | `"aet"` | no | `aet → [eat, tea]` |
| `"tan"` | `"ant"` | sí | `aet → [eat, tea]`, `ant → [tan]` |
| `"ate"` | `"aet"` | no | `aet → [eat, tea, ate]`, `ant → [tan]` |
| `"nat"` | `"ant"` | no | `aet → [eat, tea, ate]`, `ant → [tan, nat]` |
| `"bat"` | `"abt"` | sí | ..., `abt → [bat]` |

Resultado: `[["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]`.

La clave también distingue cantidades: `"ab"` da `"ab"` y `"abb"` da `"abb"`, así que no se mezclan.

## Errores comunes

- **Llamar `palabra.sort()`.** Las cadenas no tienen `sort`; lanza `TypeError: palabra.sort is not a function`. Conviértela antes con `[...palabra]` o `palabra.split("")`.
- **Olvidar el `join("")` y usar el arreglo como clave.** Dos arreglos con las mismas letras son objetos **distintos** para el `Map` (se comparan por referencia), así que cada palabra queda sola en su grupo.
- **Usar un `Set` de letras como clave** (`[...new Set(palabra)]`). Pierde las cantidades: `"ab"` y `"abb"` caerían en el mismo grupo. Lo reconoces en el test de "distinta cantidad".
- **Devolver el `Map` o `grupos.values()` directamente.** No es un arreglo: `toEqual` falla y métodos como `map` no existen. Conviértelo con `[...grupos.values()]` o `Array.from(...)`.
- **Ordenar la palabra original en el lugar** con algo que la modifique y luego agregar la versión ordenada al grupo: el resultado tendría `"aet"` en vez de `"eat"`. Agrega siempre la palabra original.

## Otra forma de resolverlo

**Comparar con los grupos existentes** (paso 1): O(n² · k). Fácil de pensar, pero lenta con muchas palabras.

**Clave por conteo de letras**: en vez de ordenar (O(k log k) por palabra), cuentas las 26 letras y usas el conteo como clave, por ejemplo `"1,0,0,...,1"`. Cada clave cuesta O(k), así que el total es O(n · k):

```js
const conteo = new Array(26).fill(0);
for (const letra of palabra) conteo[letra.charCodeAt(0) - 97]++;
const clave = conteo.join(",");
```

**¿Cuál conviene?** La de letras ordenadas: O(n · k log k), corta y fácil de explicar. La de conteo es la mejora que puedes mencionar si las palabras son muy largas.

## Cómo explicarlo en la entrevista

> "La solución directa sería comparar cada palabra con cada grupo, que es cuadrático. En cambio, me doy cuenta de que dos anagramas, ordenados letra por letra, dan la misma cadena. Uso esa cadena ordenada como clave de un Map y meto cada palabra en su grupo, en una sola pasada. El tiempo es O(n · k log k), con n palabras de largo k, por el ordenamiento de cada palabra, y la memoria es O(n · k) por los grupos. Si las palabras fueran muy largas, usaría como clave el conteo de las 26 letras para evitar ordenar."

## Conceptos

- **Clave canónica**: una representación igual para todos los elementos que consideras "equivalentes".
- **`Map` de listas**: `clave -> arreglo`, el patrón para agrupar.
- **Spread de cadenas**: `[...palabra]` da un arreglo de caracteres.
- **Comparación por referencia**: dos arreglos con el mismo contenido no son la misma clave en un `Map`.
- **`Map.prototype.values()`**: devuelve un iterador; conviértelo con `[...]` para tener un arreglo.
