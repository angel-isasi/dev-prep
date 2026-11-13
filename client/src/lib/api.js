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
  repasar: (id) => post(`${ruta(id)}/repasar`),
  inicio: () => pedir("/api/inicio"),
  progreso: () => pedir("/api/progreso"),
  config: () => pedir("/api/config"),
  guardarConfig: (cambios) => put("/api/config", cambios),
  entrevistas: () => pedir("/api/entrevistas"),
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
  temas: () => pedir("/api/aprender"),
  tema: (id) => pedir(`/api/aprender/${encodeURIComponent(id)}`),
  guardarQuiz: (id, aciertos) =>
    pedir(`/api/aprender/${encodeURIComponent(id)}/quiz`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aciertos }),
    }),
  referencia: () => pedir("/api/referencia"),
};
