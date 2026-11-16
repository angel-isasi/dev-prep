// Lambda de dev-prep (se empaqueta en un solo archivo con "npm run aws:crear"; ver scripts/aws-sync.js).
//
// Con token (Authorization: Bearer):
//   GET  /                 documentos de todos los dispositivos y la clave pública de los avisos
//   PUT  /                 guarda el documento de un dispositivo
//   POST /push/suscribir   guarda la suscripción a avisos de un dispositivo
//   POST /push/quitar      la borra
//   POST /push/probar      manda un aviso de prueba a todos tus dispositivos
//   POST /avisar           manda un aviso ya armado (lo usa la laptop, por ejemplo al acabarse el tiempo de juego)
// Sin token:
//   evento programado (EventBridge, cada 30 min): decide si toca avisar (server/avisos.js) y envía.
//   A las 11:00 (hora de Lima) además busca ofertas de trabajo nuevas (server/ofertas-auto.js).
import { DeleteItemCommand, DynamoDBClient, GetItemCommand, PutItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { gunzipSync, gzipSync } from "node:zlib";
import { createHash, timingSafeEqual } from "node:crypto";
import { decidirAvisos, HORA_OFERTAS, horaLocal, rutaDeAviso } from "../../server/avisos.js";
import { buscarOfertas, ofertasParaAvisar, ordenarOfertas } from "../../server/ofertas-auto.js";
import { enviarAviso } from "../../server/webpush.js";

const db = new DynamoDBClient({});
const TABLA = process.env.TABLA;
const MAX = 300 * 1024;
const VAPID = { publica: process.env.VAPID_PUBLICA, privada: process.env.VAPID_PRIVADA };

const resp = (statusCode, body) => ({ statusCode, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
const hash = (t) => createHash("sha256").update(t).digest();
function autorizado(cabeceras) {
  const t = String(cabeceras.authorization ?? "").replace(/^Bearer /, "");
  return t.length > 0 && !!process.env.TOKEN && timingSafeEqual(hash(t), hash(process.env.TOKEN));
}
const cuerpoDe = (event) => {
  const texto = event.isBase64Encoded ? Buffer.from(event.body ?? "", "base64").toString() : (event.body ?? "{}");
  return JSON.parse(texto || "{}");
};

/** Todos los ítems de la tabla, separados en documentos, suscripciones y estado de avisos. */
async function leerTodo() {
  const items = [];
  let desde;
  do {
    const r = await db.send(new ScanCommand({ TableName: TABLA, ExclusiveStartKey: desde }));
    items.push(...(r.Items ?? []));
    desde = r.LastEvaluatedKey;
  } while (desde);
  const documentos = items
    .filter((i) => i.doc?.B && !i.dispositivo.S.includes("#"))
    .map((i) => ({
      dispositivo: i.dispositivo.S,
      actualizado: i.actualizado?.S,
      doc: JSON.parse(gunzipSync(Buffer.from(i.doc.B)).toString()),
    }));
  const suscripciones = items
    .filter((i) => i.dispositivo.S.startsWith("push#") && i.suscripcion?.S)
    .map((i) => ({ clave: i.dispositivo.S, suscripcion: JSON.parse(i.suscripcion.S) }));
  return { documentos, suscripciones };
}

/** Envía a todas las suscripciones; borra las que el servicio dice que ya no existen. */
async function enviarATodos(suscripciones, datos) {
  let enviados = 0;
  for (const { clave, suscripcion } of suscripciones) {
    try {
      const estado = await enviarAviso(suscripcion, datos, VAPID);
      if (estado === 404 || estado === 410) await db.send(new DeleteItemCommand({ TableName: TABLA, Key: { dispositivo: { S: clave } } }));
      else if (estado < 300) enviados++;
    } catch (error) {
      console.error("No se pudo enviar a", clave, error.message);
    }
  }
  return enviados;
}

/**
 * Una vez al día, a las 11:00: busca ofertas en las bolsas de trabajo y devuelve las buenas que
 * todavía no te avisó. Recuerda los ids ya vistos en "estado#ofertas" para no repetirlas.
 */
async function ofertasDeHoy() {
  const { fecha, hora } = horaLocal(new Date());
  if (hora !== HORA_OFERTAS) return [];
  const r = await db.send(new GetItemCommand({ TableName: TABLA, Key: { dispositivo: { S: "estado#ofertas" } } }));
  const estado = r.Item?.estado?.S ? JSON.parse(r.Item.estado.S) : { ids: [] };
  if (estado.fecha === fecha) return [];
  try {
    const pedir = (url, opciones = {}) =>
      fetch(url, { ...opciones, headers: { ...opciones.headers, "User-Agent": "dev-prep (app personal de estudio)" } });
    const { ofertas } = await buscarOfertas(pedir, { espera: 6000 });
    const ordenadas = ordenarOfertas(ofertas, { hoy: fecha }, { limite: 300 });
    const nuevas = ofertasParaAvisar(ordenadas, estado.ids ?? []);
    const ids = [...new Set([...nuevas.map((o) => o.id), ...(estado.ids ?? [])])].slice(0, 600);
    await db.send(
      new PutItemCommand({
        TableName: TABLA,
        Item: { dispositivo: { S: "estado#ofertas" }, estado: { S: JSON.stringify({ fecha, ids }) } },
      }),
    );
    return nuevas;
  } catch (error) {
    console.error("No se pudieron buscar ofertas:", error.message);
    return [];
  }
}

/** Cada 30 minutos: ¿toca avisar? */
async function revisarAvisos() {
  if (!VAPID.publica) return { avisos: 0 };
  const { documentos, suscripciones } = await leerTodo();
  if (!suscripciones.length || !documentos.length) return { avisos: 0 };
  const r = await db.send(new GetItemCommand({ TableName: TABLA, Key: { dispositivo: { S: "estado#avisos" } } }));
  const estado = r.Item?.estado?.S ? JSON.parse(r.Item.estado.S) : {};
  const ofertasNuevas = await ofertasDeHoy();
  const { avisos, estado: nuevo } = decidirAvisos(documentos, new Date(), estado, { ofertasNuevas });
  for (const a of avisos) await enviarATodos(suscripciones, { titulo: a.titulo, cuerpo: a.cuerpo, url: a.url, tipo: a.tipo });
  await db.send(
    new PutItemCommand({ TableName: TABLA, Item: { dispositivo: { S: "estado#avisos" }, estado: { S: JSON.stringify(nuevo) } } }),
  );
  return { avisos: avisos.length };
}

export const handler = async (event) => {
  // Evento programado de EventBridge (no trae token: lo invoca AWS, no internet)
  if (event?.source === "aws.events" || event?.["detail-type"] === "Scheduled Event") return revisarAvisos();

  const metodo = event.requestContext?.http?.method;
  const ruta = event.rawPath ?? "/";
  if (!autorizado(event.headers ?? {})) return resp(401, { error: "No autorizado" });

  try {
    if (metodo === "GET") {
      const { documentos } = await leerTodo();
      return resp(200, { documentos, vapidPublica: VAPID.publica ?? null });
    }
    if (metodo === "PUT") {
      const cuerpo = cuerpoDe(event);
      const dispositivo = String(cuerpo.dispositivo ?? "");
      if (!/^[a-z0-9-]{3,40}$/.test(dispositivo)) return resp(400, { error: "Dispositivo inválido" });
      const comprimido = gzipSync(JSON.stringify(cuerpo.doc ?? {}));
      if (comprimido.length > MAX) return resp(413, { error: "El documento es demasiado grande" });
      const actualizado = new Date().toISOString();
      await db.send(
        new PutItemCommand({
          TableName: TABLA,
          Item: { dispositivo: { S: dispositivo }, actualizado: { S: actualizado }, doc: { B: comprimido } },
        }),
      );
      return resp(200, { actualizado });
    }
    if (metodo === "POST" && ruta === "/push/suscribir") {
      const { dispositivo, suscripcion } = cuerpoDe(event);
      if (
        !/^[a-z0-9-]{3,40}$/.test(String(dispositivo ?? "")) ||
        !suscripcion?.endpoint?.startsWith("https://") ||
        !suscripcion.keys?.p256dh
      ) {
        return resp(400, { error: "Suscripción inválida" });
      }
      await db.send(
        new PutItemCommand({
          TableName: TABLA,
          Item: {
            dispositivo: { S: `push#${dispositivo}` },
            suscripcion: { S: JSON.stringify(suscripcion) },
            actualizado: { S: new Date().toISOString() },
          },
        }),
      );
      return resp(200, { ok: true });
    }
    if (metodo === "POST" && ruta === "/push/quitar") {
      const { dispositivo } = cuerpoDe(event);
      await db.send(new DeleteItemCommand({ TableName: TABLA, Key: { dispositivo: { S: `push#${String(dispositivo ?? "")}` } } }));
      return resp(200, { ok: true });
    }
    if (metodo === "POST" && (ruta === "/push/probar" || ruta === "/avisar")) {
      const { suscripciones } = await leerTodo();
      const c = ruta === "/avisar" ? cuerpoDe(event) : {};
      const datos =
        ruta === "/avisar"
          ? { titulo: String(c.titulo ?? "dev-prep").slice(0, 80), cuerpo: String(c.cuerpo ?? "").slice(0, 200), url: rutaDeAviso(c.url) }
          : { titulo: "Avisos activados", cuerpo: "Así te avisará dev-prep. ¡A practicar!", url: "/" };
      return resp(200, { enviados: await enviarATodos(suscripciones, datos) });
    }
    return resp(405, { error: "Método no permitido" });
  } catch (error) {
    console.error(error);
    return resp(500, { error: "Error interno" });
  }
};
