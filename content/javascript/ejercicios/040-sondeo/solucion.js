const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

export async function sondear(consultar, intervalo, intentos) {
  for (let i = 0; i < intentos; i++) {
    const resultado = await consultar();
    if (resultado) return resultado;

    const esUltimo = i === intentos - 1;
    if (!esUltimo) await esperar(intervalo);
  }

  throw new Error("Se agotaron los intentos");
}
