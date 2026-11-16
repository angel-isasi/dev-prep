// Eventos en vivo del servidor de dev-prep (SSE): "corriendo" y "resultado" de los tests.
// Una sola conexión por servidor; cada componente se suscribe al tipo que le interesa.

/** @param {string} base dirección del servidor ("" = el mismo que sirve la página) */
export function crearEscucha(base = "") {
  let fuente = null;
  const conexion = () => (fuente ??= new EventSource(`${base}/api/eventos`));

  /**
   * @param {string} tipo
   * @param {(datos: any) => void} callback
   * @returns {() => void} función para dejar de escuchar
   */
  return function escuchar(tipo, callback) {
    const manejador = (evento) => callback(JSON.parse(evento.data));
    conexion().addEventListener(tipo, manejador);
    return () => fuente?.removeEventListener(tipo, manejador);
  };
}
