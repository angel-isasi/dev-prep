// Copia de client/public-movil/correr-js.js para la app local (mantener las dos iguales).
// Corre un código corto de JavaScript y devuelve lo que imprime con console.log (para "¿Qué imprime?").
// Vive en un Worker: no ve la página, ni tus datos, ni el DOM. Su política de seguridad (vercel.json)
// le permite evaluar código y le prohíbe conectarse a internet.
"use strict";

function formatear(valor, profundidad = 0) {
  if (typeof valor === "string") return profundidad === 0 ? valor : `'${valor}'`;
  if (typeof valor === "function") return valor.name ? `[Function: ${valor.name}]` : "[Function (anonymous)]";
  if (typeof valor === "symbol" || typeof valor === "bigint") return String(valor) + (typeof valor === "bigint" ? "n" : "");
  if (valor === null || typeof valor !== "object") return Object.is(valor, -0) ? "-0" : String(valor);
  if (profundidad > 3) return Array.isArray(valor) ? "[Array]" : "[Object]";
  if (valor instanceof Promise) return "Promise { ... }";
  if (valor instanceof Error) return `${valor.name}: ${valor.message}`;
  if (valor instanceof Map) return `Map(${valor.size}) { ${[...valor].map(([k, v]) => `${formatear(k, profundidad + 1)} => ${formatear(v, profundidad + 1)}`).join(", ")} }`;
  if (valor instanceof Set) return `Set(${valor.size}) { ${[...valor].map((v) => formatear(v, profundidad + 1)).join(", ")} }`;
  if (Array.isArray(valor)) return valor.length ? `[ ${valor.map((v) => formatear(v, profundidad + 1)).join(", ")} ]` : "[]";
  const claves = Object.keys(valor);
  if (!claves.length) return "{}";
  return `{ ${claves.map((k) => `${/^[A-Za-z_$][\w$]*$/.test(k) ? k : `'${k}'`}: ${formatear(valor[k], profundidad + 1)}`).join(", ")} }`;
}

self.onmessage = async (evento) => {
  const lineas = [];
  const anotar = (...args) => lineas.push(args.map((a) => formatear(a)).join(" "));
  console.log = console.info = console.warn = console.error = anotar;
  self.onerror = (e) => {
    lineas.push(`Uncaught ${e.message ?? e}`);
    return true;
  };
  self.onunhandledrejection = (e) => lineas.push(`Uncaught (in promise) ${formatear(e.reason)}`);
  try {
    // eslint-disable-next-line no-new-func
    new Function(String(evento.data?.codigo ?? ""))();
  } catch (e) {
    lineas.push(`Uncaught ${e?.name ?? "Error"}: ${e?.message ?? e}`);
  }
  // Espera los setTimeout y las promesas cortas antes de responder
  await new Promise((listo) => setTimeout(listo, 400));
  self.postMessage({ salida: lineas.join("\n") });
};
