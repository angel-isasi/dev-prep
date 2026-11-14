Escribe la función `rotar(nums, k)` que **rote** el arreglo `nums` `k` posiciones **hacia la derecha**.

Rotar una posición a la derecha significa que el último elemento pasa al inicio y todos los demás se corren un lugar:

```
[1, 2, 3, 4, 5, 6, 7]   rotar 1  ->  [7, 1, 2, 3, 4, 5, 6]
                        rotar 2  ->  [6, 7, 1, 2, 3, 4, 5]
                        rotar 3  ->  [5, 6, 7, 1, 2, 3, 4]
```

## Reglas

- **Modifica `nums` en el lugar** (in-place): los tests revisan el mismo arreglo que te pasaron. No hace falta devolver nada.
- Crear un arreglo nuevo con el resultado y devolverlo **no** sirve: el arreglo original tiene que quedar rotado.
- `k` puede ser 0 o **mayor que el largo** del arreglo: rotar 7 veces un arreglo de 7 elementos lo deja igual.
- El arreglo tiene al menos un elemento.

## Ejemplos

```js
const a = [1, 2, 3, 4, 5, 6, 7];
rotar(a, 3);
a;  // [5, 6, 7, 1, 2, 3, 4]

const b = [-1, -100, 3, 99];
rotar(b, 2);
b;  // [3, 99, -1, -100]

const c = [1, 2, 3];
rotar(c, 4);
c;  // [3, 1, 2]   rotar 4 es lo mismo que rotar 1
```

## Reto extra

Con un arreglo auxiliar sale fácil en O(n) de memoria. ¿Puedes hacerlo con **O(1) de memoria extra**? Pista de lo que se puede: se resuelve con tres "voltear un tramo del arreglo".
