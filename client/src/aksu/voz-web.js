// La voz neuronal de Aksu DENTRO del navegador, para el celular (donde no hay motor de la laptop).
// Son las mismas voces de Piper (davefx en español, ryan en inglés), pero el audio se calcula en
// el propio dispositivo con WebAssembly:
//   1. un programa convierte el texto en fonemas (piper_phonemize, en /voz-web/);
//   2. la red neuronal de la voz (un archivo .onnx de 63 MB) convierte los fonemas en sonido.
// La voz se descarga UNA vez, cuando tú lo pides, y queda guardada en el dispositivo (en su
// almacenamiento privado, que no se borra al actualizar la app). Después funciona sin internet.

const BASE = "/voz-web/";
const ORIGEN = "https://huggingface.co/rhasspy/piper-voices/resolve/main";
/** Las voces que se pueden instalar en el dispositivo. */
export const VOCES_WEB = {
  "es_ES-davefx-medium": { ruta: "es/es_ES/davefx/medium", idioma: "es", nombre: "davefx (español)", mb: 63 },
  "en_US-ryan-medium": { ruta: "en/en_US/ryan/medium", idioma: "en", nombre: "ryan (inglés)", mb: 63 },
};

/** ¿Este navegador puede guardar y correr la voz? */
export const puedeVozWeb = () => typeof WebAssembly === "object" && !!globalThis.navigator?.storage?.getDirectory;

const carpeta = async () => (await navigator.storage.getDirectory()).getDirectoryHandle("voz", { create: true });

/** Las voces ya guardadas en este dispositivo. */
export async function vocesWebGuardadas() {
  if (!puedeVozWeb()) return [];
  try {
    const dir = await carpeta();
    const nombres = [];
    for await (const nombre of dir.keys()) nombres.push(nombre);
    return Object.keys(VOCES_WEB).filter((v) => nombres.includes(`${v}.onnx`) && nombres.includes(`${v}.onnx.json`));
  } catch {
    return [];
  }
}

/**
 * Descarga una voz y la guarda en el dispositivo.
 * @param {string} voz
 * @param {(porcentaje: number) => void} [alAvanzar]
 */
export async function descargarVozWeb(voz, alAvanzar) {
  const datos = VOCES_WEB[voz];
  if (!datos || !puedeVozWeb()) throw new Error("Este navegador no puede guardar la voz");
  const dir = await carpeta();
  const url = `${ORIGEN}/${datos.ruta}/${voz}.onnx`;
  const config = await fetch(`${url}.json`);
  if (!config.ok) throw new Error("No se pudo descargar la voz");
  const textoConfig = await config.text();

  const r = await fetch(url);
  if (!r.ok || !r.body) throw new Error("No se pudo descargar la voz");
  const total = Number(r.headers.get("content-length")) || datos.mb * 1024 * 1024;
  // Se escribe a un archivo temporal y solo al terminar toma su nombre: una descarga a medias no cuenta
  const temporal = await dir.getFileHandle(`${voz}.parcial`, { create: true });
  const salida = await temporal.createWritable();
  const lector = r.body.getReader();
  let recibido = 0;
  try {
    for (;;) {
      const { done, value } = await lector.read();
      if (done) break;
      await salida.write(value);
      recibido += value.length;
      alAvanzar?.(Math.min(99, Math.floor((recibido / total) * 100)));
    }
    await salida.close();
  } catch (e) {
    await salida.abort?.().catch(() => {});
    await dir.removeEntry(`${voz}.parcial`).catch(() => {});
    throw e;
  }
  // Copia al nombre definitivo (mover archivos no existe en todos los navegadores)
  const final = await dir.getFileHandle(`${voz}.onnx`, { create: true });
  const w = await final.createWritable();
  await w.write(await temporal.getFile());
  await w.close();
  await dir.removeEntry(`${voz}.parcial`).catch(() => {});
  const fc = await dir.getFileHandle(`${voz}.onnx.json`, { create: true });
  const wc = await fc.createWritable();
  await wc.write(textoConfig);
  await wc.close();
  alAvanzar?.(100);
  await navigator.storage.persist?.().catch(() => {}); // pide al navegador que no la borre si falta espacio
}

/** Borra una voz guardada. */
export async function borrarVozWeb(voz) {
  const dir = await carpeta();
  sesiones.delete(voz);
  await dir.removeEntry(`${voz}.onnx`).catch(() => {});
  await dir.removeEntry(`${voz}.onnx.json`).catch(() => {});
}

// ---------- Generar el audio ----------
let ortListo = null;
/** El motor de inferencia: se carga solo cuando hace falta (pesa 10 MB). */
function motor() {
  ortListo ??= import("onnxruntime-web/wasm").then((m) => {
    const ort = m.default ?? m;
    ort.env.wasm.wasmPaths = BASE;
    ort.env.wasm.numThreads = 1; // varios hilos exigen cabeceras especiales del servidor; con uno funciona en todos lados
    return ort;
  });
  return ortListo;
}

let fonemizadorListo = null;
/** El programa de fonemas es un script clásico: se carga una vez y deja la función createPiperPhonemize. */
function fonemizador() {
  fonemizadorListo ??= new Promise((resolver, rechazar) => {
    if (globalThis.createPiperPhonemize) return resolver(globalThis.createPiperPhonemize);
    const s = document.createElement("script");
    s.src = `${BASE}piper_phonemize.js`;
    s.onload = () => (globalThis.createPiperPhonemize ? resolver(globalThis.createPiperPhonemize) : rechazar(new Error("Sin fonemizador")));
    s.onerror = () => rechazar(new Error("No se pudo cargar el fonemizador"));
    document.head.append(s);
  });
  fonemizadorListo.catch(() => (fonemizadorListo = null));
  return fonemizadorListo;
}

/** Texto → números de fonemas, con la pronunciación del idioma de la voz. */
async function fonemas(texto, idiomaEspeak) {
  const crear = await fonemizador();
  return new Promise((resolver, rechazar) => {
    const tope = setTimeout(() => rechazar(new Error("El fonemizador no respondió")), 20_000);
    crear({
      print: (linea) => {
        try {
          const ids = JSON.parse(linea).phoneme_ids;
          if (Array.isArray(ids)) {
            clearTimeout(tope);
            resolver(ids);
          }
        } catch {
          // líneas que no son el resultado
        }
      },
      printErr: () => {},
      locateFile: (archivo) => `${BASE}${archivo.split("/").pop()}`,
    }).then((modulo) => modulo.callMain(["-l", idiomaEspeak, "--input", JSON.stringify([{ text: texto }]), "--espeak_data", "/espeak-ng-data"]), rechazar);
  });
}

/** Una sesión por voz: la red cargada en memoria (cargarla tarda unos segundos la primera vez). */
const sesiones = new Map();
function sesionDe(voz) {
  if (!sesiones.has(voz)) {
    const lista = (async () => {
      const dir = await carpeta();
      const [modelo, config, ort] = await Promise.all([
        dir.getFileHandle(`${voz}.onnx`).then((h) => h.getFile()).then((f) => f.arrayBuffer()),
        dir.getFileHandle(`${voz}.onnx.json`).then((h) => h.getFile()).then((f) => f.text()).then(JSON.parse),
        motor(),
      ]);
      const red = await ort.InferenceSession.create(modelo, { executionProviders: ["wasm"] });
      return { red, config, ort };
    })();
    lista.catch(() => sesiones.delete(voz));
    sesiones.set(voz, lista);
  }
  return sesiones.get(voz);
}

/** Parte un texto largo en frases, para que cada cálculo sea corto. */
const frases = (texto) => (String(texto).match(/[^.!?…\n]+[.!?…]*\s*/g) ?? [texto]).map((f) => f.trim()).filter(Boolean);

/**
 * Genera el audio de un texto con una voz guardada.
 * @returns {Promise<{ pcm: Float32Array, frecuencia: number }>} muestras de sonido listas para reproducir
 */
export async function audioWeb(texto, voz) {
  const { red, config, ort } = await sesionDe(voz);
  const partes = [];
  for (const frase of frases(texto)) {
    const ids = await fonemas(frase, config.espeak.voice);
    const entradas = {
      input: new ort.Tensor("int64", BigInt64Array.from(ids.map((n) => BigInt(n))), [1, ids.length]),
      input_lengths: new ort.Tensor("int64", BigInt64Array.from([BigInt(ids.length)])),
      scales: new ort.Tensor("float32", Float32Array.from([config.inference.noise_scale, config.inference.length_scale, config.inference.noise_w])),
    };
    if (Object.keys(config.speaker_id_map ?? {}).length) entradas.sid = new ort.Tensor("int64", BigInt64Array.from([0n]));
    const { output } = await red.run(entradas);
    partes.push(Float32Array.from(output.data));
  }
  const pcm = new Float32Array(partes.reduce((n, p) => n + p.length, 0));
  let i = 0;
  for (const p of partes) {
    pcm.set(p, i);
    i += p.length;
  }
  return { pcm, frecuencia: config.audio.sample_rate };
}
