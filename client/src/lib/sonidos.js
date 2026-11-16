// Sonidos cortos y suaves, generados con Web Audio (sin archivos, funcionan sin internet).
// Volumen bajo y ataque lento: nada de fanfarrias. Se apagan o suben en Ajustes (por dispositivo).
const CLAVE = "devprep-sonido";
export const NIVELES_SONIDO = { apagado: 0, suave: 0.05, normal: 0.11 };

export const nivelSonido = () => {
  const v = localStorage.getItem(CLAVE);
  return v in NIVELES_SONIDO ? v : "suave";
};
export const cambiarSonido = (nivel) => localStorage.setItem(CLAVE, nivel);

let contexto = null;
function audio() {
  const Ctx = globalThis.AudioContext ?? globalThis.webkitAudioContext;
  if (!Ctx) return null;
  contexto ??= new Ctx();
  if (contexto.state === "suspended") contexto.resume().catch(() => {});
  return contexto;
}

/** Notas (frecuencia en Hz, inicio y duración en s) con envolvente suave. */
function tocar(notas, { tipo = "sine" } = {}) {
  const volumen = NIVELES_SONIDO[nivelSonido()];
  if (!volumen) return;
  const ctx = audio();
  if (!ctx) return;
  const t0 = ctx.currentTime + 0.01;
  for (const [frecuencia, inicio, duracion] of notas) {
    const osc = ctx.createOscillator();
    const gan = ctx.createGain();
    osc.type = tipo;
    osc.frequency.value = frecuencia;
    gan.gain.setValueAtTime(0, t0 + inicio);
    gan.gain.linearRampToValueAtTime(volumen, t0 + inicio + 0.02);
    gan.gain.exponentialRampToValueAtTime(0.0001, t0 + inicio + duracion);
    osc.connect(gan).connect(ctx.destination);
    osc.start(t0 + inicio);
    osc.stop(t0 + inicio + duracion + 0.05);
  }
}

export const sonidos = {
  /** Dos notas hacia arriba, cortas. */
  acierto: () => tocar([[660, 0, 0.12], [880, 0.08, 0.18]]),
  /** Una nota grave y breve (no es un "error" fuerte). */
  fallo: () => tocar([[220, 0, 0.22]], { tipo: "triangle" }),
  /** Acorde suave al terminar una lección. */
  leccion: () => tocar([[523, 0, 0.35], [659, 0.1, 0.35], [784, 0.2, 0.45]]),
  /** Meta del día cumplida. */
  meta: () => tocar([[587, 0, 0.3], [740, 0.12, 0.3], [880, 0.24, 0.5]]),
  /** Insignia o nivel nuevo. */
  logro: () => tocar([[784, 0, 0.25], [988, 0.1, 0.25], [1175, 0.2, 0.6]]),
};
