Crea el componente `Carrusel` que recibe en la prop `slides` un arreglo de textos y muestra **uno a la vez**, con botones para ir al anterior y al siguiente. La navegación es **circular**: después del último vuelve al primero, y antes del primero va al último.

## Reglas

- Al inicio se muestra el **primer** slide.
- Un botón con `aria-label="Anterior"` (puede mostrar `‹`) y otro con `aria-label="Siguiente"` (puede mostrar `›`).
- Un indicador con el texto exacto **"posición / total"**, por ejemplo `1 / 3`. La posición empieza en 1, no en 0.
- Desde el último slide, "Siguiente" vuelve al primero.
- Desde el primer slide, "Anterior" va al último.
- Solo se ve un slide a la vez: los demás no están en el DOM.

## Ejemplo

```jsx
<Carrusel slides={["Uno", "Dos", "Tres"]} />
```

| Acción | Se ve |
|---|---|
| (inicio) | Uno, `1 / 3` |
| Siguiente | Dos, `2 / 3` |
| Siguiente, Siguiente | Tres, `3 / 3` |
| Siguiente desde Tres | Uno, `1 / 3` |
| Anterior desde Uno | Tres, `3 / 3` |

## Por qué importa

Carruseles, galerías y "stories" están en todas partes. En la entrevista evalúan si guardas solo el índice y si sabes dar la vuelta con el operador módulo sin llenar el código de `if`.
