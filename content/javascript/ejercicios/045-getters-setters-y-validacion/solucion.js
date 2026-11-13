export class Producto {
  #precio = 0;

  constructor(nombre, precio) {
    this.nombre = nombre;
    this.precio = precio; // pasa por el setter, así también se valida
  }

  get precio() {
    return this.#precio;
  }

  set precio(valor) {
    if (!Number.isFinite(valor) || valor < 0) {
      throw new Error("Precio inválido");
    }
    this.#precio = valor;
  }

  get conIgv() {
    return Number((this.#precio * 1.18).toFixed(2));
  }
}
