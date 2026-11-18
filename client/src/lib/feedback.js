// Una sola respuesta para cada cosa que pasa en la app: sonido, vibración y, en lo grande, confeti.
// Antes cada pantalla lo hacía a su manera (unas sonaban, otras vibraban, otras nada). Ahora todas
// llaman aquí, así un acierto se siente igual en una lección, en un quiz o en una historia.
//
//   feedback.toque()    un toque corto: elegiste algo (solo vibración)
//   feedback.acierto()  respuesta correcta
//   feedback.fallo()    respuesta incorrecta (grave y breve, no un "error" fuerte)
//   feedback.logro(tipo) terminaste algo: "leccion", "ejercicio", "meta" o "logro" (sonido y confeti)
//
// El volumen se elige en Ajustes (lib/sonidos.js) y el confeti respeta "reducir movimiento".
import { celebrar } from "./celebrar.js";
import { sonidos } from "./sonidos.js";

// La vibración solo existe en celulares; en la laptop no hace nada
const vibrar = (patron) => {
  try {
    navigator.vibrate?.(patron);
  } catch {
    // algunos navegadores la bloquean si no hubo un toque antes: no importa
  }
};

export const feedback = {
  toque: () => vibrar(15),
  acierto: () => {
    vibrar(25);
    sonidos.acierto();
  },
  fallo: () => {
    vibrar([40, 60, 40]);
    sonidos.fallo();
  },
  /** @param {"ejercicio"|"leccion"|"meta"|"logro"} [tipo] */
  logro: (tipo = "ejercicio") => {
    vibrar(tipo === "logro" || tipo === "meta" ? [30, 50, 30, 50, 60] : [30, 40, 30]);
    celebrar(tipo);
  },
};
