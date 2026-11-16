// Versión celular de eventos.js: en el celular no hay servidor ni tests en vivo,
// así que nadie envía eventos. Escuchar no hace nada.
export function escuchar() {
  return () => {};
}
