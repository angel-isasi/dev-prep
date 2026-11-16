import { calcOrderTotal, formatPrice } from "../utils/money.js";
import { getActionLabel } from "../utils/status.js";
import { StatusBadge } from "./StatusBadge.jsx";

// "salon" -> "Mesa 4", "delivery" -> "Delivery", "llevar" -> "Para llevar"
function getOrderTypeLabel(order) {
  if (order.type === "salon") return `Mesa ${order.table}`;
  if (order.type === "delivery") return "Delivery";
  return "Para llevar";
}

// Tarjeta de un pedido. El botón lo lleva al siguiente estado (lo decide App con onAdvance).
export function OrderCard({ order, onAdvance }) {
  const actionLabel = getActionLabel(order.status);

  return (
    <article className="order-card" aria-label={`Pedido #${order.id}`}>
      <div className="order-card__top">
        <strong className="order-card__code">#{order.id}</strong>
        <span className="order-card__customer">{order.customer}</span>
        <span className="order-card__type">{getOrderTypeLabel(order)}</span>
        <StatusBadge status={order.status} />
      </div>

      <ul className="order-card__items">
        {order.items.map((item) => (
          <li key={item.dishId}>
            {item.quantity ?? 1} x {item.name}
          </li>
        ))}
      </ul>

      <div className="order-card__bottom">
        <p className="order-card__total">Total: {formatPrice(calcOrderTotal(order.items))}</p>
        {actionLabel && (
          <button type="button" onClick={() => onAdvance(order.id)}>
            {actionLabel}
          </button>
        )}
      </div>
    </article>
  );
}
