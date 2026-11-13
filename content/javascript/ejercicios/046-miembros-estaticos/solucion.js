export class Voto {
  static #total = 0;

  static get total() {
    return Voto.#total;
  }

  static desde(texto) {
    return new Voto(texto.trim().toLowerCase());
  }

  constructor(corto) {
    this.corto = corto;
    Voto.#total++;
  }
}
