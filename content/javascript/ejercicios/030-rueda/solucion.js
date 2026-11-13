export function rueda(...valores) {
  let i = 0;

  return () => {
    const valor = valores[i % valores.length];
    i++;
    return valor;
  };
}
