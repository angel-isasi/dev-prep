## Idea clave

El único estado es el arreglo de **respuestas**. La pregunta actual (`respuestas.length`), si terminó y el puntaje se **derivan** de ahí. Un solo estado no puede contradecirse consigo mismo.

## Paso a paso

1. **Un estado**: `const [respuestas, setRespuestas] = useState([])`.
2. **Derivar la pregunta actual**: si respondiste 0, vas en la 0 (que se muestra como "1"); si respondiste 1, vas en la 1. Es decir, `actual = respuestas.length`.
3. **Derivar si terminó**: `respuestas.length === preguntas.length`.
4. **Derivar el puntaje**: `filter` con el índice compara cada respuesta con la correcta de **su** pregunta, y `.length` cuenta las que coinciden.
5. **Renderizado condicional con `return` temprano**: si terminó, devuelve la pantalla del puntaje; si no, la pregunta.
6. **Responder** agrega al final sin mutar: `[...anteriores, opcion]`. Usamos la forma con función para trabajar siempre con el valor más reciente.
7. **Reiniciar** es volver al estado inicial: `setRespuestas([])`. Como todo se deriva, el progreso y el puntaje vuelven solos a cero.

```jsx
import { useState } from "react";

export function Quiz({ preguntas }) {
  const [respuestas, setRespuestas] = useState([]);

  const actual = respuestas.length;
  const terminado = actual === preguntas.length;
  const puntaje = respuestas.filter((respuesta, i) => respuesta === preguntas[i].correcta).length;

  if (terminado) {
    return (
      <div>
        <p>
          Acertaste {puntaje} de {preguntas.length}
        </p>
        <button onClick={() => setRespuestas([])}>Jugar de nuevo</button>
      </div>
    );
  }

  const pregunta = preguntas[actual];

  return (
    <div>
      <p>
        Pregunta {actual + 1} de {preguntas.length}
      </p>
      <h2>{pregunta.texto}</h2>
      {pregunta.opciones.map((opcion) => (
        <button key={opcion} onClick={() => setRespuestas((anteriores) => [...anteriores, opcion])}>
          {opcion}
        </button>
      ))}
    </div>
  );
}
```

## Por qué funciona

Recorrido con las dos preguntas del ejemplo:

| Momento | `respuestas` | `actual` | `terminado` | `puntaje` | Se ve |
|---|---|---|---|---|---|
| Inicio | `[]` | 0 | false | 0 | Pregunta 1 de 2 |
| Clic "useState" | `["useState"]` | 1 | false | 1 | Pregunta 2 de 2 |
| Clic "push" | `["useState", "push"]` | 2 | true | 1 | Acertaste 1 de 2 |
| Jugar de nuevo | `[]` | 0 | false | 0 | Pregunta 1 de 2 |

El cálculo del puntaje en la tercera fila: `filter` recorre `["useState", "push"]`. En `i = 0`, `"useState" === preguntas[0].correcta` (`"useState"`): sí. En `i = 1`, `"push" === "map"`: no. Queda `["useState"]` y su `length` es 1.

Ojo con un detalle: cuando `terminado` es `true`, `preguntas[actual]` sería `preguntas[2]`, que es `undefined`. Por eso el `return` temprano va **antes** de leer `pregunta.texto`.

## Errores comunes

- **Tres o cuatro estados** (`indice`, `puntaje`, `terminado`, `respuestas`) que se actualizan juntos. Basta que olvides uno para tener combinaciones imposibles, como "terminado" con índice 0. Lo reconoces porque "Jugar de nuevo" deja el puntaje anterior.
- **Sumar el puntaje con `setPuntaje(puntaje + 1)`** en el clic y olvidar reiniciarlo: la segunda partida empieza con puntos.
- **Leer `preguntas[actual].texto` antes de comprobar si terminó**: error "Cannot read properties of undefined (reading 'texto')" al responder la última.
- **Mutar con `respuestas.push(opcion)`**: el arreglo es el mismo y React no re-renderiza; haces clic y nada cambia.
- **Mostrar `actual` en vez de `actual + 1`**: el usuario ve "Pregunta 0 de 2".

## Otra forma de resolverlo

Con un índice y un puntaje (la solución "intuitiva"):

```jsx
export function Quiz({ preguntas }) {
  const [indice, setIndice] = useState(0);
  const [puntaje, setPuntaje] = useState(0);

  function responder(opcion) {
    if (opcion === preguntas[indice].correcta) setPuntaje((p) => p + 1);
    setIndice((i) => i + 1);
  }

  function reiniciar() {
    setIndice(0);
    setPuntaje(0);
  }

  if (indice === preguntas.length) {
    return (/* Acertaste {puntaje} de ... y Jugar de nuevo con reiniciar */);
  }
  // ... igual que antes, con preguntas[indice]
}
```

**¿Cuándo conviene?** Funciona, pero tienes que acordarte de reiniciar dos estados y pierdes **qué** respondió el usuario. Con el arreglo de respuestas además puedes mostrar una revisión al final ("tu respuesta: push, correcta: map") sin cambiar el estado. Es buena idea mencionar esta versión en la entrevista y explicar por qué preferiste la otra.

## Cómo explicarlo en la entrevista

> "Pensé cuál es el estado mínimo: solo las respuestas del usuario, en orden. Con eso derivo todo: la pregunta actual es la cantidad de respuestas, terminó cuando hay tantas respuestas como preguntas, y el puntaje es un `filter` que compara cada respuesta con la correcta de su índice. Así no hay estados que se desincronicen, y reiniciar es solo volver a un arreglo vacío. Además conservo el historial, por si quiero mostrar una revisión al final."

## Conceptos

- **Estado mínimo**: guarda la fuente de la verdad, no lo que se puede calcular.
- **Estado derivado**: `actual`, `terminado` y `puntaje` se calculan en cada render.
- **`filter` con índice**: `(elemento, i) => ...` para comparar con otro arreglo en la misma posición.
- **Return temprano**: renderizado condicional de pantallas completas.
- **Actualización con función** `setX((anterior) => ...)`: usa siempre el valor más reciente.
- **Inmutabilidad**: `[...anteriores, nueva]` en vez de `push`.
- **Listas con `key`**: el texto de la opción es único dentro de cada pregunta.
