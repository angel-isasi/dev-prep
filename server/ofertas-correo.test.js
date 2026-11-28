import { describe, expect, it } from "vitest";
import { fuenteDe, ofertasBumeran, ofertasComputrabajo, ofertasComputrabajoNuevo, ofertasDeCorreos, ofertasGetOnBoard, ofertasGlassdoor, ofertasIndeed, ofertasLinkedin } from "./ofertas-correo.js";

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
<table><tr><td><span>4.1 ★</span></td></tr><tr><td><span>Overskull</span></td></tr><tr><td><b>PROGRAMADOR JUNIOR - VILLA EL SALVADOR</b></td></tr>
<tr><td>Villa El Salvador</td></tr><tr><td><span>Easy Apply</span></td><td>5d</td></tr></table></a></td></tr>
<tr><td><a href="https://www.glassdoor.com/partner/jobListing.htm?pos=102&amp;jobListingId=1010265262027"><div>TEINOR SAC</div><div>Practicante de Inteligencia Artificial</div><div>Trabajo desde casa</div><div>Easy Apply</div></a></td></tr>
<tr><td><a href="https://www.glassdoor.com/Job/villa-el-salvador-jobs.htm">See more</a></td></tr></table>`;

const GETONBOARD = `Featured jobs
- Desarrollador Back-end — BC Tecnología
  https://www.getonbrd.com/jobs/programming/desarrollador-backend-bc-tecnologia-santiago-a1eb?utm_content=x
- QA Engineer Manual and Automation — Improving
  https://www.getonbrd.com/jobs/sysadmin-devops-qa/qa-engineer-manual-and-automation-improving-remote-80a6?utm_content=y
Find more jobs: https://www.getonbrd.com/myjobs`;

// Bumeran: texto plano con tabulaciones y líneas vacías entre los datos de cada aviso
const BUMERAN = "\tHola Angel, te acercamos estos empleos que Jobi encontró para ti\n\n\t\tPublicado hace 7 días\n\n\t\t\t Programador Senior\n\t\t\t Pedregal\n\t\t\t Ica, Ica\n\t\t\t Full-time\n\t\t\t Presencial\n\n\t\t\t\tApto discapacidad\n\n\t\t\t\t\tPostularme\n\n\t\tPublicado hace 7 días\n\n\t\t\t Practicante Community Manager\n\t\t\t Bravva Agencia de Marketing Digital 360\n\t\t\t Ica, Ica\n\t\t\t Full-time\n\t\t\t Presencial\n\n\t\t\t\tApto discapacidad\n\n\t\t\t\t\tPostularme\n\n\t\tPublicado hace más de 15 días\n\n\t\t\t DESARROLLADOR JUNIOR DE SOFTWARE - CANALES ALTERNATIVOS - ICA\n\t\t\t Caja Ica\n\t\t\t Ica, Ica\n\t\t\t Full-time\n\t\t\t Presencial\n\n\t\t\t\tApto discapacidad\n\n\t\t\t\t\tPostularme\n\n\t\tPublicado hace 5 días\n\n\t\t\t Funerario/Chofer - Ica\n\t\t\t MAPFRE PERU\n\t\t\t Ica, Ica\n\t\t\t Full-time\n\t\t\t Presencial\n\n\t\t\t\tApto discapacidad\n\n\t\t\t\t\tPostularme\n\n\t\tPublicado hace 2 días\n\n\t\t\t Desarrollador Frontend React\n\t\t\t Empresa X\n\t\t\t Lima, Lima\n\t\t\t Full-time\n\t\t\t Remoto\n\n\t\t\t\tApto discapacidad\n\n\t\t\t\t\tPostularme\n\n\tTe recomendamos empleos según tu perfil. ¿No es lo que estás buscando?\n";

const INDEED = `Alerta de empleo de Indeed
6 puestos disponibles de practicante desarrollo web en Perú

Practicante de Desarrollo Web
R&C CONSULTING - Lince, Lima
Postulación vía Indeed
Desarrollo web: HTML, PHP y WordPress.
hace 4 días
https://pe.indeed.com/rc/clk/dl?jk=ea715c40933d00cb&from=ja&qd=x

Practicante de Recursos Humanos - Grupo Falabella Perú
Grupo Falabella - San Isidro, Lima
Participar en iniciativas de atracción de talento.
hace 5 días
https://pe.indeed.com/rc/clk/dl?jk=43c5176018a07ca5&from=ja

Desarrollador Frontend React
Empresa Y - Remote
S/.3000 por mes
hace 1 día
https://pe.indeed.com/rc/clk/dl?jk=00aa11bb22cc33dd&from=ja
`;

const CT = (titulo, empresa, id) =>
  `[| || || || Sé el primero en postularte || ${titulo} || 4.2 ${empresa} || Marcona, Ica || S/. 2.000,00 (Mensual) || Hoy |](https://go.computrabajo.com/go/app/o_detail?url=https%3A%2F%2Fpe.computrabajo.com%2Fofertas-de-trabajo%2Foferta-de-trabajo-de-x-${id}%3Futm_source%3Dauto&idp=1)`;
const COMPUTRABAJO = `Computrabajo
${CT("Auxiliar operativo", "Coopsol Consultoria", "AC9BEDF5AF168E6561373E686DCF3405")}
${CT("Practicante de Sistemas", "Caja Ica", "BB9BEDF5AF168E6561373E686DCF3405")}`;

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

  it("Bumeran: solo los puestos de programación, con enlace a la búsqueda del puesto", () => {
    expect(fuenteDe("Bumeran <no_reply@bumeran.com>")).toBe("Bumeran");
    const o = ofertasBumeran(BUMERAN, "2026-11-24");
    expect(o.map((x) => [x.titulo, x.empresa, x.ubicacion, x.remoto])).toEqual([
      ["Programador Senior", "Pedregal", "Ica, Ica, Perú", false],
      ["DESARROLLADOR JUNIOR DE SOFTWARE - CANALES ALTERNATIVOS - ICA", "Caja Ica", "Ica, Ica, Perú", false],
      ["Desarrollador Frontend React", "Empresa X", "Lima, Lima (remoto)", true],
    ]);
    expect(o[0].url).toBe("https://www.bumeran.com.pe/empleos-busqueda-programador-senior.html");
    expect(o[0].id).toBe("bumeran:programador-senior-pedregal");
    expect(ofertasDeCorreos([{ de: "no_reply@bumeran.com", fecha: "2026-11-24T09:00:00Z", texto: BUMERAN }])).toHaveLength(3);
  });

  it("Indeed: solo los de programación, con empresa, lugar y enlace al aviso", () => {
    expect(fuenteDe("Indeed <donotreply@jobalert.indeed.com>")).toBe("Indeed");
    const o = ofertasIndeed(INDEED, "2026-11-25");
    expect(o.map((x) => [x.titulo, x.empresa, x.ubicacion, x.remoto, x.url])).toEqual([
      ["Practicante de Desarrollo Web", "R&C CONSULTING", "Lince, Lima, Perú", false, "https://pe.indeed.com/viewjob?jk=ea715c40933d00cb"],
      ["Desarrollador Frontend React", "Empresa Y", "Remoto", true, "https://pe.indeed.com/viewjob?jk=00aa11bb22cc33dd"],
    ]);
    expect(ofertasDeCorreos([{ de: "donotreply@jobalert.indeed.com", fecha: "2026-11-25T02:00:00Z", texto: INDEED }])).toHaveLength(2);
  });

  it("Computrabajo: decodifica el enlace real y salta lo que no es de programación", () => {
    expect(fuenteDe("trabajos_pe@computrabajo.com")).toBe("Computrabajo");
    const o = ofertasComputrabajo(COMPUTRABAJO, "2026-11-25");
    expect(o).toHaveLength(1);
    expect(o[0]).toMatchObject({
      id: "computrabajo:BB9BEDF5AF168E6561373E686DCF3405",
      titulo: "Practicante de Sistemas",
      empresa: "Caja Ica",
      ubicacion: "Marcona, Ica, Perú",
      url: "https://pe.computrabajo.com/ofertas-de-trabajo/oferta-de-trabajo-de-x-BB9BEDF5AF168E6561373E686DCF3405",
    });
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

describe("correos con saltos de línea de Windows y formatos nuevos", () => {
  it("LinkedIn con saltos de Windows lee todas las ofertas del resumen, no solo la primera", () => {
    const CRLF = String.fromCharCode(13, 10);
    const bloque = (n, titulo) =>
      [titulo, `Empresa ${n}`, "Lima", "1 persona estudió en la misma institución educativa que tú", `Ver anuncio de empleo: https://www.linkedin.com/comm/jobs/view/${n}/`, ""].join(CRLF);
    const texto = [bloque(11, "Programador junior"), bloque(22, "Desarrollador Frontend")].join(`${CRLF}------------------------------${CRLF}`);
    const lista = ofertasDeCorreos([{ de: "jobalerts-noreply@linkedin.com", fecha: "2026-11-27", texto }]);
    expect(lista.map((o) => [o.titulo, o.empresa, o.ubicacion])).toEqual([
      ["Programador junior", "Empresa 11", "Lima, Perú"],
      ["Desarrollador Frontend", "Empresa 22", "Lima, Perú"],
    ]);
  });

  it("Computrabajo con el formato de noviembre: puesto entre asteriscos y enlace entre < >", () => {
    const destino = "https://pe.computrabajo.com/ofertas-de-trabajo/oferta-de-trabajo-de-practicante-en-ica-AC9BEDF5AF168E6561373E686DCF3405?utm=1";
    const enlace = (sufijo) => `<https://go.computrabajo.com/go/app/o_detail?url=${encodeURIComponent(destino + sufijo)}&idp=1>`;
    const texto = [
      "Sé el primero en postularte",
      "*Practicante de desarrollo web*",
      "[image: star]*4.2 *[image: verificada] Coopsol",
      "Ica, Ica",
      "S/. 1.200,00 (Mensual)",
      "Hoy",
      enlace(""),
      "*Auxiliar operativo*",
      "Otra",
      "Ica",
      enlace("&x=2"),
    ].join("\n");
    const lista = ofertasComputrabajoNuevo(texto, "2026-11-27");
    expect(lista).toHaveLength(1);
    expect(lista[0]).toMatchObject({ titulo: "Practicante de desarrollo web", empresa: "Coopsol", ubicacion: "Ica, Ica, Perú" });
    expect(lista[0].url.startsWith("https://pe.computrabajo.com/ofertas-de-trabajo/")).toBe(true);
  });
});
