## Idea clave

`sort` **muta**: ordena el mismo arreglo que recibe y devuelve esa misma referencia. La función creía estar devolviendo una lista nueva, pero ordenaba el catálogo original, y cualquier otra parte de la app que usaba ese arreglo (la vista de Destacados) veía el cambio.

## Paso a paso

1. **Lee el síntoma.** El orden por precio funciona. Lo que falla es **otra** vista que usa los mismos datos. Cuando algo cambia "solo", sospecha de una mutación.
2. **Reprodúcelo.** Guarda el catálogo, llama a `ordenarPorPrecio(catalogo)` y vuelve a mirar `catalogo`: ya está ordenado.
3. **Confirma que es el mismo arreglo.** `ordenarPorPrecio(catalogo) === catalogo` da `true`. No hay lista nueva.
4. **Ordena una copia.**

```js
return [...productos].sort((a, b) => a.precio - b.precio);
```

## Por qué funciona

`[...productos]` crea un arreglo nuevo con los mismos elementos. `sort` reordena ese arreglo nuevo y lo devuelve; el original queda intacto.

Ojo: la copia es **superficial**. Los objetos de adentro son los mismos (`copia[0] === original[1]`), solo cambia el arreglo que los contiene. Para ordenar eso basta, porque `sort` no modifica los objetos, solo cambia su posición.

Esto mismo es lo que rompe el estado en React: si haces `lista.sort()` sobre el estado y luego `setLista(lista)`, React recibe la misma referencia y puede no volver a pintar.

## Errores comunes

- **Copiar después de ordenar**: `return [...productos.sort(...)]`. Devuelves una copia, pero el original ya se ordenó antes de copiarlo.
- **Guardar en otra variable**: `const ordenados = productos; ordenados.sort(...)`. Asignar no copia: las dos variables apuntan al mismo arreglo.
- **Volver a ordenar por un campo "destacado" en la otra vista.** Esconde el síntoma, pero cualquier otra parte de la app que lea el catálogo seguirá viendo datos cambiados.

## Otra forma de resolverlo

`toSorted` (disponible en navegadores modernos y en Node 20 o más) hace lo mismo que `sort` pero devuelve un arreglo nuevo sin tocar el original:

```js
export function ordenarPorPrecio(productos) {
  return productos.toSorted((a, b) => a.precio - b.precio);
}
```

`slice()` también copia: `productos.slice().sort(...)`.

## Cómo explicarlo en la entrevista

> "El ordenamiento estaba bien, pero otra vista cambiaba sola, lo que me hizo sospechar de una mutación. `sort` ordena el arreglo en el lugar y devuelve la misma referencia, así que estaba modificando el catálogo original. Lo arreglé ordenando una copia con spread. También existe `toSorted`, que ya devuelve un arreglo nuevo. Es el mismo motivo por el que en React no se debe hacer `sort` directo sobre el estado."

## Conceptos

- **Mutar**: cambiar un dato existente en vez de crear uno nuevo.
- **Métodos que mutan**: `sort`, `reverse`, `push`, `pop`, `splice`. Los que no mutan: `map`, `filter`, `slice`, `toSorted`.
- **Referencia**: dos variables pueden apuntar al mismo arreglo; cambiarlo desde una se ve desde la otra.
- **Spread (`...`)**: `[...arr]` crea un arreglo nuevo con los mismos elementos.
- **Copia superficial**: copia el contenedor, pero los objetos de adentro siguen siendo los mismos.
