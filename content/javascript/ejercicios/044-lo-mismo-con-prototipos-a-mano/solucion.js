const metodosUsuario = {
  saludar() {
    return `Hola, soy ${this.nombre}`;
  },
};

export function crearUsuario(nombre) {
  const usuario = Object.create(metodosUsuario);
  usuario.nombre = nombre;
  return usuario;
}
