export function sumarLento(a, b) {
  return new Promise((resolver) => setTimeout(() => resolver(a + b), 10));
}

export async function sumarTres(a, b, c) {
  const parcial = await sumarLento(a, b);
  return sumarLento(parcial, c);
}
