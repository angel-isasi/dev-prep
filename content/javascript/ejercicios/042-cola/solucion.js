export class Cola {
  #items = [];

  encolar(elemento) {
    this.#items.push(elemento);
    return this;
  }

  atender() {
    return this.#items.shift();
  }

  get vacia() {
    return this.#items.length === 0;
  }
}
