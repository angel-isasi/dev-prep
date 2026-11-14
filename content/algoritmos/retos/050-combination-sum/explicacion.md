## Idea clave

**Backtracking** llevando cuánto **falta** para el objetivo. En cada paso eliges un candidato, lo restas y sigues explorando; si lo que falta llega a 0, guardas la combinación. Para no generar `[2, 3]` y `[3, 2]` a la vez, después de elegir el candidato `i` solo dejas elegir candidatos **desde `i` en adelante**: puedes repetir el mismo (por eso `i` y no `i + 1`), pero nunca volver a uno anterior.

## Paso a paso

1. **La solución directa** (dila en voz alta): prueba todas las secuencias de candidatos que no se pasen del objetivo, guarda las que suman justo, y al final elimina los repetidos ordenando cada combinación y usando un `Set`. Funciona, pero genera `[2, 2, 3]`, `[2, 3, 2]` y `[3, 2, 2]` para quedarte con una sola: trabajo tirado a la basura.
2. **Evita los repetidos desde la raíz.** Una combinación sin orden se puede escribir siempre de una sola forma: con los candidatos **en el orden en que aparecen** (`[2, 2, 3]`, nunca `[3, 2, 2]`). Si solo generas esa forma, no hay repetidos que borrar.
3. **¿Cómo se obliga ese orden?** Con un parámetro `desde`: el `for` de cada llamada empieza en `desde`, y al elegir el candidato `i` llamas a `explorar(i, ...)`. Así los siguientes elegidos son el mismo candidato o uno posterior, nunca uno anterior.
4. **Por qué `i` y no `i + 1`**: con `i + 1` no podrías repetir el mismo candidato y nunca saldría `[2, 2, 3]`. Con `0` volverías a los anteriores y saldrían repetidos.
5. **El patrón de siempre**: **elegir** (`camino.push(candidato)`), **explorar** (`explorar(i, restante - candidato)`), **deshacer** (`camino.pop()`).
6. **Casos de parada**: si `restante === 0`, guarda una **copia** del camino. Si un candidato es mayor que `restante`, elegirlo te pasaría del objetivo.
7. **Poda con orden**: si ordenas una **copia** de los candidatos de menor a mayor, en cuanto uno es mayor que `restante` todos los siguientes también lo son, y puedes cortar el `for` con `break`.

```js
export function combinacionesQueSuman(candidatos, objetivo) {
  const ordenados = [...candidatos].sort((a, b) => a - b);
  const resultado = [];
  const camino = [];

  function explorar(desde, restante) {
    if (restante === 0) {
      resultado.push([...camino]);
      return;
    }
    for (let i = desde; i < ordenados.length; i++) {
      const candidato = ordenados[i];
      if (candidato > restante) break;
      camino.push(candidato);
      explorar(i, restante - candidato);
      camino.pop();
    }
  }

  explorar(0, objetivo);
  return resultado;
}
```

## Por qué funciona

Árbol de decisiones con `combinacionesQueSuman([2, 3, 6, 7], 7)`. Cada rama dice qué candidato eliges y cuánto falta después; entre paréntesis, desde qué candidato puedes seguir:

```
falta 7 (desde 2)
├─ elijo 2 → falta 5 (desde 2)
│  ├─ elijo 2 → falta 3 (desde 2)
│  │  ├─ elijo 2 → falta 1 (desde 2): 2 > 1, corto ✗
│  │  ├─ elijo 3 → falta 0: guardo [2, 2, 3] ✓
│  │  └─ 6 > 3: corto
│  ├─ elijo 3 → falta 2 (desde 3): 3 > 2, corto ✗
│  └─ 6 > 5: corto
├─ elijo 3 → falta 4 (desde 3)
│  ├─ elijo 3 → falta 1 (desde 3): 3 > 1, corto ✗
│  └─ 6 > 4: corto
├─ elijo 6 → falta 1 (desde 6): 6 > 1, corto ✗
└─ elijo 7 → falta 0: guardo [7] ✓
```

Fíjate en la rama "elijo 3 → falta 4": desde ahí solo puedes elegir 3, 6 o 7, **nunca 2**. Por eso no aparece `[3, 2, 2]`, que sería la misma combinación que `[2, 2, 3]`, ya encontrada en la rama del 2.

Así cambia `camino` en la primera rama que encuentra algo:

| Paso | Acción | `camino` | Falta |
|---|---|---|---|
| 1 | elegir 2 | `[2]` | 5 |
| 2 | elegir 2 | `[2, 2]` | 3 |
| 3 | elegir 2 | `[2, 2, 2]` | 1 |
| 4 | ningún candidato cabe en 1: deshacer | `[2, 2]` | 3 |
| 5 | elegir 3: falta 0, guardo `[2, 2, 3]` | `[2, 2, 3]` | 0 |
| 6 | deshacer; 6 > 3, corto; deshacer | `[2]` | 5 |

## Errores comunes

- **Llamar a `explorar(i + 1, ...)`.** No puedes repetir candidatos: con `[1]` y 2 devuelves `[]` en vez de `[[1, 1]]`. Lo reconoces en el test "repetir el mismo candidato".
- **Empezar el `for` siempre en 0.** Salen las mismas combinaciones en distinto orden. Lo reconoces en el test "sin repetidos en otro orden": devuelves `[2, 3]` y `[3, 2]`.
- **Usar `break` sin haber ordenado.** Cortas el `for` creyendo que los siguientes son más grandes, pero no lo son. Con `[5, 2]` y 4, el 5 corta todo y nunca pruebas el 2: devuelves `[]` en vez de `[[2, 2]]`. Lo reconoces en el test "candidatos desordenados". Si no ordenas, usa `continue`.
- **No parar nunca cuando te pasas.** Si no cortas cuando el candidato es mayor que lo que falta (y tampoco tienes un caso base para `restante < 0`), la recursión sigue restando para siempre y JavaScript lanza "Maximum call stack size exceeded".
- **Guardar `camino` sin copiar, u ordenar `candidatos` en el lugar.** Lo primero te deja una lista de arreglos vacíos; lo segundo modifica el arreglo de quien llamó (test "no modifica el arreglo original").

## Otra forma de resolverlo

**Generar con repetidos y limpiar con un `Set`** (paso 1): mucho más lenta, porque cada combinación de k elementos puede aparecer hasta k! veces.

**"Tomar o no tomar"**, como en Subsets: para el candidato `i`, o lo tomas una vez más (y te quedas en `i`), o dejas de tomarlo para siempre (y pasas a `i + 1`):

```js
function explorar(i, restante) {
  if (restante === 0) {
    resultado.push([...camino]);
    return;
  }
  if (i === candidatos.length || restante < 0) return;

  camino.push(candidatos[i]); // tomarlo otra vez
  explorar(i, restante - candidatos[i]);
  camino.pop();

  explorar(i + 1, restante); // no tomarlo más
}
explorar(0, objetivo);
```

**¿Cuál conviene?** Las dos versiones de backtracking generan exactamente las mismas combinaciones. El costo es exponencial: depende de cuántas combinaciones hay y de la profundidad máxima del árbol, que es `objetivo / candidato más pequeño`; esa misma profundidad es la memoria extra de la recursión. La del `for` con `desde` y `break` poda más ramas y es la plantilla que más se repite en entrevistas. La de "tomar o no tomar" es útil si ya la tienes clara de Subsets. Si solo te pidieran **contar** las combinaciones (no listarlas), se usaría programación dinámica, como en Coin Change.

## Cómo explicarlo en la entrevista

> "Uso backtracking llevando cuánto falta para el objetivo. En cada llamada recorro los candidatos con un for que empieza en un índice desde; elijo uno, lo agrego al camino, exploro restándolo y luego lo quito. Para poder repetir el mismo candidato paso i y no i más uno, y como nunca vuelvo a un candidato anterior, cada combinación sale una sola vez, en orden. Si lo que falta llega a cero guardo una copia del camino. Además ordeno una copia de los candidatos, así en cuanto uno se pasa de lo que falta corto el for, porque los siguientes son más grandes. El costo es exponencial, porque depende de cuántas combinaciones existan, y la memoria de la recursión es objetivo entre el candidato más chico."

## Conceptos

- **Backtracking con "lo que falta"**: restar en cada elección y parar al llegar a 0.
- **Índice `desde`**: obliga un orden de elección y así evita combinaciones repetidas.
- **`i` vs `i + 1`**: quedarte en `i` permite reutilizar el mismo elemento; `i + 1` lo prohíbe.
- **Poda**: ordenar y usar `break` para no entrar en ramas que ya se pasan.
- **Elegir, explorar, deshacer**: `push`, llamada recursiva, `pop`.
