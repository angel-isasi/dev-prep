// Guarda tu progreso en data/progreso.json y un historial en data/eventos.jsonl.
// Las reglas (qué cuenta como intento, cuándo está resuelto) viven en progreso-reglas.js.
import { appendFile, copyFile, mkdir, readdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { ahoraIso, fechaLocal } from "./fechas.js";
import {
  aplicarResultado,
  marcarAbierto,
  progresoVacio,
  registroVacio,
  sumarAlDia,
  sumarTiempo,
  verPista,
  verSolucion,
  iniciarRepaso,
  calificarPregunta,
  registrarQuiz,
  programarRepaso,
  validarConfig,
} from "./progreso-reglas.js";
import { diasCombinados, documentoParaSubir, fusionarDocumento } from "./combinar.js";
import { categoriasDeResultado } from "./errores.js";

const RESPALDOS_DIARIOS = 7;

/** @param {{ datosDir: string }} opciones */
export async function crearProgreso({ datosDir }) {
  const archivo = path.join(datosDir, "progreso.json");
  const historial = path.join(datosDir, "eventos.jsonl");
  const respaldosDir = path.join(datosDir, "respaldos");
  await mkdir(datosDir, { recursive: true });

  let datos;
  try {
    datos = { ...progresoVacio(), ...JSON.parse(await readFile(archivo, "utf8")) };
  } catch (error) {
    if (error.code !== "ENOENT") {
      // Archivo dañado: lo apartamos en vez de borrarlo, y empezamos de cero.
      const apartado = `${archivo}.danado-${Date.now()}`;
      await rename(archivo, apartado);
      console.error(`[progreso] progreso.json no se pudo leer; se guardó como ${path.basename(apartado)}`);
    }
    datos = progresoVacio();
  }
  await respaldoDiario();

  // Las escrituras van en fila: nunca dos a la vez sobre el mismo archivo.
  let cola = Promise.resolve();

  // Configuración de antes de la sincronización: sin fecha de edición. Se le pone la de hoy, para que
  // al mezclar mande sobre la configuración por defecto de un celular recién vinculado.
  datos.config.actualizadoEn ??= ahoraIso();

  /** Escritura atómica: primero a un .tmp y luego renombrar (si se corta la luz, no queda a medias). */
  // Avisos de "el progreso cambió" (los usa la sincronización para subir los cambios).
  const oyentes = new Set();

  /** @param {{ avisar?: boolean }} [opciones] avisar: false cuando el cambio vino de la nube (no hay nada nuevo que subir) */
  function guardar({ avisar = true } = {}) {
    if (avisar) for (const oyente of oyentes) oyente();
    cola = cola
      .then(async () => {
        const tmp = `${archivo}.tmp`;
        await writeFile(tmp, JSON.stringify(datos, null, 2));
        await rename(tmp, archivo);
      })
      .catch((error) => console.error("[progreso] no se pudo guardar:", error.message));
    return cola;
  }

  /** Una copia por día en data/respaldos/ (se guardan las últimas 7). */
  async function respaldoDiario() {
    try {
      await mkdir(respaldosDir, { recursive: true });
      const destino = path.join(respaldosDir, `progreso-${fechaLocal()}.json`);
      await copyFile(archivo, destino).catch((e) => (e.code === "ENOENT" ? null : Promise.reject(e)));
      const viejos = (await readdir(respaldosDir)).filter((f) => f.startsWith("progreso-")).sort().slice(0, -RESPALDOS_DIARIOS);
      await Promise.all(viejos.map((f) => rm(path.join(respaldosDir, f))));
    } catch (error) {
      console.error("[progreso] no se pudo crear el respaldo diario:", error.message);
    }
  }

  async function registrarEvento(tipo, id, extra = {}) {
    const linea = JSON.stringify({ en: ahoraIso(), tipo, id, ...extra });
    await appendFile(historial, linea + "\n").catch((e) => console.error("[progreso]", e.message));
  }

  // Completa con valores por defecto los registros guardados con versiones anteriores.
  const deEjercicio = (id) => ({ ...registroVacio(), ...datos.ejercicios[id] });

  /** Suma tiempo activo al ejercicio y al día. */
  function conTiempo(registro, ahora) {
    const { registro: nuevo, segundos } = sumarTiempo(registro, ahora);
    if (segundos) datos.dias = sumarAlDia(datos.dias, fechaLocal(), "segundos", segundos);
    return nuevo;
  }

  return {
    deEjercicio,
    datos: () => datos,

    /** @returns {Promise<object|null>} el registro nuevo, o null si se salta una pista */
    async verPista(id, n) {
      const ahora = ahoraIso();
      const registro = verPista(deEjercicio(id), n, ahora);
      if (!registro) return null;
      datos.ejercicios[id] = conTiempo(registro, ahora);
      await registrarEvento("pista", id, { n });
      await guardar();
      return datos.ejercicios[id];
    },

    async verSolucion(id) {
      const antes = deEjercicio(id);
      datos.ejercicios[id] = verSolucion(antes, ahoraIso());
      await registrarEvento("solucion", id, { penalidad: antes.estado !== "resuelto" });
      await guardar();
      return datos.ejercicios[id];
    },

    async iniciarRepaso(id) {
      datos.ejercicios[id] = iniciarRepaso(deEjercicio(id));
      await registrarEvento("repaso-inicio", id);
      await guardar();
      return datos.ejercicios[id];
    },

    config: () => datos.config,

    // --- Sincronización con otros dispositivos ---
    /** Días de todos los dispositivos sumados (racha, meta, semana, calendario). */
    dias: () => diasCombinados(datos),
    /** Lo que esta laptop sube a la nube. */
    documento: () => documentoParaSubir(datos),
    /** Mezcla los documentos de otros dispositivos con el tuyo (sin perder nada). */
    async fusionar(documentos) {
      const antes = JSON.stringify(datos);
      for (const { dispositivo, doc } of documentos) datos = fusionarDocumento(datos, doc, dispositivo);
      datos.ejercicios ??= {};
      datos.preguntas ??= {};
      datos.quizzes ??= {};
      // Si la mezcla no cambió nada, no se escribe. Y nunca avisa a la sincronización: lo que llegó
      // de la nube no hay que volver a subirlo (avisar aquí hacía sincronizar cada 8 segundos sin parar).
      if (JSON.stringify(datos) !== antes) await guardar({ avisar: false });
    },
    alCambiar(oyente) {
      oyentes.add(oyente);
      return () => oyentes.delete(oyente);
    },

    dePregunta: (id) => datos.preguntas[id],

    /** Resultado de un quiz de Aprender: se guarda el mejor y el último. */
    async guardarQuiz(id, aciertos, total) {
      const previo = datos.quizzes[id];
      datos.quizzes[id] = registrarQuiz(previo, aciertos, total, ahoraIso());
      await registrarEvento("quiz", id, { aciertos, total });
      await guardar();
      return datos.quizzes[id];
    },

    /** Autoevaluación de una tarjeta de entrevista. */
    async calificarPregunta(id, nota) {
      // "en": fecha y hora, para saber cuál es más reciente al mezclar con el celular.
      datos.preguntas[id] = { ...calificarPregunta(datos.preguntas[id], nota, fechaLocal()), en: ahoraIso() };
      datos.dias = sumarAlDia(datos.dias, fechaLocal(), "preguntas");
      await registrarEvento("pregunta", id, { nota });
      await guardar();
      return datos.preguntas[id];
    },

    /** Cambia solo los campos válidos; devuelve la config resultante. */
    async cambiarConfig(cambios) {
      const validos = validarConfig(cambios);
      if (Object.keys(validos).length) datos.config = { ...datos.config, ...validos, actualizadoEn: ahoraIso() };
      await guardar();
      return datos.config;
    },

    /** Guarda la foto del % de preparación de hoy (para el resumen semanal). */
    async anotarPreparacion(porcentaje) {
      const hoy = fechaLocal();
      if (datos.dias[hoy]?.preparacion === porcentaje) return;
      datos.dias = { ...datos.dias, [hoy]: { ...(datos.dias[hoy] ?? { resueltos: 0, repasos: 0, preguntas: 0, segundos: 0 }), preparacion: porcentaje } };
      await guardar();
    },

    async guardarExplicacion(id, texto) {
      datos.ejercicios[id] = { ...deEjercicio(id), explicacion: texto };
      await registrarEvento("explicacion", id);
      await guardar();
      return datos.ejercicios[id];
    },
    registrarEvento,

    async marcarAbierto(id) {
      const ahora = ahoraIso();
      // Al abrir no se suma tiempo: solo se marca el inicio de esta sesión de trabajo.
      datos.ejercicios[id] = { ...marcarAbierto(deEjercicio(id), ahora), ultimaActividad: ahora };
      await registrarEvento("abrir", id);
      await guardar();
    },

    /**
     * @param {string} id
     * @param {{ pasan: number, total: number, error: string|null }} resultado
     * @param {{ esIntento: boolean }} info
     */
    /** Minutos de juego que detectó el vigilante (no dispara la sincronización: se sube cada 5 min). */
    async sumarJuego(segundos) {
      datos.dias = sumarAlDia(datos.dias, fechaLocal(), "juego", segundos);
      await guardar({ avisar: false });
    },

    /** Suma a un contador del día (por ejemplo "jefes" al vencer al jefe de la semana). */
    async sumarDia(campo, cantidad = 1) {
      datos.dias = sumarAlDia(datos.dias, fechaLocal(), campo, cantidad);
      await guardar();
    },

    async registrarResultado(id, resultado, { esIntento }) {
      const ahora = ahoraIso();
      const aplicado = aplicarResultado(deEjercicio(id), resultado, { esIntento, ahora });
      const { resueltoAhora, repasoCompletado } = aplicado;
      let registro = esIntento ? conTiempo(aplicado.registro, ahora) : aplicado.registro;
      // Regla acordada: si ya lo estudiaste en el celular (viste la solución allí), resolverlo cuenta,
      // pero te lo vuelvo a pedir mañana para comprobar que lo retuviste.
      if (resueltoAhora && datos.lecturas?.[id]?.vioSolucion) {
        registro = { ...registro, repaso: programarRepaso(1, fechaLocal()), estudiadoEnCelular: true };
      }
      datos.ejercicios[id] = registro;
      if (resueltoAhora) datos.dias = sumarAlDia(datos.dias, fechaLocal(), "resueltos");
      // Resuelto sin pistas ni solución: cuenta como "limpio" (bono de concentración)
      if (resueltoAhora && !registro.pistasVistas && !registro.vioSolucion) datos.dias = sumarAlDia(datos.dias, fechaLocal(), "limpios");
      // Tus errores frecuentes: una vez por categoría y por guardado que falla
      if (esIntento && resultado.pasan !== resultado.total) {
        for (const categoria of categoriasDeResultado(resultado)) datos.dias = sumarAlDia(datos.dias, fechaLocal(), `err:${categoria}`);
      }
      if (repasoCompletado) datos.dias = sumarAlDia(datos.dias, fechaLocal(), "repasos");
      await registrarEvento("corrida", id, { pasan: resultado.pasan, total: resultado.total, intento: esIntento });
      if (resueltoAhora) await registrarEvento("resuelto", id);
      if (repasoCompletado) await registrarEvento("repaso", id, { caja: registro.repaso.caja });
      await guardar();
      return { registro, resueltoAhora, repasoCompletado };
    },
  };
}
