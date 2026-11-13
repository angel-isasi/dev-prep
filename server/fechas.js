// Fechas en la hora local de tu PC (Lima). Nunca usamos toISOString() para el
// "día": está en UTC y después de las 7 p. m. ya cuenta como mañana.
const dos = (n) => String(n).padStart(2, "0");

/** "2026-11-13" según la hora local. */
export function fechaLocal(fecha = new Date()) {
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`;
}

/** "2026-11-13T15:02:11-05:00": fecha y hora local con su zona horaria. */
export function ahoraIso(fecha = new Date()) {
  const minutos = -fecha.getTimezoneOffset();
  const signo = minutos >= 0 ? "+" : "-";
  const zona = `${signo}${dos(Math.floor(Math.abs(minutos) / 60))}:${dos(Math.abs(minutos) % 60)}`;
  const hora = `${dos(fecha.getHours())}:${dos(fecha.getMinutes())}:${dos(fecha.getSeconds())}`;
  return `${fechaLocal(fecha)}T${hora}${zona}`;
}

/** "2026-11-13_15-02-11": para nombres de archivo. */
export function sello(fecha = new Date()) {
  return ahoraIso(fecha).slice(0, 19).replace("T", "_").replaceAll(":", "-");
}
