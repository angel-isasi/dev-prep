// Cambiar la ciudad del usuario
//
// Devuelve un usuario NUEVO con la ciudad de su dirección cambiada.
// El usuario original (y su dirección) no se modifican: la pantalla
// "Editar perfil" lo guarda para mostrar el antes y para poder deshacer.
//
//   cambiarCiudad({ nombre: "Ana", direccion: { calle: "Av. Sol 123", ciudad: "Lima" } }, "Cusco")
//   ->  { nombre: "Ana", direccion: { calle: "Av. Sol 123", ciudad: "Cusco" } }

export function cambiarCiudad(usuario, ciudad) {
  const copia = { ...usuario, direccion: { ...usuario.direccion } }; // copiar también el objeto anidado
  copia.direccion.ciudad = ciudad;
  return copia;
}
