export class Usuario {
  constructor(nombre) {
    this.nombre = nombre;
  }

  puede(accion) {
    return accion === "leer";
  }

  describir() {
    return `${this.nombre} (${this.constructor.name})`;
  }
}

export class Editor extends Usuario {
  puede(accion) {
    return accion === "publicar" || super.puede(accion);
  }
}
