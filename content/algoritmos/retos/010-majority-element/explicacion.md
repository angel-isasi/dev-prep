## Idea clave

El mayoritario aparece más veces que **todos los demás juntos**. Si cada aparición del candidato suma un voto y cada número distinto le quita uno, los demás nunca alcanzan a "anular" al mayoritario: al final siempre queda él como candidato. Es la **votación de Boyer-Moore**.

## Paso a paso

1. **La solución directa** (dila en voz alta): contar con un `Map` cuántas veces aparece cada número y devolver el que pase de `n / 2`. Es O(n) de tiempo, pero usa O(n) de memoria.

   ```js
   const conteo = new Map();
   for (const n of nums) {
     conteo.set(n, (conteo.get(n) || 0) + 1);
     if (conteo.get(n) > nums.length / 2) return n;
   }
   ```

2. **Otra idea rápida**: ordenar. El mayoritario ocupa más de la mitad, así que siempre cae en la posición del medio: `[...nums].sort((a, b) => a - b)[Math.floor(n / 2)]`. Es O(n log n).
3. **Boyer-Moore, para O(1) de memoria.** Lleva un `candidato` y sus `votos`. Recorre una vez:
   - Si `votos` es 0, el número actual pasa a ser el candidato.
   - Si el número es igual al candidato, `votos++`; si no, `votos--`.
4. **¿Por qué el ganador es el mayoritario?** Piensa que cada número distinto "se cancela" con una aparición del candidato. El mayoritario tiene más apariciones que todos los demás sumados, así que no lo pueden cancelar entero: al final queda él.
5. **El orden dentro del bucle importa**: primero decides si cambias de candidato, después cuentas el voto. Así el número que se vuelve candidato se da su propio voto.

```js
export function mayoritario(nums) {
  let candidato = null;
  let votos = 0;

  for (const n of nums) {
    if (votos === 0) candidato = n;
    votos += n === candidato ? 1 : -1;
  }

  return candidato;
}
```

## Por qué funciona

Recorrido con `mayoritario([2, 2, 1, 1, 1, 2, 2])`:

| `n` | ¿`votos` era 0? | `candidato` | `votos` después |
|---|---|---|---|
| 2 | sí | 2 | 1 |
| 2 | no | 2 | 2 |
| 1 | no | 2 | 1 |
| 1 | no | 2 | 0 |
| 1 | **sí** | **1** | 1 |
| 2 | no | 1 | 0 |
| 2 | **sí** | **2** | 1 |

Devuelve 2. Fíjate en que el candidato cambió a 1 a mitad de camino: Boyer-Moore no promete que el candidato sea correcto en cada momento, solo **al final**, y solo si el mayoritario existe (como garantiza el enunciado).

Con `[1, 2, 3, 3, 3]`: el 1 y el 2 se anulan entre sí (votos 1, luego 0), el primer 3 se vuelve candidato y los otros dos 3 lo refuerzan. Devuelve 3.

## Errores comunes

- **Contar con un objeto y devolver la clave.** `Object.keys` y `for...in` dan las claves como **texto**: devuelves `"3"` en vez de `3`. Lo reconoces porque el test falla con `expected '-1' to be -1`. Usa `Map`, que conserva el tipo, o convierte con `Number(clave)`.
- **Contar el voto antes de cambiar de candidato.** Si haces `votos += ...` primero, con `votos = 0` el número nuevo resta un voto (porque aún no es el candidato) y `votos` se vuelve negativo.
- **Usar Boyer-Moore cuando no está garantizado que exista el mayoritario.** Con `[1, 2, 3]` devuelve 3, que no es mayoritario. En ese caso hay que hacer una segunda pasada para contar al candidato.
- **Comparar con `>= n / 2`** en la versión de conteo. "Más de la mitad" es `>`; con `[1, 2]` el 1 aparece exactamente la mitad y no es mayoritario.
- **Ordenar sin comparador.** `[10, 9, 9].sort()` da `[10, 9, 9]` (orden de texto). Para este problema sigue funcionando por casualidad, pero es un mal hábito: usa `(a, b) => a - b`.

## Otra forma de resolverlo

- **Conteo con `Map`** (paso 1): O(n) de tiempo y O(n) de memoria. Es la más fácil de explicar y la que conviene escribir si no recuerdas Boyer-Moore.
- **Ordenar y tomar el del medio** (paso 2): O(n log n) de tiempo; si ordenas una copia, O(n) de memoria. Corta y elegante.

**¿Cuál conviene?** Empieza por el conteo con `Map`: muestra que sabes usar estructuras. Si te preguntan "¿y con O(1) de memoria?", presenta Boyer-Moore. Es un truco que se recuerda o no; no te preocupes si no lo inventas en el momento, pero explicarlo bien da muchos puntos.

## Cómo explicarlo en la entrevista

> "La forma fácil es contar con un Map, que es O(n) de tiempo pero usa O(n) de memoria. Como el mayoritario aparece más de la mitad de las veces, puedo usar la votación de Boyer-Moore: llevo un candidato y un contador; cada elemento igual al candidato suma un voto y cada distinto resta uno, y cuando los votos llegan a cero cambio de candidato. Como el mayoritario aparece más veces que todos los demás juntos, siempre sobrevive al final. Queda O(n) de tiempo y O(1) de memoria."

## Conceptos

- **Votación de Boyer-Moore**: encuentra el elemento mayoritario en una pasada y sin memoria extra.
- **`Map` vs objeto**: el `Map` conserva el tipo de las claves; el objeto las convierte a texto.
- **Operador ternario**: `condición ? siUno : siOtro`, útil para sumar 1 o -1 en una línea.
- **Precondición**: algo que el enunciado garantiza (aquí, que el mayoritario existe) y que tu algoritmo puede aprovechar.
- **O(1) de memoria**: usar una cantidad fija de variables sin importar el tamaño de la entrada.
