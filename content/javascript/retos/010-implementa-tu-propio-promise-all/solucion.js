export function promiseAll(promesas) {
  return new Promise((resolver, rechazar) => {
    const resultados = [];
    let pendientes = promesas.length;

    if (pendientes === 0) {
      resolver([]);
      return;
    }

    promesas.forEach((promesa, i) => {
      Promise.resolve(promesa).then((valor) => {
        resultados[i] = valor;
        pendientes--;
        if (pendientes === 0) resolver(resultados);
      }, rechazar);
    });
  });
}
