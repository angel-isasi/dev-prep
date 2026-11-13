export class Playlist {
  #canciones;

  constructor(...canciones) {
    this.#canciones = canciones;
  }

  *[Symbol.iterator]() {
    yield* this.#canciones;
  }
}
