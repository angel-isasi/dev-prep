export function unicos(lista) {
  return [...new Set(lista)];
}

export function unicosPor(lista, clave) {
  const vistos = new Set();
  return lista.filter((item) => {
    if (vistos.has(item[clave])) return false;
    vistos.add(item[clave]);
    return true;
  });
}
