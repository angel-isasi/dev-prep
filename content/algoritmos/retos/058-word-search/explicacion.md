## Idea clave

Pruebas empezar la palabra desde **cada celda**. Desde una celda que coincide con la letra actual, exploras sus 4 vecinas buscando la letra siguiente, con recursión. Para no reusar celdas, **marcas** la celda al entrar y la **desmarcas** al salir: eso es **backtracking**, elegir, explorar y deshacer la elección para que otros caminos puedan usar esa celda.

## Paso a paso

1. **Entiende el espacio de búsqueda.** La palabra puede empezar en cualquier celda, y desde cada letra la siguiente puede estar en hasta 4 vecinas. Los caminos posibles forman un árbol que hay que explorar, y la mayoría de ramas mueren pronto (en cuanto una letra no coincide).
2. **Qué es backtracking.** Una forma de probar todas las opciones de manera ordenada: en cada paso **eliges** una opción, **exploras** lo que sigue y, si no llevó a la respuesta, **deshaces** la elección y pruebas la siguiente. Es como resolver un laberinto marcando el camino con tiza y borrando la tiza al retroceder.
3. **La función recursiva** `buscar(f, c, k)` responde: "¿puedo formar `palabra` desde la letra `k`, empezando en la celda `(f, c)`?".
   - Si `k === palabra.length`: ya coloqué todas las letras, `true`. Va **primero**, porque después de la última letra la llamada siguiente puede caer fuera del tablero y aun así es un éxito.
   - Si `(f, c)` está fuera del tablero: `false`.
   - Si `t[f][c] !== palabra[k]`: letra equivocada, `false`.
4. **Elegir**: la celda coincide. Guarda su letra y márcala con `"#"`. Como `"#"` no es ninguna letra de la palabra, ningún paso posterior de este camino podrá volver a entrar en ella.
5. **Explorar**: llama a `buscar` en las 4 vecinas con `k + 1`, unidas con `||`. El `||` se detiene en cuanto una devuelve `true`: no sigues buscando si ya la encontraste.
6. **Deshacer**: antes de devolver, vuelve a poner la letra en la celda. Si no lo haces, una celda que se usó en un camino fallido queda bloqueada para siempre, y otros caminos que la necesitaban fallan sin razón.
7. **El recorrido principal**: dos bucles por todas las celdas; si `buscar(f, c, 0)` da `true` en alguna, devuelve `true`. Si ninguna, `false`.
8. **Trabaja sobre una copia** (`tablero.map((fila) => [...fila])`). Aunque desmarcas al volver, si devuelves `true` en medio de la búsqueda la copia evita cualquier riesgo de dejar `"#"` en el tablero de quien te llamó.
9. **Costo**: desde cada una de las `filas × columnas` celdas, cada paso tiene como mucho 3 direcciones nuevas (la cuarta es de donde vienes): O(filas × columnas × 3ᴸ), con L el largo de la palabra. Memoria: O(L) por la recursión, más la copia.

```js
export function existePalabra(tablero, palabra) {
  const filas = tablero.length;
  const columnas = tablero[0].length;
  const t = tablero.map((fila) => [...fila]);

  function buscar(f, c, k) {
    if (k === palabra.length) return true;
    if (f < 0 || c < 0 || f >= filas || c >= columnas) return false;
    if (t[f][c] !== palabra[k]) return false;

    const letra = t[f][c];
    t[f][c] = "#";
    const encontrada =
      buscar(f + 1, c, k + 1) ||
      buscar(f - 1, c, k + 1) ||
      buscar(f, c + 1, k + 1) ||
      buscar(f, c - 1, k + 1);
    t[f][c] = letra;
    return encontrada;
  }

  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      if (buscar(f, c, 0)) return true;
    }
  }
  return false;
}
```

## Por qué funciona

Recorrido con `"ABCCED"` en el tablero del ejemplo (las vecinas se prueban en el orden abajo, arriba, derecha, izquierda):

```
    c0  c1  c2  c3
f0  A   B   C   E
f1  S   F   C   S
f2  A   D   E   E
```

| Celda | `k` | Busca | Resultado |
|---|---|---|---|
| (0, 0) | 0 | A | coincide, marca. Abajo (1, 0) es S: falla. Arriba: fuera. Prueba la derecha |
| (0, 1) | 1 | B | coincide, marca. Abajo (1, 1) es F: falla. Arriba: fuera. Prueba la derecha |
| (0, 2) | 2 | C | coincide, marca. Prueba abajo |
| (1, 2) | 3 | C | coincide, marca. Prueba abajo |
| (2, 2) | 4 | E | coincide, marca. Abajo: fuera. Arriba (1, 2) es `"#"`: falla. Derecha (2, 3) es E: falla. Prueba la izquierda |
| (2, 1) | 5 | D | coincide, marca. Su primera vecina recibe `k = 6` |
| (3, 1) | 6 | | `k === palabra.length`: **`true`** |

El `true` sube por todas las llamadas gracias al `||`, y cada una desmarca su celda al volver. Devuelve `true`.

**Por qué "ABCB" da `false`**: el camino A (0, 0), B (0, 1), C (0, 2) llega bien, pero la única B vecina de esa C es (0, 1), que está marcada con `"#"`. La marca impide reusarla.

**Por qué hay que desmarcar** (test `"AAB"`):

```
C A A
A A A
B C D
```

El primer intento empieza en (0, 1), baja a (1, 1) y no encuentra ninguna B: falla. Si no desmarcaras, (1, 1) quedaría como `"#"`. Pero el camino correcto es justamente (1, 1) → (1, 0) → (2, 0), que ahora sería imposible: devolverías `false`.

## Errores comunes

- **No desmarcar al volver.** Las celdas de caminos fallidos quedan bloqueadas. Lo reconoces en el test `"AAB"`: das `false`.
- **No marcar las celdas usadas.** Puedes ir y volver entre dos celdas vecinas. Lo reconoces en el test `"ABCB"`: das `true` porque vuelves a la B de (0, 1).
- **Revisar los límites después de leer la celda.** `t[-1][0]` es `undefined[0]` y lanza `TypeError`. Comprueba los límites **antes** de leer.
- **Poner el chequeo de `k === palabra.length` después del de límites.** Si todas las vecinas de la última letra caen fuera del tablero, devuelves `false` aunque la palabra esté completa. Lo reconoces en el test del tablero de una celda: `"a"` da `false`.
- **Incluir diagonales.** Lo reconoces en el test de las diagonales: `"ad"` daría `true`.
- **Marcar sobre el tablero original sin copiarlo** y salir con `return true` antes de desmarcar en algún camino. Le dejas `"#"` a quien te llamó. Lo reconoces en el test "no modifica el tablero original".

## Otra forma de resolverlo

**Con un `Set` de visitados** en vez de marcar la celda: guardas `"f,c"` al entrar y lo borras al salir (`visitados.add(...)` y `visitados.delete(...)`). No necesitas copiar el tablero, pero cada paso crea un texto y consulta el `Set`. Misma complejidad, O(filas × columnas × 3ᴸ):

```js
const visitados = new Set();
function buscar(f, c, k) {
  if (k === palabra.length) return true;
  const clave = `${f},${c}`;
  if (f < 0 || c < 0 || f >= filas || c >= columnas) return false;
  if (visitados.has(clave) || tablero[f][c] !== palabra[k]) return false;
  visitados.add(clave);
  const encontrada =
    buscar(f + 1, c, k + 1) || buscar(f - 1, c, k + 1) ||
    buscar(f, c + 1, k + 1) || buscar(f, c - 1, k + 1);
  visitados.delete(clave);
  return encontrada;
}
```

**Poda previa por conteo**: antes de buscar, cuenta las letras del tablero. Si la palabra tiene más letras de algún tipo de las que hay (por ejemplo, tres `E` y el tablero tiene dos), devuelve `false` sin explorar nada. No cambia el peor caso, pero ahorra mucho en la práctica.

**¿Cuál conviene?** La de marcar con `"#"`: es la más corta y la que suelen esperar. La del `Set` es más fácil de leer si te preocupa tocar la grilla. La poda es un buen comentario extra para mostrar que piensas en optimizar.

## Cómo explicarlo en la entrevista

> "Pruebo empezar la palabra desde cada celda con una búsqueda en profundidad. La función recursiva recibe la celda y el índice de la letra que busco: si ya coloqué todas las letras devuelvo true; si estoy fuera del tablero o la letra no coincide, false. Si coincide, marco la celda para no reusarla en este camino, pruebo las cuatro vecinas con la letra siguiente y, al volver, la desmarco. Eso es backtracking: desmarcar es clave para que otros caminos puedan usar esa celda. Trabajo sobre una copia del tablero. El tiempo es O(filas por columnas por tres a la L), con L el largo de la palabra, y la memoria O(L) por la recursión."

## Conceptos

- **Backtracking**: elegir, explorar y deshacer la elección; prueba todas las opciones sin repetir estados inválidos.
- **DFS en una matriz**: explorar vecinas recursivamente, como en Number of Islands, pero aquí con un camino que se deshace.
- **Marcar y desmarcar**: la diferencia con "hundir islas", donde la marca era permanente.
- **Cortocircuito de `||`**: deja de probar direcciones en cuanto una tiene éxito.
- **Orden de los casos base**: primero "ya terminé", después "estoy fuera" y "no coincide".
- **Copia de una matriz**: `tablero.map((fila) => [...fila])`.
