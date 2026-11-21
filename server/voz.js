// Voz neuronal de Aksu, generada en esta laptop con Piper (un programa libre que no necesita
// internet). El navegador solo trae voces sintéticas antiguas; Piper suena fluido y con entonación.
//
// Vive fuera del repositorio, en data/voz/: el programa (piper/piper.exe) y una o más voces
// (archivos .onnx con su .onnx.json). No se queda abierto: arranca cuando hay algo que decir,
// genera el audio (menos de un segundo por frase) y se cierra, así que en reposo no gasta nada.
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { readdir, readFile, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const MAX_TEXTO = 900;

/** El texto como JSON solo con caracteres ASCII: así las tildes llegan bien al programa en Windows. */
export const lineaJson = (texto) => JSON.stringify({ text: texto }).replace(/[\u0080-￿]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`);

/** Deja el texto listo para leerse en voz alta: sin Markdown ni símbolos que el programa deletrearía. */
export const limpiarParaVoz = (texto) =>
  String(texto ?? "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[`*_#>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_TEXTO);

/** @param {{ datosDir: string }} p */
export function crearVoz({ datosDir }) {
  const carpeta = path.resolve(datosDir, "voz");
  const programa = path.join(carpeta, "piper", "piper.exe");

  /** Las voces instaladas: los nombres de los .onnx (sin extensión). */
  async function voces() {
    if (process.platform !== "win32" || !existsSync(programa)) return [];
    const archivos = await readdir(carpeta).catch(() => []);
    return archivos.filter((a) => a.endsWith(".onnx") && archivos.includes(`${a}.json`)).map((a) => a.slice(0, -5));
  }

  /**
   * Genera el audio (WAV) de un texto.
   * @param {string} texto
   * @param {string} [voz]  nombre de la voz; si no existe, la primera instalada
   * @returns {Promise<Buffer>}
   */
  async function sintetizar(texto, voz) {
    const limpio = limpiarParaVoz(texto);
    const lista = await voces();
    if (!limpio || !lista.length) throw new Error("No hay voz instalada");
    const elegida = lista.includes(voz) ? voz : lista[0];
    const salida = path.join(tmpdir(), `devprep-voz-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.wav`);
    await new Promise((resolver, rechazar) => {
      const p = spawn(programa, ["--model", path.join(carpeta, `${elegida}.onnx`), "--json-input", "--output_file", salida], { cwd: path.dirname(programa), windowsHide: true, stdio: ["pipe", "ignore", "ignore"] });
      const tope = setTimeout(() => p.kill(), 20_000);
      p.on("error", rechazar);
      p.on("close", (codigo) => {
        clearTimeout(tope);
        codigo === 0 ? resolver() : rechazar(new Error("El programa de voz falló"));
      });
      p.stdin.end(`${lineaJson(limpio)}\n`);
    });
    try {
      return await readFile(salida);
    } finally {
      unlink(salida).catch(() => {});
    }
  }

  return { voces, sintetizar };
}
