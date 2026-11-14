// Todas las llamadas al servidor en un solo lugar.

// Última respuesta de cada GET. Al volver a una pantalla se muestra al instante
// lo que ya teníamos y la pantalla se actualiza sola cuando llega la respuesta nueva.
const cache = new Map();

async function pedir(url, opciones) {
  const respuesta = await fetch(url, opciones);
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(datos.error ?? `Error ${respuesta.status}`);
  if (!opciones) cache.set(url, datos);
  return datos;
}

/** GET con caché: api.inicio() pide al servidor; api.inicio.guardado() devuelve lo último recibido (o null). */
const get = (aUrl) => {
  const url = typeof aUrl === "function" ? aUrl : () => aUrl;
  const llamar = (...args) => pedir(url(...args));
  llamar.guardado = (...args) => cache.get(url(...args)) ?? null;
  return llamar;
};

const post = (url) => pedir(url, { method: "POST" });
const put = (url, cuerpo) =>
  pedir(url, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cuerpo) });
const ruta = (id) => `/api/ejercicios/${encodeURIComponent(id)}`;

export const api = {
  ejercicios: get("/api/ejercicios"),
  ejercicio: (id) => pedir(`/api/ejercicios/${encodeURIComponent(id)}`),
  abrir: (id) => post(`/api/ejercicios/${encodeURIComponent(id)}/abrir`),
  reiniciar: (id) => post(`/api/ejercicios/${encodeURIComponent(id)}/reiniciar`),
  correr: (id) => post(`${ruta(id)}/correr`),
  verPista: (id, n) => post(`${ruta(id)}/pistas/${n}`),
  verSolucion: (id) => post(`${ruta(id)}/solucion`),
  guardarExplicacion: (id, texto) => put(`${ruta(id)}/explicacion`, { texto }),
  repasar: (id) => post(`${ruta(id)}/repasar`),
  inicio: get("/api/inicio"),
  progreso: get("/api/progreso"),
  config: () => pedir("/api/config"),
  guardarConfig: (cambios) => put("/api/config", cambios),
  entrevistas: get("/api/entrevistas"),
  tarjetas: (filtro) => pedir(`/api/entrevistas/tarjetas?${new URLSearchParams(filtro)}`),
  calificar: (id, nota) =>
    pedir(`/api/entrevistas/preguntas/${encodeURIComponent(id)}/calificar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nota }),
    }),
  ejerciciosEntrevista: () => pedir("/api/entrevistas/ejercicios"),
  misRespuestas: () => pedir("/api/mis-respuestas"),
  guardarMisRespuestas: (datos) => put("/api/mis-respuestas", datos),
  temas: get("/api/aprender"),
  tema: get((id) => `/api/aprender/${encodeURIComponent(id)}`),
  guardarQuiz: (id, aciertos) =>
    pedir(`/api/aprender/${encodeURIComponent(id)}/quiz`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aciertos }),
    }),
  referencia: get("/api/referencia"),
  apagar: () => post("/api/apagar"),
};
