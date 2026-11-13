Cada pizza tiene varias etiquetas (`"picante"`, `"veggie"`...). Crea el componente `Etiquetas` que recibe `pizzas` y muestra **todas las etiquetas sin repetir, en orden alfabético**.

## Reglas

- Cada pizza es un objeto con `etiquetas`, un arreglo de textos.
- Una `<ul>` con un `<li>` por etiqueta.
- Ninguna etiqueta aparece dos veces.
- Orden alfabético **en español**: `"árbol"` va antes que `"bueno"` (la tilde no la manda al final).
- Si no hay pizzas, la lista queda vacía.

## Ejemplo

```jsx
<Etiquetas
  pizzas={[
    { etiquetas: ["picante", "carne"] },
    { etiquetas: ["veggie", "picante"] },
  ]}
/>
```

Se ve:

```
- carne
- picante
- veggie
```

## Por qué importa

Filtros por etiquetas, categorías de un blog, listas de habilidades: todos necesitan juntar listas internas y quitar repetidos. `flatMap` + `Set` lo resuelve en una línea, y ordenar bien con tildes es un detalle que demuestra cuidado por el usuario hispanohablante.
