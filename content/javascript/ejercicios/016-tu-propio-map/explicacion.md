## Idea clave

`map` no es magia: es un bucle que llama a **tu** función con cada elemento y guarda lo que devuelve en un array nuevo. Lo único que cambia de un uso a otro es la función que le pasas. Una función que recibe otra función como argumento se llama **función de orden superior**, y la función que recibe se llama **callback**.

## Paso a paso

1. **Crea un array vacío** `resultado`. Ahí irá lo nuevo; así no tocas el original.
2. **Recorre la lista con un `for` clásico**, porque necesitas el índice `i` para pasárselo al callback.
3. **Llama al callback** con `fn(lista[i], i, lista)`: el elemento, su posición y el array completo, en ese orden (el mismo que usa el `map` de JavaScript).
4. **Guarda lo que devuelve** con `resultado.push(...)`.
5. **Devuelve** `resultado`.

```js
export function mapear(lista, fn) {
  const resultado = [];

  for (let i = 0; i < lista.length; i++) {
    resultado.push(fn(lista[i], i, lista));
  }

  return resultado;
}
```

## Por qué funciona

Recorrido con `mapear([1, 2, 3], (n, i) => n * i)`:

| Vuelta | `i` | `lista[i]` | `fn(lista[i], i, lista)` | `resultado` al terminar la vuelta |
|---|---|---|---|---|
| antes del bucle | | | | `[]` |
| 1 | `0` | `1` | `1 * 0 = 0` | `[0]` |
| 2 | `1` | `2` | `2 * 1 = 2` | `[0, 2]` |
| 3 | `2` | `3` | `3 * 2 = 6` | `[0, 2, 6]` |

Fíjate que `mapear` no sabe nada de multiplicar: solo sabe recorrer y guardar. La "lógica" la pone quien llama, a través del callback. Por eso el mismo `mapear` sirve para duplicar números, pasar textos a mayúsculas o lo que necesites.

El callback recibe 3 argumentos, pero si tu función solo declara uno, como `(n) => n * 2`, JavaScript simplemente ignora los que sobran. Por eso pasar siempre los tres no rompe nada.

Con `[]`, la condición `0 < 0` es falsa desde el inicio, el bucle no da ninguna vuelta, `fn` nunca se llama y devuelves `[]`.

## Errores comunes

- **Olvidar el `return resultado`.** La función devuelve `undefined` y los tests fallan con "expected undefined to deeply equal [ 2, 4, 6 ]".
- **No pasar el índice al callback: `fn(lista[i])`.** Con `(n, i) => n * i`, `i` llega como `undefined` y `n * undefined` es `NaN`. Lo reconoces porque recibes `[NaN, NaN, NaN]`.
- **Modificar el original: `lista[i] = fn(lista[i])`.** Parece funcionar, pero cambias el array de quien te llamó. Lo reconoces en el test "no modifica el array original": el original ya no es `[1, 2, 3]`.
- **Llamar a `fn` sin guardar lo que devuelve.** Si haces `fn(lista[i], i, lista)` y luego `resultado.push(lista[i])`, recibes el array original sin transformar: `[1, 2, 3]` en vez de `[2, 4, 6]`.
- **Usar `for...in` para recorrer el array.** Te da los índices como **texto** (`"0"`, `"1"`), así que `i` llega como string al callback y puede causar resultados raros.

## Otra forma de resolverlo

Creando el array con el tamaño final desde el inicio:

```js
export function mapear(lista, fn) {
  const resultado = new Array(lista.length);
  for (let i = 0; i < lista.length; i++) {
    resultado[i] = fn(lista[i], i, lista);
  }
  return resultado;
}
```

Aquí reservas el espacio desde el inicio y escribes en cada posición, en vez de usar `push`.

**¿Cuál conviene?** La versión con `push` es la más clara y la que se espera en una entrevista. La de `new Array(lista.length)` deja más explícito que el resultado tiene el mismo largo que el original. Las dos son O(n): recorren el array una sola vez.

## Cómo explicarlo en la entrevista

> "`map` es una función de orden superior: recibe un callback y lo aplica a cada elemento. Creo un array vacío, recorro la lista con un `for` para tener el índice, llamo al callback con el elemento, el índice y la lista, igual que el `map` nativo, y guardo lo que devuelve con `push`. Al final devuelvo el array nuevo, así no muto el original. Es O(n) porque visito cada elemento una vez."

## Conceptos

- **Función de orden superior**: una función que recibe otra función como argumento o que devuelve una función.
- **Callback**: la función que le pasas a otra para que ella la llame cuando le toque.
- **`for` clásico**: `for (let i = 0; i < lista.length; i++)` te da el índice en cada vuelta.
- **`push`**: agrega un elemento al final de un array.
- **Inmutabilidad**: devolver un array nuevo en vez de modificar el que te pasaron; React depende mucho de esta idea.
- **Argumentos sobrantes**: si llamas a una función con más argumentos de los que declara, los extra se ignoran.
