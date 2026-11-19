// Precios de la IA (dólares por millón de tokens) y cuánto costó un pedido.
// Archivo sin dependencias: lo usan la función de Vercel y la app (para llevar la cuenta del mes).

/** [entrada, salida] en USD por millón de tokens. */
export const PRECIOS = {
  "claude-opus-5-5": [4, 20],
  "claude-sonnet-5-5": [2, 10],
  "claude-haiku-5-5": [0.1, 0.5],
};

/** El modelo de cada tarea: el más barato que la hace bien. */
export const MODELOS = {
  entrevista: "claude-sonnet-5-5",
  informe: "claude-sonnet-5-5",
  ingles: "claude-haiku-5-5",
  codigo: "claude-sonnet-5-5",
  // Charla en inglés: cada turno con el modelo barato; las correcciones del final con uno mejor
  conversacion: "claude-haiku-5-5",
  "conversacion-cierre": "claude-sonnet-5-5",
};

/**
 * Costo de un pedido en dólares. Si el modelo no está en la tabla, se cobra como el más caro
 * (mejor contar de más que de menos).
 * @param {{ modelo?: string, entrada?: number, salida?: number }} uso
 */
export function costoUsd({ modelo, entrada = 0, salida = 0 } = {}) {
  const [pEntrada, pSalida] = PRECIOS[modelo] ?? PRECIOS["claude-opus-5-5"];
  return (entrada * pEntrada + salida * pSalida) / 1_000_000;
}
