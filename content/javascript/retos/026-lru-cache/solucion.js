export class LRUCache {
  constructor(capacidad) {
    this.capacidad = capacidad;
    // Un Map recuerda el orden de inserción: la primera clave es la más vieja.
    this.mapa = new Map();
  }

  get(clave) {
    if (!this.mapa.has(clave)) return -1;
    const valor = this.mapa.get(clave);
    this.mapa.delete(clave);
    this.mapa.set(clave, valor); // la mueve al final: ahora es la más reciente
    return valor;
  }

  put(clave, valor) {
    if (this.mapa.has(clave)) this.mapa.delete(clave);
    this.mapa.set(clave, valor);

    if (this.mapa.size > this.capacidad) {
      const masAntigua = this.mapa.keys().next().value;
      this.mapa.delete(masAntigua);
    }
  }
}
