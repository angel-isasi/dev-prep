export function ordenarPor(lista, clave) {
  // sort modifica el arreglo sobre el que se llama: por eso ordenamos una copia.
  return [...lista].sort((a, b) => {
    if (a[clave] > b[clave]) return 1;
    if (a[clave] < b[clave]) return -1;
    return 0;
  });
}
