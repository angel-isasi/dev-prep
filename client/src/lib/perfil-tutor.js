// Memoria del tutor: un perfil corto tuyo que viaja con cada pedido a la IA (lib/ia.js), así todas las
// funciones te conocen: tus temas flojos, lo que ya dominas, los errores que repites y tus proyectos.
// Se arma con datos que la app ya tiene (no gasta IA) y se guarda 10 minutos para no recalcularlo.
import { api } from "./api.js";

const DURA_MS = 10 * 60 * 1000;
let guardado = null; // { en, texto }

const nombres = (lista, max) => lista.slice(0, max).map((u) => u.titulo).join(", ");

/** Arma el texto del perfil (exportado para los tests). */
export function armarPerfil({ mapa, errores, mis, inglesErrores, config, tropiezos } = {}) {
  const unidades = mapa?.unidades ?? [];
  const empezadas = unidades.filter((u) => u.estado !== "sin-empezar");
  const flojas = empezadas.filter((u) => u.estado === "rojo" || u.estado === "amarillo").sort((a, b) => a.valor - b.valor);
  const domina = empezadas.filter((u) => u.estado === "verde");
  const lineas = [
    "Angel, estudiante de Ingeniería de Sistemas en la UNICA (Ica, Perú). Sabe JavaScript básico y le cuesta React; aprende practicando y se aburre con la teoría larga. Se prepara para su primer trabajo o prácticas como frontend junior. Inglés entre B1 y B2. Le funciona más la presión que el premio.",
    config?.objetivo?.trim() ? `Su objetivo, escrito por él: ${config.objetivo.trim().slice(0, 300)}` : "",
    config?.fechaMeta ? `Fecha meta para postular: ${config.fechaMeta}. Meta diaria: ${config.metaDiaria ?? "?"} ejercicios.` : "",
    flojas.length ? `Temas flojos: ${nombres(flojas, 5)}.` : "",
    domina.length ? `Temas que ya domina: ${nombres(domina, 6)}.` : "",
    !empezadas.length && unidades.length ? "Recién empieza: casi no tiene práctica registrada." : "",
    errores?.length ? `Errores que más repite en los tests: ${errores.slice(0, 3).map((e) => `${e.nombre} (${e.veces})`).join(", ")}.` : "",
    inglesErrores?.length ? `Errores de inglés que repite: ${inglesErrores.slice(0, 3).join("; ")}.` : "",
    ...(tropiezos ?? []),
    mis?.pitch?.trim() ? `Su pitch: ${mis.pitch.trim().slice(0, 400)}` : "",
  ];
  return lineas.filter(Boolean).join("\n");
}

/** Errores de inglés recientes que guarda la app (ver lib/errores-ingles.js), si los hay. */
function erroresIngles() {
  try {
    return (JSON.parse(localStorage.getItem("devprep.inglesErrores") ?? "[]") ?? []).slice(-5).map((e) => `${e.original} → ${e.corregido}`);
  } catch {
    return [];
  }
}

/** El perfil para la IA. Si algo falla, devuelve lo que pudo armar (nunca rompe el pedido). */
export async function perfilTutor() {
  if (guardado && Date.now() - guardado.en < DURA_MS) return guardado.texto;
  const [mapa, errores, mis, config, tropiezos] = await Promise.all([
    api.mapa?.().catch(() => null),
    api.erroresFrecuentes?.().catch(() => []),
    api.misRespuestas?.().catch(() => null),
    api.config?.().catch(() => null),
    api.tropiezos?.().catch(() => []),
  ]);
  const texto = armarPerfil({ mapa, errores, mis, config, tropiezos, inglesErrores: erroresIngles() });
  guardado = { en: Date.now(), texto };
  return texto;
}

/** Después de practicar, el perfil se vuelve a armar en el siguiente pedido. */
export const olvidarPerfil = () => {
  guardado = null;
};
