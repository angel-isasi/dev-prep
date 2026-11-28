// Todas las llamadas al servidor de dev-prep en un solo lugar.
// crearApi("") habla con el servidor que sirve la página (la app local).
// crearApi("http://127.0.0.1:4321") lo usa la versión web cuando está en tu laptop con dev-prep abierto.

/** @param {string} base dirección del servidor ("" = el mismo que sirve la página) */
export function crearApi(base = "") {
  // Última respuesta de cada GET. Al volver a una pantalla se muestra al instante
  // lo que ya teníamos y la pantalla se actualiza sola cuando llega la respuesta nueva.
  const cache = new Map();

  async function pedir(url, opciones) {
    const respuesta = await fetch(base + url, opciones);
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

  return {
    /** Dirección del servidor, para enlaces e imágenes (QR) que no pasan por fetch. */
    url: (ruta) => base + ruta,
    ejercicios: get("/api/ejercicios"),
    ejercicio: (id) => pedir(`/api/ejercicios/${encodeURIComponent(id)}`),
    abrir: (id) => post(`/api/ejercicios/${encodeURIComponent(id)}/abrir`),
    reiniciar: (id) => post(`/api/ejercicios/${encodeURIComponent(id)}/reiniciar`),
    empezarDeCero: () => post("/api/empezar-de-cero"),
    correr: (id) => post(`${ruta(id)}/correr`),
    verPista: (id, n) => post(`${ruta(id)}/pistas/${n}`),
    verSolucion: (id) => post(`${ruta(id)}/solucion`),
    guardarExplicacion: (id, texto) => put(`${ruta(id)}/explicacion`, { texto }),
    /** Tu código de workspace/ (para la IA). { codigo: null } si aún no lo abriste. */
    miCodigo: (id) => pedir(`${ruta(id)}/mi-codigo`, { headers: { accept: "application/json" } }),
    /** Tu día en la laptop y el programa que tienes delante (solo nombres). */
    usoLaptop: () => pedir("/api/uso-laptop", { headers: { accept: "application/json" } }),
    /** Las voces neuronales instaladas en la laptop: { voces: string[] }. */
    vocesLocales: () => pedir("/api/voz", { headers: { accept: "application/json" } }),
    /** El audio (WAV) de un texto, generado en la laptop. */
    audioDeVoz: async (texto, voz) => {
      const r = await fetch(base + "/api/voz", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ texto, voz }) });
      if (!r.ok) throw new Error("Sin voz local");
      return r.arrayBuffer();
    },
    repasar: (id) => post(`${ruta(id)}/repasar`),
    inicio: get("/api/inicio"),
    progreso: get("/api/progreso"),
    config: () => pedir("/api/config"),
    guardarConfig: (cambios) => put("/api/config", cambios),
    entrevistas: get("/api/entrevistas"),
    tarjetas: ({ categorias, cantidad, ...filtro } = {}) =>
      pedir(`/api/entrevistas/tarjetas?${new URLSearchParams({ ...filtro, ...(categorias ? { categorias: categorias.join("|") } : {}) })}`),
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
    // Sincronización con el celular (AWS)
    sync: () => pedir("/api/sync"),
    sincronizar: () => post("/api/sync"),
    // Conseguir trabajo: pruebas técnicas, proyecto guiado y portafolio (necesitan el disco de la laptop)
    proyectos: () => pedir("/api/proyectos"),
    abrirProyecto: (id, etapa) =>
      pedir(`/api/proyectos/${encodeURIComponent(id)}/abrir`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ etapa }) }),
    verificarProyecto: (id, etapa) =>
      pedir(`/api/proyectos/${encodeURIComponent(id)}/verificar`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ etapa }) }),
    /** Tu código de un proyecto (para la revisión con IA). */
    codigoProyecto: (id) => pedir(`/api/proyectos/${encodeURIComponent(id)}/codigo`, { headers: { accept: "application/json" } }),
    portafolio: () => pedir("/api/portafolio"),
    // Git práctico: repositorios de verdad en Documentos/dev-prep-git
    escenariosGit: () => pedir("/api/git"),
    // Ofertas de las 4 bolsas de trabajo (el motor puede leer Get on Board; el navegador, no)
    buscarOfertasMotor: (nuevo) => pedir(`/api/ofertas/buscar${nuevo ? "?nuevo=1" : ""}`),
    prepararGit: (id) => post(`/api/git/${encodeURIComponent(id)}/preparar`),
    abrirGit: (id) => post(`/api/git/${encodeURIComponent(id)}/abrir`),
    verificarGit: (id) => post(`/api/git/${encodeURIComponent(id)}/verificar`),
    exportarPortafolio: (ejercicio) => post(`/api/portafolio/${encodeURIComponent(ejercicio)}/exportar`),
  };
}
