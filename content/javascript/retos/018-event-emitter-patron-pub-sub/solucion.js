export class Emisor {
  constructor() {
    this.eventos = {};
  }

  on(evento, fn) {
    (this.eventos[evento] ||= []).push(fn);
    return () => this.off(evento, fn);
  }

  off(evento, fn) {
    this.eventos[evento] = (this.eventos[evento] || []).filter((f) => f !== fn);
  }

  emit(evento, ...args) {
    (this.eventos[evento] || []).forEach((fn) => fn(...args));
  }
}
