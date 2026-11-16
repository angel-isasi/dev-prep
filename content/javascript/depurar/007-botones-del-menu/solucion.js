// Acciones del menú
//
// Recibe las opciones del menú y devuelve una función por opción, para usarla
// como manejador de clic. Cada función devuelve el texto
// "Elegiste: <opción> (n.º <posición>)".
//
//   const acciones = crearAcciones(["Inicio", "Perfil"]);
//   acciones[1]()  ->  "Elegiste: Perfil (n.º 2)"

export function crearAcciones(opciones) {
  const acciones = [];
  for (let i = 0; i < opciones.length; i++) { // let crea una i nueva en cada vuelta
    acciones.push(() => `Elegiste: ${opciones[i]} (n.º ${i + 1})`);
  }
  return acciones;
}
