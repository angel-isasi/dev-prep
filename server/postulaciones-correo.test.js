import { describe, expect, it } from "vitest";
import { leerConfirmacion, postulacionesDeCorreos, yaPostulaste } from "./postulaciones-correo.js";

// Asuntos y textos como llegan de verdad (recortados)
const correos = [
  { de: "Indeed Apply <indeedapply@indeed.com>", asunto: "Indeed Application: Practicante Frontend", fecha: "2026-11-24T15:53:05Z", texto: "Your application has been submitted. Good luck!" },
  {
    de: "Bumeran <no_reply@bumeran.com>",
    asunto: "Ya recibieron tu postulación",
    fecha: "2026-11-27T16:24:47Z",
    texto: "   Ya estás un paso más cerca de tu nuevo trabajo\n\n   Te postulaste a\n\n     Programador Web Jr - Primer empleo, Remoto\n\n   Ver postulación\n   Te acercamos estos avisos similares",
  },
  {
    de: "Postulaciones Computrabajo <postulaciones@computrabajo.com>",
    asunto: "Seguimiento de tu postulación para el puesto Desarrollador Junior Full Stack",
    fecha: "2026-11-25T08:27:15Z",
    texto: " Computrabajo\n✔️Tu CV está a la espera de revisión por parte de RBR CONSULTING SERVICES S.A.C.\n| ¡Enhorabuena! Te postulaste con éxito. |\n| Tu CV ya está en manos de RBR CONSULTING SERVICES S.A.C.. |",
  },
  { de: "noreply@airavirtual.com", asunto: "¡Recibimos tu postulación a Practicante Preprofesional de Sistemas en Falabella Perú!", fecha: "2026-11-24T10:00:00Z", texto: "" },
  { de: "careers@sezzle.com", asunto: "Thank you for applying! | Sezzle", fecha: "2026-11-25T12:00:00Z", texto: "Thank you for your interest in the Software Engineer Intern position at Sezzle." },
  { de: "recruiting@joinbairesdev.com", asunto: "BairesDev | Angel, ¡tu postulación está activa! Estos son los próximos pasos", fecha: "2026-11-27T09:00:00Z", texto: "" },
  // No son confirmaciones: alertas y recomendaciones
  { de: "noreply@glassdoor.com", asunto: "Practicante Frontend role at TEINOR SAC: you would be a great fit!", fecha: "2026-11-27T09:00:00Z", texto: "" },
  { de: "jobalerts-noreply@linkedin.com", asunto: "Sermaluc Perú busca personal para un puesto de Desarrollador Frontend", fecha: "2026-11-27T09:00:00Z", texto: "" },
];

describe("confirmaciones de postulación en tu correo", () => {
  it("saca puesto y empresa de cada bolsa", () => {
    expect(leerConfirmacion(correos[0])).toEqual({ puesto: "Practicante Frontend", empresa: "", fuente: "Indeed" });
    expect(leerConfirmacion(correos[1])).toMatchObject({ puesto: "Programador Web Jr - Primer empleo, Remoto", fuente: "Bumeran" });
    expect(leerConfirmacion(correos[2])).toMatchObject({ puesto: "Desarrollador Junior Full Stack", empresa: "RBR CONSULTING SERVICES S.A.C" });
    expect(leerConfirmacion(correos[3])).toMatchObject({ puesto: "Practicante Preprofesional de Sistemas", empresa: "Falabella Perú" });
    expect(leerConfirmacion(correos[4])).toMatchObject({ empresa: "Sezzle", puesto: "Software Engineer Intern" });
    expect(leerConfirmacion(correos[5])).toMatchObject({ empresa: "Bairesdev" });
  });

  it("las alertas y recomendaciones no cuentan como postulación", () => {
    expect(leerConfirmacion(correos[6])).toBeNull();
    expect(leerConfirmacion(correos[7])).toBeNull();
  });

  it("junta todas sin repetir, con un id estable", () => {
    const lista = postulacionesDeCorreos([...correos, correos[0]]);
    expect(lista).toHaveLength(6);
    expect(lista.find((p) => p.fuente === "Indeed")).toMatchObject({ id: "correo-practicante-frontend", fecha: "2026-11-24" });
  });
});

describe("¿ya postulaste a esta oferta?", () => {
  const indeed = { puesto: "Practicante Frontend", empresa: "" };
  it("coincide el puesto aunque la confirmación no traiga la empresa", () => {
    expect(yaPostulaste({ titulo: "Practicante Frontend", empresa: "TEINOR SAC" }, indeed)).toBe(true);
    expect(yaPostulaste({ titulo: "Practicante Backend", empresa: "TEINOR SAC" }, indeed)).toBe(false);
  });
  it("con la empresa conocida, tiene que coincidir también", () => {
    const ct = { puesto: "Desarrollador Junior Full Stack", empresa: "RBR CONSULTING SERVICES S.A.C" };
    expect(yaPostulaste({ titulo: "Desarrollador Junior Full Stack", empresa: "RBR Consulting Services SAC" }, ct)).toBe(false);
    expect(yaPostulaste({ titulo: "Desarrollador Junior Full Stack", empresa: "RBR CONSULTING SERVICES S.A.C." }, ct)).toBe(true);
    expect(yaPostulaste({ titulo: "Desarrollador Junior Full Stack", empresa: "Otra SAC" }, ct)).toBe(false);
  });
});
