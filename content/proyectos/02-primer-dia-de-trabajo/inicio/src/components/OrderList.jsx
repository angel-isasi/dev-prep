import { OrderCard } from "./OrderCard.jsx";

export function OrderList({ orders, onAdvance }) {
  // TODO(rosa): negocio pidió un mensaje cuando no hay pedidos, hoy sale la lista en blanco
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
