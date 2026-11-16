// Crear producto con valores por defecto
//
// Recibe los datos del formulario y completa lo que falte:
// - nombre: "Sin nombre" si no llegó o está vacío.
// - categoria: "general" si no llegó o está vacía.
// - stock: 10 si no llegó (undefined o null). Un 0 es válido: producto agotado.

export function crearProducto(datos) {
  return {
    nombre: datos.nombre || "Sin nombre",
    categoria: datos.categoria || "general",
    stock: datos.stock ?? 10, // ?? solo reemplaza null y undefined, no el 0
  };
}
