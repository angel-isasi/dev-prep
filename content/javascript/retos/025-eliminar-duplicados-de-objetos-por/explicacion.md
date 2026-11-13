## Idea clave

Un `Set` solo guarda valores **únicos**. Para primitivos basta con meter la lista en un `Set`. Para objetos, el `Set` los compara por referencia y no sirve directo; en cambio guardas en un `Set` el **valor de la propiedad** que los identifica y filtras: el primero de cada valor pasa, los siguientes no.

## Paso a paso

1. **`unicos`**: `new Set(lista)` descarta repetidos conservando el orden de la primera aparición; `[...set]` lo convierte otra vez en arreglo.
2. **`unicosPor`**: crea un `Set` vacío `vistos`.
3. Recorre con `filter`, que devuelve un arreglo nuevo con los elementos para los que devuelves `true`.
4. Si `vistos.has(item[clave])`, ese valor ya apareció: `false`.
5. Si no, lo anotas con `vistos.add(item[clave])` y devuelves `true`.

```js
export function unicos(lista) {
  return [...new Set(lista)];
}

export function unicosPor(lista, clave) {
  const vistos = new Set();
  return lista.filter((item) => {
    if (vistos.has(item[clave])) return false;
    vistos.add(item[clave]);
    return true;
  });
}
```

## Por qué funciona

Recorrido de `unicosPor(votos, "id")`:

| Vuelta | `item` | `item.id` | ¿`vistos.has`? | ¿Pasa? | `vistos` después |
|---|---|---|---|---|---|
| 1 | `{ id: 1, corto: "A" }` | 1 | no | sí | `{1}` |
| 2 | `{ id: 2, corto: "B" }` | 2 | no | sí | `{1, 2}` |
| 3 | `{ id: 1, corto: "C" }` | 1 | sí | no | `{1, 2}` |

Resultado: los objetos A y B, los mismos de la lista original.

¿Por qué no `new Set(votos)`? Porque `{ id: 1, corto: "A" }` y `{ id: 1, corto: "C" }` son dos objetos distintos en memoria; incluso dos objetos idénticos lo serían. El `Set` compara como `===`, así que los tres votos pasarían.

`Set.has` y `Set.add` son O(1) en promedio, así que todo el recorrido es O(n). El `Set` también distingue tipos: `1` y `"1"` son valores distintos.

## Errores comunes

- **Usar `new Set(lista)` con objetos.** No quita nada, porque compara referencias. Lo reconoces porque `unicosPor` devuelve los tres votos.
- **Guardar en `vistos` el objeto entero: `vistos.add(item)`.** Mismo problema: nunca vas a encontrar "el mismo" objeto con otro contenido igual.
- **Usar `lista.indexOf(item) === i` para objetos.** También compara referencias y no detecta duplicados por propiedad.
- **Usar un objeto `{}` como registro de vistos.** Funciona para textos, pero convierte las claves a texto: `1` y `"1"` se confundirían.
- **Quedarte con el último en vez del primero** (por ejemplo, armando un `Map` y sobrescribiendo). Lo reconoces porque recibes `["C", "B"]` o `["B", "C"]`.

## Otra forma de resolverlo

Con un `Map` donde la clave es el valor de la propiedad:

```js
export function unicosPor(lista, clave) {
  const porClave = new Map();
  for (const item of lista) {
    if (!porClave.has(item[clave])) porClave.set(item[clave], item);
  }
  return [...porClave.values()];
}
```

El `Map` guarda el primer objeto de cada valor y `values()` los devuelve en orden de inserción. Conviene si además quieres **buscar** por esa clave después (`porClave.get(1)`). Si quisieras quedarte con el **último** de cada valor (por ejemplo, la versión más reciente de un producto), bastaría con quitar el `if` y sobrescribir siempre.

Para primitivos, una alternativa sin `Set` es `lista.filter((x, i) => lista.indexOf(x) === i)`, pero es O(n²) porque `indexOf` recorre la lista en cada vuelta.

## Cómo explicarlo en la entrevista

> "Para primitivos basta con `new Set`, que solo guarda valores únicos, y lo convierto otra vez en arreglo con spread. Para objetos, el `Set` compara referencias y dos objetos con el mismo contenido son distintos, así que guardo en un `Set` la propiedad que los identifica, como el `id`, y filtro: me quedo con el primero de cada valor. `has` y `add` son O(1), así que todo es O(n)."

## Conceptos

- **`Set`**: colección de valores únicos; compara con la misma regla que `===` (salvo `NaN`, que sí se reconoce como igual a sí mismo).
- **Spread `[...set]`**: convierte un `Set` (o cualquier iterable) en arreglo.
- **`filter`**: devuelve un arreglo nuevo con los elementos que cumplen la condición.
- **Comparación por referencia**: dos objetos distintos nunca son `===`, aunque tengan el mismo contenido.
- **`Map`**: diccionario que respeta el orden de inserción y acepta claves de cualquier tipo.
