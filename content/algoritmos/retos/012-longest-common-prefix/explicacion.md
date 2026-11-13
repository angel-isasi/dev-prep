## Idea clave

Tomas la primera palabra como **candidato** a prefijo y lo vas recortando por el final hasta que cada una de las demás palabras empiece con él. Lo que sobrevive al recorrer todas es el prefijo común más largo.

## Paso a paso

1. **Piensa en la forma manual** (la solución directa): compara las palabras **columna por columna**. Mira la letra 0 de todas; si coinciden, pasa a la letra 1, y así hasta que alguna no coincida o una palabra se acabe. Es O(S), donde S es el total de caracteres, y funciona muy bien. La verás completa en "Otra forma de resolverlo".
2. **Otra forma de verlo: un candidato que se achica.** El prefijo no puede ser más largo que la primera palabra, así que empiezas con ella entera.
3. **Compáralo con cada palabra siguiente.** `palabra.startsWith(prefijo)` te dice si la palabra empieza con el candidato. Si no, recorta el último carácter: `prefijo.slice(0, -1)` (el `-1` significa "hasta uno antes del final").
4. **Salida temprana**: si el candidato queda vacío, ningún recorte posterior lo va a arreglar. Devuelve `""` ya.
5. **El candidato solo se achica**, nunca crece. Por eso, al terminar, sirve para todas las palabras a la vez.
6. **Caso borde**: si el arreglo está vacío, `palabras[0]` sería `undefined`. Devuelve `""` antes de empezar.

```js
export function prefijoComun(palabras) {
  if (palabras.length === 0) return "";

  let prefijo = palabras[0];
  for (const palabra of palabras.slice(1)) {
    while (!palabra.startsWith(prefijo)) {
      prefijo = prefijo.slice(0, -1);
      if (prefijo === "") return "";
    }
  }

  return prefijo;
}
```

## Por qué funciona

Recorrido con `prefijoComun(["flower", "flow", "flight"])`:

| Palabra | `prefijo` antes | ¿Empieza con él? | Recorte | `prefijo` después |
|---|---|---|---|---|
| (inicio) | | | | `"flower"` |
| `"flow"` | `"flower"` | no | `"flowe"` | |
| `"flow"` | `"flowe"` | no | `"flow"` | |
| `"flow"` | `"flow"` | sí | | `"flow"` |
| `"flight"` | `"flow"` | no | `"flo"` | |
| `"flight"` | `"flo"` | no | `"fl"` | |
| `"flight"` | `"fl"` | sí | | `"fl"` |

Devuelve `"fl"`.

Con `["casado", "casas", "cas"]` el candidato empieza largo (`"casado"`), se recorta a `"casa"` con `"casas"` y luego a `"cas"` con `"cas"`. No importa en qué posición esté la palabra más corta: el candidato se adapta.

## Errores comunes

- **No manejar el arreglo vacío.** `palabras[0]` es `undefined` y `undefined.startsWith` no existe: el programa se cae. Lo reconoces en el test del arreglo vacío.
- **Comparar solo la primera y la última palabra** (o solo dos palabras). El prefijo debe servir para **todas**: con `["flower", "flow", "flight"]`, comparar solo las dos primeras da `"flow"`.
- **Usar `includes` en vez de `startsWith`.** `"racecar".includes("car")` es `true`, pero `"car"` no es su **prefijo**.
- **En la versión columna por columna, no revisar el largo.** Si una palabra se acaba, `palabra[i]` es `undefined`; si no lo controlas, puedes seguir comparando de más.
- **Asumir que la primera palabra es la más corta.** No hace falta en esta solución, pero si en la versión por columnas usas el largo de la primera como límite, debes cortar también cuando cualquier otra se acabe.

## Otra forma de resolverlo

**Columna por columna (escaneo vertical)**: recorres las letras de la primera palabra y, para cada posición `i`, revisas que todas las palabras tengan esa misma letra.

```js
if (palabras.length === 0) return "";
for (let i = 0; i < palabras[0].length; i++) {
  const letra = palabras[0][i];
  for (const palabra of palabras) {
    if (palabra[i] !== letra) return palabras[0].slice(0, i);
  }
}
return palabras[0];
```

Es O(S) de tiempo y O(1) de memoria extra, y se detiene en cuanto encuentra una diferencia. Si una palabra es más corta, `palabra[i]` es `undefined`, distinto de cualquier letra, y corta ahí.

**Ordenar y comparar la primera con la última**: después de `sort()`, las palabras más distintas quedan en los extremos; basta comparar esas dos. Es O(S log n) por el ordenamiento: ingenioso, pero más lento.

**¿Cuál conviene?** Las dos primeras son igual de buenas. La del candidato que se achica es más corta de escribir; la de columnas es más fácil de explicar como "lo que haría a mano".

## Cómo explicarlo en la entrevista

> "Tomo la primera palabra como prefijo candidato, porque el prefijo común nunca puede ser más largo que ella. Luego la comparo con cada una de las demás: mientras la palabra no empiece con el candidato, le quito el último carácter. Si se queda vacío, no hay prefijo común y termino antes. Es O(S) de tiempo, donde S es el total de caracteres, y O(1) de memoria extra aparte del candidato."

## Conceptos

- **`startsWith`**: indica si una cadena empieza con otra.
- **`slice(0, -1)`**: devuelve la cadena sin su último carácter; los índices negativos cuentan desde el final.
- **`slice(1)` en arreglos**: copia el arreglo sin su primer elemento.
- **Candidato que se achica**: empezar con la respuesta más grande posible y reducirla hasta que cumpla la condición.
- **Escaneo vertical**: comparar varias cadenas posición por posición.
