export function robarCasas(casas) {
  let anteAnterior = 0; // mejor total hasta dos casas atrás
  let anterior = 0; // mejor total hasta la casa anterior

  for (const dinero of casas) {
    // Opción 1: me salto esta casa y me quedo con lo mejor hasta la anterior.
    // Opción 2: robo esta casa, así que la anterior no; sumo a lo de dos atrás.
    const actual = Math.max(anterior, anteAnterior + dinero);

    anteAnterior = anterior;
    anterior = actual;
  }

  return anterior;
}
