export function particion(lista, cumple) {
  const si = [];
  const no = [];

  for (const item of lista) {
    if (cumple(item)) {
      si.push(item);
    } else {
      no.push(item);
    }
  }

  return [si, no];
}
