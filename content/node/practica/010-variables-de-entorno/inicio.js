// Configuración con variables de entorno
//
// Lee PORT, NODE_ENV, DEBUG y DATABASE_URL del objeto env (todo llega como
// string o undefined), conviértelas, pon valores por defecto y valida.
//
//   leerConfig({ PORT: "8080", DEBUG: "1" })
//     ->  { puerto: 8080, entorno: "development", debug: true, urlBaseDeDatos: "sqlite://local.db" }
//   leerConfig({ PORT: "abc" })  ->  Error: PORT inválido: abc
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

export function leerConfig(env = process.env) {
  // Tu código aquí
}
