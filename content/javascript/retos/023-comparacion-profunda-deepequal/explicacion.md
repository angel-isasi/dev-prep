## Idea clave

Una cadena de **descartes rápidos** y, al final, **recursión**: si son el mismo valor, listo; si alguno no es objeto, son distintos; si uno es arreglo y el otro no, distintos; si tienen distinta cantidad de claves, distintos. Si pasan todo eso, comparas cada clave llamando otra vez a `iguales`.

## Paso a paso

1. **`a === b`**: cubre primitivos iguales y el caso de que sean el mismo objeto. Devuelve `true`.
2. **¿Son los dos objetos de verdad?** Ambos con `typeof "object"` y ninguno `null`. Si no, como ya no eran `===`, son distintos.
3. **Arreglo contra objeto**: si `Array.isArray(a)` no coincide con `Array.isArray(b)`, distintos.
4. **Cuenta las claves** con `Object.keys`. Si la cantidad difiere, distintos.
5. **Compara cada clave** con `every`: la clave tiene que existir en `b` y el valor tiene que ser igual según `iguales` (recursión).

```js
export function iguales(a, b) {
  if (a === b) return true;

  const sonObjetos = typeof a === "object" && typeof b === "object" && a !== null && b !== null;
  if (!sonObjetos) return false;

  if (Array.isArray(a) !== Array.isArray(b)) return false;

  const clavesA = Object.keys(a);
  const clavesB = Object.keys(b);
  if (clavesA.length !== clavesB.length) return false;

  return clavesA.every((clave) => clave in b && iguales(a[clave], b[clave]));
}
```

## Por qué funciona

Recorrido con `iguales({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] })`:

| Llamada | ¿`===`? | ¿Objetos? | Claves | Resultado |
|---|---|---|---|---|
| `iguales({a}, {a})` | no | sí | `["a"]` y `["a"]` | depende de `a` |
| `iguales([1, {b}], [1, {b}])` | no | sí, ambos arreglos | `["0", "1"]` y `["0", "1"]` | depende de cada índice |
| `iguales(1, 1)` | sí | | | `true` |
| `iguales({b: 2}, {b: 2})` | no | sí | `["b"]` y `["b"]` | depende de `b` |
| `iguales(2, 2)` | sí | | | `true` |

Todas las comparaciones devuelven `true`, así que `every` devuelve `true` en cada nivel.

¿Por qué hace falta `clave in b` si ya comparaste la cantidad de claves? Por casos como `{ a: undefined }` contra `{ b: undefined }`: tienen una clave cada uno, y `b["a"]` es `undefined`, igual que `a["a"]`. Sin el `in`, dirías que son iguales.

¿Y arreglo contra objeto? `Object.keys([1, 2])` es `["0", "1"]`, igual que `Object.keys({ 0: 1, 1: 2 })`. Sin el paso 3, los confundirías.

## Errores comunes

- **Usar `===` o `==` directamente con objetos.** Compara referencias. Lo reconoces porque el primer test recibe `false`.
- **Olvidar el caso `null`.** `typeof null` es `"object"` y `Object.keys(null)` lanza "Cannot convert undefined or null to object". Lo reconoces porque el test de primitivos falla con ese error.
- **Revisar solo las claves de `a`.** `iguales({ a: 1 }, { a: 1, b: 2 })` daría `true`. Lo reconoces porque falla el test de "una clave de más". Por eso se comparan las cantidades.
- **No distinguir arreglos de objetos.** `[1, 2]` y `{ 0: 1, 1: 2 }` darían `true`.
- **Usar `JSON.stringify(a) === JSON.stringify(b)`.** Falla si el orden de las claves es distinto (`{a, b}` contra `{b, a}`) y borra las claves con `undefined`. Lo reconoces porque el test del orden recibe `false`.

## Otra forma de resolverlo

Con un `for...of` y retornos tempranos, en lugar de `every`:

```js
export function iguales(a, b) {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  const clavesA = Object.keys(a);
  if (clavesA.length !== Object.keys(b).length) return false;

  for (const clave of clavesA) {
    if (!Object.hasOwn(b, clave)) return false;
    if (!iguales(a[clave], b[clave])) return false;
  }
  return true;
}
```

Es lo mismo, pero algunos lo encuentran más fácil de leer paso a paso. `Object.hasOwn(b, clave)` es más estricto que `in`: solo mira propiedades propias, no heredadas. Para producción existen `isDeepStrictEqual` en Node o `_.isEqual` en Lodash, que además manejan fechas, `Map`, `Set` y `NaN`.

## Cómo explicarlo en la entrevista

> "`===` en objetos compara referencias, no contenido. Para comparar contenido voy descartando: si son el mismo valor, son iguales; si alguno no es objeto o es `null`, son distintos; si uno es arreglo y el otro no, distintos; si tienen distinta cantidad de claves, distintos. Si pasan todo eso, comparo cada clave recursivamente, verificando que exista en ambos. Distingo arreglos de objetos para no confundir `[1, 2]` con `{0: 1, 1: 2}`. Es O(n) en la cantidad total de valores."

## Conceptos

- **Comparación por referencia**: `===` entre objetos solo es `true` si son el mismo objeto.
- **Comparación profunda**: comparar el contenido en todos los niveles.
- **`typeof null === "object"`**: hay que revisar `null` aparte.
- **`Object.keys(obj)`**: arreglo con las claves propias; en arreglos da los índices como texto.
- **`every`**: `true` si la condición se cumple para todos los elementos; corta al primer `false`.
- **Operador `in` y `Object.hasOwn`**: comprueban si una clave existe, aunque su valor sea `undefined`.
