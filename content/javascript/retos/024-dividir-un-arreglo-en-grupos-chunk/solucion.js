export function partir(arr, tam) {
  const grupos = [];
  for (let i = 0; i < arr.length; i += tam) {
    grupos.push(arr.slice(i, i + tam));
  }
  return grupos;
}
