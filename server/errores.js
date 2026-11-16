// Errores típicos de los tests: cada uno con su categoría (para "Tus errores frecuentes") y una
// pista en español. Lo usan el servidor (cuenta tus errores por categoría) y la interfaz (PanelTests).

export const REGLAS_ERROR = [
  // Va antes que la de sintaxis: también dice "Unexpected token", pero el problema no es tu archivo.
  {
    categoria: "api-html",
    nombre: "La API devolvió HTML en vez de JSON",
    patron: /Unexpected token '<'.*is not valid JSON|"<!DOCTYPE.*is not valid JSON/i,
    pista: "La respuesta de tu API no es JSON sino una página HTML. Casi siempre es porque la ruta no existe (Express responde su página de error 404): revisa el método (`get`, `post`...) y la ruta exacta. También pasa si respondes con `res.send` un texto en vez de `res.json`.",
  },
  {
    categoria: "sintaxis",
    nombre: "Error de sintaxis",
    patron: /Failed to parse source|SyntaxError|Unexpected token|Unterminated|Expected .* but found/i,
    pista: "Tu archivo tiene un error de sintaxis y no se pudo leer. Revisa llaves `{}`, paréntesis `()` y comillas cerca de la línea que indica el mensaje.",
  },
  {
    categoria: "no-es-funcion",
    nombre: "Llamar a algo que no es una función",
    patron: /is not a function/,
    pista: "Se intentó llamar a algo que no es una función. ¿Escribiste `export function nombre(...)` con el mismo nombre del enunciado?",
  },
  {
    categoria: "export",
    nombre: "Export con otro nombre o faltante",
    patron: /does not provide an export named/,
    pista: "El test no encuentra lo que importa. Revisa que exportes la función o el componente (`export function ...`) con el nombre exacto.",
  },
  {
    categoria: "no-definido",
    nombre: "Variable no declarada o mal escrita",
    patron: /is not defined/,
    pista: "Usas una variable que no existe en ese punto. Revisa que la declaraste con `const` o `let` y que el nombre esté bien escrito (mayúsculas incluidas).",
  },
  {
    categoria: "sin-return",
    nombre: "Olvidar el return",
    patron: /expected undefined to/,
    pista: "Tu función devolvió `undefined`. ¿Te falta el `return`? Si usas una función flecha con llaves `{ }`, también necesita `return`.",
  },
  {
    categoria: "undefined-null",
    nombre: "Leer una propiedad de undefined o null",
    patron: /Cannot read properties of (undefined|null)/,
    pista: "Estás leyendo una propiedad de algo que vale `undefined` o `null`. Revisa que la variable tenga valor antes de usar `.algo` o `[algo]`.",
  },
  {
    categoria: "nan",
    nombre: "Operaciones que dan NaN",
    patron: /NaN/,
    pista: "Apareció `NaN`: una operación matemática con algo que no es número, muchas veces `undefined + 1`. ¿Inicializaste el valor antes de sumarle?",
  },
  {
    categoria: "elemento",
    nombre: "El test no encuentra el elemento en pantalla",
    patron: /Unable to find (a label|an element|an accessible element)/,
    pista: "El test no encontró el elemento en pantalla. Revisa el texto exacto, el `aria-label` o el `<label>` que pide el enunciado.",
  },
  {
    categoria: "render",
    nombre: "Componente que no devuelve JSX válido",
    patron: /Nothing was returned from render|Element type is invalid/,
    pista: "Tu componente no devuelve JSX válido. Revisa que tenga `return (...)` y que el componente esté exportado.",
  },
  {
    categoria: "tiempo",
    nombre: "Bucle infinito o promesa que no termina",
    patron: /timed out/i,
    pista: "El test tardó demasiado. ¿Hay un bucle infinito o una promesa que nunca se resuelve?",
  },
  // Sin pista: el resultado no es el esperado (la lógica falla en algún caso)
  {
    categoria: "resultado",
    nombre: "Resultado distinto al esperado (un caso sin cubrir)",
    patron: /expected .* to (deeply )?equal|expected .* to be |expected .* to have/i,
    pista: null,
  },
];

/** Nombre legible de una categoría. */
export const nombreCategoria = (categoria) => REGLAS_ERROR.find((r) => r.categoria === categoria)?.nombre ?? categoria;

/** Pista en español para un mensaje de error, o null si no se reconoce. */
export function explicarError(mensaje) {
  if (!mensaje) return null;
  return REGLAS_ERROR.find((r) => r.pista && r.patron.test(mensaje))?.pista ?? null;
}

/** Categoría de un mensaje de error, o null. */
export function categoriaError(mensaje) {
  if (!mensaje) return null;
  return REGLAS_ERROR.find((r) => r.patron.test(mensaje))?.categoria ?? null;
}

/** Las categorías distintas de una corrida (error general o casos que fallan). */
export function categoriasDeResultado(resultado) {
  const mensajes = [resultado?.error, ...(resultado?.casos ?? []).filter((c) => !c.ok).map((c) => c.mensaje)];
  return [...new Set(mensajes.map(categoriaError).filter(Boolean))];
}

/** Total por categoría en los días (campos "err:<categoria>"), de mayor a menor. */
export function erroresFrecuentes(dias) {
  const total = {};
  for (const dia of Object.values(dias ?? {})) {
    for (const [campo, n] of Object.entries(dia ?? {})) {
      if (campo.startsWith("err:") && typeof n === "number") total[campo.slice(4)] = (total[campo.slice(4)] ?? 0) + n;
    }
  }
  return Object.entries(total)
    .sort((a, b) => b[1] - a[1])
    .map(([categoria, veces]) => ({ categoria, nombre: nombreCategoria(categoria), veces }));
}
