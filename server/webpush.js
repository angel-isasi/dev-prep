// Notificaciones Web Push sin librerías, solo con node:crypto (lo usa la Lambda de AWS).
// - VAPID (RFC 8292): firma ES256 que identifica a quien envía el aviso.
// - Cifrado aes128gcm (RFC 8188 y RFC 8291): el contenido viaja cifrado; Google o Apple solo lo reenvían.
import { createCipheriv, createECDH, createPrivateKey, createPublicKey, generateKeyPairSync, hkdfSync, randomBytes, sign, verify } from "node:crypto";

export const b64url = (buf) => Buffer.from(buf).toString("base64url");
export const deB64url = (texto) => Buffer.from(texto, "base64url");

/** Par de claves VAPID nuevo: { publica (65 bytes en base64url), privada (32 bytes en base64url) }. */
export function generarClavesVapid() {
  const { privateKey } = generateKeyPairSync("ec", { namedCurve: "prime256v1" });
  const jwk = privateKey.export({ format: "jwk" });
  const publica = Buffer.concat([Buffer.from([4]), deB64url(jwk.x), deB64url(jwk.y)]);
  return { publica: b64url(publica), privada: jwk.d };
}

/** Clave privada de node:crypto a partir de las claves VAPID guardadas. */
function clavePrivadaVapid({ publica, privada }) {
  const pub = deB64url(publica);
  return createPrivateKey({ key: { kty: "EC", crv: "P-256", d: privada, x: b64url(pub.subarray(1, 33)), y: b64url(pub.subarray(33, 65)) }, format: "jwk" });
}

/**
 * Cabecera Authorization de VAPID para un endpoint de push.
 * @param {string} endpoint   URL del servicio de push (FCM, Mozilla, Apple)
 * @param {{ publica: string, privada: string }} claves
 * @param {string} sujeto     contacto de quien envía (una URL https o mailto:)
 */
export function cabeceraVapid(endpoint, claves, sujeto, ahora = Date.now()) {
  const encabezado = b64url(JSON.stringify({ typ: "JWT", alg: "ES256" }));
  const carga = b64url(JSON.stringify({ aud: new URL(endpoint).origin, exp: Math.floor(ahora / 1000) + 12 * 3600, sub: sujeto }));
  const firma = sign("sha256", Buffer.from(`${encabezado}.${carga}`), { key: clavePrivadaVapid(claves), dsaEncoding: "ieee-p1363" });
  return `vapid t=${encabezado}.${carga}.${b64url(firma)}, k=${claves.publica}`;
}

/** Verifica una firma VAPID (para los tests). */
export function verificarVapid(cabecera, claves) {
  const [, token] = cabecera.match(/t=([^,]+)/) ?? [];
  const [a, b, firma] = token.split(".");
  const pub = deB64url(claves.publica);
  const clave = createPublicKey({ key: { kty: "EC", crv: "P-256", x: b64url(pub.subarray(1, 33)), y: b64url(pub.subarray(33, 65)) }, format: "jwk" });
  const valida = verify("sha256", Buffer.from(`${a}.${b}`), { key: clave, dsaEncoding: "ieee-p1363" }, deB64url(firma));
  return { valida, carga: JSON.parse(deB64url(b).toString()) };
}

const hkdf = (sal, ikm, info, largo) => Buffer.from(hkdfSync("sha256", ikm, sal, info, largo));

/**
 * Cifra el contenido de un aviso para una suscripción (RFC 8291, un solo registro).
 * @param {string|Buffer} contenido
 * @param {{ p256dh: string, auth: string }} claves  de la suscripción del navegador (base64url)
 * @param {{ privadaEfimera?: Buffer, sal?: Buffer }} [pruebas]  solo para los tests (vector del RFC)
 * @returns {Buffer} cuerpo de la petición (Content-Encoding: aes128gcm)
 */
export function cifrarAviso(contenido, { p256dh, auth }, { privadaEfimera, sal = randomBytes(16) } = {}) {
  const uaPublica = deB64url(p256dh);
  const secretoAuth = deB64url(auth);
  const ecdh = createECDH("prime256v1");
  if (privadaEfimera) ecdh.setPrivateKey(privadaEfimera);
  else ecdh.generateKeys();
  const asPublica = ecdh.getPublicKey();
  const secretoEcdh = ecdh.computeSecret(uaPublica);

  const infoClave = Buffer.concat([Buffer.from("WebPush: info\0"), uaPublica, asPublica]);
  const ikm = hkdf(secretoAuth, secretoEcdh, infoClave, 32);
  const cek = hkdf(sal, ikm, Buffer.from("Content-Encoding: aes128gcm\0"), 16);
  const nonce = hkdf(sal, ikm, Buffer.from("Content-Encoding: nonce\0"), 12);

  const cifrador = createCipheriv("aes-128-gcm", cek, nonce);
  const texto = Buffer.concat([Buffer.from(contenido), Buffer.from([2])]); // 2 = último registro, sin relleno
  const cifrado = Buffer.concat([cifrador.update(texto), cifrador.final(), cifrador.getAuthTag()]);

  const tamRegistro = Buffer.alloc(4);
  tamRegistro.writeUInt32BE(4096);
  return Buffer.concat([sal, tamRegistro, Buffer.from([asPublica.length]), asPublica, cifrado]);
}

/**
 * Envía un aviso. Devuelve el código HTTP (201 = enviado; 404 o 410 = la suscripción ya no existe).
 * @param {{ endpoint: string, keys: { p256dh: string, auth: string } }} suscripcion
 * @param {object} datos   { titulo, cuerpo, url }
 * @param {{ publica: string, privada: string }} claves  VAPID
 */
export async function enviarAviso(suscripcion, datos, claves, { sujeto = "https://dev-prep.angel-isasi.com", pedir = fetch } = {}) {
  const cuerpo = cifrarAviso(JSON.stringify(datos), suscripcion.keys);
  const r = await pedir(suscripcion.endpoint, {
    method: "POST",
    headers: {
      Authorization: cabeceraVapid(suscripcion.endpoint, claves, sujeto),
      "Content-Encoding": "aes128gcm",
      "Content-Type": "application/octet-stream",
      TTL: "43200",
      Urgency: "normal",
    },
    body: cuerpo,
  });
  return r.status;
}
