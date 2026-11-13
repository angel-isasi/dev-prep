// Todas las llamadas al servidor en un solo lugar.

async function pedir(url, opciones) {
  const respuesta = await fetch(url, opciones);
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(datos.error ?? `Error ${respuesta.status}`);
  return datos;
}

const post = (url) => pedir(url, { method: "POST" });
const put = (url, cuerpo) =>
  pedir(url, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cuerpo) });
const ruta = (id) => `/api/ejercicios/${encodeURIComponent(id)}`;

export const api = {
  ejercicios: () => pedir("/api/ejercicios"),
  ejercicio: (id) => pedir(`/api/ejercicios/${encodeURIComponent(id)}`),
  abrir: (id) => post(`/api/ejercicios/${encodeURIComponent(id)}/abrir`),
  reiniciar: (id) => post(`/api/ejercicios/${encodeURIComponent(id)}/reiniciar`),
  correr: (id) => post(`${ruta(id)}/correr`),
  verPista: (id, n) => post(`${ruta(id)}/pistas/${n}`),
  verSolucion: (id) => post(`${ruta(id)}/solucion`),
  guardarExplicacion: (id, texto) => put(`${ruta(id)}/explicacion`, { texto }),
};
