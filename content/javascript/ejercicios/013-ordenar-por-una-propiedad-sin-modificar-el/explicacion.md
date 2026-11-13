## Idea clave

`sort` **modifica el arreglo** sobre el que se llama. Por eso primero haces una copia con `[...lista]` y ordenas la copia. Para ordenar por una propiedad le pasas a `sort` una **función de comparación** que devuelve negativo, positivo o cero.

## Paso a paso

1. **Copia la lista** con `[...lista]`. El spread crea un arreglo nuevo con los mismos elementos; ordenar la copia no toca el original.
2. **Llama a `sort` con una función de comparación** `(a, b) => ...`. `sort` la llama muchas veces con pares de elementos y, según el número que devuelvas, decide el orden:
   - **positivo** (`1`): `a` va **después** de `b`.
   - **negativo** (`-1`): `a` va **antes** de `b`.
   - **cero**: da igual, se quedan como están.
3. **Lee la propiedad con corchetes**: `a[clave]`. Como el nombre de la propiedad está en una variable, `a.clave` buscaría una propiedad que se llama literalmente "clave".
4. **Compara con `>` y `<`**, que funcionan tanto con números como con textos (los textos se comparan en orden alfabético).
5. **Devuelve** la copia ordenada.

```js
export function ordenarPor(lista, clave) {
  // sort modifica el arreglo sobre el que se llama: por eso ordenamos una copia.
  return [...lista].sort((a, b) => {
    if (a[clave] > b[clave]) return 1;
    if (a[clave] < b[clave]) return -1;
    return 0;
  });
}
```

## Por qué funciona

Con `ordenarPor(alumnos, "nombre")`, algunas de las comparaciones que hace `sort`:

| `a[clave]` | `b[clave]` | Devuelve | Significa |
|---|---|---|---|
| `"Luz"` | `"Ana"` | `1` | Luz va después de Ana |
| `"Ana"` | `"Eva"` | `-1` | Ana va antes de Eva |
| `"Eva"` | `"Luz"` | `-1` | Eva va antes de Luz |

Resultado: Ana, Eva, Luz. Con `"nota"` pasa lo mismo, pero comparando `15`, `18` y `8` como números: `8, 15, 18`.

El original sigue intacto porque `sort` reordenó la copia. Ojo: la copia es **superficial**, los objetos de adentro son los mismos (no se copian). Eso está bien aquí porque no los modificas, solo cambias su orden en el arreglo nuevo.

## Errores comunes

- **Ordenar el original**: `return lista.sort(...)`. Los dos primeros tests pasan, pero falla "no modifica el arreglo original": `alumnos[0].nombre` ya no es `"Luz"`. También falla "devuelve un arreglo nuevo", porque `sort` devuelve el mismo arreglo.
- **Restar en vez de comparar**: `(a, b) => a[clave] - b[clave]`. Funciona con números, pero con textos `"Luz" - "Ana"` es `NaN` y el orden queda como estaba. Lo reconoces porque el test de texto recibe `["Luz", "Ana", "Eva"]`.
- **Usar `a.clave` en vez de `a[clave]`**: lee una propiedad llamada "clave" que no existe; todo es `undefined` y nada se ordena.
- **Devolver un booleano**: `(a, b) => a[clave] > b[clave]`. Devuelve `true` o `false` (que se convierten en `1` y `0`), nunca negativo, así que `sort` no tiene información suficiente y el resultado depende del caso. A veces pasa y a veces no.
- **Llamar `sort()` sin función**: con objetos los convierte todos a `"[object Object]"` y no cambia nada. Con números solos, ordenaría como texto: `[8, 15, 18].sort()` da `[15, 18, 8]`.

## Otra forma de resolverlo

Con `toSorted`, que ordena **devolviendo una copia** sin tocar el original (disponible en navegadores y Node modernos), y `localeCompare` para textos:

```js
export function ordenarPor(lista, clave) {
  return lista.toSorted((a, b) => {
    const x = a[clave];
    const y = b[clave];
    return typeof x === "string" ? x.localeCompare(y) : x - y;
  });
}
```

`localeCompare` compara textos según el idioma: ordena bien las tildes (`"Ángel"` junto a las `A`) y ya devuelve negativo, cero o positivo. Para números, `x - y` da exactamente eso.

**¿Cuál conviene?** `toSorted` es la forma moderna y deja clara la intención de no modificar el original. `[...lista].sort(...)` funciona en cualquier versión y demuestra que entiendes el problema. Si en una entrevista usas `toSorted`, menciona que equivale a copiar y ordenar. Ambas son O(n log n).

## Cómo explicarlo en la entrevista

> "`sort` modifica el arreglo en el lugar, así que primero hago una copia con el spread, o uso `toSorted` si está disponible. Le paso una función de comparación que lee la propiedad con corchetes, porque el nombre llega en una variable, y devuelve 1, -1 o 0 según cuál va primero. Uso `<` y `>` en vez de restar para que funcione igual con textos y con números. Ordenar es O(n log n). La copia es superficial: los objetos son los mismos, pero no los modifico."

## Conceptos

- **`sort`**: ordena el arreglo **en el lugar** (lo modifica) y devuelve ese mismo arreglo.
- **Función de comparación**: `(a, b) => número`; negativo pone `a` antes, positivo después, cero los deja igual.
- **Copia con spread**: `[...lista]` crea un arreglo nuevo con los mismos elementos.
- **Copia superficial**: se copia el arreglo, pero los objetos de adentro siguen siendo los mismos.
- **Notación de corchetes**: `obj[clave]` lee la propiedad cuyo nombre está guardado en `clave`.
- **`toSorted`**: versión de `sort` que devuelve una copia ordenada sin modificar el original.
- **`localeCompare`**: compara textos respetando las reglas del idioma.
