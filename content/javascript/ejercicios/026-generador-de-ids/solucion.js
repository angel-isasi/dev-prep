export function crearIds(prefijo) {
  let siguiente = 1;

  return () => {
    const id = `${prefijo}-${siguiente}`;
    siguiente++;
    return id;
  };
}
