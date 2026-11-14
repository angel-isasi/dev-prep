## Idea clave

Frente a cada casa solo hay dos opciones: **saltarla** (te quedas con lo mejor hasta la casa anterior) o **robarla** (sumas su dinero a lo mejor hasta dos casas atrás). El mejor total hasta la casa `i` es el mayor de esos dos. Como solo dependes de los dos totales anteriores, avanzas con dos variables: programación dinámica en O(n) y O(1) de memoria.

## Paso a paso

1. **Descarta los atajos.** "Roba todas las casas pares o todas las impares y quédate con la mayor suma" parece funcionar, pero con `[2, 1, 1, 2]` las pares suman 3, las impares 3, y la respuesta es 4 (casas 0 y 3, saltándote dos seguidas). "Roba siempre la casa más rica" tampoco: en `[5, 10, 6]` tomar el 10 te deja en 10, y 5 + 6 = 11.
2. **Decide casa por casa.** Llama `mejor(i)` al máximo que puedes juntar mirando solo las casas de 0 a `i`. Para la casa `i`:
   - Si la **saltas**, lo mejor es `mejor(i - 1)`.
   - Si la **robas**, no pudiste robar la `i - 1`, así que sumas a `mejor(i - 2)`: `mejor(i - 2) + casas[i]`.

   `mejor(i) = Math.max(mejor(i - 1), mejor(i - 2) + casas[i])`
3. **La solución directa** (dila en voz alta): escribir esa fórmula como recursión. Funciona, pero `mejor(i)` llama a `mejor(i - 1)` y a `mejor(i - 2)`, y `mejor(i - 1)` vuelve a llamar a `mejor(i - 2)`: los mismos cálculos se repiten y el tiempo crece de forma exponencial, como en Fibonacci.

   ```js
   function mejor(i) {
     if (i < 0) return 0;
     return Math.max(mejor(i - 1), mejor(i - 2) + casas[i]);
   }
   return mejor(casas.length - 1);
   ```

4. **De abajo hacia arriba.** En vez de bajar desde la última casa, avanza desde la primera y guarda cada `mejor(i)` en una tabla. Cada valor se calcula una vez: O(n).
5. **Solo necesitas los dos últimos.** Para calcular `mejor(i)` usas `mejor(i - 1)` y `mejor(i - 2)`, nada más. Dos variables bastan: `anterior` y `anteAnterior`, que empiezan en 0 (antes de la primera casa no hay dinero).
6. **Actualiza en el orden correcto.** Calcula `actual` primero; después corre las variables: `anteAnterior = anterior` y `anterior = actual`.
7. **Casos borde gratis.** Con `[]` el bucle no entra y devuelves 0. Con una casa, `actual = Math.max(0, 0 + dinero)`, que es su dinero.

```js
export function robarCasas(casas) {
  let anteAnterior = 0;
  let anterior = 0;

  for (const dinero of casas) {
    const actual = Math.max(anterior, anteAnterior + dinero);
    anteAnterior = anterior;
    anterior = actual;
  }

  return anterior;
}
```

## Por qué funciona

Recorrido con `robarCasas([2, 7, 9, 3, 1])`:

| Casa `i` | `dinero` | Saltarla: `anterior` | Robarla: `anteAnterior + dinero` | `actual` | `anteAnterior` después | `anterior` después |
|---|---|---|---|---|---|---|
| inicio | | | | | 0 | 0 |
| 0 | 2 | 0 | 0 + 2 = 2 | **2** | 0 | 2 |
| 1 | 7 | 2 | 0 + 7 = 7 | **7** | 2 | 7 |
| 2 | 9 | 7 | 2 + 9 = 11 | **11** | 7 | 11 |
| 3 | 3 | 11 | 7 + 3 = 10 | **11** | 11 | 11 |
| 4 | 1 | 11 | 11 + 1 = 12 | **12** | 11 | 12 |

Devuelve 12: las casas 0, 2 y 4 (2 + 9 + 1). En la casa 3 conviene saltar (11 > 10), y en la casa 4 conviene robar sumando el 11 de dos casas atrás.

**Por qué no hace falta mirar más atrás**: `anteAnterior` ya es lo mejor de **todas** las casas hasta `i - 2`, saltándose las que convenga. Con `[2, 1, 1, 2]`, al llegar a la casa 3 `anteAnterior` vale 2 (solo la casa 0), así que robar la casa 3 da 2 + 2 = 4: la fórmula se salta dos casas seguidas sin que tengas que pedírselo.

## Errores comunes

- **Sumar pares e impares por separado.** Lo reconoces en el test `[2, 1, 1, 2]`: das 3 en vez de 4.
- **Elegir siempre la casa más rica.** Lo reconoces en el test `[5, 10, 6]`: das 10 en vez de 11.
- **Actualizar las variables en el orden equivocado.** Si haces `anterior = Math.max(...)` y después `anteAnterior = anterior`, `anteAnterior` recibe el valor **nuevo** y sumas casas vecinas.
- **Usar `casas[i - 1]` en vez de "lo mejor hasta `i - 1`".** La decisión depende del **total acumulado**, no del dinero de una sola casa vecina.
- **Acceder a `casas[0]` y `casas[1]` sin revisar el largo.** Si inicializas así, el arreglo vacío o de una casa da `undefined` o `NaN`. Empezar las dos variables en 0 evita esos casos especiales.

## Otra forma de resolverlo

**Con una tabla completa**: un arreglo `mejor` del largo de `casas`, donde `mejor[i] = Math.max(mejor[i - 1], mejor[i - 2] + casas[i])`. Es O(n) de tiempo y O(n) de memoria. Ocupa más, pero puedes mirar la tabla entera para depurar o para reconstruir qué casas elegiste:

```js
if (casas.length === 0) return 0;
const mejor = new Array(casas.length);
mejor[0] = casas[0];
mejor[1] = Math.max(casas[0], casas[1] ?? 0);
for (let i = 2; i < casas.length; i++) {
  mejor[i] = Math.max(mejor[i - 1], mejor[i - 2] + casas[i]);
}
return mejor[casas.length - 1];
```

**Recursión con memoización**: la recursión del paso 3 más un `Map` que guarda cada `mejor(i)`. También O(n), pero usa la pila de llamadas.

**¿Cuál conviene?** La de dos variables: es la más corta, O(1) de memoria y el entrevistador suele pedirla como mejora final. Si te cuesta verla de frente, escribe primero la tabla y luego di "solo uso las dos últimas casillas, así que las cambio por dos variables".

## Cómo explicarlo en la entrevista

> "En cada casa tengo dos opciones: saltarla, y me quedo con lo mejor hasta la casa anterior, o robarla, y sumo su dinero a lo mejor hasta dos casas atrás. El mejor total es el máximo de esas dos. Es programación dinámica, como Fibonacci: cada valor depende de los dos anteriores. Lo recorro una vez de izquierda a derecha guardando solo esos dos totales en dos variables. Queda O(n) de tiempo y O(1) de memoria, y los casos de cero o una casa salen solos porque las variables empiezan en cero."

## Conceptos

- **Programación dinámica**: construir la respuesta a partir de respuestas de subproblemas más chicos, calculando cada uno una vez.
- **Relación de recurrencia**: la fórmula `mejor(i) = max(mejor(i - 1), mejor(i - 2) + casas[i])`.
- **Decisión tomar o saltar**: patrón muy común en DP; en cada elemento comparas las dos opciones.
- **Optimizar memoria**: si la fórmula solo mira los últimos valores, cambias la tabla por unas pocas variables.
- **Orden de actualización**: calcula el valor nuevo antes de pisar las variables que usa.
