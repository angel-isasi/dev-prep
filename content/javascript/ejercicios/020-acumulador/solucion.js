export function crearAcumulador() {
  let total = 0;

  return (n) => {
    total += n;
    return total;
  };
}
