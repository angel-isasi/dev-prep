// "¿Estoy listo para esta oferta?": detecta las tecnologías de una oferta de trabajo con un diccionario
// y las cruza con tu mapa de dominio. Sin IA: solo palabras clave. Funciones puras.

const JS = ["variables-y-tipos", "funciones", "arrays", "objetos", "metodos-de-array", "closures-y-scope", "this", "promesas-y-async"];
const REACT = ["react-jsx-y-componentes", "react-props-y-children", "react-estado-y-eventos", "react-listas-y-condicionales", "react-formularios", "react-efectos-y-datos", "react-hooks-avanzados", "react-hooks-propios-y-patrones"];
const TS = ["ts-tipos-basicos", "ts-objetos-e-interfaces", "ts-uniones-y-narrowing", "ts-funciones", "ts-genericos", "ts-utility-types", "ts-clases-y-modulos", "ts-react-con-typescript"];
const NODE = ["node-que-es-node", "node-archivos", "node-asincronia-y-eventos", "node-http-y-express", "node-apis-rest", "node-middlewares-y-errores"];
const SQL = ["node-sql-consultas", "node-sql-joins", "node-sql-escritura"];

/** Tecnología -> palabras que la delatan y unidades de dev-prep que la cubren ([] = no está en dev-prep). */
export const TECNOLOGIAS = [
  { nombre: "JavaScript", patron: /\b(javascript|js|es6|ecmascript)\b/i, unidades: JS },
  { nombre: "React", patron: /\breact(\.js|js)?\b(?!\s*native)/i, unidades: REACT },
  { nombre: "Hooks de React", patron: /\bhooks?\b/i, unidades: ["react-estado-y-eventos", "react-efectos-y-datos", "react-hooks-avanzados", "react-hooks-propios-y-patrones"] },
  { nombre: "TypeScript", patron: /\b(typescript|ts)\b/i, unidades: TS },
  { nombre: "Node.js", patron: /\bnode(\.js|js)?\b/i, unidades: NODE },
  { nombre: "Express", patron: /\bexpress(\.js|js)?\b/i, unidades: ["node-http-y-express", "node-apis-rest", "node-middlewares-y-errores"] },
  { nombre: "APIs REST", patron: /\b(rest(ful)?|apis?)\b/i, unidades: ["node-apis-rest", "promesas-y-async", "react-efectos-y-datos"] },
  { nombre: "SQL", patron: /\b(sql|mysql|postgres(ql)?|sqlite|bases? de datos|databases?)\b/i, unidades: SQL },
  { nombre: "Asincronía (promesas, async/await)", patron: /\b(async|await|promesas?|promises?|asincr)/i, unidades: ["promesas-y-async", "node-asincronia-y-eventos"] },
  { nombre: "DOM y eventos", patron: /\b(dom|eventos?|events?)\b/i, unidades: ["dom-y-eventos"] },
  { nombre: "Testing (Jest, Vitest, Testing Library)", patron: /\b(jest|vitest|testing library|tests? unitarios?|unit tests?|testing)\b/i, unidades: [] },
  { nombre: "Git", patron: /\b(git|github|gitlab)\b/i, unidades: [] },
  { nombre: "HTML", patron: /\bhtml5?\b/i, unidades: [] },
  { nombre: "CSS", patron: /\b(css3?|sass|scss|responsive)\b/i, unidades: [] },
  { nombre: "Tailwind CSS", patron: /\btailwind/i, unidades: [] },
  { nombre: "Next.js", patron: /\bnext(\.js|js)\b/i, unidades: [] },
  { nombre: "Vue", patron: /\bvue(\.js|js)?\b/i, unidades: [] },
  { nombre: "Angular", patron: /\bangular\b/i, unidades: [] },
  { nombre: "Redux o estado global", patron: /\b(redux|zustand|context api|estado global)\b/i, unidades: ["react-hooks-avanzados"] },
  { nombre: "Docker", patron: /\bdocker\b/i, unidades: [] },
  { nombre: "AWS o la nube", patron: /\b(aws|azure|gcp|cloud|nube)\b/i, unidades: [] },
  { nombre: "Metodologías ágiles", patron: /\b(scrum|agile|ágil|agil|kanban|sprints?)\b/i, unidades: [] },
  { nombre: "Inglés", patron: /\b(ingl[eé]s|english)\b/i, unidades: ["ingles"] },
];

/**
 * @param {string} texto  la oferta pegada
 * @param {{ id: string, estado: string, valor: number }[]} mapa  de mapaDominio
 * @param {{ inglesDominadas?: number, inglesTotal?: number }} [ingles]
 * @returns {{ tecnologias: { nombre: string, estado: "dominas"|"en-progreso"|"por-empezar"|"no-esta", valor: number|null }[], resumen: { dominas: number, total: number } }}
 */
export function analizarOferta(texto, mapa, ingles = {}) {
  const porId = new Map(mapa.map((u) => [u.id, u]));
  const tecnologias = TECNOLOGIAS.filter((t) => t.patron.test(texto)).map((t) => {
    if (!t.unidades.length) return { nombre: t.nombre, estado: "no-esta", valor: null, ruta: null };
    let valor;
    let ruta;
    if (t.unidades[0] === "ingles") {
      valor = ingles.inglesTotal ? (ingles.inglesDominadas ?? 0) / ingles.inglesTotal : 0;
      ruta = "/ingles";
    } else {
      // Las unidades que todavía no empezaste cuentan como 0
      valor = t.unidades.reduce((s, id) => s + (porId.get(id)?.valor ?? 0), 0) / t.unidades.length;
      // "Practicar lo que falta": la lección de la unidad más floja de esa tecnología
      const floja = [...t.unidades].sort((a, b) => (porId.get(a)?.valor ?? 0) - (porId.get(b)?.valor ?? 0))[0];
      ruta = `/leccion?unidad=${encodeURIComponent(floja)}`;
    }
    const estado = valor >= 0.7 ? "dominas" : valor > 0.05 ? "en-progreso" : "por-empezar";
    return { nombre: t.nombre, estado, valor: Math.round(valor * 100) / 100, ruta };
  });
  return { tecnologias, resumen: { dominas: tecnologias.filter((t) => t.estado === "dominas").length, total: tecnologias.length } };
}

/**
 * Palabras clave para tu CV: las tecnologías que pide la oferta y que no aparecen en tu CV.
 * Las separa en dos, para que no pongas en tu CV algo que no sabes:
 *   agregar: las dominas o estás aprendiendo (ponlas)  ·  aprender: todavía no (no las pongas)
 * @param {{ nombre: string, estado: string }[]} tecnologias  las de analizarOferta
 * @param {string} textoCv  todo el texto de tu CV (titular, perfil, habilidades, proyectos)
 */
export function palabrasParaCv(tecnologias, textoCv = "") {
  const porNombre = new Map(TECNOLOGIAS.map((t) => [t.nombre, t]));
  const faltan = tecnologias.filter((t) => t.nombre !== "Inglés" && !porNombre.get(t.nombre)?.patron.test(textoCv));
  return {
    agregar: faltan.filter((t) => t.estado === "dominas" || t.estado === "en-progreso").map((t) => t.nombre),
    aprender: faltan.filter((t) => t.estado === "por-empezar" || t.estado === "no-esta").map((t) => t.nombre),
  };
}
