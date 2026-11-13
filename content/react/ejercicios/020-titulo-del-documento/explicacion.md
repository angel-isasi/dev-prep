## Idea clave

Un **efecto** (`useEffect`) sirve para **sincronizar React con algo externo**, aquí el título de la pestaña. Corre después de que React pinta, y el arreglo de dependencias `[cantidad]` hace que se repita solo cuando `cantidad` cambia.

## Paso a paso

1. **Importa `useEffect`.** No hace falta `useState`: el dato ya llega como prop.
2. **Escribe el efecto.** `useEffect(funcion, dependencias)`. La función cambia `document.title`.
3. **Elige el texto con un ternario.** `` cantidad > 0 ? `(${cantidad}) Padre Gino` : "Padre Gino" ``.
4. **Declara las dependencias.** El efecto usa `cantidad`, así que va en el arreglo: `[cantidad]`. Regla práctica: todo valor del componente (props, estado) que uses dentro del efecto va en las dependencias.
5. **Devuelve el JSX.** El párrafo `{cantidad} en el carrito` es lo único que React pinta en la página.

```jsx
import { useEffect } from "react";

export function TituloPedido({ cantidad }) {
  // Corre después de pintar, y otra vez solo cuando cambia `cantidad`.
  useEffect(() => {
    document.title = cantidad > 0 ? `(${cantidad}) Padre Gino` : "Padre Gino";
  }, [cantidad]);

  return <p>{cantidad} en el carrito</p>;
}
```

## Por qué funciona

Cada vez que React renderiza el componente, compara las dependencias con las del render anterior y decide si corre el efecto:

| Render | `cantidad` | ¿Cambió la dependencia? | ¿Corre el efecto? | `document.title` |
|---|---|---|---|---|
| Montaje | `0` | primera vez | sí | Padre Gino |
| El padre pasa `3` | `3` | sí (0 a 3) | sí | (3) Padre Gino |
| El padre vuelve a renderizar con `3` | `3` | no | **no** | (3) Padre Gino |
| El padre pasa `0` | `0` | sí (3 a 0) | sí | Padre Gino |

El orden es: React ejecuta la función del componente, actualiza el DOM (el párrafo) y **después** corre los efectos. Por eso el efecto nunca bloquea el pintado.

¿Por qué no poner `document.title = ...` directamente en el cuerpo? Funcionaría en este caso simple, pero el cuerpo del componente debe ser **puro**: solo calcular el JSX a partir de props y estado. React puede ejecutar el cuerpo varias veces (por ejemplo, en modo estricto en desarrollo) o descartar un render. Los efectos son el lugar previsto para tocar cosas de fuera.

## Errores comunes

- **Olvidar el arreglo de dependencias.** `useEffect(() => {...})` sin segundo argumento corre después de **cada** render. Aquí no rompe nada visible, pero es trabajo innecesario y en otros efectos (por ejemplo, un `fetch` que actualiza el estado) provoca bucles infinitos.
- **Poner `[]` vacío.** El efecto corre solo al montar: el título se queda con la primera cantidad y no se actualiza. Lo reconoces porque fallan los tests de "se actualiza cuando la cantidad cambia".
- **Usar `cantidad ? ... : ...` y recibir `"0"` como texto.** El string `"0"` es *truthy* y saldría `(0) Padre Gino`. Con números no pasa, pero comparar `cantidad > 0` deja la intención más clara.
- **Guardar la cantidad en un `useState` copiado de la prop** y actualizarlo en otro efecto. Es estado duplicado: la prop ya es la fuente de verdad.
- **Escribir el texto distinto** (`Padre Gino (3)`, sin espacio, etc.). Los tests comparan el título exacto.

## Otra forma de resolverlo

Un **hook propio** reutilizable, para que cualquier componente cambie el título con una línea:

```jsx
import { useEffect } from "react";

function useTituloDocumento(titulo) {
  useEffect(() => {
    document.title = titulo;
  }, [titulo]);
}

export function TituloPedido({ cantidad }) {
  useTituloDocumento(cantidad > 0 ? `(${cantidad}) Padre Gino` : "Padre Gino");
  return <p>{cantidad} en el carrito</p>;
}
```

**¿Cuándo conviene?** Cuando varias páginas o componentes cambian el título: escribes la lógica una vez y le das un nombre que explica qué hace. Para un solo componente, el `useEffect` directo es suficiente. Además, en React 19 puedes renderizar `<title>` dentro de cualquier componente y React lo mueve al `<head>`, pero el patrón con `useEffect` sigue siendo el que te preguntan para explicar efectos.

## Cómo explicarlo en la entrevista

> "El título de la pestaña está fuera de React, así que lo cambio en un `useEffect`, que es el lugar para sincronizar con sistemas externos. El efecto corre después de pintar, y como depende de `cantidad`, la pongo en el arreglo de dependencias: así React solo lo vuelve a ejecutar cuando la cantidad cambia. Si dejara el arreglo vacío, el título se quedaría con el primer valor; si no pusiera arreglo, correría en cada render."

## Conceptos

- **`useEffect`**: ejecuta código después del render para sincronizar con algo externo (DOM, título, timers, APIs).
- **Arreglo de dependencias**: lista de valores que, si cambian, hacen que el efecto vuelva a correr. `[]` es "solo al montar"; sin arreglo es "en cada render".
- **Efecto secundario**: cualquier cosa que el componente hace además de devolver JSX.
- **Componente puro**: con las mismas props y estado devuelve el mismo JSX sin tocar nada externo.
- **`document.title`**: propiedad del navegador con el texto de la pestaña.
- **Hook propio**: función que empieza con `use` y usa otros hooks para reutilizar lógica.
