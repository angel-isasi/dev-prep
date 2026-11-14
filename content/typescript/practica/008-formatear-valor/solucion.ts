export type ValorCelda = string | number | boolean | null;

export function formatearValor(valor: ValorCelda): string {
  // Aquí `valor` es string | number | boolean | null.
  if (valor === null) return "Sin dato";

  // Desde aquí TypeScript ya descartó null: string | number | boolean.
  if (typeof valor === "boolean") return valor ? "Sí" : "No";

  // Dentro de este if, `valor` es number: toFixed existe.
  if (typeof valor === "number") return valor.toFixed(2);

  // Solo queda string: TypeScript lo sabe sin que lo comprobemos.
  const limpio = valor.trim();
  return limpio === "" ? "Sin dato" : limpio;
}
