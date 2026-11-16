// Activar los avisos (Web Push) en este dispositivo: pide permiso, se suscribe con la clave pública
// de la Lambda y guarda la suscripción en AWS (con el token del vínculo). Solo funciona en la versión
// publicada (https) y con el dispositivo vinculado.
import { leerVinculo, miDispositivo, sincronizar } from "./sync-movil.js";

const disponible = () => "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

/** Clave pública en base64url a los bytes que pide el navegador. */
function aBytes(base64url) {
  const relleno = "=".repeat((4 - (base64url.length % 4)) % 4);
  const binario = atob((base64url + relleno).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(binario, (c) => c.charCodeAt(0));
}

async function pedirLambda(ruta, cuerpo) {
  const v = leerVinculo();
  const r = await fetch(`${v.url.replace(/\/$/, "")}${ruta}`, {
    method: "POST",
    headers: { authorization: `Bearer ${v.token}`, "content-type": "application/json" },
    body: JSON.stringify(cuerpo),
    signal: AbortSignal.timeout(10_000),
  });
  if (!r.ok) throw new Error(r.status === 401 ? "El vínculo ya no es válido: vuelve a escanear el QR." : `AWS respondió ${r.status}`);
  return r.json();
}

/** @returns {Promise<"no-disponible"|"sin-vinculo"|"bloqueado"|"activos"|"apagados">} */
export async function estadoAvisos() {
  if (!disponible()) return "no-disponible";
  if (!leerVinculo()) return "sin-vinculo";
  if (Notification.permission === "denied") return "bloqueado";
  const registro = await navigator.serviceWorker.getRegistration();
  const sub = await registro?.pushManager.getSubscription();
  return sub ? "activos" : "apagados";
}

export async function activarAvisos() {
  if (!disponible()) throw new Error("Este navegador no permite avisos.");
  if (!leerVinculo()) throw new Error("Primero vincula este dispositivo (Ajustes de la laptop, QR).");
  let clave = leerVinculo().vapidPublica;
  if (!clave) {
    await sincronizar(); // trae la clave pública de los avisos
    clave = leerVinculo()?.vapidPublica;
  }
  if (!clave) throw new Error("Los avisos todavía no están activados en AWS.");
  const permiso = await Notification.requestPermission();
  if (permiso !== "granted") throw new Error("No diste permiso para los avisos.");
  const registro = await navigator.serviceWorker.ready;
  let sub;
  try {
    sub = (await registro.pushManager.getSubscription()) ?? (await registro.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: aBytes(clave) }));
  } catch (error) {
    // "push service error": el navegador no logra conectarse al servicio de avisos de Google (red, VPN,
    // antivirus o firewall que bloquea mtalk.google.com). No depende de dev-prep.
    if (error.name === "AbortError") {
      throw new Error("Chrome no pudo conectarse al servicio de avisos de Google. Revisa en chrome://gcm-internals que diga CONNECTED; si no, suele ser una VPN, el antivirus o el firewall. En el celular sí debería funcionar.");
    }
    throw error;
  }
  await pedirLambda("/push/suscribir", { dispositivo: miDispositivo(), suscripcion: sub.toJSON() });
}

export async function desactivarAvisos() {
  const registro = await navigator.serviceWorker.getRegistration();
  const sub = await registro?.pushManager.getSubscription();
  await sub?.unsubscribe();
  if (leerVinculo()) await pedirLambda("/push/quitar", { dispositivo: miDispositivo() }).catch(() => {});
}

/** Manda un aviso de prueba a todos tus dispositivos. */
export const probarAvisos = () => pedirLambda("/push/probar", {});
