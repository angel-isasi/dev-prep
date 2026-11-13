const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

export async function reintentar(fn, intentos = 3, esperaMs = 10) {
  let ultimoError;

  for (let i = 0; i < intentos; i++) {
    try {
      return await fn();
    } catch (error) {
      ultimoError = error;
      const quedanIntentos = i < intentos - 1;
      if (quedanIntentos) await esperar(esperaMs * 2 ** i);
    }
  }

  throw ultimoError;
}
