import { useEffect, useState } from "react";
import { getOrders, updateOrderStatus } from "./api.js";
import { Header } from "./components/Header.jsx";
import { MenuPanel } from "./components/MenuPanel.jsx";
import { OrderList } from "./components/OrderList.jsx";
import { getNextStatus } from "./utils/status.js";

export default function App() {
  const [orders, setOrders] = useState([]);
  const [hideDelivered, setHideDelivered] = useState(false);

  useEffect(() => {
    // TODO: mostrar algo mientras carga y avisar si falla. Por ahora solo lo dejo en consola. (Diego)
    getOrders()
      .then(setOrders)
      .catch((error) => console.error(error));
  }, []);

  async function handleAdvance(id) {
    const order = orders.find((o) => o.id === id);
    const updated = await updateOrderStatus(id, getNextStatus(order.status));
    // Un array nuevo con un objeto nuevo para ese pedido: así React ve el cambio y vuelve a pintar.
    setOrders((current) => current.map((o) => (o.id === updated.id ? updated : o)));
  }

  const visibleOrders = hideDelivered ? orders.filter((order) => order.status !== "entregado") : orders;

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
          <OrderList orders={visibleOrders} onAdvance={handleAdvance} />
        </section>
        <MenuPanel />
      </main>
    </div>
  );
}
