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
