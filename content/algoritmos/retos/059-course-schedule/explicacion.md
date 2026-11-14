## Idea clave

Los cursos y sus requisitos forman un **grafo dirigido**. Se pueden llevar todos si y solo si ese grafo **no tiene ciclos**. Para comprobarlo, simulas la matrícula: empiezas por los cursos sin requisitos y, cada vez que "apruebas" uno, liberas a los que dependían de él. Si al final llevaste todos, no había ciclo; si alguno nunca se liberó, está atrapado en un círculo.

## Paso a paso

1. **Qué es un grafo.** Un conjunto de **nodos** (aquí, los cursos) unidos por **aristas** (aquí, "este curso es requisito de aquel"). Es **dirigido** porque las flechas tienen sentido: "0 es requisito de 1" no es lo mismo que "1 es requisito de 0". El par `[1, 0]` es una flecha `0 → 1`: primero 0, después 1.

   ```
   [[1, 0], [2, 0], [3, 1], [3, 2]]

        0
       / \
      v   v
      1   2
       \ /
        v
        3
   ```

2. **Qué es un ciclo.** Un camino de flechas que vuelve a donde empezó: `1 → 2 → 3 → 1`. En este problema, un ciclo significa que cada curso del círculo espera a otro del mismo círculo, y ninguno puede ser el primero. Por eso la pregunta "¿puedo llevar todos?" es lo mismo que "¿el grafo **no** tiene ciclos?".
3. **Cómo guardar un grafo: la lista de adyacencia.** Un arreglo con una lista por nodo: `habilita[r]` tiene los cursos a los que apunta `r`, es decir, los que piden a `r` como requisito. Para el dibujo de arriba: `habilita = [[1, 2], [3], [3], []]`. Se arma recorriendo los pares una vez. Ojo al crearla: `Array.from({ length: n }, () => [])` crea un arreglo **distinto** para cada curso.
4. **Requisitos pendientes.** Además cuentas, para cada curso, cuántas flechas le llegan: `pendientes[c]`. En el dibujo: `[0, 1, 1, 2]`. Un curso con 0 pendientes se puede llevar ya.
5. **Simula la matrícula con una cola.** Mete a la cola todos los cursos con 0 pendientes. Mientras la cola tenga cursos: saca uno, súmalo a `tomados` y, para cada curso que habilita, réstale 1 a sus pendientes. Si alguno llega a 0, ya tiene todo aprobado: entra a la cola.
6. **¿Por qué esto detecta ciclos?** Un curso dentro de un círculo siempre tiene al menos un requisito pendiente que también está en el círculo, y ese tampoco se libera nunca. Así que ningún curso del círculo llega a 0 pendientes ni entra a la cola. Al final, `tomados < numCursos`.
7. **Responde**: `tomados === numCursos`.
8. **Costo**: armar la lista recorre los P prerrequisitos; cada curso entra a la cola una vez y cada flecha se recorre una vez. O(C + P) de tiempo y O(C + P) de memoria, con C la cantidad de cursos.

```js
export function puedeTerminarCursos(numCursos, prerrequisitos) {
  const habilita = Array.from({ length: numCursos }, () => []);
  const pendientes = new Array(numCursos).fill(0);
  for (const [curso, requisito] of prerrequisitos) {
    habilita[requisito].push(curso);
    pendientes[curso]++;
  }

  const cola = [];
  for (let c = 0; c < numCursos; c++) {
    if (pendientes[c] === 0) cola.push(c);
  }

  let tomados = 0;
  while (cola.length > 0) {
    const actual = cola.shift();
    tomados++;
    for (const siguiente of habilita[actual]) {
      pendientes[siguiente]--;
      if (pendientes[siguiente] === 0) cola.push(siguiente);
    }
  }

  return tomados === numCursos;
}
```

## Por qué funciona

Recorrido con el rombo del test: `puedeTerminarCursos(5, [[1, 0], [2, 0], [3, 1], [3, 2], [4, 3]])`.

Después de armar el grafo: `habilita = [[1, 2], [3], [3], [4], []]` y `pendientes = [0, 1, 1, 2, 1]`. Solo el 0 está libre.

| Saca de la cola | `tomados` | A quién habilita | `pendientes` después | Cola después |
|---|---|---|---|---|
| (inicio) | 0 | | [0, 1, 1, 2, 1] | [0] |
| 0 | 1 | 1 y 2 | [0, **0**, **0**, 2, 1] | [1, 2] |
| 1 | 2 | 3 | [0, 0, 0, **1**, 1] | [2] |
| 2 | 3 | 3 | [0, 0, 0, **0**, 1] | [3] |
| 3 | 4 | 4 | [0, 0, 0, 0, **0**] | [4] |
| 4 | 5 | nadie | igual | [] |

`tomados = 5 = numCursos`: devuelve `true`. El 3 tiene dos requisitos, y solo entra a la cola cuando **los dos** están aprobados.

Ahora con un ciclo: `puedeTerminarCursos(4, [[1, 0], [2, 1], [3, 2], [1, 3]])`, es decir `0 → 1 → 2 → 3 → 1`. `pendientes = [0, 2, 1, 1]`. Sacas el 0 y el 1 baja a 1 pendiente (le sigue faltando el 3). La cola queda vacía con `tomados = 1`. Los cursos 1, 2 y 3 se esperan entre ellos: devuelve `false`.

## Errores comunes

- **Buscar solo pares mutuos** (`[a, b]` y `[b, a]`). Encuentras los círculos de dos cursos, pero no los de tres o más. Lo reconoces en el test del círculo de tres cursos.
- **Devolver `true` si existe algún curso libre.** Que haya un punto de partida no significa que puedas llegar a todos. Lo reconoces en el mismo test: el 0 está libre, pero 1, 2 y 3 forman un círculo.
- **Crear la lista con `new Array(n).fill([])`.** Todas las posiciones apuntan al **mismo** arreglo: cada `push` aparece en la lista de todos los cursos, y los pendientes se descuentan donde no deben.
- **Comparar `tomados` con `prerrequisitos.length`** en vez de con `numCursos`. Cuentas flechas, no cursos. Lo reconoces en el test sin requisitos: 3 tomados contra 0 pares da `false`.
- **En la versión DFS, usar un solo "visitado".** El rombo llega al curso 3 por dos caminos distintos; si "ya visitado" significa "ciclo", das `false` en un grafo sin ciclos. Lo reconoces en el test del rombo. Hacen falta tres estados (ver abajo).
- **Invertir la dirección de las flechas** (`habilita[curso].push(requisito)`). Para esta pregunta de sí o no no cambia nada, porque un ciclo sigue siendo ciclo al revés. Pero si te piden **el orden** de los cursos (la versión II de este problema), te saldría al revés. Acostúmbrate a la dirección correcta.

## Otra forma de resolverlo

**DFS con tres estados**: recorres el grafo en profundidad marcando cada curso como "sin visitar" (0), "en el camino actual" (1) o "terminado" (2). Si durante la recursión llegas a un curso que está **en el camino actual**, encontraste un ciclo. Si llegas a uno **terminado**, ya sabes que desde ahí no hay ciclos y no repites el trabajo. También O(C + P):

```js
const requisitosDe = Array.from({ length: numCursos }, () => []);
for (const [curso, requisito] of prerrequisitos) requisitosDe[curso].push(requisito);
const estado = new Array(numCursos).fill(0); // 0 sin visitar, 1 en el camino, 2 terminado

function hayCiclo(c) {
  if (estado[c] === 1) return true; // volví a un curso de mi propio camino
  if (estado[c] === 2) return false; // ya revisado antes, sin ciclos
  estado[c] = 1;
  for (const r of requisitosDe[c]) {
    if (hayCiclo(r)) return true;
  }
  estado[c] = 2;
  return false;
}

for (let c = 0; c < numCursos; c++) {
  if (hayCiclo(c)) return false;
}
return true;
```

**¿Cuál conviene?** La de la cola (se llama **algoritmo de Kahn** u **orden topológico**) se explica con el ejemplo de la matrícula y no usa recursión; además, el orden en que salen los cursos de la cola es un orden válido para llevarlos, que es justo lo que pide la versión II. La DFS es igual de eficiente y es la forma general de detectar ciclos en grafos dirigidos; menciónala si te preguntan por alternativas.

## Cómo explicarlo en la entrevista

> "Lo veo como un grafo dirigido: cada curso es un nodo y cada requisito una flecha del requisito al curso. Se pueden llevar todos si el grafo no tiene ciclos. Armo una lista de adyacencia y cuento cuántos requisitos pendientes tiene cada curso. Meto a una cola los que no tienen ninguno; cada vez que saco uno, lo cuento como tomado y le resto un pendiente a los cursos que habilita, y los que llegan a cero entran a la cola. Si al final tomé todos los cursos, no había ciclo; si no, los que faltan están atrapados en uno. Es un orden topológico, O(cursos más prerrequisitos) de tiempo y memoria."

## Conceptos

- **Grafo**: nodos unidos por aristas; sirve para modelar relaciones (requisitos, rutas, amistades).
- **Grafo dirigido**: las aristas tienen sentido, como flechas.
- **Lista de adyacencia**: un arreglo con, para cada nodo, la lista de nodos a los que apunta.
- **Ciclo**: un camino de flechas que vuelve a su inicio; aquí hace imposible terminar.
- **Grado de entrada**: cuántas flechas llegan a un nodo (aquí, `pendientes`).
- **Orden topológico (Kahn)**: ordenar los nodos para que cada flecha vaya de uno anterior a uno posterior; existe solo si no hay ciclos.
- **DFS con tres estados**: la forma clásica de detectar ciclos en un grafo dirigido.
- **`Array.from({ length: n }, () => [])`**: crea n arreglos independientes; `fill([])` comparte uno solo.
