## Idea clave

En vez de que cada día busque hacia adelante, guardas en una **pila** los días que **todavía esperan** un día más cálido. Cuando llega un día nuevo, este **responde** a todos los días de arriba de la pila que sean más fríos que él: los sacas y anotas cuánto esperaron. Luego el día nuevo entra a la pila a esperar su turno. Como los días de la pila quedan ordenados de más caliente (abajo) a más frío (arriba), se llama **pila monotónica**.

## Paso a paso

1. **La solución directa** (dila en voz alta): para cada día, recorre los días siguientes hasta encontrar uno más cálido. Es O(n²): con temperaturas que solo bajan, cada día revisa todos los que siguen.

   ```js
   const respuesta = new Array(temperaturas.length).fill(0);
   for (let i = 0; i < temperaturas.length; i++) {
     for (let j = i + 1; j < temperaturas.length; j++) {
       if (temperaturas[j] > temperaturas[i]) {
         respuesta[i] = j - i;
         break;
       }
     }
   }
   return respuesta;
   ```

2. **¿Qué trabajo se repite?** En `[75, 71, 69, 72]`, el día de 71 y el de 69 buscan los dos hacia adelante y los dos encuentran el 72. Mejor al revés: cuando aparece el 72, que avise a todos los que estaban esperando y son más fríos.
3. **La pila de pendientes.** Guarda **índices**, no temperaturas: necesitas el índice para calcular cuántos días pasaron (`i - dia`), y con el índice siempre puedes leer la temperatura.
4. **Llega el día `i`.** Mientras la pila no esté vacía y `temperaturas[i]` sea **mayor** que la temperatura del día de arriba, saca ese día: su respuesta es `i - dia`. Paras cuando el de arriba es igual o más cálido que hoy, porque hoy no le sirve a él ni a los que están debajo (que son aún más cálidos).
5. **Hoy entra a esperar**: `pila.push(i)`.
6. **Los que se quedan en la pila** nunca encontraron un día más cálido. Como empezaste con `new Array(n).fill(0)`, ya tienen su 0.
7. **¿Por qué es O(n) si hay un `while` dentro del `for`?** Cada índice entra a la pila una sola vez y sale como mucho una vez. En total, el `while` da como mucho n vueltas en toda la función, no n por cada día.

```js
export function temperaturasDiarias(temperaturas) {
  const respuesta = new Array(temperaturas.length).fill(0);
  const pila = [];

  for (let i = 0; i < temperaturas.length; i++) {
    while (pila.length > 0 && temperaturas[i] > temperaturas[pila[pila.length - 1]]) {
      const dia = pila.pop();
      respuesta[dia] = i - dia;
    }
    pila.push(i);
  }

  return respuesta;
}
```

## Por qué funciona

Recorrido con `[73, 74, 75, 71, 69, 72, 76, 73]`. En la pila escribo `índice(temperatura)`:

| `i` | Temp. | Sacas de la pila (y su respuesta) | Pila después |
|---|---|---|---|
| 0 | 73 | (nada) | `0(73)` |
| 1 | 74 | `0(73)`: espera 1 - 0 = **1** | `1(74)` |
| 2 | 75 | `1(74)`: espera **1** | `2(75)` |
| 3 | 71 | (71 no supera a 75) | `2(75) 3(71)` |
| 4 | 69 | (69 no supera a 71) | `2(75) 3(71) 4(69)` |
| 5 | 72 | `4(69)`: espera **1**; `3(71)`: espera 5 - 3 = **2**; 72 no supera a 75 | `2(75) 5(72)` |
| 6 | 76 | `5(72)`: espera **1**; `2(75)`: espera 6 - 2 = **4** | `6(76)` |
| 7 | 73 | (73 no supera a 76) | `6(76) 7(73)` |

Quedan en la pila los días 6 y 7: nadie fue más cálido después, así que se quedan con 0. Resultado: `[1, 1, 4, 2, 1, 1, 0, 0]`.

Fíjate en que la pila siempre baja de abajo hacia arriba (75, 71, 69): por eso, en cuanto el de arriba ya no es más frío que hoy, ninguno de los de abajo lo es.

## Errores comunes

- **Usar `>=` en vez de `>`.** Un día con la misma temperatura no es más cálido. Lo reconoces en el test `[70, 70, 70, 71]`: devuelves `[1, 1, 1, 0]` en vez de `[3, 2, 1, 0]`.
- **Guardar temperaturas en la pila en vez de índices.** Luego no puedes calcular cuántos días pasaron ni saber en qué posición escribir la respuesta.
- **Usar `if` en vez de `while`.** Solo respondes a un día pendiente, pero un día caluroso puede responder a varios de golpe. Lo reconoces en el ejemplo clásico: el 72 tiene que responder al 69 y al 71.
- **Leer la cima con `pila[pila.length]`.** Eso es `undefined`; la cima es `pila[pila.length - 1]`.
- **Crear el resultado vacío (`[]`) y hacer `push`.** Las respuestas no llegan en orden (el día 4 se responde antes que el día 2), así que tienes que escribir por índice en un arreglo que ya tenga el largo correcto.

## Otra forma de resolverlo

**Buscar hacia adelante desde cada día** (paso 1): O(n²) de tiempo y O(1) de memoria extra. Bien como primera respuesta.

**Pila recorriendo de derecha a izquierda**: vas desde el último día hacia el primero y la pila guarda los "candidatos" a ser el próximo día más cálido. Para cada día, sacas los que no son más cálidos que él; si queda alguien arriba, ese es su respuesta:

```js
const respuesta = new Array(temperaturas.length).fill(0);
const pila = [];
for (let i = temperaturas.length - 1; i >= 0; i--) {
  while (pila.length > 0 && temperaturas[pila[pila.length - 1]] <= temperaturas[i]) {
    pila.pop();
  }
  if (pila.length > 0) respuesta[i] = pila[pila.length - 1] - i;
  pila.push(i);
}
return respuesta;
```

**¿Cuál conviene?** Las dos pilas son O(n) de tiempo y O(n) de memoria. La de izquierda a derecha ("hoy responde a los que esperan") suele ser más fácil de contar en voz alta. La de derecha a izquierda es útil cuando el problema pide "el siguiente mayor" y prefieres pensar en candidatos. Elige una y practícala hasta que te salga sola: la pila monotónica aparece en muchos problemas.

## Cómo explicarlo en la entrevista

> "La forma directa es que cada día busque hacia adelante el primero más cálido, pero eso es O(n²). Lo mejoro con una pila monotónica: guardo los índices de los días que todavía esperan respuesta. Al llegar un día nuevo, mientras sea más cálido que el día de arriba de la pila, lo saco y anoto la diferencia de índices como su respuesta. Después meto el día actual. Los que nunca salen se quedan con 0. Aunque hay un while dentro del for, cada índice entra y sale de la pila una sola vez, así que es O(n) de tiempo y O(n) de memoria."

## Conceptos

- **Pila (`push` / `pop`)**: el último que entra es el primero que sale; la cima es `pila[pila.length - 1]`.
- **Pila monotónica**: una pila que mantiene sus valores ordenados; sirve para "el siguiente mayor" o "el siguiente menor".
- **Guardar índices en vez de valores**: con el índice tienes la posición y también el valor.
- **Análisis amortizado**: un `while` dentro de un `for` puede seguir siendo O(n) si cada elemento se procesa una sola vez en total.
- **`new Array(n).fill(0)`**: crear un arreglo de largo fijo con un valor por defecto.
