import { OrderCard } from "./OrderCard.jsx";

export function OrderList({ orders, onAdvance, emptyMessage = "No hay pedidos por ahora" }) {
  if (orders.length === 0) return <p className="empty">{emptyMessage}</p>;

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
