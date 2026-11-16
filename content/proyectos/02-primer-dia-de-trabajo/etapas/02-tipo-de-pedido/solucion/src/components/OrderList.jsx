import { OrderCard } from "./OrderCard.jsx";

export function OrderList({ orders, onAdvance }) {
  if (orders.length === 0) return <p className="empty">No hay pedidos por ahora</p>;

  return (
    <ul className="order-list">
      {orders.map((order) => (
        <li key={order.id}>
          <OrderCard order={order} onAdvance={onAdvance} />
        </li>
      ))}
    </ul>
  );
}
