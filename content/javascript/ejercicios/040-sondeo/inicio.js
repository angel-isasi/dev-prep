// Sondeo
//
// Llama a `consultar` cada `intervalo` ms hasta que devuelva algo verdadero
// (y devuelve ese valor) o hasta hacer `intentos` consultas sin éxito
// (y entonces rechaza con new Error("Se agotaron los intentos")).
//
//   await sondear(estadoDespliegue, 100, 5)  ->  "publicado"
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

export async function sondear(consultar, intervalo, intentos) {
  // Tu código aquí
}
