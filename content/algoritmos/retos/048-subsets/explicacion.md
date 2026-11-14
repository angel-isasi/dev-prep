## Idea clave

Cada elemento tiene **dos opciones: entra o no entra** al subconjunto. Si recorres los elementos uno por uno y pruebas las dos opciones para cada uno, generas un **árbol de decisiones** con 2ⁿ hojas, y cada hoja es un subconjunto distinto. Lo recorres con **backtracking**: elegir (meter el elemento), explorar (decidir sobre el siguiente) y deshacer (sacarlo para probar la otra opción).

## Paso a paso

1. **Primero, entiende cuántos hay.** Con `[1, 2, 3]`: el 1 entra o no (2 formas), el 2 entra o no (2 formas), el 3 entra o no (2 formas). Total 2 × 2 × 2 = 8. Con n elementos, 2ⁿ. No hay forma de evitar generarlos todos, porque la respuesta misma los pide todos; la pregunta es cómo generarlos ordenadamente sin olvidar ni repetir ninguno.
2. **Una función que decide sobre un elemento.** `explorar(i)` decide qué pasa con `nums[i]`. Lleva en `camino` lo que ya decidiste meter.
3. **Opción "entra"**: el patrón completo del backtracking.
   - **elegir**: `camino.push(nums[i])`;
   - **explorar**: `explorar(i + 1)`, que se encarga de todos los elementos siguientes;
   - **deshacer**: `camino.pop()`, para que `camino` vuelva a estar como antes de elegir.
4. **Opción "no entra"**: no hay nada que elegir ni deshacer, solo `explorar(i + 1)`.
5. **Caso base**: si `i === nums.length`, ya decidiste sobre todos. `camino` es un subconjunto completo: guarda una **copia** con `[...camino]`. Si guardas `camino` directamente, guardas una referencia al mismo arreglo, que vas a seguir cambiando.
6. **¿Por qué no hay repetidos?** Porque cada hoja corresponde a una combinación distinta de decisiones "entra / no entra", y siempre decides en el mismo orden (primero el 1, luego el 2...). Nunca aparece `[2, 1]` además de `[1, 2]`.

```js
export function subconjuntos(nums) {
  const resultado = [];
  const camino = [];

  function explorar(i) {
    if (i === nums.length) {
      resultado.push([...camino]);
      return;
    }
    camino.push(nums[i]);
    explorar(i + 1);
    camino.pop();

    explorar(i + 1);
  }

  explorar(0);
  return resultado;
}
```

## Por qué funciona

Árbol de decisiones con `[1, 2, 3]`. A la izquierda "entra", a la derecha "no entra". Lo que está en cada nodo es `camino` en ese momento:

```
                         []                     ¿entra el 1?
              ┌──────────┴──────────┐
             [1]                    []          ¿entra el 2?
        ┌─────┴─────┐          ┌─────┴─────┐
      [1,2]        [1]        [2]          []   ¿entra el 3?
     ┌──┴──┐     ┌──┴──┐     ┌──┴──┐     ┌──┴──┐
 [1,2,3] [1,2] [1,3]  [1]  [2,3]  [2]   [3]   []
```

Las 8 hojas son los 8 subconjuntos. Así cambia `camino` al recorrer la parte izquierda:

| Paso | Acción | `camino` | ¿Se guarda? |
|---|---|---|---|
| 1 | elegir 1 | `[1]` | |
| 2 | elegir 2 | `[1, 2]` | |
| 3 | elegir 3, `i = 3` es el final | `[1, 2, 3]` | sí, `[1, 2, 3]` |
| 4 | deshacer 3; el 3 no entra, `i = 3` | `[1, 2]` | sí, `[1, 2]` |
| 5 | deshacer 2; el 2 no entra; elegir 3 | `[1, 3]` | sí, `[1, 3]` |
| 6 | deshacer 3; el 3 no entra | `[1]` | sí, `[1]` |
| 7 | deshacer 1; el 1 no entra ... | `[]` | (sigue por la derecha) |

El "deshacer" es lo que permite reutilizar un solo arreglo `camino` para todo el árbol: cada vez que vuelves de una rama, `camino` queda igual que antes de entrar.

## Errores comunes

- **Guardar `camino` sin copiar** (`resultado.push(camino)`). Todas las entradas apuntan al mismo arreglo, que al final queda vacío: devuelves 8 veces `[]`. Lo reconoces en el ejemplo clásico.
- **Olvidar el `pop` (deshacer).** Los elementos de una rama se quedan pegados en las siguientes y salen subconjuntos de más de 3 elementos o repetidos.
- **Olvidar la rama "no entra".** Solo sale `[1, 2, 3]`. Cada elemento necesita sus dos opciones.
- **Devolver `[]` cuando `nums` está vacío.** El conjunto vacío tiene un subconjunto: el vacío. La respuesta es `[[]]`. Lo reconoces en el test "arreglo vacío".
- **Ordenar `nums` en el lugar** para "ordenar los subconjuntos". `sort` cambia el arreglo de quien llamó; además aquí no hace falta. Lo reconoces en el test "no modifica el arreglo original".

## Otra forma de resolverlo

**Iterativa, duplicando** (sin recursión): empiezas con `[[]]`. Por cada número, recorres los subconjuntos que ya tienes y agregas una copia de cada uno con el número nuevo. Con `[1, 2]`: `[[]]` pasa a `[[], [1]]` y luego a `[[], [1], [2], [1, 2]]`.

```js
const resultado = [[]];
for (const num of nums) {
  const cantidad = resultado.length; // solo los que había antes de este número
  for (let k = 0; k < cantidad; k++) {
    resultado.push([...resultado[k], num]);
  }
}
return resultado;
```

**Backtracking con un `for`** (cada nodo del árbol es un subconjunto): guardas `camino` al entrar y luego pruebas agregar cada elemento a partir de `desde`. Es la plantilla que vas a reutilizar en Combination Sum:

```js
function explorar(desde) {
  resultado.push([...camino]);
  for (let i = desde; i < nums.length; i++) {
    camino.push(nums[i]);
    explorar(i + 1);
    camino.pop();
  }
}
```

**¿Cuál conviene?** Las tres son O(n × 2ⁿ) de tiempo y memoria, porque hay 2ⁿ subconjuntos y copiar cada uno cuesta hasta n. La iterativa es la más corta y no usa recursión. La de "entra / no entra" es la más fácil de dibujar y explicar. La del `for` es la plantilla general de backtracking. Aprende la de "entra / no entra" para entender y la del `for` para reutilizar.

## Cómo explicarlo en la entrevista

> "Cada elemento tiene dos opciones, entra o no entra, así que hay 2 a la n subconjuntos. Los genero con backtracking: una función recursiva decide sobre el elemento i. Primero lo meto en el camino, exploro el resto y lo saco, que es el patrón elegir, explorar y deshacer. Después exploro el resto sin meterlo. Cuando i llega al final, guardo una copia del camino. Como siempre decido en el mismo orden, no salen repetidos. Es O(n por 2 a la n) de tiempo y memoria, que es lo mínimo porque la salida tiene ese tamaño; la recursión usa O(n) de pila."

## Conceptos

- **Backtracking**: recorrer un árbol de decisiones construyendo la respuesta y retrocediendo.
- **Elegir, explorar, deshacer**: `push`, llamada recursiva, `pop`.
- **Árbol de decisiones binario**: dos opciones por nivel, 2ⁿ hojas.
- **Conjunto potencia**: todos los subconjuntos de un conjunto, incluido el vacío.
- **Copia al guardar**: `[...camino]` crea un arreglo nuevo con los mismos valores.
