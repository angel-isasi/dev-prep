Escribe la función `particion(lista, cumple)` que separe un arreglo en **dos grupos**: los elementos que cumplen una condición y los que no. Devuelve un arreglo con los dos grupos: `[losQueCumplen, losQueNo]`.

`cumple` es una **función** que recibe un elemento y devuelve `true` o `false`. Tú no sabes qué condición es: solo la llamas con cada elemento.

## Reglas

- Cada grupo mantiene el orden original de los elementos.
- Si ninguno cumple (o todos cumplen), uno de los grupos queda vacío, pero siempre devuelves los dos: `[[], [...]]` o `[[...], []]`.
- Si la lista está vacía, devuelve `[[], []]`.
- Recorre la lista **una sola vez** y no la modifiques.

## Ejemplos

```js
particion([11, 18, 20, 9], (nota) => nota >= 11);
// [[11, 18, 20], [9]]

particion(["sol", "luna", "mar"], (palabra) => palabra.length > 3);
// [["luna"], ["sol", "mar"]]

particion([1, 3, 5], (n) => n % 2 === 0);
// [[], [1, 3, 5]]

particion([], (n) => n > 0);
// [[], []]
```

## Por qué importa

Recibir una función como argumento (un *callback*) es lo que hace reutilizable a tu código: la misma `particion` sirve para aprobados y desaprobados, tareas hechas y pendientes, o productos con y sin stock. Es la base de `map`, `filter`, los eventos del DOM y las props de React como `onClick`.
