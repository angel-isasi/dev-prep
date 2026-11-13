// Una sola conexión SSE para toda la app. Cada componente se suscribe al
// tipo de evento que le interesa ("corriendo", "resultado").
let fuente = null;

function conexion() {
  fuente ??= new EventSource("/api/eventos");
  return fuente;
}

/**
 * @param {string} tipo
 * @param {(datos: any) => void} callback
 * @returns {() => void} función para dejar de escuchar
 */
export function escuchar(tipo, callback) {
  const manejador = (evento) => callback(JSON.parse(evento.data));
  conexion().addEventListener(tipo, manejador);
  return () => fuente?.removeEventListener(tipo, manejador);
}
