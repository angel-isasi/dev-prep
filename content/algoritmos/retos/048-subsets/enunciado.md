Escribe la función `subconjuntos(nums)` que reciba un arreglo de números **distintos** y devuelva **todos sus subconjuntos** (también llamado el "conjunto potencia").

Un subconjunto es cualquier selección de elementos, sin importar el orden: con `[1, 2]` los subconjuntos son `[]`, `[1]`, `[2]` y `[1, 2]`.

## Reglas

- Los números de `nums` no se repiten. Puede haber negativos.
- Incluye el subconjunto vacío `[]` y el que tiene todos los elementos.
- No repitas subconjuntos: `[1, 2]` y `[2, 1]` son el mismo.
- **El orden no importa**, ni el de la lista ni el de los números dentro de cada subconjunto: los tests ordenan tu respuesta antes de compararla.
- No modifiques el arreglo original.

## Ejemplos

```js
subconjuntos([1, 2, 3]);
// [[], [1], [2], [3], [1, 2], [1, 3], [2, 3], [1, 2, 3]]   (en cualquier orden)

subconjuntos([0]);   // [[], [0]]
subconjuntos([]);    // [[]]   el vacío siempre está
```

## Reto extra

Con `n` elementos hay exactamente 2ⁿ subconjuntos, porque cada elemento tiene dos opciones: **entra o no entra**. Resuélvelo con **backtracking** siguiendo esa idea: elegir, explorar, deshacer.
