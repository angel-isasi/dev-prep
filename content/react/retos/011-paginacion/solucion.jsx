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
