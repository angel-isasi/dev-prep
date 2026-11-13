const formatoSoles = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });

const formatoFecha = new Intl.DateTimeFormat("es-PE", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "America/Lima",
});

export function soles(monto) {
  return formatoSoles.format(monto);
}

export function fechaLarga(iso) {
  return formatoFecha.format(new Date(iso));
}
