export function crearCarrito() {
  return {
    productos: [],

    agregar(nombre, precio) {
      this.productos.push({ nombre, precio });
      return this;
    },

    total() {
      return this.productos.reduce((suma, producto) => suma + producto.precio, 0);
    },

    cantidad() {
      return this.productos.length;
    },
  };
}
