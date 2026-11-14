export function cambioMonedas(monedas, monto) {
  // minimo[m] = menor cantidad de monedas para formar el monto m.
  // Infinity significa "todavía no sé formarlo" (o no se puede).
  const minimo = new Array(monto + 1).fill(Infinity);
  minimo[0] = 0; // el monto 0 se forma sin monedas

  // Lleno la tabla de los montos chicos a los grandes.
  for (let m = 1; m <= monto; m++) {
    for (const moneda of monedas) {
      if (moneda > m) continue; // esta moneda no cabe en el monto m

      // Si la última moneda que uso es `moneda`, antes tenía que formar m - moneda.
      const usandoEsta = minimo[m - moneda] + 1;
      if (usandoEsta < minimo[m]) minimo[m] = usandoEsta;
    }
  }

  return minimo[monto] === Infinity ? -1 : minimo[monto];
}
