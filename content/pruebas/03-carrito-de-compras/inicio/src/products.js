// Catálogo de Café Altura. NO necesitas modificar este archivo.
// Los precios están en CÉNTIMOS: 3200 = S/ 32.00.

export const PRODUCTS = [
  { id: 1, name: "Café Villa Rica 250 g", description: "Grano entero, tueste medio. Notas a chocolate.", price: 3200 },
  { id: 2, name: "Café Chanchamayo 500 g", description: "Molido para pasado, tueste medio.", price: 5500 },
  { id: 3, name: "Café Oxapampa orgánico 250 g", description: "Grano entero, tueste claro. Notas cítricas.", price: 3850 },
  { id: 4, name: "Prensa francesa 600 ml", description: "Vidrio templado y filtro de acero.", price: 8990 },
  { id: 5, name: "Molinillo manual de cerámica", description: "Muela ajustable para todo tipo de molienda.", price: 12000 },
];

export function findProduct(id) {
  return PRODUCTS.find((product) => product.id === id);
}
