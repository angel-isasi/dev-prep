// Tu progreso en el celular: se guarda en el propio celular (localStorage), sin servidor.
// Usa las mismas reglas puras que la laptop (server/progreso-reglas.js), así el repaso
// espaciado funciona igual en los dos.
//
// Además de lo de la laptop (preguntas, quizzes, días), guarda "lecturas": los ejercicios
// que estudiaste en el celular (pistas vistas, si viste la solución y tu autoevaluación).
// En el celular un ejercicio nunca queda "resuelto": eso solo lo dan los tests de la laptop.
import { calificarPregunta, preguntaPendiente, progresoVacio, registrarQuiz, sumarAlDia, sumarDias } from "../../../server/progreso-reglas.js";
import { ahoraIso, fechaLocal } from "../../../server/fechas.js";

export const CLAVE = "devprep-movil-v1";
const CLAVE_DANADO = "devprep-movil-danado";

/** Estado vacío del celular: el de la laptop más lo propio del celular. */
export function progresoMovilVacio() {
  return { ...progresoVacio(), lecturas: {}, misRespuestas: null };
}

/**
 * Crea el almacén de progreso.
 * @param {Storage} almacenamiento  localStorage en el navegador (en los tests, uno falso)
 * @param {{ hoy?: () => string, ahora?: () => string }} reloj
 */
export function crearProgresoMovil(almacenamiento, reloj = {}) {
  const hoy = reloj.hoy ?? (() => fechaLocal());
  const ahora = reloj.ahora ?? (() => ahoraIso());

  function cargar() {
    const texto = almacenamiento.getItem(CLAVE);
    if (!texto) return progresoMovilVacio();
    try {
      return { ...progresoMovilVacio(), ...JSON.parse(texto) };
    } catch {
      // Si el JSON se dañó, se guarda una copia aparte y se empieza de cero (no se pierde del todo).
      almacenamiento.setItem(CLAVE_DANADO, texto);
      return progresoMovilVacio();
    }
  }

  let datos = cargar();
  const guardar = () => almacenamiento.setItem(CLAVE, JSON.stringify(datos));

  /** Una lectura (ejercicio estudiado en el celular). */
  const lecturaVacia = () => ({ pistasVistas: 0, vioSolucion: false, explicacion: "" });

  return {
    datos: () => datos,
    hoy,

    // --- Ejercicios estudiados en el celular ---
    deLectura: (id) => datos.lecturas[id] ?? null,

    /** Estado visible en el celular: pendiente, para repasar o estudiado. */
    estadoLectura(id) {
      const r = datos.lecturas[id];
      if (!r?.caja) return "pendiente";
      return preguntaPendiente(r, hoy()) ? "repasar" : "estudiado";
    },

    /** Ver la pista n, siempre en orden. Devuelve null si te saltas una. */
    verPista(id, n) {
      const r = datos.lecturas[id] ?? lecturaVacia();
      if (n !== r.pistasVistas + 1) return n <= r.pistasVistas ? r : null;
      datos.lecturas[id] = { ...r, pistasVistas: n };
      guardar();
      return datos.lecturas[id];
    },

    /** Ver la solución: en el celular no penaliza (regla "en el celular estudias"). */
    verSolucion(id) {
      const r = datos.lecturas[id] ?? lecturaVacia();
      datos.lecturas[id] = { ...r, vioSolucion: true };
      guardar();
      return datos.lecturas[id];
    },

    /** "¿Lo habrías resuelto sin ayuda?" agenda el repaso con las mismas cajas que las tarjetas. */
    autoevaluar(id, nota) {
      const r = datos.lecturas[id] ?? lecturaVacia();
      datos.lecturas[id] = { ...r, ...calificarPregunta(r, nota, hoy()), en: ahora() };
      datos.dias = sumarAlDia(datos.dias, hoy(), "lecturas");
      guardar();
      return datos.lecturas[id];
    },

    guardarExplicacion(id, texto) {
      const r = datos.lecturas[id] ?? lecturaVacia();
      datos.lecturas[id] = { ...r, explicacion: texto };
      guardar();
      return datos.lecturas[id];
    },

    // --- Tarjetas de entrevista (igual que en la laptop) ---
    calificarPregunta(id, nota) {
      datos.preguntas[id] = { ...calificarPregunta(datos.preguntas[id], nota, hoy()), en: ahora() };
      datos.dias = sumarAlDia(datos.dias, hoy(), "preguntas");
      guardar();
      return datos.preguntas[id];
    },

    // --- Quizzes de Aprender ---
    guardarQuiz(id, aciertos, total) {
      datos.quizzes[id] = registrarQuiz(datos.quizzes[id], aciertos, total, ahora());
      datos.dias = sumarAlDia(datos.dias, hoy(), "quizzes");
      guardar();
      return datos.quizzes[id];
    },

    // --- Ajustes y respuestas personales ---
    cambiarConfig(cambios) {
      datos.config = { ...datos.config, ...cambios };
      guardar();
      return datos.config;
    },
    guardarMisRespuestas(valor) {
      datos.misRespuestas = valor;
      guardar();
      return valor;
    },

    // --- Respaldo manual ---
    exportar: () => JSON.stringify(datos),
    importar(texto) {
      const nuevo = JSON.parse(texto); // si no es JSON válido, lanza y no se toca nada
      if (typeof nuevo !== "object" || !nuevo || !nuevo.version) throw new Error("No parece un respaldo de dev-prep.");
      datos = { ...progresoMovilVacio(), ...nuevo };
      guardar();
    },
  };
}

/**
 * Racha del celular: días seguidos con algo estudiado (tarjetas, quizzes o ejercicios).
 * Termina hoy si ya estudiaste hoy; si no, ayer.
 */
export function rachaMovil(dias, hoy) {
  const estudio = (f) => {
    const d = dias[f];
    return !!d && (d.preguntas ?? 0) + (d.quizzes ?? 0) + (d.lecturas ?? 0) + (d.lecciones ?? 0) > 0;
  };
  let f = estudio(hoy) ? hoy : sumarDias(hoy, -1);
  let racha = 0;
  while (estudio(f)) {
    racha++;
    f = sumarDias(f, -1);
  }
  return racha;
}
