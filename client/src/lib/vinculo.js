// Reglas del enlace de vincular (/vincular#u=...&t=...), como funciones puras para poder probarlas.
//
// Por qué importa: el enlace decide a qué servidor sube este navegador tu progreso, tu pitch y tus
// historias. Si aceptara cualquier dirección, alguien podría mandarte un enlace con SU servidor y
// quedarse con tus datos (o mandarte un "empezar de cero" falso). Por eso solo se acepta una URL de
// función Lambda de AWS (la que crea "npm run aws:crear") y un token con el formato que genera.

const URL_LAMBDA = /^https:\/\/[a-z0-9]+\.lambda-url\.[a-z0-9-]+\.on\.aws\/?$/;
const TOKEN = /^[a-f0-9]{64}$/;

/** ¿La URL es de una función Lambda de AWS? */
export const urlDeVinculoValida = (url) => typeof url === "string" && URL_LAMBDA.test(url);

/** ¿El token tiene el formato que genera scripts/aws-sync.js (32 bytes en hexadecimal)? */
export const tokenValido = (token) => typeof token === "string" && TOKEN.test(token);

/**
 * Qué hacer con un enlace de vincular.
 * @param {{ url: string|null, token: string|null }} enlace   lo que trae el "#" del enlace
 * @param {{ url?: string }|null} actual                        el vínculo que ya tiene este navegador
 * @returns {"sin-datos"|"invalido"|"mismo"|"confirmar"|"vincular"}
 */
export function decidirVinculo(enlace, actual) {
  if (!enlace.url && !enlace.token) return "sin-datos";
  if (!urlDeVinculoValida(enlace.url) || !tokenValido(enlace.token)) return "invalido";
  if (!actual?.url) return "vincular";
  // Mismo servidor (por ejemplo, después de rotar el token): se actualiza sin preguntar.
  if (actual.url.replace(/\/$/, "") === enlace.url.replace(/\/$/, "")) return "mismo";
  return "confirmar";
}
