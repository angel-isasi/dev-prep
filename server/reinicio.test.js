// "Empezar de cero": la marca de reinicio viaja en los ajustes y lo viejo no vuelve.
import { describe, expect, test } from "vitest";
import { aplicarReinicio, fusionarDocumento, reinicioVigente, vaciarProgreso } from "./combinar.js";

const viejo = (extra = {}) => ({
  version: 1,
  config: { nombre: "Angel", metaDiaria: 2, actualizadoEn: "2026-11-10T10:00:00Z" },
  ajustes: { horario: { lun: "normal", en: "2026-11-10T10:00:00Z" } },
  misRespuestas: { pitch: "Soy Angel", historias: [], respuestas: {} },
  ejercicios: { "js-ej-031": { estado: "repasar", ultimaActividad: "2026-11-13T17:00:00Z" } },
  preguntas: { "ent-001": { caja: 2, proximo: "2026-11-20" } },
  quizzes: { closures: { mejor: 4, total: 5 } },
  dias: { "2026-11-13": { resueltos: 2 } },
  items: { "q:1": { caja: 3 } },
  lecturas: { "js-gu-001": { vioSolucion: true } },
  lecciones: { xp: 40, completadas: 2 },
  postulaciones: { p1: { empresa: "Acme", en: "2026-11-12T10:00:00Z" } },
  ...extra,
});
const REINICIO = { id: "r1", en: "2026-11-16T12:00:00Z" };
const reiniciado = () => ({ ...vaciarProgreso(viejo(), "r1"), ajustes: { ...viejo().ajustes, reinicio: REINICIO } });

describe("empezar de cero", () => {
  test("vaciar conserva ajustes, configuración y textos; borra todo el progreso", () => {
    const v = vaciarProgreso(viejo(), "r1");
    expect(v.config.nombre).toBe("Angel");
    expect(v.misRespuestas.pitch).toBe("Soy Angel");
    expect(v.ajustes.horario.lun).toBe("normal");
    expect(v).toMatchObject({ ejercicios: {}, preguntas: {}, quizzes: {}, dias: {}, items: {}, lecturas: {}, epoca: "r1" });
    expect(v.lecciones).toBeUndefined();
    expect(v.postulaciones).toBeUndefined();
  });

  test("el reinicio vigente es el más reciente de los documentos", () => {
    const otro = { ajustes: { reinicio: { id: "r0", en: "2026-11-01T00:00:00Z" } } };
    expect(reinicioVigente(otro, reiniciado()).id).toBe("r1");
    expect(reinicioVigente(viejo())).toBeNull();
  });

  test("un dispositivo viejo que recibe el reinicio se vacía a sí mismo", () => {
    const celular = fusionarDocumento(viejo(), reiniciado(), "laptop");
    expect(celular.epoca).toBe("r1");
    expect(celular.ejercicios).toEqual({});
    expect(celular.lecturas).toEqual({});
    expect(celular.lecciones).toBeUndefined();
    expect(celular.ajustes.reinicio.id).toBe("r1");
    expect(celular.config.nombre).toBe("Angel");
  });

  test("el progreso viejo de otro dispositivo no vuelve al ya reiniciado", () => {
    const laptop = fusionarDocumento(reiniciado(), viejo(), "celular");
    expect(laptop.ejercicios).toEqual({});
    expect(laptop.quizzes).toEqual({});
    expect(laptop.diasRemotos.celular).toEqual({});
    expect(laptop.postulaciones ?? {}).toEqual({});
  });

  test("lo nuevo después del reinicio sí se mezcla normal", () => {
    const despues = {
      ...reiniciado(),
      ejercicios: { "js-ej-001": { estado: "resuelto", resueltoEn: "2026-11-17T10:00:00Z" } },
      dias: { "2026-11-17": { resueltos: 1 } },
    };
    const otro = fusionarDocumento(reiniciado(), despues, "celular");
    expect(otro.ejercicios["js-ej-001"].estado).toBe("resuelto");
    expect(otro.diasRemotos.celular).toEqual({ "2026-11-17": { resueltos: 1 } });
  });

  test("aplicar dos veces el mismo reinicio no vuelve a borrar", () => {
    const despues = { ...reiniciado(), ejercicios: { "js-ej-001": { estado: "resuelto" } } };
    expect(aplicarReinicio(despues)).toBe(despues);
  });
});
