Crea el componente `Favorito`: un botón que marca o desmarca una pizza como favorita. Cada clic **alterna** entre los dos estados. Es tu primer componente con **estado** (`useState`).

## Reglas

- Devuelve un solo `<button>`.
- Al inicio la pizza **no** es favorita y el botón dice exactamente **"Agregar a favoritos"**.
- Al hacer clic pasa a favorita y el botón dice exactamente **"Quitar de favoritos"**.
- Otro clic la desmarca y vuelve a decir "Agregar a favoritos", y así sucesivamente.
- El botón lleva el atributo **`aria-pressed`** con el estado actual (`true` si es favorita, `false` si no). Así un lector de pantalla anuncia que es un botón que se activa y desactiva.

## Ejemplo

```jsx
<Favorito />
```

| Acción | Texto del botón | `aria-pressed` |
|---|---|---|
| (al inicio) | Agregar a favoritos | `"false"` |
| 1er clic | Quitar de favoritos | `"true"` |
| 2do clic | Agregar a favoritos | `"false"` |

## Por qué importa

Un botón que alterna (me gusta, seguir, mostrar/ocultar) es el ejemplo clásico para explicar `useState`. En la entrevista quieren ver que entiendes que **cambiar el estado vuelve a renderizar** el componente, y que sabes actualizar a partir del valor anterior.
