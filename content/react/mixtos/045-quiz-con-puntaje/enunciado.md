Crea el componente `Quiz` que recibe un arreglo de preguntas en la prop `preguntas` y las muestra **una por una**. Cada pregunta es:

```js
{ texto: "¿Qué hook guarda estado?", opciones: ["useState", "useEffect"], correcta: "useState" }
```

## Reglas

- Mientras haya preguntas por responder se ve:
  - El progreso **"Pregunta {n} de {total}"** (empieza en 1).
  - El texto de la pregunta en un `<h2>`.
  - Un botón por opción, con el texto de la opción.
- Al hacer clic en una opción se registra esa respuesta y se pasa a la siguiente pregunta (sin botón "Siguiente").
- Al responder la última se ve **"Acertaste {puntaje} de {total}"** y un botón **"Jugar de nuevo"** que vuelve a la pregunta 1 con el puntaje en cero.
- Pista de diseño: basta con **un** estado. La pregunta actual, si terminó y el puntaje se pueden calcular.

## Ejemplo

```jsx
const preguntas = [
  { texto: "¿Qué hook guarda estado?", opciones: ["useState", "useEffect"], correcta: "useState" },
  { texto: "¿Qué método no muta el arreglo?", opciones: ["push", "map"], correcta: "map" },
];

<Quiz preguntas={preguntas} />
```

| Acción | Se ve |
|---|---|
| (inicio) | Pregunta 1 de 2, ¿Qué hook guarda estado? |
| Clic en "useState" | Pregunta 2 de 2, ¿Qué método no muta el arreglo? |
| Clic en "push" | Acertaste 1 de 2 |
| Clic en "Jugar de nuevo" | Pregunta 1 de 2 |

## Por qué importa

Un quiz parece que necesita muchos estados (índice actual, puntaje, terminado...). La respuesta madura es guardar **solo las respuestas** y derivar todo lo demás: menos estados significa menos combinaciones imposibles y menos bugs. Es exactamente lo que el entrevistador quiere ver.
