## Idea clave

Metes todos los números en un `Set` para preguntar en O(1) si un número existe. Solo empiezas a contar desde los números que son **inicio** de una secuencia (los que no tienen a `x - 1` en el `Set`), y desde ahí avanzas `x + 1`, `x + 2`... mientras existan. Así cada número se visita una cantidad fija de veces y todo queda O(n).

## Paso a paso

1. **La solución directa** (dila en voz alta): ordenar el arreglo y recorrerlo contando tramos donde cada número es el anterior + 1. Es O(n log n) por el ordenamiento, y hay que cuidar los repetidos.

   ```js
   if (nums.length === 0) return 0;
   const ordenados = [...nums].sort((a, b) => a - b);
   let mejor = 1;
   let largo = 1;
   for (let i = 1; i < ordenados.length; i++) {
     if (ordenados[i] === ordenados[i - 1]) continue; // repetido: no corta ni suma
     if (ordenados[i] === ordenados[i - 1] + 1) largo++;
     else largo = 1;
     mejor = Math.max(mejor, largo);
   }
   return mejor;
   ```

2. **¿Se puede sin ordenar?** Si tienes los números en un `Set`, puedes "caminar" una secuencia sin importar el orden: desde el 1 preguntas si está el 2, luego el 3, y así.
3. **El problema de caminar desde todos.** Si caminas desde cada número, en `[1, 2, 3, 4]` caminas 4 pasos desde el 1, 3 desde el 2, 2 desde el 3... Con una secuencia larga eso es O(n²).
4. **Camina solo desde los inicios.** Un número `x` es el inicio de una secuencia si `x - 1` **no** está en el `Set`. El 2 no es inicio porque existe el 1; el 1 sí lo es. Si `x` no es inicio, lo saltas: su secuencia ya se cuenta desde el inicio.
5. **Cuenta y guarda el máximo.** Desde cada inicio avanzas mientras `actual + 1` exista y comparas el largo con `mejor`. Recorre el `Set` (no el arreglo) para no repetir trabajo con números duplicados.

```js
export function secuenciaMasLarga(nums) {
  const numeros = new Set(nums);
  let mejor = 0;

  for (const x of numeros) {
    if (!numeros.has(x - 1)) {
      let actual = x;
      let largo = 1;
      while (numeros.has(actual + 1)) {
        actual++;
        largo++;
      }
      mejor = Math.max(mejor, largo);
    }
  }

  return mejor;
}
```

## Por qué funciona

Recorrido con `secuenciaMasLarga([100, 4, 200, 1, 3, 2])`. El `Set` es `{100, 4, 200, 1, 3, 2}`.

| `x` | ¿Está `x - 1`? | ¿Es inicio? | Camino | Largo | `mejor` |
|---|---|---|---|---|---|
| 100 | 99: no | sí | 100 (no hay 101) | 1 | 1 |
| 4 | 3: sí | no | se salta | | 1 |
| 200 | 199: no | sí | 200 (no hay 201) | 1 | 1 |
| 1 | 0: no | sí | 1 -> 2 -> 3 -> 4 | 4 | **4** |
| 3 | 2: sí | no | se salta | | 4 |
| 2 | 1: sí | no | se salta | | 4 |

**¿Por qué es O(n) si hay un `while` dentro del `for`?** Porque el `while` solo arranca desde los inicios, y cada número pertenece a una sola secuencia. El 2, el 3 y el 4 se visitan dentro del `while` una vez (cuando caminas desde el 1) y nunca más. Sumando todo, el `for` hace n vueltas y todos los `while` juntos hacen como mucho n pasos: O(n) en total.

## Errores comunes

- **Caminar desde todos los números.** Da la respuesta correcta pero es O(n²). En la entrevista te van a preguntar por la complejidad, y el `if (!numeros.has(x - 1))` es justamente lo que se evalúa.
- **Ordenar con `sort()` sin comparador.** `[10, 9, 2].sort()` da `[10, 2, 9]` (orden de texto) y los tramos salen mal. Usa `(a, b) => a - b`.
- **Cortar la secuencia con los repetidos** al ordenar. En `[0, 1, 1, 2]`, el segundo 1 no es "anterior + 1", y si reinicias el largo das 2 en vez de 3. Lo reconoces en el test `[1, 2, 0, 1]`.
- **Devolver 1 con el arreglo vacío.** Si empiezas con `mejor = 1`, el caso `[]` falla. Con el `Set` y `mejor = 0` sale solo.
- **Buscar con `nums.includes`** en vez de un `Set`. Cada `includes` recorre el arreglo: todo se vuelve O(n²) o peor.

## Otra forma de resolverlo

**Ordenar y contar tramos** (paso 1): O(n log n) de tiempo y O(n) de memoria por la copia ordenada (o O(1) si ordenas el original, aunque modificarlo no es buena práctica). Es una buena primera respuesta y es fácil de escribir bien.

**`Map` uniendo extremos**: guardas para cada número el largo de la secuencia que lo contiene y vas uniendo secuencias vecinas al insertar. También es O(n), pero es más difícil de escribir sin errores.

**¿Cuál conviene?** En la entrevista: menciona primero la de ordenar, y luego mejora a la del `Set`, que es O(n) de tiempo y O(n) de memoria. Si el arreglo es chico, ordenar es perfectamente aceptable en código real.

## Cómo explicarlo en la entrevista

> "La forma directa es ordenar y contar tramos consecutivos, saltando repetidos: O(n log n). Para llegar a O(n) meto los números en un Set, así pregunto en O(1) si un número existe. Solo empiezo a contar desde los números que son inicio de una secuencia, es decir, cuando x menos 1 no está en el Set, y desde ahí avanzo mientras exista el siguiente. Cada número se recorre como mucho una vez dentro de los while, así que el total es O(n) de tiempo y O(n) de memoria."

## Conceptos

- **`Set` para buscar en O(1)**: `new Set(arreglo)` y `has(valor)`.
- **Detectar el inicio de algo**: "no tiene anterior" evita repetir trabajo.
- **Análisis amortizado**: un `while` dentro de un `for` puede seguir siendo O(n) si cada elemento se visita una sola vez en total.
- **`Set` elimina repetidos** de paso.
- **`sort` con comparador numérico**: `(a, b) => a - b`.
