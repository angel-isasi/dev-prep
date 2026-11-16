import { useCallback, useEffect, useState } from "react";
import { getOrders, updateOrderStatus } from "./api.js";
import { Header } from "./components/Header.jsx";
import { MenuPanel } from "./components/MenuPanel.jsx";
import { OrderList } from "./components/OrderList.jsx";
import { SearchInput } from "./components/SearchInput.jsx";
import { useSearch } from "./hooks/useSearch.js";
import { getNextStatus } from "./utils/status.js";

export default function App() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("loading"); // "loading" | "error" | "ready"
  const [hideDelivered, setHideDelivered] = useState(false);

  // Mismo patrón que MenuPanel: un solo estado para la petición y una función para reintentar.
  const loadOrders = useCallback(async () => {
    setStatus("loading");
    try {
      setOrders(await getOrders());
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  async function handleAdvance(id) {
    const order = orders.find((o) => o.id === id);
    const updated = await updateOrderStatus(id, getNextStatus(order.status));
    // Un array nuevo con un objeto nuevo para ese pedido: así React ve el cambio y vuelve a pintar.
    setOrders((current) => current.map((o) => (o.id === updated.id ? updated : o)));
  }

  // Primero "Ocultar entregados" y después la búsqueda sobre lo que queda visible.
  const visibleOrders = hideDelivered ? orders.filter((order) => order.status !== "entregado") : orders;
  const { query, setQuery, results } = useSearch(visibleOrders, ["customer", "id"]);

  return (
    <div className="app">
      <Header orders={orders} />
      <main className="layout">
        <section className="panel" aria-labelledby="orders-title">
          <div className="panel__top">
            <h2 id="orders-title">Pedidos</h2>
            <label className="checkbox">
              <input type="checkbox" checked={hideDelivered} onChange={(event) => setHideDelivered(event.target.checked)} />
              Ocultar entregados
            </label>
          </div>
          <SearchInput label="Buscar pedidos" placeholder="Cliente o número de pedido" value={query} onChange={setQuery} />

          {status === "loading" && <p className="info">Cargando pedidos...</p>}

          {status === "error" && (
            <div className="alert" role="alert">
              <p>No se pudieron cargar los pedidos.</p>
              <button type="button" onClick={loadOrders}>
                Reintentar
              </button>
            </div>
          )}

          {status === "ready" && (
            <OrderList orders={results} onAdvance={handleAdvance} emptyMessage={query.trim() ? "No hay pedidos que coincidan" : undefined} />
          )}
        </section>
        <MenuPanel />
      </main>
    </div>
  );
}
