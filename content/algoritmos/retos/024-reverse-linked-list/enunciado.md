Escribe la función `invertir(cabeza)` que reciba el primer nodo (la **cabeza**) de una **lista enlazada** y la invierta, devolviendo la nueva cabeza.

Una lista enlazada es una cadena de objetos donde cada nodo guarda su valor y una referencia al siguiente:

```js
// La lista 1 -> 2 -> 3 se ve así:
const cabeza = { val: 1, next: { val: 2, next: { val: 3, next: null } } };
```

El último nodo tiene `next: null`. Una lista vacía es simplemente `null`.

## Reglas

- **Reutiliza los mismos nodos**: cambia sus `next`, no crees nodos nuevos.
- Devuelve la nueva cabeza (el que antes era el último nodo).
- Si la lista está vacía (`null`), devuelve `null`.
- Los tests convierten la lista a arreglo para comparar; tú solo trabajas con nodos.

## Ejemplos

```js
// 1 -> 2 -> 3 -> 4 -> 5   se convierte en   5 -> 4 -> 3 -> 2 -> 1
invertir(lista([1, 2, 3, 4, 5]));   // nodo 5, y luego 4, 3, 2, 1
invertir(lista([7]));               // el mismo nodo 7
invertir(null);                     // null
```

## Reto extra

Hazlo con **O(1) de memoria extra**: sin pasar los valores a un arreglo y sin recursión, solo moviendo referencias.
