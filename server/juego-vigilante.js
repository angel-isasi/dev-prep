// Vigilante del juego: cada minuto mira si Dota 2 (u otro juego configurado) está abierto en esta
// laptop y suma ese minuto a dias[hoy].juego. Avisa con voz (Windows silencia las notificaciones
// cuando juegas a pantalla completa) a los 10 minutos del final, al llegar a cero y si juegas sin
// haber cumplido la meta. Nunca cierra el juego: lo de más pasa a deuda para mañana.
import { execFile } from "node:child_process";

export const PROCESOS_POR_DEFECTO = ["dota2.exe"];
const CADA_MS = 60_000;

/** ¿Alguno de los procesos está corriendo? (tasklist de Windows; en otros sistemas, siempre no). */
export function procesoAbierto(procesos, ejecutar = execFile) {
  if (process.platform !== "win32" || !procesos.length) return Promise.resolve(false);
  return new Promise((resolver) => {
    ejecutar("tasklist", ["/FO", "CSV", "/NH"], { windowsHide: true, maxBuffer: 4 * 1024 * 1024 }, (error, salida) => {
      if (error) return resolver(false);
      const texto = String(salida).toLowerCase();
      resolver(procesos.some((p) => texto.includes(`"${p.toLowerCase()}"`)));
    });
  });
}

/** Dice un texto en voz alta con la voz de Windows (sin ventanas ni dependencias). */
export function decir(texto) {
  if (process.platform !== "win32") return;
  const seguro = texto.replace(/'/g, "''");
  execFile(
    "powershell.exe",
    ["-NoProfile", "-NonInteractive", "-Command", `Add-Type -AssemblyName System.Speech; $v = New-Object System.Speech.Synthesis.SpeechSynthesizer; try { $v.SelectVoiceByHints('NotSet', 'NotSet', 0, [Globalization.CultureInfo]'es-ES') } catch {}; $v.Speak('${seguro}')`],
    { windowsHide: true },
    () => {},
  );
}

/**
 * Qué aviso corresponde al pasar de un estado a otro (null si ninguno). Función pura.
 * @param {{ restante: number, bloqueado: boolean }|null} antes
 * @param {{ restante: number, bloqueado: boolean, disponible: number }} ahora
 */
export function avisoDe(antes, ahora, jugando) {
  if (!jugando) return null;
  if (ahora.bloqueado && (!antes || !antes.jugando || !antes.bloqueado)) {
    return "Todavía no cumples tu meta de hoy. Lo que juegues ahora se descuenta mañana.";
  }
  if (ahora.bloqueado) return null;
  if (antes && antes.restante > 10 && ahora.restante <= 10 && ahora.restante > 0) return `Te quedan ${ahora.restante} minutos de juego.`;
  if (antes && antes.restante > 0 && ahora.restante === 0) return "Se acabó tu tiempo de juego de hoy. Lo que sigas jugando se descuenta mañana.";
  return null;
}

/**
 * @param {object} p
 * @param {{ sumarJuego: (segundos: number) => Promise<void> }} p.progreso
 * @param {() => object} p.estado             estado del juego de hoy (estadoJuego) con los datos actuales
 * @param {() => string[]} p.procesos         procesos a vigilar
 * @param {(tipo: string, datos: object) => void} p.emitir   evento SSE "juego"
 * @param {(texto: string) => void} [p.avisar]  aviso extra (por ejemplo, push al celular)
 */
export function crearVigilante({ progreso, estado, procesos, emitir, avisar = () => {} }) {
  let anterior = null;
  let jugando = false;

  async function revisar() {
    jugando = await procesoAbierto(procesos());
    if (jugando) await progreso.sumarJuego(60);
    const ahora = estado();
    const aviso = avisoDe(anterior, ahora, jugando);
    if (aviso) {
      decir(aviso);
      avisar(aviso);
    }
    anterior = { ...ahora, jugando };
    emitir("juego", { ...ahora, jugando });
  }

  const intervalo = setInterval(() => revisar().catch(() => {}), CADA_MS);
  intervalo.unref?.();
  revisar().catch(() => {});
  return {
    jugando: () => jugando,
    detener: () => clearInterval(intervalo),
  };
}
