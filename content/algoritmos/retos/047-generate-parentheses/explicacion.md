## Idea clave

Construyes cada combinación **carácter por carácter** con **backtracking**: en cada paso pruebas abrir `(` y pruebas cerrar `)`, pero solo si esa opción todavía puede terminar bien. Puedes abrir mientras te queden `(` (`abiertos < n`) y puedes cerrar mientras haya algo abierto sin cerrar (`cerrados < abiertos`). Cuando llegas a largo `2 * n`, la combinación es válida y la guardas.

## Paso a paso

1. **La solución directa** (dila en voz alta): genera todos los textos de largo `2n` formados por `(` y `)`, y quédate con los bien formados. Son 2²ⁿ textos: con `n = 8` ya son 65 536, y casi todos son basura como `"))(("`.
2. **Construye en vez de filtrar.** Si ya escribiste `")"` al inicio, no tiene sentido seguir: ningún final lo arregla. Mejor no meterte nunca por un camino que no puede terminar bien.
3. **Las dos reglas** que mantienen el texto siempre "arreglable":
   - Puedes **abrir** si `abiertos < n` (te quedan paréntesis de apertura).
   - Puedes **cerrar** si `cerrados < abiertos` (hay uno abierto esperando su cierre).
4. **El patrón del backtracking: elegir, explorar, deshacer.** Llevas un arreglo `camino` con lo que elegiste hasta ahora. Para cada opción permitida:
   - **elegir**: `camino.push("(")`;
   - **explorar**: llamas a la función para seguir construyendo desde ahí;
   - **deshacer**: `camino.pop()`, para dejar `camino` exactamente como estaba y poder probar la otra opción.
   Es como recorrer un laberinto: avanzas, exploras todo lo que hay por ese lado, y retrocedes al cruce para probar el otro pasillo.
5. **Caso base**: si `camino.length === 2 * n`, usaste los `n` de cada tipo y, gracias a las reglas, está bien formada. Guarda `camino.join("")` (un texto nuevo) y vuelve.
6. **Las dos opciones son dos `if` independientes**, no un `if/else`: cuando se puede abrir y también cerrar, hay que explorar las dos ramas.

```js
export function generarParentesis(n) {
  const resultado = [];
  const camino = [];

  function explorar(abiertos, cerrados) {
    if (camino.length === 2 * n) {
      resultado.push(camino.join(""));
      return;
    }
    if (abiertos < n) {
      camino.push("(");
      explorar(abiertos + 1, cerrados);
      camino.pop();
    }
    if (cerrados < abiertos) {
      camino.push(")");
      explorar(abiertos, cerrados + 1);
      camino.pop();
    }
  }

  explorar(0, 0);
  return resultado;
}
```

## Por qué funciona

Árbol de decisiones con `n = 2`. Al lado de cada nodo va `(abiertos, cerrados)` y qué opciones están permitidas:

```
""        (0, 0)  abrir sí, cerrar no (0 < 0 es falso)
└─ "("    (1, 0)  abrir sí, cerrar sí
   ├─ "(("    (2, 0)  abrir no (2 < 2 es falso), cerrar sí
   │  └─ "(()"   (2, 1)  solo cerrar
   │     └─ "(())"  (2, 2)  largo 4: se guarda ✓
   └─ "()"    (1, 1)  abrir sí, cerrar no (1 < 1 es falso)
      └─ "()("   (2, 1)  solo cerrar
         └─ "()()"  (2, 2)  largo 4: se guarda ✓
```

Así cambia `camino` en el lado izquierdo y cómo el "deshacer" te devuelve al cruce:

| Paso | Acción | `camino` |
|---|---|---|
| 1 | elegir `(` | `["("]` |
| 2 | elegir `(` | `["(", "("]` |
| 3 | elegir `)` | `["(", "(", ")"]` |
| 4 | elegir `)`, largo 4, guardo `"(())"` | `["(", "(", ")", ")"]` |
| 5 | deshacer, deshacer, deshacer | `["("]` |
| 6 | ahora pruebo cerrar en el cruce: elegir `)` | `["(", ")"]` |

Nunca se generó un texto inválido: las reglas cortan las ramas malas antes de entrar en ellas. Por eso el resultado sale sin filtrar y sin repetidos (cada hoja del árbol es un camino distinto).

## Errores comunes

- **Permitir cerrar con `cerrados < n`** en vez de `cerrados < abiertos`. Generas textos como `")("`. Lo reconoces en el test `n = 1`: aparece `")("` junto a `"()"`.
- **Usar `if/else`** entre abrir y cerrar. Solo exploras una rama en cada cruce y te faltan combinaciones. Lo reconoces en el test `n = 2`: te falta `"()()"`.
- **Olvidar el `pop` (deshacer).** El `camino` se queda con los caracteres de la rama anterior y las combinaciones salen mezcladas o demasiado largas.
- **Guardar `camino` en vez de `camino.join("")`.** Guardas una referencia al mismo arreglo, que al final queda vacío por los `pop`: el resultado son arreglos vacíos, no textos.
- **Olvidar el `return` del caso base.** Aquí no rompe nada (ya no hay opciones permitidas), pero en otros problemas de backtracking sí; acostúmbrate a ponerlo.

## Otra forma de resolverlo

**Generar todo y filtrar** (paso 1): O(2²ⁿ × n) de tiempo. Sirve para explicar el problema, no para resolverlo.

**Backtracking con textos en vez de arreglo**: si pasas el texto como parámetro, `actual + "("` crea un texto nuevo y el original no cambia. El "deshacer" ocurre solo al volver de la llamada:

```js
const resultado = [];
function explorar(actual, abiertos, cerrados) {
  if (actual.length === 2 * n) {
    resultado.push(actual);
    return;
  }
  if (abiertos < n) explorar(actual + "(", abiertos + 1, cerrados);
  if (cerrados < abiertos) explorar(actual + ")", abiertos, cerrados + 1);
}
explorar("", 0, 0);
return resultado;
```

**¿Cuál conviene?** Las dos generan exactamente las combinaciones válidas. Esa cantidad es el número de Catalan (1, 2, 5, 14, 42, ...), que crece más o menos como 4ⁿ, y cada combinación cuesta O(n) de construir; la memoria extra es O(n) por la profundidad de la recursión. La de textos es más corta. La del arreglo con `push` y `pop` deja a la vista el patrón "elegir, explorar, deshacer", que es el mismo de Subsets, Permutations y Combination Sum. Practica las dos.

## Cómo explicarlo en la entrevista

> "Generar todos los textos de paréntesis y filtrar los válidos sería 2 a la 2n. En lugar de eso uso backtracking: construyo la combinación carácter por carácter, y en cada paso solo tomo las opciones que todavía pueden terminar bien. Puedo abrir si me quedan paréntesis de apertura, y puedo cerrar si hay más abiertos que cerrados. Cada opción sigue el patrón elegir, explorar con una llamada recursiva y deshacer. Cuando el largo llega a 2n, la combinación es válida y la guardo. Así nunca genero una combinación inválida; el costo es proporcional a la cantidad de respuestas, el número de Catalan, por n para construir cada una."

## Conceptos

- **Backtracking**: construir una solución paso a paso y retroceder cuando una opción ya se exploró o no lleva a nada.
- **Elegir, explorar, deshacer**: `push`, llamada recursiva, `pop`.
- **Poda**: no entrar en ramas que no pueden dar una respuesta válida (aquí, cerrar sin nada abierto).
- **Caso base de la recursión**: cuándo dejar de construir y guardar el resultado.
- **Copia al guardar**: `camino.join("")` o `[...camino]`, nunca la referencia al arreglo que sigues modificando.
