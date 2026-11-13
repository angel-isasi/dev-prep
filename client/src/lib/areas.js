// Cómo se organiza Practicar: áreas (JavaScript, Algoritmos, React) y sus colecciones.
// Las colecciones son las carpetas de content/ (p. ej. "react/retos").

export const AREAS = [
  {
    id: "javascript",
    titulo: "JavaScript",
    descripcion: "El lenguaje. Empieza aquí aunque tu meta sea React.",
    colecciones: [
      {
        id: "javascript/guiados",
        nombre: "Fundamentos",
        descripcion: "Cortos y guiados: variables, condicionales, funciones, this y el DOM.",
      },
      {
        id: "javascript/ejercicios",
        nombre: "Práctica",
        descripcion: "Arrays, objetos, funciones, closures, asincronía, clases e iteradores.",
      },
      {
        id: "javascript/retos",
        nombre: "Retos de entrevista",
        descripcion: "Debounce, memoize, deep clone, tu propio Promise.all, LRU cache y más.",
      },
    ],
  },
  {
    id: "algoritmos",
    titulo: "Algoritmos",
    descripcion: "Problemas tipo LeetCode: la parte de lógica de las entrevistas.",
    colecciones: [
      {
        id: "algoritmos/retos",
        nombre: "Retos tipo LeetCode",
        descripcion: "Hash, dos punteros, ventana deslizante, pilas, búsqueda binaria y árboles.",
      },
    ],
  },
  {
    id: "react",
    titulo: "React",
    descripcion: "Componentes, estado, efectos y hooks, probados como en un proyecto real.",
    colecciones: [
      {
        id: "react/ejercicios",
        nombre: "Práctica",
        descripcion: "De tu primer componente a hooks propios, Context, portales y Suspense.",
      },
      {
        id: "react/mixtos",
        nombre: "JavaScript + React",
        descripcion: "La lógica de JavaScript dentro de componentes: datos, asincronía y reducers.",
      },
      {
        id: "react/retos",
        nombre: "Retos de entrevista",
        descripcion: "Los que piden en vivo: buscador, modal, carrito, formulario, tres en raya.",
      },
    ],
  },
];

/** Busca una colección por id: { area, coleccion }. */
export function buscarColeccion(id) {
  for (const area of AREAS) {
    const coleccion = area.colecciones.find((c) => c.id === id);
    if (coleccion) return { area, coleccion };
  }
  return null;
}

/**
 * El siguiente ejercicio que conviene hacer: primero uno en progreso, si no,
 * el primer pendiente en el orden del contenido.
 */
export function siguienteEjercicio(lista) {
  return lista.find((e) => e.estado === "en-progreso") ?? lista.find((e) => e.estado === "pendiente") ?? null;
}

/** Un ejercicio sin resolver al azar (para practicar "como en la entrevista"). */
export function ejercicioAlAzar(lista) {
  const candidatos = lista.filter((e) => e.estado !== "resuelto");
  const fuente = candidatos.length ? candidatos : lista;
  return fuente.length ? fuente[Math.floor(Math.random() * fuente.length)] : null;
}
