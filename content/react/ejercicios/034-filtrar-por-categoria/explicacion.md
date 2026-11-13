## Idea clave

Guarda en el estado **solo el filtro elegido**. Los botones (categorías sin repetir) y la lista visible son **estado derivado**: se calculan en cada render a partir de `pizzas` y del filtro.

## Paso a paso

1. **Estado mínimo**: `useState("todas")`. Es lo único que el usuario cambia.
2. **Categorías sin repetir**: `pizzas.map((p) => p.categoria)` da `["clásicas", "veggie", "clásicas", "veggie"]`. Un `Set` guarda cada valor una sola vez **en el orden en que llegaron**, y el spread `...` lo vuelve arreglo. Le pones "todas" al inicio.
3. **Pizzas visibles**: si el filtro es "todas", el arreglo completo; si no, `filter` por categoría.
4. **Botones**: uno por categoría con `key={c}`, `onClick` que cambia el filtro y `aria-pressed={categoria === c}`, que indica cuál está activo (a un lector de pantalla y a los tests).
5. **Lista**: un `<li key={p.nombre}>` por pizza visible.

```jsx
import { useState } from "react";

export function MenuFiltrable({ pizzas }) {
  // Lo único que se guarda: qué filtro eligió el usuario.
  const [categoria, setCategoria] = useState("todas");

  // Derivado: categorías sin repetir (Set conserva el orden de aparición).
  const categorias = ["todas", ...new Set(pizzas.map((p) => p.categoria))];

  // Derivado: pizzas visibles según el filtro.
  const visibles =
    categoria === "todas" ? pizzas : pizzas.filter((p) => p.categoria === categoria);

  return (
    <div>
      <div>
        {categorias.map((c) => (
          <button key={c} aria-pressed={categoria === c} onClick={() => setCategoria(c)}>
            {c}
          </button>
        ))}
      </div>
      <ul>
        {visibles.map((p) => (
          <li key={p.nombre}>{p.nombre}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Por qué funciona

| Acción | Estado `categoria` | `visibles` | Botón con `aria-pressed="true"` |
|---|---|---|---|
| Primer render | `"todas"` | las 4 pizzas | todas |
| Clic en veggie | `"veggie"` | Vegana, Espinaca | veggie |
| Clic en clásicas | `"clásicas"` | Margarita, Americana | clásicas |
| Clic en todas | `"todas"` | las 4 pizzas | todas |

Cada clic cambia un solo texto en el estado. React vuelve a ejecutar el componente, recalcula `categorias` y `visibles` desde cero y pinta el resultado. No hay nada que sincronizar.

Si mañana el padre pasa una carta distinta en `pizzas` (por ejemplo, llega del servidor), los botones y la lista se actualizan solos, porque se calculan de la prop. Si los hubieras guardado en estados, mostrarías datos viejos.

## Errores comunes

- **Guardar la lista filtrada en otro estado** y actualizarla en el `onClick` o en un `useEffect`. Duplicas datos y, si cambia `pizzas`, la lista guardada queda desactualizada.
- **Escribir las categorías a mano** (`["clásicas", "veggie"]`). Funciona con estos datos, pero se rompe en cuanto agregues una categoría nueva.
- **Quitar repetidos con `filter((c, i, arr) => arr.indexOf(c) === i)`**. Funciona, pero es menos legible y más lento que `new Set`. En entrevista, `Set` es la respuesta esperada.
- **Olvidar las `key`** en botones y `<li>`, o usar el índice en una lista que se filtra. React avisa en consola y puede mezclar elementos.
- **`aria-pressed` siempre en `true`** o calculado al revés. Lo reconoces porque falla el test de `aria-pressed`.

## Otra forma de resolverlo

Si la carta fuera muy grande, puedes **memorizar** los cálculos derivados con `useMemo`:

```jsx
import { useMemo, useState } from "react";

export function MenuFiltrable({ pizzas }) {
  const [categoria, setCategoria] = useState("todas");
  const categorias = useMemo(
    () => ["todas", ...new Set(pizzas.map((p) => p.categoria))],
    [pizzas],
  );
  const visibles = useMemo(
    () => (categoria === "todas" ? pizzas : pizzas.filter((p) => p.categoria === categoria)),
    [pizzas, categoria],
  );
  // ...mismo JSX
}
```

**¿Cuándo conviene?** Con cartas de miles de elementos o cálculos caros. Con unas decenas de pizzas, recalcular es instantáneo y `useMemo` solo agrega ruido. Otra mejora común en apps reales es guardar el filtro en la URL (`?categoria=veggie`) para que se pueda compartir el enlace.

## Cómo explicarlo en la entrevista

> "Guardo solo la categoría elegida en el estado. Las categorías de los botones las derivo de las pizzas con un `Set`, que quita repetidos y conserva el orden, y la lista visible la calculo con `filter`. Como todo se deriva en cada render, si cambian las pizzas todo se actualiza solo y no hay estados que sincronizar. Marco el botón activo con `aria-pressed` para accesibilidad."

## Conceptos

- **Estado mínimo**: guarda solo lo que el usuario cambia.
- **Estado derivado**: lo calculable a partir de props y estado no se guarda.
- **`Set`**: colección sin repetidos que conserva el orden de inserción.
- **Spread `[...set]`**: convierte un `Set` en arreglo.
- **`filter`**: se queda con los elementos que cumplen una condición.
- **`key` en listas**: única y estable.
- **`aria-pressed`**: indica que un botón de alternar está activo.
- **`useMemo`**: memoriza cálculos caros.
