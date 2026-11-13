export class MinStack {
  constructor() {
    this.pila = []; // los valores
    this.minimos = []; // minimos[i] = el mínimo de pila[0..i]
  }

  push(x) {
    this.pila.push(x);
    // El nuevo mínimo es el menor entre x y el mínimo que había.
    const minimo = this.minimos.length === 0 ? x : Math.min(x, this.getMin());
    this.minimos.push(minimo);
  }

  pop() {
    // Las dos pilas siempre tienen el mismo tamaño: saco de ambas.
    this.minimos.pop();
    return this.pila.pop();
  }

  top() {
    return this.pila[this.pila.length - 1];
  }

  getMin() {
    return this.minimos[this.minimos.length - 1];
  }
}
