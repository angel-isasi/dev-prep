// Infraestructura de la sincronización en AWS (usa tu AWS CLI ya configurado):
//   npm run aws:crear    crea o actualiza la Lambda, la URL y la tabla (aws/sincronizar.yaml)
//   npm run aws:borrar   borra todo (la tabla con tus datos incluida)
//   npm run aws:estado   muestra la URL y si responde
//   npm run aws:rotar    cambia el token secreto (si se filtró el QR): luego vuelve a vincular el celular
// El token secreto y las claves de los avisos se generan la primera vez y se guardan en
// data/sync.json (no va al repo). El código de la Lambda (aws/lambda/index.js) se empaqueta con
// Vite en un solo archivo y se sube después de desplegar la plantilla.
import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { build } from "vite";
import { config } from "../server/config.js";
import { generarClavesVapid } from "../server/webpush.js";
import { crearZip } from "./zip.js";

const PILA = "devprep-sync";
const REGION = "us-east-1";
const PLANTILLA = path.join(config.raiz, "aws", "sincronizar.yaml");
const ARCHIVO = path.join(config.datosDir, "sync.json");

const aws = (...args) => execFileSync("aws", [...args, "--region", REGION], { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] });

async function leerSync() {
  return JSON.parse(await readFile(ARCHIVO, "utf8").catch(() => "{}"));
}

async function guardarSync(datos) {
  await mkdir(config.datosDir, { recursive: true });
  await writeFile(ARCHIVO, JSON.stringify(datos, null, 2));
}

/** Empaqueta aws/lambda/index.js y lo sube como código de la función. */
async function subirCodigo() {
  console.log("Empaquetando el código de la Lambda…");
  await build({ configFile: path.join(config.raiz, "aws", "lambda", "vite.config.js") });
  const codigo = await readFile(path.join(config.raiz, "aws", "lambda", "dist", "index.mjs"));
  const zip = path.join(config.raiz, "aws", "lambda", "dist", "funcion.zip");
  await writeFile(zip, crearZip([{ nombre: "index.mjs", contenido: codigo }]));
  aws("lambda", "wait", "function-updated", "--function-name", "devprep-sincronizar");
  aws("lambda", "update-function-code", "--function-name", "devprep-sincronizar", "--zip-file", `fileb://${zip}`, "--query", "LastUpdateStatus", "--output", "text");
  aws("lambda", "wait", "function-updated", "--function-name", "devprep-sincronizar");
  console.log("Código subido.");
}

async function crear() {
  const sync = await leerSync();
  sync.token ??= randomBytes(32).toString("hex");
  sync.dispositivo ??= "laptop";
  // Claves de los avisos (Web Push): la pública va a los navegadores; la privada solo a la Lambda
  if (!sync.vapid) sync.vapid = generarClavesVapid();
  await guardarSync(sync);
  // Si un intento anterior falló al crearse, la pila queda en ROLLBACK_COMPLETE y hay que borrarla antes.
  const previo = (() => {
    try {
      return aws("cloudformation", "describe-stacks", "--stack-name", PILA, "--query", "Stacks[0].StackStatus", "--output", "text").trim();
    } catch {
      return null;
    }
  })();
  if (previo === "ROLLBACK_COMPLETE") {
    console.log("Borrando un intento anterior que falló…");
    aws("cloudformation", "delete-stack", "--stack-name", PILA);
    aws("cloudformation", "wait", "stack-delete-complete", "--stack-name", PILA);
  }
  console.log("Creando o actualizando la pila en AWS (tarda 1 o 2 minutos)…");
  aws("cloudformation", "deploy", "--template-file", PLANTILLA, "--stack-name", PILA, "--capabilities", "CAPABILITY_IAM", "--parameter-overrides", `Token=${sync.token}`, `VapidPublica=${sync.vapid.publica}`, `VapidPrivada=${sync.vapid.privada}`, "--no-fail-on-empty-changeset");
  await subirCodigo();
  const salidas = JSON.parse(aws("cloudformation", "describe-stacks", "--stack-name", PILA, "--query", "Stacks[0].Outputs", "--output", "json"));
  sync.url = salidas.find((o) => o.OutputKey === "Url").OutputValue;
  await guardarSync(sync);
  console.log(`Listo. URL: ${sync.url}`);
  await estado();
}

async function borrar() {
  console.log("Borrando la pila (Lambda, URL y tabla con los datos)…");
  aws("cloudformation", "delete-stack", "--stack-name", PILA);
  aws("cloudformation", "wait", "stack-delete-complete", "--stack-name", PILA);
  const sync = await leerSync();
  delete sync.url;
  await guardarSync(sync);
  console.log("Borrado.");
}

async function estado() {
  const sync = await leerSync();
  if (!sync.url) return console.log("No hay sincronización creada. Usa: npm run aws:crear");
  const r = await fetch(sync.url, { headers: { authorization: `Bearer ${sync.token}` } });
  const cuerpo = await r.json().catch(() => ({}));
  console.log(`URL: ${sync.url}\nRespuesta: ${r.status} · dispositivos guardados: ${(cuerpo.documentos ?? []).map((d) => d.dispositivo).join(", ") || "ninguno"}`);
  const sinToken = await fetch(sync.url);
  console.log(`Sin token responde ${sinToken.status} (debe ser 401).`);
}

/** Cambia el token: el viejo deja de funcionar al instante. Hay que volver a escanear el QR. */
async function rotar() {
  const sync = await leerSync();
  sync.token = randomBytes(32).toString("hex");
  await guardarSync(sync);
  console.log("Token nuevo generado. Actualizando AWS…");
  await crear();
  console.log("Listo: reinicia dev-prep y vuelve a vincular el celular con el QR de Ajustes.");
}

const comandos = { crear, borrar, estado, rotar };
const comando = comandos[process.argv[2]];
if (!comando) {
  console.log("Uso: node scripts/aws-sync.js crear | borrar | estado");
  process.exit(1);
}
await comando();
