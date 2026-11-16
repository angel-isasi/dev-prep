// Dinero en céntimos (enteros): así 0.1 + 0.2 nunca da 0.30000000000000004.

/** 3200 -> "S/ 32.00" */
export function formatPrice(cents) {
  return `S/ ${(cents / 100).toFixed(2)}`;
}
