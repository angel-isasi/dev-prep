## Idea clave

Cuentas cuántas copias de cada número hay en el primer arreglo y luego recorres el segundo **gastando** esas copias: cada vez que encuentras un número con copias disponibles, lo agregas al resultado y restas 1. Así cada número sale exactamente el mínimo de veces entre los dos arreglos.

## Paso a paso

1. **La solución directa** (dila en voz alta): copiar `nums1`, y por cada número de `nums2` buscarlo en la copia con `indexOf`. Si está, agregarlo al resultado y borrarlo con `splice` para no usarlo dos veces. Funciona, pero cada búsqueda y cada borrado recorren el arreglo: O(n · m).

   ```js
   const bolsa = [...nums1];
   const resultado = [];
   for (const num of nums2) {
     const pos = bolsa.indexOf(num);
     if (pos !== -1) {
       resultado.push(num);
       bolsa.splice(pos, 1);
     }
   }
   return resultado;
   ```

2. **¿Qué trabajo se repite?** Buscar en la bolsa una y otra vez. No necesitas saber **dónde** está cada número, solo **cuántos** te quedan.
3. **Cuenta `nums1`.** Un `Map` de número a cantidad: `conteo.set(num, (conteo.get(num) || 0) + 1)`.
4. **Recorre `nums2` y gasta.** Si `conteo.get(num) > 0`, agrega `num` al resultado y resta 1. Si el número no está en el `Map`, `get` devuelve `undefined`, y `undefined > 0` es `false`: no entra, que es justo lo que quieres.
5. **Devuelve el resultado.** Sale en el orden en que los números aparecen en `nums2`, pero el enunciado acepta cualquier orden.

```js
export function interseccion(nums1, nums2) {
  const conteo = new Map();
  for (const num of nums1) {
    conteo.set(num, (conteo.get(num) || 0) + 1);
  }

  const resultado = [];
  for (const num of nums2) {
    if (conteo.get(num) > 0) {
      resultado.push(num);
      conteo.set(num, conteo.get(num) - 1);
    }
  }

  return resultado;
}
```

## Por qué funciona

Recorrido con `interseccion([4, 9, 5], [9, 4, 9, 8, 4])`. Después de contar `nums1`: `conteo = { 4: 1, 9: 1, 5: 1 }`.

| `num` de `nums2` | Copias antes | ¿Hay? | `resultado` | Copias después |
|---|---|---|---|---|
| 9 | 1 | sí | `[9]` | 0 |
| 4 | 1 | sí | `[9, 4]` | 0 |
| 9 | **0** | no | `[9, 4]` | 0 |
| 8 | (no está) | no | `[9, 4]` | |
| 4 | **0** | no | `[9, 4]` | 0 |

El segundo 9 y el segundo 4 de `nums2` no entran porque ya se gastó su única copia de `nums1`. Resultado `[9, 4]`, que ordenado es `[4, 9]`.

Si lo haces al revés (contar `nums2` y recorrer `nums1`) el resultado tiene los mismos números: el mínimo de dos cantidades no depende del orden.

## Errores comunes

- **Usar `includes` sin gastar.** `nums2.filter((n) => nums1.includes(n))` con `[2]` y `[2, 2]` devuelve `[2, 2]`, aunque el primero solo tiene un 2. Lo reconoces en el test "no repite más de lo que hay en el primero".
- **Usar un `Set`.** Pierdes las repeticiones: `[1, 2, 2, 1]` y `[2, 2]` daría `[2]` en vez de `[2, 2]`. Eso resuelve otro problema (Intersection of Two Arrays, la versión I).
- **Ordenar con `sort()` sin comparador.** `[10, 9, 1].sort()` da `[1, 10, 9]`, porque compara como texto. Usa `sort((a, b) => a - b)`.
- **Olvidar el `|| 0`** al contar: `undefined + 1` es `NaN`, y `NaN > 0` es `false`, así que el resultado siempre sale vacío.
- **Modificar los arreglos originales** con `splice` sin copiarlos antes. Quien llamó a tu función se encuentra con sus datos cambiados.

## Otra forma de resolverlo

**Buscar y tachar con `indexOf` y `splice`** (paso 1): O(n · m) de tiempo y O(n) de memoria por la copia. Muy intuitiva.

**Ordenar y usar dos punteros**: ordenas los dos arreglos y avanzas un puntero en cada uno. Si los valores son iguales, lo agregas y avanzas los dos; si no, avanzas el del valor más chico.

```js
const a = [...nums1].sort((x, y) => x - y);
const b = [...nums2].sort((x, y) => x - y);
const resultado = [];
let i = 0;
let j = 0;
while (i < a.length && j < b.length) {
  if (a[i] === b[j]) {
    resultado.push(a[i]);
    i++;
    j++;
  } else if (a[i] < b[j]) {
    i++;
  } else {
    j++;
  }
}
return resultado;
```

Es O(n log n + m log m) por ordenar. Si los arreglos **ya vinieran ordenados**, es O(n + m) y sin memoria extra: esa es la pregunta de seguimiento típica.

**¿Cuál conviene?** El conteo con `Map`: O(n + m) de tiempo y O(n) de memoria. Truco extra: cuenta el arreglo **más chico**, así el `Map` ocupa menos.

## Cómo explicarlo en la entrevista

> "Cada número tiene que salir el mínimo de veces entre los dos arreglos. Cuento las copias de cada número del primer arreglo con un Map, y luego recorro el segundo: si quedan copias de ese número, lo agrego al resultado y resto una. Así nunca agrego más de las que hay. Es O(n + m) de tiempo y O(n) de memoria. Si los arreglos vinieran ordenados, usaría dos punteros sin memoria extra."

## Conceptos

- **Conteo con `Map`**: `map.set(x, (map.get(x) || 0) + 1)`.
- **Gastar un conteo**: restar 1 cada vez que usas una copia, como en Ransom Note.
- **`Set` vs conteo**: el `Set` solo sabe si algo está; el conteo sabe cuántas veces.
- **Dos punteros sobre arreglos ordenados**: avanzas el que tiene el valor más chico.
- **`sort` con comparador numérico**: `(a, b) => a - b`.
