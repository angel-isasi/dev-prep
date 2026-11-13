// Se crea una sola vez, fuera del componente: no cambia entre renders.
const formatoSoles = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
});

export function Precio({ monto }) {
  return <span>{formatoSoles.format(monto)}</span>;
}
