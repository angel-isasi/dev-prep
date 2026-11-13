export function todasONada(promesas) {
  return Promise.all(promesas);
}

export async function resumenDeEstados(promesas) {
  const resultados = await Promise.allSettled(promesas);
  return resultados.map((resultado) => resultado.status);
}

export function primeraEnTerminar(promesas) {
  return Promise.race(promesas);
}

export function primeraExitosa(promesas) {
  return Promise.any(promesas);
}
