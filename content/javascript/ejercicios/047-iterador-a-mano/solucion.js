export function crearIterador(lista) {
  let indice = 0;

  return {
    siguiente() {
      if (indice < lista.length) {
        const valor = lista[indice];
        indice++;
        return { valor, listo: false };
      }
      return { valor: undefined, listo: true };
    },
  };
}
