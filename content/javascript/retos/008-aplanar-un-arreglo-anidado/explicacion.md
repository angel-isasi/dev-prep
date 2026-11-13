## Idea clave

Cada elemento es una de dos cosas: un **valor normal**, que va directo al resultado, o un **arreglo**, que se aplana con la misma función (recursión) y se pega al resultado. La recursión baja todos los niveles que haga falta.

## Paso a paso

1. **Recorre con `reduce`**, empezando con un acumulador vacío `[]`.
2. **Pregunta con `Array.isArray(elemento)`** si el elemento es un arreglo.
3. **Si es arreglo**, llama a `aplanar(elemento)`: te devuelve ese subarreglo ya plano. Lo pegas con `acumulado.concat(...)`.
4. **Si no es arreglo**, lo agregas con `acumulado.concat([elemento])`.
5. `concat` devuelve un arreglo **nuevo**, así que nunca tocas el original.

```js
export function aplanar(arr) {
  return arr.reduce(
    (acumulado, elemento) =>
      Array.isArray(elemento) ? acumulado.concat(aplanar(elemento)) : acumulado.concat([elemento]),
    [],
  );
}
```

## Por qué funciona

Recorrido con `aplanar([1, [2, [3]], 4])`:

| Llamada | Elemento | ¿Arreglo? | Acumulado después |
|---|---|---|---|
| `aplanar([1, [2, [3]], 4])` | `1` | no | `[1]` |
| | `[2, [3]]` | sí: llama `aplanar([2, [3]])` | ... |
| `aplanar([2, [3]])` | `2` | no | `[2]` |
| | `[3]` | sí: llama `aplanar([3])`, que devuelve `[3]` | `[2, 3]` |
| volvemos | (`aplanar([2, [3]])` devolvió `[2, 3]`) | | `[1, 2, 3]` |
| | `4` | no | `[1, 2, 3, 4]` |

El caso base es implícito: cuando un arreglo no tiene subarreglos, ningún elemento provoca otra llamada y la recursión se detiene.

¿Por qué `concat([elemento])` y no `concat(elemento)`? Porque `concat` aplana **un nivel** de sus argumentos que sean arreglos. Con `[elemento]` dejas claro que agregas un solo valor, pase lo que pase.

## Errores comunes

- **Usar `typeof elemento === "object"` para detectar arreglos.** También es `true` para objetos y `null`. Lo reconoces porque el test con `{ id: 1 }` falla con un error al recorrerlo.
- **Olvidar la recursión: `acumulado.concat(elemento)` para todo.** Solo aplanas un nivel. Lo reconoces porque recibes `[1, 2, [3, [4]], 5]`.
- **Llamar a `aplanar` pero no usar lo que devuelve.** Si escribes `aplanar(elemento);` en una línea suelta, el resultado se pierde.
- **Usar `push(aplanar(elemento))` sin los tres puntos.** Metes el subarreglo entero como un solo elemento y vuelves a tener anidación. Debe ser `push(...aplanar(elemento))`.
- **Usar `.flat(Infinity)`.** Es la respuesta de producción, pero aquí el test lo detecta: el reto es mostrar que sabes hacerlo a mano.

## Otra forma de resolverlo

Sin recursión, usando una **pila**:

```js
export function aplanar(arr) {
  const pila = [...arr];
  const resultado = [];

  while (pila.length > 0) {
    const elemento = pila.pop();
    if (Array.isArray(elemento)) {
      pila.push(...elemento);
    } else {
      resultado.push(elemento);
    }
  }

  return resultado.reverse();
}
```

Sacas elementos del final: si es arreglo, devuelves sus elementos a la pila; si no, va al resultado. Como sacas desde el final, el resultado sale al revés y lo das vuelta al terminar. Conviene con anidaciones **muy** profundas (miles de niveles), donde la recursión podría causar "Maximum call stack size exceeded". También es la respuesta cuando el entrevistador pregunta "¿y sin recursión?".

En código real: `arr.flat(Infinity)`.

## Cómo explicarlo en la entrevista

> "Recorro con `reduce`. Para cada elemento pregunto con `Array.isArray` si es un arreglo: si lo es, lo aplano llamando recursivamente a la misma función y concateno el resultado; si no, lo agrego tal cual. Uso `concat`, que devuelve arreglos nuevos, así no modifico el original. Visito cada elemento una vez, así que es O(n) en el total de elementos. Si la anidación fuera muy profunda, lo haría con una pila para no desbordar la pila de llamadas, y en producción usaría `flat(Infinity)`."

## Conceptos

- **Recursión**: una función que se llama a sí misma con una parte más pequeña del problema.
- **`Array.isArray(x)`**: la forma correcta de saber si algo es un arreglo.
- **`reduce`**: recorre un arreglo acumulando un resultado.
- **`concat`**: devuelve un arreglo nuevo con los elementos unidos; aplana un nivel de sus argumentos.
- **Spread en `push(...arr)`**: agrega cada elemento por separado.
- **Pila (stack)**: estructura donde el último que entra es el primero que sale (`push` y `pop`).
- **`flat(profundidad)`**: método nativo que aplana; con `Infinity` aplana todo.
