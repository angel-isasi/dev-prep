// Corre un código corto en un Worker aparte (public/correr-js.js) y devuelve lo que imprime.
// Si tarda más de 3 segundos (un bucle infinito), se corta.

/** @returns {Promise<string>} lo que imprimió con console.log, una línea por log */
export function correrJs(codigo) {
  return new Promise((resolver, rechazar) => {
    const worker = new Worker("/correr-js.js");
    const corte = setTimeout(() => {
      worker.terminate();
      rechazar(new Error("El código tardó demasiado en terminar."));
    }, 3000);
    worker.onmessage = (e) => {
      clearTimeout(corte);
      worker.terminate();
      resolver(String(e.data?.salida ?? ""));
    };
    worker.onerror = (e) => {
      clearTimeout(corte);
      worker.terminate();
      rechazar(new Error(e.message || "No se pudo correr el código."));
    };
    worker.postMessage({ codigo });
  });
}
