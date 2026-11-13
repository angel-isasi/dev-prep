export const usuario = {
  nombre: "Angel",

  saludar() {
    return `Hola, soy ${this.nombre}`;
  },

  saludarLuego() {
    // La flecha no tiene this propio: usa el this de saludarLuego.
    return new Promise((resolver) => setTimeout(() => resolver(this.nombre), 100));
  },
};

export const saludoLigado = usuario.saludar.bind(usuario);
