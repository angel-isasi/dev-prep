// Todas las llamadas al servidor en un solo lugar.

async function pedir(url, opciones) {
  const respuesta = await fetch(url, opciones);
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(datos.error ?? `Error ${respuesta.status}`);
  return datos;
}

const post = (url) => pedir(url, { method: "POST" });

export const api = {
  ejercicios: () => pedir("/api/ejercicios"),
  ejercicio: (id) => pedir(`/api/ejercicios/${encodeURIComponent(id)}`),
  abrir: (id) => post(`/api/ejercicios/${encodeURIComponent(id)}/abrir`),
  reiniciar: (id) => post(`/api/ejercicios/${encodeURIComponent(id)}/reiniciar`),
  correr: (id) => post(`/api/ejercicios/${encodeURIComponent(id)}/correr`),
};
