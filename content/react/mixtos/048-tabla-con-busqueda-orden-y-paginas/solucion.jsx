import { useMemo, useState } from "react";

export function TablaPedidos({ pedidos, porPagina = 2 }) {
  // Estado mínimo: qué se busca, cómo se ordena y en qué página estás.
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState({ campo: "cliente", asc: true });
  const [pagina, setPagina] = useState(1);

  // 1) Filtrar y 2) ordenar. Solo se recalcula si cambian sus datos.
  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return pedidos
      .filter((pedido) => pedido.cliente.toLowerCase().includes(texto))
      .toSorted((a, b) => {
        const valorA = a[orden.campo];
        const valorB = b[orden.campo];
        const resultado =
          typeof valorA === "number" ? valorA - valorB : valorA.localeCompare(valorB, "es");
        return orden.asc ? resultado : -resultado;
      });
  }, [pedidos, busqueda, orden]);

  // 3) Cortar la página. Nunca menos de 1 página.
  const paginas = Math.max(1, Math.ceil(filtrados.length / porPagina));
  const actual = Math.min(pagina, paginas);
  const visibles = filtrados.slice((actual - 1) * porPagina, actual * porPagina);

  function ordenarPor(campo) {
    setOrden((anterior) => ({
      campo,
      asc: anterior.campo === campo ? !anterior.asc : true,
    }));
  }

  function buscar(evento) {
    setBusqueda(evento.target.value);
    setPagina(1);
  }

  return (
    <div>
      <input aria-label="Buscar cliente" value={busqueda} onChange={buscar} />

      <table>
        <thead>
          <tr>
            <th>
              <button onClick={() => ordenarPor("cliente")}>Cliente</button>
            </th>
            <th>
              <button onClick={() => ordenarPor("total")}>Total</button>
            </th>
          </tr>
        </thead>
        <tbody>
          {visibles.map((pedido) => (
            <tr key={pedido.id}>
              <td>{pedido.cliente}</td>
              <td>{pedido.total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button disabled={actual === 1} onClick={() => setPagina(actual - 1)}>
        Anterior
      </button>
      <span>
        Página {actual} de {paginas}
      </span>
      <button disabled={actual === paginas} onClick={() => setPagina(actual + 1)}>
        Siguiente
      </button>
    </div>
  );
}
