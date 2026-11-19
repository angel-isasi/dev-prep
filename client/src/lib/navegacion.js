// La navegación de toda la app en un solo lugar. La usan la barra lateral (laptop), la barra
// inferior y las pastillas de sección (celular) y el buscador (Ctrl+K). Son 6 secciones; lo
// demás vive dentro de su sección como "sub".
//
// `web`: solo existe en la versión publicada. `tambien`: otras rutas que pertenecen a ese
// destino (para saber qué marcar como activo).
import { ES_MOVIL } from "./modo.js";
import { IconoAprender, IconoIngles, IconoInicio, IconoPracticar, IconoProgreso, IconoTrabajo } from "../components/Iconos.jsx";

const TODAS = [
  { id: "hoy", a: "/", texto: "Hoy", Icono: IconoInicio, exacto: true, sub: [] },
  {
    id: "aprender",
    a: "/aprender",
    texto: "Aprender",
    Icono: IconoAprender,
    sub: [
      { a: "/aprender", texto: "Temas" },
      { a: "/camino", texto: "Lecciones", web: true },
      { a: "/chuletas", texto: "Chuletas", web: true },
      { a: "/referencia", texto: "Referencia" },
      { a: "/glosario", texto: "Glosario", web: true },
    ],
  },
  {
    id: "practicar",
    a: "/practicar",
    texto: "Practicar",
    Icono: IconoPracticar,
    sub: [
      { a: "/practicar", texto: "Ejercicios" },
      { a: "/revision", texto: "Revisión de código", web: true },
      { a: "/git", texto: "Git práctico", web: true },
    ],
  },
  {
    id: "ingles",
    a: "/ingles",
    texto: "Inglés",
    Icono: IconoIngles,
    web: true,
    sub: [
      { a: "/ingles", texto: "Temario", exacto: true, tambien: ["/ingles/unidad", "/ingles/parejas", "/ingles/examen", "/ingles/conversa"] },
      { a: "/ingles/historias", texto: "Historias", tambien: ["/ingles/historia", "/ingles/roleplay"] },
      { a: "/ingles/mapache", texto: "Map" },
    ],
  },
  {
    id: "trabajo",
    a: "/entrevistas",
    texto: "Conseguir trabajo",
    corto: "Trabajo",
    Icono: IconoTrabajo,
    sub: [
      { a: "/entrevistas", texto: "Entrevistas" },
      { a: "/trabajo", texto: "Ofertas y postulaciones", web: true },
    ],
  },
  {
    id: "progreso",
    a: "/progreso",
    texto: "Progreso",
    Icono: IconoProgreso,
    sub: [
      { a: "/progreso", texto: "Resumen" },
      { a: "/logros", texto: "Insignias", web: true },
      { a: "/diario", texto: "Diario", web: true },
    ],
  },
];

const disponible = (x) => ES_MOVIL || !x.web;

/** Las secciones del menú, ya sin lo que no existe en esta versión. */
export const SECCIONES = TODAS.filter(disponible).map((s) => ({ ...s, sub: s.sub.filter(disponible) }));

const dentro = (pathname, a) => pathname === a || pathname.startsWith(`${a}/`);

/** ¿La ruta actual pertenece a este destino (un sub de una sección)? */
export function estaEnDestino(pathname, { a, exacto, tambien = [] }) {
  return (exacto ? pathname === a : dentro(pathname, a)) || tambien.some((r) => dentro(pathname, r));
}

/**
 * La sección y el sub a los que pertenece una ruta. Si dos destinos coinciden (por ejemplo
 * "/ingles" y "/ingles/historias"), gana el de ruta más larga.
 * @returns {{ seccion: object | null, sub: object | null }}
 */
export function ubicar(pathname) {
  if (pathname === "/") return { seccion: SECCIONES[0], sub: null };
  let mejor = { seccion: null, sub: null, largo: -1 };
  for (const seccion of SECCIONES) {
    for (const sub of seccion.sub) {
      if (estaEnDestino(pathname, sub) && sub.a.length > mejor.largo) mejor = { seccion, sub, largo: sub.a.length };
    }
  }
  return { seccion: mejor.seccion, sub: mejor.sub };
}

/** ¿La ruta es la portada de un destino? Solo ahí se muestran las pastillas de sección. */
export function esPortada(pathname) {
  return pathname === "/practicar/lista" || SECCIONES.some((s) => s.sub.some((d) => d.a === pathname));
}
