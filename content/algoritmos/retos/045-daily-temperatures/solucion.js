export function temperaturasDiarias(temperaturas) {
  // Por defecto 0: si nadie le da respuesta a un día, se queda en 0.
  const respuesta = new Array(temperaturas.length).fill(0);

  // Pila de ÍNDICES de días que todavía esperan un día más cálido.
  // Sus temperaturas van de mayor (abajo) a menor o igual (arriba).
  const pila = [];

  for (let i = 0; i < temperaturas.length; i++) {
    // Hoy es más cálido que los días de arriba de la pila: hoy es su respuesta.
    while (pila.length > 0 && temperaturas[i] > temperaturas[pila[pila.length - 1]]) {
      const dia = pila.pop();
      respuesta[dia] = i - dia; // cuántos días tuvo que esperar
    }
    // Hoy también tiene que esperar a alguien más cálido.
    pila.push(i);
  }

  return respuesta;
}
