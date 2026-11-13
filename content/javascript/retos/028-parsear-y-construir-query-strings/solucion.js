export function parsearQuery(qs) {
  return Object.fromEntries(new URLSearchParams(qs.replace(/^\?/, "")));
}

export function crearQuery(obj) {
  const pares = Object.entries(obj).filter(([, valor]) => valor !== undefined && valor !== "");
  return new URLSearchParams(pares).toString();
}
