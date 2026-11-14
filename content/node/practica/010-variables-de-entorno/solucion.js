const ENTORNOS = ["development", "production", "test"];

/** Devuelve el valor de la variable, o undefined si no existe o está vacía. */
const leer = (env, nombre) => (env[nombre] ? env[nombre] : undefined);

export function leerConfig(env = process.env) {
  // PORT: string -> número entero, validado.
  const textoPuerto = leer(env, "PORT") ?? "3000";
  const puerto = Number(textoPuerto);
  if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535) {
    throw new Error(`PORT inválido: ${textoPuerto}`);
  }

  // NODE_ENV: solo valores conocidos (un error de tipeo no debe pasar desapercibido).
  const entorno = leer(env, "NODE_ENV") ?? "development";
  if (!ENTORNOS.includes(entorno)) {
    throw new Error(`NODE_ENV inválido: ${entorno}`);
  }

  // DEBUG: el string "false" es truthy, así que se compara explícitamente.
  const debug = ["true", "1"].includes(leer(env, "DEBUG"));

  // DATABASE_URL: obligatoria en producción, con valor por defecto en el resto.
  const url = leer(env, "DATABASE_URL");
  if (entorno === "production" && !url) {
    throw new Error("Falta DATABASE_URL en producción");
  }

  return { puerto, entorno, debug, urlBaseDeDatos: url ?? "sqlite://local.db" };
}
