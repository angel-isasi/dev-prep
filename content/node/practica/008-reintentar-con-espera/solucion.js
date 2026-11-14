// Una pausa de `ms` milisegundos que se usa con await.
const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

// Desestructuración con valores por defecto: si no pasan opciones, se usa {}.
export async function reintentar(tarea, { intentos = 3, esperaInicial = 100 } = {}) {
  let ultimoError;
  let espera = esperaInicial;

  for (let intento = 1; intento <= intentos; intento++) {
    try {
      // return await: si la tarea rechaza, el error cae en el catch de abajo.
      return await tarea();
    } catch (error) {
      ultimoError = error;
      if (intento < intentos) {
        await esperar(espera);
        espera *= 2; // backoff exponencial: 100, 200, 400...
      }
    }
  }

  throw ultimoError;
}
