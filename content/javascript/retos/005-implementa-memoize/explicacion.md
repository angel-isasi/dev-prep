## Idea clave

Guardas un `Map` en un **closure**. La clave es la lista de argumentos convertida a texto y el valor es el resultado. Antes de calcular, preguntas a la caché; si ya está, la devuelves sin llamar a `fn`.

## Paso a paso

1. **Crea la caché** con `const cache = new Map()` dentro de `memoize`. Cada llamada a `memoize` crea un `Map` nuevo, así que cada función memoizada tiene su propia caché.
2. **Devuelve una función** que recibe `...args`.
3. **Arma la clave** con `JSON.stringify(args)`: el arreglo `[10, 3]` se vuelve el texto `"[10,3]"`.
4. **Pregunta con `cache.has(clave)`**. Si está, devuelve `cache.get(clave)`.
5. **Si no está**, calcula con `fn.apply(this, args)`, guarda con `cache.set` y devuelve el resultado.

```js
export function memoize(fn) {
  const cache = new Map();

  return function (...args) {
    const clave = JSON.stringify(args);
    if (cache.has(clave)) return cache.get(clave);

    const resultado = fn.apply(this, args);
    cache.set(clave, resultado);
    return resultado;
  };
}
```

## Por qué funciona

Recorrido con `const restar = memoize((a, b) => a - b)`:

| Llamada | `clave` | ¿`cache.has`? | Qué hace | Caché al final |
|---|---|---|---|---|
| `restar(10, 3)` | `"[10,3]"` | no | calcula 7 y lo guarda | `{"[10,3]" => 7}` |
| `restar(3, 10)` | `"[3,10]"` | no | calcula -7 y lo guarda | `{"[10,3]" => 7, "[3,10]" => -7}` |
| `restar(10, 3)` | `"[10,3]"` | sí | devuelve 7 sin llamar a `fn` | sin cambios |

¿Por qué `JSON.stringify` y no `args` directamente? Porque un `Map` compara las claves que son objetos por **referencia**: cada llamada crea un arreglo `args` nuevo, así que `[10, 3]` de la primera llamada y `[10, 3]` de la tercera son claves distintas y nunca habría aciertos. Los textos, en cambio, se comparan por contenido.

¿Y por qué `has` y no `get`? Si `fn` devuelve `0`, `if (cache.get(clave))` daría falso y volverías a calcular cada vez. `has` responde "¿existe la clave?", sin importar el valor.

## Errores comunes

- **Crear la caché dentro de la función devuelta.** Se vacía en cada llamada y nunca hay aciertos. Lo reconoces porque `fn` se llama 3 veces en el primer test.
- **Usar `args` (el arreglo) como clave del `Map`.** Mismo síntoma: cada llamada trae un arreglo nuevo y el `Map` no los reconoce como iguales.
- **Usar solo el primer argumento como clave: `cache.has(args[0])`.** Con varios argumentos mezclas resultados: `restar(10, 3)` y `restar(10, 5)` devolverían lo mismo.
- **Preguntar con `if (cache.get(clave))`.** Los resultados `0`, `""` o `undefined` nunca salen de la caché. Lo reconoces porque falla el test de los falsy.
- **Declarar la caché fuera de `memoize`, a nivel del módulo.** Todas las funciones memoizadas la compartirían: `triple(5)` devolvería el `10` que guardó `doble(5)`.

## Otra forma de resolverlo

Si la función recibe **un solo argumento primitivo**, puedes usarlo directamente como clave, sin `JSON.stringify`:

```js
export function memoize1(fn) {
  const cache = new Map();
  return (arg) => {
    if (!cache.has(arg)) cache.set(arg, fn(arg));
    return cache.get(arg);
  };
}
```

Es más rápido (no convierte a texto) y distingue `1` de `"1"`, cosa que `JSON.stringify` también hace, pero no distingue, por ejemplo, `undefined` de `null` dentro de un arreglo (`JSON.stringify([undefined])` da `"[null]"`). Conviene para funciones como Fibonacci o factorial.

Límites que vale la pena mencionar: solo sirve para **funciones puras** (mismo argumento, mismo resultado, sin efectos secundarios), la caché crece sin límite (en producción se pone un tope, como en una caché LRU) y con objetos como argumentos `JSON.stringify` puede ser lento o ambiguo.

## Cómo explicarlo en la entrevista

> "Uso un `Map` dentro de un closure como caché. La clave es el arreglo de argumentos convertido a texto con `JSON.stringify`, porque el `Map` compara arreglos por referencia. Si ya tengo esa combinación, la devuelvo; si no, calculo, guardo y devuelvo. Pregunto con `has` para no recalcular resultados como 0. Leer y escribir en el `Map` es O(1). Sirve para funciones puras y costosas; advertiría que la caché crece sin límite y que con objetos complejos la clave por texto tiene problemas."

## Conceptos

- **Memoización**: guardar el resultado de una función según sus argumentos para no recalcularlo.
- **Función pura**: con los mismos argumentos siempre devuelve lo mismo y no cambia nada fuera de ella.
- **`Map`**: diccionario con `set`, `get`, `has` y `delete`; acepta claves de cualquier tipo.
- **Comparación por referencia**: dos arreglos con el mismo contenido son objetos distintos para `===` y para `Map`.
- **`JSON.stringify`**: convierte un valor en texto; útil para armar claves.
- **Closure**: la caché sobrevive entre llamadas porque la función devuelta la recuerda.
