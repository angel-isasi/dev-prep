// Cargar nombres de participantes
//
// Recibe una lista de ids y la función obtenerUsuario(id), que devuelve una
// promesa con el usuario ({ id, nombre }). Devuelve (en una promesa) los
// nombres, en el mismo orden que los ids. Pide todos los usuarios a la vez.
//
//   await cargarNombres([1, 2], obtenerUsuario)  ->  ["Ana", "Luis"]

export async function cargarNombres(ids, obtenerUsuario) {
  const usuarios = await Promise.all(ids.map((id) => obtenerUsuario(id))); // espera todas las promesas
  return usuarios.map((usuario) => usuario.nombre);
}
