export class Pila {
  #items = [];

  apilar(elemento) {
    this.#items.push(elemento);
    return this;
  }

  desapilar() {
    return this.#items.pop();
  }

  verTope() {
    return this.#items.at(-1);
  }

  get tamano() {
    return this.#items.length;
  }
}
