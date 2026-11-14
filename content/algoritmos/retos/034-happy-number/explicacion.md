## Idea clave

Aplicas la suma de cuadrados de los dígitos una y otra vez. Hay solo dos finales posibles: llegas a 1, o repites un número que ya habías visto, y desde ahí la secuencia se repite para siempre. Un `Set` con los números vistos te dice cuándo pasó lo segundo.

## Paso a paso

1. **Primero, la parte mecánica: separar los dígitos.** `n % 10` te da el último dígito (`82 % 10` es 2) y `Math.floor(n / 10)` lo quita (`Math.floor(82 / 10)` es 8). Repites hasta que `n` sea 0, sumando cada dígito al cuadrado.
2. **La solución ingenua** (dila en voz alta): repetir el proceso hasta llegar a 1.

   ```js
   while (n !== 1) {
     n = sumaCuadrados(n);
   }
   return true;
   ```

   Con 19 funciona. Con 2 se cuelga para siempre: el bucle nunca termina.

3. **¿Por qué se cuelga?** Escribe la secuencia del 2: `2 -> 4 -> 16 -> 37 -> 58 -> 89 -> 145 -> 42 -> 20 -> 4`. El 4 ya había salido. Como cada número siempre lleva al mismo siguiente, desde ahí la secuencia se repite igual para siempre.
4. **Detecta la repetición.** Guarda cada número en un `Set` antes de avanzar. Si el número actual ya está en el `Set`, entraste en un ciclo: no es feliz.
5. **Condición de salida doble**: el bucle sigue mientras `n !== 1` **y** `n` no se haya visto. Al salir, la respuesta es simplemente `n === 1`.

```js
function sumaCuadrados(n) {
  let suma = 0;
  while (n > 0) {
    const digito = n % 10;
    suma += digito * digito;
    n = Math.floor(n / 10);
  }
  return suma;
}

export function esFeliz(n) {
  const vistos = new Set();
  while (n !== 1 && !vistos.has(n)) {
    vistos.add(n);
    n = sumaCuadrados(n);
  }
  return n === 1;
}
```

## Por qué funciona

Recorrido con `esFeliz(2)`:

| `n` | ¿Es 1? | ¿Ya visto? | `vistos` después | Siguiente |
|---|---|---|---|---|
| 2 | no | no | {2} | 4 |
| 4 | no | no | {2, 4} | 16 |
| 16 | no | no | {2, 4, 16} | 1 + 36 = 37 |
| 37 | no | no | {..., 37} | 9 + 49 = 58 |
| 58 | no | no | {..., 58} | 25 + 64 = 89 |
| 89 | no | no | {..., 89} | 64 + 81 = 145 |
| 145 | no | no | {..., 145} | 1 + 16 + 25 = 42 |
| 42 | no | no | {..., 42} | 16 + 4 = 20 |
| 20 | no | no | {..., 20} | 4 + 0 = 4 |
| 4 | no | **sí** | | sale del bucle |

Al salir, `n` es 4, no 1: devuelve `false`.

¿Y si el número creciera para siempre sin repetirse? No pasa: un número de 3 dígitos da como mucho 9² + 9² + 9² = 243, y uno de 4 dígitos como mucho 324. Los números grandes bajan rápido, así que la secuencia termina moviéndose entre valores chicos, y ahí tarde o temprano se repite o llega a 1.

## Errores comunes

- **No detectar el ciclo.** El `while (n !== 1)` solo se cuelga con los números no felices. Lo reconoces porque la corrida de tests se queda colgada en "corriendo..." y nunca muestra resultado: el test del 2 entra en un bucle infinito.
- **Olvidar `Math.floor` al quitar el dígito.** `82 / 10` es 8.2, no 8. El bucle de dígitos sigue con decimales y la suma sale mal.
- **Revisar el `Set` después de agregar.** Si haces `vistos.add(n)` y luego preguntas `vistos.has(n)`, siempre es `true` y sales en el primer paso.
- **Ignorar los ceros.** El 0 aporta 0 a la suma, pero igual tienes que dividir para pasar al siguiente dígito. Si cortas el bucle cuando el dígito es 0, `100` daría mal.
- **Devolver `true` sin revisar.** Al salir del bucle hay dos motivos posibles; la respuesta es `n === 1`, no `true` a secas.

## Otra forma de resolverlo

**Con cadenas**: `String(n).split("").reduce((s, d) => s + d * d, 0)` también suma los cuadrados de los dígitos (el `*` convierte cada carácter a número). Más corta, pero crea cadenas y arreglos en cada paso. Con `% 10` practicas aritmética, que es lo que suelen esperar.

**Tortuga y liebre (Floyd)**: dos variables avanzan por la misma secuencia, `lenta` un paso a la vez y `rapida` dos pasos. Si hay ciclo, la rápida termina alcanzando a la lenta, como en una pista circular.

```js
let lenta = n;
let rapida = sumaCuadrados(n);
while (rapida !== 1 && lenta !== rapida) {
  lenta = sumaCuadrados(lenta);
  rapida = sumaCuadrados(sumaCuadrados(rapida));
}
return rapida === 1;
```

Es O(1) de memoria porque no guarda nada. Es la misma técnica que se usa para detectar ciclos en listas enlazadas (Linked List Cycle).

**¿Cuál conviene?** La del `Set` es la más fácil de explicar y de escribir sin errores. Floyd es un gran "bonus" si te preguntan por memoria. En la práctica las secuencias son cortas, así que las dos son rápidas: el tiempo es O(log n) por paso (la cantidad de dígitos).

## Cómo explicarlo en la entrevista

> "Separo el problema en dos: una función que suma los cuadrados de los dígitos usando módulo 10 y división entera, y un bucle que la aplica. Como cada número lleva siempre al mismo siguiente, si un número se repite estoy en un ciclo y nunca llegaré a 1. Por eso guardo los números vistos en un Set y paro cuando llego a 1 o cuando repito. Si me piden memoria constante, puedo usar el algoritmo de la tortuga y la liebre, como en la detección de ciclos en listas enlazadas."

## Conceptos

- **Separar dígitos**: `n % 10` da el último, `Math.floor(n / 10)` lo quita.
- **Detección de ciclos con `Set`**: si un estado se repite, el proceso se repite para siempre.
- **Condición de salida doble**: un bucle que puede terminar por dos motivos, y revisar cuál fue.
- **Tortuga y liebre (Floyd)**: dos punteros a distinta velocidad detectan un ciclo sin memoria extra.
- **Funciones auxiliares**: separar un paso mecánico (`sumaCuadrados`) hace el código más fácil de leer y de probar.
