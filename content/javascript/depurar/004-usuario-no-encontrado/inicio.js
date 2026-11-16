// Buscar usuario por email
//
// Devuelve el usuario cuyo email coincide con el buscado (sin importar
// mayúsculas y minúsculas), o null si no existe.
//
//   buscarPorEmail(usuarios, "ANA@correo.com")  ->  { id: 1, email: "ana@correo.com" }

export function buscarPorEmail(usuarios, email) {
  const buscado = email.toLowerCase();
  let encontrado = null;
  usuarios.forEach((usuario) => {
    if (usuario.email.toLowerCase() === buscado) return usuario;
  });
  return encontrado;
}
