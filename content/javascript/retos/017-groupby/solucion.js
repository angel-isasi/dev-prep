export function agruparPor(lista, clave) {
  return lista.reduce((grupos, item) => {
    const grupo = typeof clave === "function" ? clave(item) : item[clave];
    (grupos[grupo] ||= []).push(item);
    return grupos;
  }, {});
}
