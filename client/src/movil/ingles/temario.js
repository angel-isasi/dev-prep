// El curso de inglés armado para el temario: las 6 etapas con sus unidades y el avance de cada una.
// Es lógica pura (sin pantalla) para poder probarla: la dibuja Temario.jsx.
import { avanceConceptos } from "../leccion/variantes.js";
import { hechaPorExamen } from "./examen.js";

/** Las etapas del curso, en orden. `nivel` es lo que alcanzas al terminarla. */
export const ETAPAS = [
  { id: "basico", titulo: "Base", nivel: "A1 a A2" },
  { id: "intermedio", titulo: "Intermedio", nivel: "B1" },
  { id: "trabajo", titulo: "Inglés de trabajo", nivel: "B1 a B2" },
  { id: "avanzado", titulo: "Avanzado", nivel: "B2" },
  { id: "superior", titulo: "Superior", nivel: "C1" },
  { id: "dominio", titulo: "Dominio", nivel: "C2" },
];

/**
 * @param {object} datos lo que devuelve api.lecciones("ingles"): unidades, items, registros, extra y unidadActual
 * @returns {{ etapas: object[], actual: object|null }} cada etapa trae `unidades` y `hechas`; cada unidad trae
 *   `numero`, `avance`, `hecha`, `actual`, `aprobada` (por el examen de nivel), `legendaria`, `cofreAbierto`
 *   y `estado` ("hecha" | "actual" | "empezada" | "pendiente").
 */
export function armarTemario(datos) {
  const orden = datos.unidades.map((u) => u.id);
  const unidades = datos.unidades.map((u, i) => {
    const avance = avanceConceptos(datos.items, datos.registros, u.id);
    // El examen de nivel deja como hechas las unidades anteriores a donde llegaste
    const porExamen = !!hechaPorExamen(datos.extra?.examen, orden, u.id);
    // "Ya me la sé": aprobaste la prueba de la unidad y la saltaste
    const saltada = !!datos.extra?.saltadas?.[u.id];
    const hecha = avance.completa || porExamen || saltada;
    const actual = u.id === datos.unidadActual;
    return {
      ...u,
      numero: u.orden ?? i + 1,
      avance,
      hecha,
      actual,
      aprobada: (porExamen || saltada) && !avance.completa,
      legendaria: !!datos.extra?.legendarias?.[u.id],
      cofreAbierto: !!datos.extra?.cofres?.[u.id],
      estado: hecha ? "hecha" : actual ? "actual" : avance.vistos > 0 ? "empezada" : "pendiente",
    };
  });
  const etapas = ETAPAS.map((e) => {
    const suyas = unidades.filter((u) => u.etapa === e.id);
    return { ...e, unidades: suyas, hechas: suyas.filter((u) => u.hecha).length };
  }).filter((e) => e.unidades.length);
  return { etapas, actual: unidades.find((u) => u.actual) ?? unidades[0] ?? null };
}

/**
 * Qué unidades se ven en el celular antes de "Ver las N unidades": una ventana alrededor de donde vas
 * (una antes y las que siguen), sin salirse de la lista.
 * @returns {{ desde: number, hasta: number }} índices de `slice`
 */
export function ventanaDeUnidades(total, indiceActual, cuantas = 5) {
  if (total <= cuantas + 2) return { desde: 0, hasta: total };
  const desde = Math.min(Math.max(0, indiceActual - 1), total - cuantas);
  return { desde, hasta: desde + cuantas };
}
