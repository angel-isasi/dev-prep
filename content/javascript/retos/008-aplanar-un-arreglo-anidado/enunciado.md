Escribe la función `aplanar(arr)` que reciba un arreglo con arreglos anidados a **cualquier profundidad** y devuelva un arreglo nuevo de un solo nivel, con todos los elementos en el mismo orden.

## Reglas

- No uses `.flat()` ni `.flatMap()`: el reto es hacerlo a mano.
- Los elementos que no son arreglos (números, textos, objetos) se agregan tal cual.
- Los textos **no** se separan en letras: `"hola"` sigue siendo un solo elemento.
- No modifiques el arreglo original.
- Un arreglo vacío devuelve `[]`.

## Ejemplos

```js
aplanar([1, [2, [3, [4]]], 5]);   // [1, 2, 3, 4, 5]
aplanar([[], [[]], 1]);           // [1]
aplanar(["ab", ["cd"]]);          // ["ab", "cd"]
aplanar([]);                      // []
```

## Por qué importa

Datos anidados aparecen todo el tiempo: comentarios con respuestas, menús con submenús, categorías dentro de categorías. Es el ejercicio clásico para ver si sabes **recursión**, y en la entrevista suelen seguir con "¿y si solo quiero aplanar un nivel?" o "¿cómo lo harías sin recursión?".
