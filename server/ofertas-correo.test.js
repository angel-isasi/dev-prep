import { describe, expect, it } from "vitest";
import { fuenteDe, ofertasDeCorreos, ofertasGetOnBoard, ofertasGlassdoor, ofertasLinkedin } from "./ofertas-correo.js";

// Recortes con la misma forma que los correos reales (enlaces acortados)
const LINKEDIN = `Tu alerta de empleo para Desarrollador de front-end en Perú
7 nuevos empleos coinciden con tus preferencias.
Gestionar alertas: https://www.linkedin.com/comm/jobs/alerts?x=1

Programador / Desarrollador Web
PEDREGAL S.A.
Ica

26 personas estudiaron en la misma institución educativa que tú
Solicitar con perfil y CV
Ver anuncio de empleo: https://www.linkedin.com/comm/jobs/view/4492321182/?trackingId=abc

---------------------------------------------------------

Practicante Desarrollo Full stack
Falabella Perú
Lima

Esta empresa busca personal activamente
Ver anuncio de empleo: https://www.linkedin.com/comm/jobs/view/4493210405/?trackingId=def

---------------------------------------------------------

Ver todos los empleos en LinkedIn: https://www.linkedin.com/comm/jobs/search-results/?x=1

Nuevos empleos de tus otras alertas

Empleos de<strong class="font-bold">«Javascript Developer»</strong> en Lima

Junior Forward Deployed AI Engineer - Remote - Latin America
FullStack
Perú

1 contacto
Solicitar con perfil y CV
Ver anuncio de empleo: https://www.linkedin.com/comm/jobs/view/4493218827/?trackingId=ghi

---------------------------------------------------------
`;

const GLASSDOOR = `<table><tr><td><a href="https://www.glassdoor.com/partner/jobListing.htm?pos=101&amp;jobListingId=1010327446010&amp;utm_medium=email" style="x">
<table><tr><td><span>Overskull</span></td></tr><tr><td><b>PROGRAMADOR JUNIOR - VILLA EL SALVADOR</b></td></tr>
<tr><td>Villa El Salvador</td></tr><tr><td><span>Easy Apply</span></td><td>5d</td></tr></table></a></td></tr>
<tr><td><a href="https://www.glassdoor.com/partner/jobListing.htm?pos=102&amp;jobListingId=1010265262027"><div>TEINOR SAC</div><div>Practicante de Inteligencia Artificial</div><div>Trabajo desde casa</div><div>Easy Apply</div></a></td></tr>
<tr><td><a href="https://www.glassdoor.com/Job/villa-el-salvador-jobs.htm">See more</a></td></tr></table>`;

const GETONBOARD = `Featured jobs
- Desarrollador Back-end — BC Tecnología
  https://www.getonbrd.com/jobs/programming/desarrollador-backend-bc-tecnologia-santiago-a1eb?utm_content=x
- QA Engineer Manual and Automation — Improving
  https://www.getonbrd.com/jobs/sysadmin-devops-qa/qa-engineer-manual-and-automation-improving-remote-80a6?utm_content=y
Find more jobs: https://www.getonbrd.com/myjobs`;

describe("ofertas que llegan al correo", () => {
  it("reconoce el remitente", () => {
    expect(fuenteDe("Alertas de empleo de LinkedIn <jobalerts-noreply@linkedin.com>")).toBe("LinkedIn");
    expect(fuenteDe("noreply@glassdoor.com")).toBe("Glassdoor");
    expect(fuenteDe("alguien@empresa.com")).toBeNull();
  });

  it("LinkedIn: puesto, empresa, lugar y enlace limpio, saltando el ruido", () => {
    const o = ofertasLinkedin(LINKEDIN, "2026-11-22");
    expect(o.map((x) => [x.titulo, x.empresa, x.ubicacion])).toEqual([
      ["Programador / Desarrollador Web", "PEDREGAL S.A.", "Ica, Perú"],
      ["Practicante Desarrollo Full stack", "Falabella Perú", "Lima, Perú"],
      ["Junior Forward Deployed AI Engineer - Remote - Latin America", "FullStack", "Perú"],
    ]);
    expect(o[0].url).toBe("https://www.linkedin.com/jobs/view/4492321182/");
    expect(o[0].id).toBe("linkedin:4492321182");
    expect(o[2].remoto).toBe(true);
  });

  it("Glassdoor: cada tarjeta enlazada, sin Easy Apply ni la antigüedad", () => {
    const o = ofertasGlassdoor(GLASSDOOR, "2026-11-22");
    expect(o.map((x) => [x.empresa, x.titulo, x.ubicacion, x.remoto])).toEqual([
      ["Overskull", "PROGRAMADOR JUNIOR - VILLA EL SALVADOR", "Villa El Salvador, Perú", false],
      ["TEINOR SAC", "Practicante de Inteligencia Artificial", "Trabajo desde casa", true],
    ]);
    expect(o[0].url).toContain("jobListingId=1010327446010");
    expect(o[0].url).not.toContain("&amp;");
  });

  it("Get on Board: puesto — empresa y su enlace", () => {
    const o = ofertasGetOnBoard(GETONBOARD, "2026-11-22");
    expect(o.map((x) => [x.titulo, x.empresa, x.remoto])).toEqual([
      ["Desarrollador Back-end", "BC Tecnología", false],
      ["QA Engineer Manual and Automation", "Improving", true],
    ]);
  });

  it("junta todos los correos sin repetir la misma oferta", () => {
    const o = ofertasDeCorreos([
      { de: "jobalerts-noreply@linkedin.com", fecha: "2026-11-21T10:00:00Z", texto: LINKEDIN },
      { de: "jobalerts-noreply@linkedin.com", fecha: "2026-11-22T10:00:00Z", texto: LINKEDIN },
      { de: "noreply@glassdoor.com", fecha: "2026-11-22T10:00:00Z", html: GLASSDOOR },
      { de: "otro@x.com", fecha: "2026-11-22", texto: "nada" },
    ]);
    expect(o).toHaveLength(5);
    expect(o.find((x) => x.id === "linkedin:4492321182").fecha).toBe("2026-11-22");
  });
});
