// API falsa de Qhatu. NO necesitas modificar este archivo.
// Simula una red real: tarda medio segundo y falla una de cada cinco veces.

const DELAY_MS = 500;
const FAILURE_RATE = 0.2;

const PRODUCTS = [
  { id: 1, name: "Arroz extra 5 kg", category: "Abarrotes", price: 24.9 },
  { id: 2, name: "Café tostado 250 g", category: "Bebidas", price: 18.5 },
  { id: 3, name: "Leche evaporada 400 g", category: "Lácteos", price: 4.2 },
  { id: 4, name: "Chicha morada 1 L", category: "Bebidas", price: 6 },
  { id: 5, name: "Quinua 500 g", category: "Abarrotes", price: 9.8 },
  { id: 6, name: "Yogur de fresa 1 L", category: "Lácteos", price: 7.5 },
  { id: 7, name: "Detergente en polvo 1 kg", category: "Limpieza", price: 15.9 },
  { id: 8, name: "Aceite vegetal 1 L", category: "Abarrotes", price: 11.4 },
  { id: 9, name: "Agua sin gas 2.5 L", category: "Bebidas", price: 3.5 },
  { id: 10, name: "Queso fresco 500 g", category: "Lácteos", price: 13.9 },
  { id: 11, name: "Lejía 1 L", category: "Limpieza", price: 4.9 },
  { id: 12, name: "Azúcar rubia 1 kg", category: "Abarrotes", price: 4.6 },
];

/**
 * Pide el catálogo.
 * @returns {Promise<Array<{ id: number, name: string, category: string, price: number }>>}
 */
export function fetchProducts() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < FAILURE_RATE) {
        reject(new Error("Error 503: servicio no disponible"));
      } else {
        // Una copia: así nadie puede modificar los datos del "servidor".
        resolve(PRODUCTS.map((product) => ({ ...product })));
      }
    }, DELAY_MS);
  });
}
