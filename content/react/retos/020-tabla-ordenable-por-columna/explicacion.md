## Idea clave

El estado es **cómo ordenar** (`{ columna, ascendente }`), no las filas ordenadas. En cada render se **copia** el arreglo de props y se ordena la copia, porque `sort` modifica el arreglo sobre el que se llama. Números se comparan restando y textos con `localeCompare` en español.

## Paso a paso

1. **Columnas.** `Object.keys(filas[0] ?? {})` da `["nombre", "votos"]`. El `?? {}` evita un error si `filas` llega vacío.
2. **Estado de orden.** `useState({ columna: columnas[0], ascendente: true })`: al inicio, primera columna ascendente.
3. **Función de comparación.** `sort` necesita una función que devuelva un número negativo si `a` va antes, positivo si va después y 0 si da igual:
   - Números: `a - b` (7 - 12 es negativo, el 7 va primero).
   - Textos: `localeCompare(b, "es")`, que conoce el alfabeto español: tildes y ñ quedan en su lugar.
4. **Copiar y ordenar.** `[...filas].sort(...)`. Si es descendente, se cambia el signo del resultado: `-resultado`.
5. **Clic en un encabezado.** `setOrden((actual) => ({ columna, ascendente: actual.columna === columna ? !actual.ascendente : true }))`: misma columna invierte, columna nueva empieza ascendente.
6. **Accesibilidad.** Cada `<th>` tiene `aria-sort` y el encabezado es un `<button>`, así se puede ordenar con el teclado (Tab + Enter) y el lector de pantalla anuncia "ordenado ascendente".

```jsx
import { useState } from "react";

function comparar(a, b) {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), "es");
}

export function TablaOrdenable({ filas }) {
  const columnas = Object.keys(filas[0] ?? {});
  const [orden, setOrden] = useState({ columna: columnas[0], ascendente: true });

  // Copiamos antes de ordenar: sort() modifica el arreglo original.
  const ordenadas = [...filas].sort((filaA, filaB) => {
    const resultado = comparar(filaA[orden.columna], filaB[orden.columna]);
    return orden.ascendente ? resultado : -resultado;
  });

  function ordenarPor(columna) {
    setOrden((actual) => ({
      columna,
      // Misma columna: invierte. Otra columna: empieza ascendente.
      ascendente: actual.columna === columna ? !actual.ascendente : true,
    }));
  }

  return (
    <table>
      <thead>
        <tr>
          {columnas.map((columna) => (
            <th
              key={columna}
              aria-sort={
                orden.columna !== columna ? "none" : orden.ascendente ? "ascending" : "descending"
              }
            >
              <button onClick={() => ordenarPor(columna)}>{columna}</button>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {ordenadas.map((fila) => (
          <tr key={fila[columnas[0]]}>
            {columnas.map((columna) => (
              <td key={columna}>{fila[columna]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

`comparar` va fuera del componente porque no usa props ni estado. La `key` de cada fila es el valor de la primera columna, que aquí es único; con datos reales usarías un `id`.

## Por qué funciona

Con `Terror (12)`, `Drama (30)` y `Acción (7)`:

| Acción | `orden` | Comparación | Filas pintadas |
|---|---|---|---|
| (al inicio) | `nombre`, ↑ | `localeCompare` | Acción, Drama, Terror |
| clic en `votos` | `votos`, ↑ (columna nueva) | `a - b` | Acción (7), Terror (12), Drama (30) |
| clic en `votos` | `votos`, ↓ (misma, invierte) | `-(a - b)` | Drama (30), Terror (12), Acción (7) |
| clic en `nombre` | `nombre`, ↑ (columna nueva) | `localeCompare` | Acción, Drama, Terror |

En ningún paso cambia `filas`: cada render crea su propia copia ordenada.

## Errores comunes

- **`filas.sort(...)` sin copiar.** `sort` ordena **en el lugar**: modificas la prop del padre, y como es el mismo arreglo React puede no enterarse. Lo detecta el test "no modifica el arreglo".
- **Comparar números como textos.** `"12".localeCompare("7")` dice que `"12"` va antes (compara carácter por carácter: "1" < "7"). Por eso los números se restan.
- **Restar textos**: `"Drama" - "Terror"` es `NaN` y `sort` deja el orden como caiga.
- **Comparar textos con `<`** o sin locale: `"Acción" < "Drama"` funciona por suerte, pero `"Ñandú"` o mayúsculas mezcladas quedan mal. `localeCompare(b, "es")` es la forma correcta.
- **Guardar las filas ordenadas en el estado.** Si el padre manda filas nuevas, tu copia queda vieja. Guarda el criterio, calcula el resultado.
- **Olvidar volver a ascendente** al cambiar de columna: si venías descendente en `votos`, `nombre` empezaría al revés.

## Otra forma de resolverlo

Con **`useMemo`** para no reordenar en cada render si ni las filas ni el orden cambiaron, y con `toSorted`, que ya devuelve una copia:

```jsx
import { useMemo, useState } from "react";

const ordenadas = useMemo(
  () =>
    filas.toSorted((a, b) => {
      const r = comparar(a[orden.columna], b[orden.columna]);
      return orden.ascendente ? r : -r;
    }),
  [filas, orden]
);
```

**¿Cuándo conviene?** `useMemo` vale la pena con tablas grandes (miles de filas) o si el componente se re-renderiza seguido por otras razones. Con pocas filas, ordenar es instantáneo. `toSorted` (navegadores de 2023 en adelante) hace lo mismo que `[...filas].sort(...)` pero deja más clara la intención. Si los datos vinieran paginados del servidor, el orden se pediría a la API (`?ordenar=votos&dir=desc`).

## Cómo explicarlo en la entrevista

> "Guardo en el estado solo la columna y la dirección; las filas ordenadas las calculo en cada render. Nunca ordeno la prop directamente porque `sort` muta el arreglo: primero copio con spread. Para textos uso `localeCompare` con `'es'` para que las tildes y la ñ se ordenen bien, y para números resto, porque comparados como texto '12' quedaría antes que '7'. Si hago clic en la misma columna invierto la dirección, y si es otra empiezo ascendente. Marco la columna con `aria-sort` para accesibilidad."

## Conceptos

- **`sort` muta**: ordena el mismo arreglo; copia antes con `[...arr]` o usa `toSorted`.
- **Función de comparación**: negativo, cero o positivo según qué elemento va primero.
- **`localeCompare(otro, "es")`**: compara textos según el idioma (tildes, ñ).
- **Estado como objeto**: `{ columna, ascendente }`, actualizado con la forma funcional.
- **Estado derivado**: las filas ordenadas se calculan.
- **`Object.keys`**: obtiene las claves de un objeto, aquí las columnas.
- **`aria-sort`**: indica en un encabezado de tabla cómo está ordenada esa columna.
- **`useMemo`**: memoriza un cálculo caro hasta que cambien sus dependencias.
