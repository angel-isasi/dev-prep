// Estados de un pedido y en qué orden avanzan.
// Si agregas un estado nuevo, agrégalo en los tres objetos de abajo.

export const STATUS_FLOW = ["pendiente", "en_cocina", "listo", "entregado"];

export const STATUS_LABELS = {
  pendiente: "Pendiente",
  en_cocina: "En cocina",
  listo: "Listo",
  entregado: "Entregado",
};

// Texto del botón que lleva el pedido al siguiente estado.
const ACTION_LABELS = {
  pendiente: "Enviar a cocina",
  en_cocina: "Marcar como listo",
  listo: "Marcar como entregado",
};

/** "pendiente" -> "en_cocina". Devuelve null si ya no hay siguiente estado. */
export function getNextStatus(status) {
  const index = STATUS_FLOW.indexOf(status);
  return STATUS_FLOW[index + 1] ?? null;
}

export function getActionLabel(status) {
  return ACTION_LABELS[status] ?? null;
}

/** Cuántos pedidos hay en cada estado: { pendiente: 3, en_cocina: 1, ... } */
export function countByStatus(orders) {
  const counts = Object.fromEntries(STATUS_FLOW.map((status) => [status, 0]));
  for (const order of orders) counts[order.status] += 1;
  return counts;
}
