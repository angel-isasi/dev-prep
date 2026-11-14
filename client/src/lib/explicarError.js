// Traduce los errores más comunes de los tests a una pista en español.
// Devuelve null si no reconoce el error.

const REGLAS = [
  // Va antes que la de sintaxis: también dice "Unexpected token", pero el problema no es tu archivo.
  {
    patron: /Unexpected token '<'.*is not valid JSON|"<!DOCTYPE.*is not valid JSON/i,
    pista: "La respuesta de tu API no es JSON sino una página HTML. Casi siempre es porque la ruta no existe (Express responde su página de error 404): revisa el método (`get`, `post`...) y la ruta exacta. También pasa si respondes con `res.send` un texto en vez de `res.json`.",
  },
  {
    patron: /Failed to parse source|SyntaxError|Unexpected token|Unterminated|Expected .* but found/i,
    pista: "Tu archivo tiene un error de sintaxis y no se pudo leer. Revisa llaves `{}`, paréntesis `()` y comillas cerca de la línea que indica el mensaje.",
  },
  {
    patron: /is not a function/,
    pista: "Se intentó llamar a algo que no es una función. ¿Escribiste `export function nombre(...)` con el mismo nombre del enunciado?",
  },
  {
    patron: /does not provide an export named/,
    pista: "El test no encuentra lo que importa. Revisa que exportes la función o el componente (`export function ...`) con el nombre exacto.",
  },
  {
    patron: /is not defined/,
    pista: "Usas una variable que no existe en ese punto. Revisa que la declaraste con `const` o `let` y que el nombre esté bien escrito (mayúsculas incluidas).",
  },
  {
    patron: /expected undefined to/,
    pista: "Tu función devolvió `undefined`. ¿Te falta el `return`? Si usas una función flecha con llaves `{ }`, también necesita `return`.",
  },
  {
    patron: /Cannot read properties of (undefined|null)/,
    pista: "Estás leyendo una propiedad de algo que vale `undefined` o `null`. Revisa que la variable tenga valor antes de usar `.algo` o `[algo]`.",
  },
  {
    patron: /NaN/,
    pista: "Apareció `NaN`: una operación matemática con algo que no es número, muchas veces `undefined + 1`. ¿Inicializaste el valor antes de sumarle?",
  },
  {
    patron: /Unable to find (a label|an element|an accessible element)/,
    pista: "El test no encontró el elemento en pantalla. Revisa el texto exacto, el `aria-label` o el `<label>` que pide el enunciado.",
  },
  {
    patron: /Nothing was returned from render|Element type is invalid/,
    pista: "Tu componente no devuelve JSX válido. Revisa que tenga `return (...)` y que el componente esté exportado.",
  },
  {
    patron: /timed out/i,
    pista: "El test tardó demasiado. ¿Hay un bucle infinito o una promesa que nunca se resuelve?",
  },
];

/** @param {string|null|undefined} mensaje */
export function explicarError(mensaje) {
  if (!mensaje) return null;
  return REGLAS.find((r) => r.patron.test(mensaje))?.pista ?? null;
}
