## Idea clave

El único estado es **el número de página**. El total de páginas y los items que se ven son **estado derivado**: se calculan en cada render con `Math.ceil` y `slice`.

## Paso a paso

1. **Estado mínimo.** `const [pagina, setPagina] = useState(1)`. Empezamos en 1 porque así lo lee una persona ("Página 1 de 3").
2. **Total de páginas.** `Math.ceil(items.length / porPagina)`: 5 items de a 2 son 2.5 páginas, y `ceil` lo redondea hacia arriba a 3. Con `Math.max(1, ...)` una lista vacía tiene 1 página y no "Página 1 de 0".
3. **Items visibles.** La página 1 empieza en el índice 0, la 2 en `porPagina`, la 3 en `2 * porPagina`... En general, `inicio = (pagina - 1) * porPagina`. `slice(inicio, inicio + porPagina)` corta ese tramo sin modificar `items` (el final no se incluye).
4. **Botones.** `setPagina((p) => p - 1)` y `setPagina((p) => p + 1)`, con la forma funcional porque el nuevo valor depende del anterior.
5. **Bordes.** `disabled={pagina === 1}` en "Anterior" y `disabled={pagina === totalPaginas}` en "Siguiente". Un botón deshabilitado no dispara `onClick`, así nunca te sales del rango.

```jsx
import { useState } from "react";

export function ListaPaginada({ items, porPagina = 3 }) {
  const [pagina, setPagina] = useState(1);

  // Todo lo demás se calcula a partir de la página actual.
  const totalPaginas = Math.max(1, Math.ceil(items.length / porPagina));
  const inicio = (pagina - 1) * porPagina;
  const visibles = items.slice(inicio, inicio + porPagina);

  return (
    <div>
      <ul>
        {visibles.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <button onClick={() => setPagina((p) => p - 1)} disabled={pagina === 1}>
        Anterior
      </button>
      <span> Página {pagina} de {totalPaginas} </span>
      <button onClick={() => setPagina((p) => p + 1)} disabled={pagina === totalPaginas}>
        Siguiente
      </button>
    </div>
  );
}
```

## Por qué funciona

Con `items = ["a", "b", "c", "d", "e"]` y `porPagina = 2`, `totalPaginas` siempre es 3:

| Acción | `pagina` | `inicio` | `slice(...)` | Se pinta |
|---|---|---|---|---|
| (al inicio) | 1 | 0 | `slice(0, 2)` | a, b · Anterior deshabilitado |
| clic en Siguiente | 2 | 2 | `slice(2, 4)` | c, d · ambos activos |
| clic en Siguiente | 3 | 4 | `slice(4, 6)` | e · Siguiente deshabilitado |
| clic en Anterior | 2 | 2 | `slice(2, 4)` | c, d |

En la última página, `slice(4, 6)` pide hasta el índice 6 aunque no exista: `slice` simplemente devuelve lo que haya (`["e"]`), sin error.

## Errores comunes

- **Guardar `visibles` o `totalPaginas` en el estado.** Tendrías que actualizarlos a mano en cada clic y si `items` cambia quedan desfasados. Si un valor se puede calcular, calcúlalo.
- **Errores de uno (off-by-one).** Usar `pagina * porPagina` como inicio salta la primera página. Lo reconoces porque al inicio ves "c, d" en vez de "a, b".
- **Usar `Math.floor` o `Math.round`** para el total: con 5 items de a 2 te da 2 páginas y el item "e" nunca se ve.
- **Usar `splice` en vez de `slice`.** `splice` **modifica** el arreglo original (que además es una prop). `slice` devuelve una copia del tramo.
- **No deshabilitar los botones** y solo "proteger" en el `onClick`. Funciona, pero el usuario no ve que llegó al límite, y es fácil llegar a la página 0 o 4.

## Otra forma de resolverlo

Empezar la página en **0** (como los índices de arreglo) y sumar 1 solo al mostrarla:

```jsx
const [indice, setIndice] = useState(0);
const totalPaginas = Math.max(1, Math.ceil(items.length / porPagina));
const visibles = items.slice(indice * porPagina, (indice + 1) * porPagina);

// ...
<span> Página {indice + 1} de {totalPaginas} </span>
<button onClick={() => setIndice((i) => i + 1)} disabled={indice === totalPaginas - 1}>
  Siguiente
</button>
```

**¿Cuándo conviene?** Es cuestión de gusto: con base 0 las cuentas del `slice` son más directas, con base 1 el estado coincide con lo que ve el usuario y con lo que suelen pedir las APIs (`?page=1`). Lo importante es ser consistente. Si los datos vinieran del servidor, no cortarías en el cliente: mandarías la página en la petición y el servidor devolvería solo esos items y el total.

## Cómo explicarlo en la entrevista

> "Solo guardo la página actual en el estado. El total de páginas lo saco con `Math.ceil` del largo entre los items por página, y los visibles con `slice`, que no modifica el arreglo. Los botones usan la actualización funcional y se deshabilitan en los extremos para que el usuario no se salga del rango. Si los datos fueran muchos y vinieran de una API, pediría cada página al servidor en lugar de cortarlos en el cliente."

## Conceptos

- **`useState`**: aquí solo para el número de página.
- **Estado derivado**: total de páginas e items visibles se calculan, no se guardan.
- **`Math.ceil`**: redondea hacia arriba; una página incompleta sigue siendo una página.
- **`slice(inicio, fin)`**: copia un tramo del arreglo sin modificarlo; el `fin` no se incluye.
- **Actualización funcional** `setPagina((p) => p + 1)`: el nuevo valor depende del anterior.
- **`disabled`**: un botón deshabilitado no responde a clics y comunica el límite.
- **Casos borde**: primera página, última página incompleta y lista vacía.
