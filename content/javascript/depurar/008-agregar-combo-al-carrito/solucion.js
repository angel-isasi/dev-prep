// Carrito de compras
//
// agregar(item) suma un producto ({ nombre, precio }).
// agregarVarios(items) suma varios de golpe (un combo).
// total() devuelve la suma de los precios.

export class Carrito {
  constructor() {
    this.items = [];
  }

  agregar(item) {
    this.items.push(item);
  }

  agregarVarios(items) {
    items.forEach((item) => { // la flecha usa el this de agregarVarios
      this.agregar(item);
    });
  }

  total() {
    return this.items.reduce((suma, item) => suma + item.precio, 0);
  }
}
