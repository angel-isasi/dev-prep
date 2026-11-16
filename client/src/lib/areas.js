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
      {
        id: "javascript/depurar",
        nombre: "Depurar código roto",
        descripcion: "Código que parece bien pero falla: encuentra el error con el síntoma y arréglalo.",
      },
      {
        id: "javascript/testing",
        nombre: "Escribe tú los tests",
        descripcion: "La función ya funciona: escribe los tests que atrapen sus versiones con errores escondidos.",
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
      {
        id: "react/depurar",
        nombre: "Depurar componentes",
        descripcion: "Estado mutado, efectos sin limpieza, keys mal puestas: los bugs que llegan a revisión.",
      },
      {
        id: "react/apis",
        nombre: "Consumir APIs",
        descripcion: "APIs que tardan, fallan o vienen vacías: carga, error, reintento, cancelar y paginar.",
      },
    ],
  },
  {
    id: "typescript",
    titulo: "TypeScript",
    descripcion: "JavaScript con tipos: lo piden casi todas las ofertas. Tus tipos también se revisan.",
    colecciones: [
      {
        id: "typescript/practica",
        nombre: "Práctica",
        descripcion: "Tipos básicos, interfaces, uniones, narrowing, genéricos y utility types.",
      },
      {
        id: "typescript/retos",
        nombre: "Retos con tipos",
        descripcion: "Funciones genéricas, tipos que modelan datos reales y componentes de React tipados.",
      },
    ],
  },
  {
    id: "node",
    titulo: "Node.js y SQL",
    descripcion: "El lado del servidor: módulos, archivos, APIs con Express y consultas SQL reales.",
    colecciones: [
      {
        id: "node/practica",
        nombre: "Fundamentos de Node",
        descripcion: "Módulos, archivos, eventos, asincronía y utilidades de Node.",
      },
      {
        id: "node/apis",
        nombre: "APIs con Express",
        descripcion: "Rutas, parámetros, validación, errores y middlewares, probados con peticiones reales.",
      },
      {
        id: "node/sql",
        nombre: "SQL",
        descripcion: "SELECT, WHERE, JOIN, GROUP BY e INSERT con SQLite, sin instalar nada.",
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
