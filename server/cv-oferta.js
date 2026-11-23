// CV para cada oferta: la IA reordena y reescribe tu CV base según lo que pide una oferta, sin inventar.
// Aquí van las partes puras (las prueba cv-oferta.test.js): el CV base inicial, qué ofertas reciben su
// CV solas, el resumen de la búsqueda para Aksu y el id de una oferta pegada a mano.
//
// El CV base no lleva teléfono ni correo: este archivo está en un repositorio público. Esos datos salen
// del formulario "Mi CV" de la app, que se guarda solo en tu progreso.
import { diasEntre } from "./postulaciones.js";

/** Desde este puntaje (de 0 a 100) una oferta recibe su CV sin que lo pidas. */
export const UMBRAL_CV_AUTO = 80;
/** Como mucho, cuántos CV se hacen solos por día (cada uno cuesta unos 5 centavos de dólar). */
export const MAX_CV_AUTO_DIA = 2;
/** Puntaje desde el que una oferta cuenta como "buena" en el resumen para Aksu. */
export const PUNTAJE_BUENA = 65;

/**
 * Formato del CV base: las primeras líneas (antes del primer "#") son el encabezado: tu nombre, tu
 * titular y tus datos de contacto. Después, cada "# Sección" y, dentro, cada "## Puesto".
 */
export function encabezadoDe(texto = "") {
  const corte = texto.search(/^# /m);
  const lineas = (corte === -1 ? "" : texto.slice(0, corte))
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return { nombre: lineas[0] ?? "", titular: lineas[1] ?? "", contacto: lineas.slice(2), cuerpo: corte === -1 ? texto : texto.slice(corte) };
}

export const CV_BASE_INICIAL = `Angel Fernando Isasi Oyolo
Estudiante de Ingeniería de Sistemas | Desarrollo Web
Ica, Perú
LinkedIn: linkedin.com/in/angel-isasi-oyolo • GitHub: github.com/angel-isasi • Portafolio: angel-isasi.com

# PERFIL
Estudiante de 5.º ciclo de Ingeniería de Sistemas en la UNICA, orientado al desarrollo web. Formo parte del equipo de desarrollo del portal RIMAY de la universidad, entrego sitios web a clientes reales como freelance y busco seguir creciendo dentro de un equipo, en modalidad remota.

# EXPERIENCIA
## Practicante de Desarrollo Web: RIMAY, portal de la UNICA | Nov 2026 – Actualidad
Facultad de Ciencias de la Comunicación, Turismo y Arqueología. Equipo de 3 estudiantes.
- Desarrollo del módulo de votación del Festival de Cortos con Laravel, Filament y MariaDB: inicio de sesión con Google (OAuth / Socialite) y protección antibots con Cloudflare Turnstile en el endpoint de votos.
- Configuración de Google Cloud y Cloudflare para el portal, y pruebas de extremo a extremo del flujo de votación.
- Integración continua con GitHub Actions para ejecutar las pruebas (PHPUnit) en cada pull request. Trabajo con ramas por tarea, commits convencionales y revisión cruzada de código.
- Propuesta de rediseño del portal con Next.js, TypeScript, Tailwind CSS y Sanity (CMS) en Vercel.

## Desarrollador Web Freelance | 2026 – Actualidad
Clientes en Guatemala, modalidad remota.
- La Silenciosa (lasilenciosa.com): sitio web de un restaurante con catálogo de productos y pedidos vía WhatsApp, con Next.js y despliegue en Vercel. En producción, con mantenimiento mensual a mi cargo.

# PROYECTOS
## dev-prep: plataforma propia para prepararme como desarrollador frontend | 2026 – Actualidad
dev-prep.angel-isasi.com · React, TypeScript, Node.js, AWS Lambda y DynamoDB, Vercel, API de Claude
- Más de 500 ejercicios (JavaScript, React, TypeScript, Node.js, algoritmos) con pruebas en Vitest que corren en vivo al guardar en VS Code, y repaso espaciado.
- Tutor con IA (API de Claude en funciones serverless de Vercel): corrige ejercicios, simula entrevistas por voz y adapta mi CV a cada oferta sin inventar datos.
- Buscador de ofertas que junta bolsas de empleo y alertas de LinkedIn y Glassdoor leídas de Gmail (Apps Script) y las puntúa según mi perfil.
- PWA que funciona sin internet, progreso sincronizado en AWS, más de 650 pruebas automáticas y política de seguridad (CSP).

## Otros proyectos
- Mini OneDrive en AWS (en desarrollo): almacenamiento serverless con Cognito, S3, Lambda, DynamoDB y CloudFront; diseño de la arquitectura y versión propia con AWS CDK y CI en GitHub Actions.
- Sistema de turnos UNICA (en desarrollo): React y FastAPI + MySQL; responsable de la arquitectura y del frontend.
- Portafolio personal (angel-isasi.com): Next.js y Tailwind CSS en Vercel, con dominio propio en Cloudflare.

# EDUCACIÓN
## Universidad Nacional San Luis Gonzaga (UNICA) | 2024 – Actualidad
Ingeniería de Sistemas: 5.º ciclo

# HABILIDADES
Frontend: HTML, CSS, JavaScript, TypeScript, React, Next.js, Tailwind CSS
Backend y datos: PHP / Laravel, Node.js, Python / FastAPI, SQL (MySQL, SQL Server)
Cloud: AWS (Lambda, S3, DynamoDB, Cognito, CDK), Vercel, Cloudflare
Herramientas: Git, GitHub, GitHub Actions, VS Code, Claude Code
Metodologías: Scrum, Jira
Idiomas: Español (nativo), Inglés (intermedio)

# CURSOS Y CERTIFICADOS
- AWS Cloud Practitioner Essentials (curso): AWS Skill Builder, 2026
- JavaScript: The Hard Parts, v3 y Complete Intro to Web Development v3: Frontend Masters, 2026
- Scrum Fundamentals Certified (SFC): SCRUMstudy, 2026
- Upper Intermediate English B2: Platzi, 2026
`;

/** Un id corto y estable para una oferta pegada a mano (el mismo texto da el mismo id). */
export function idOfertaPegada(texto) {
  let h = 5381;
  for (const c of String(texto).trim()) h = ((h << 5) + h + c.codePointAt(0)) >>> 0;
  return `pegada-${h.toString(36)}`;
}

/**
 * Qué ofertas reciben su CV solas hoy: las de puntaje alto, sin CV todavía, que no ocultaste ni
 * parecen estafa, de la mejor a la peor y sin pasar el tope del día.
 * @param {object[]} ofertas ya puntuadas (con id, puntaje, marca, alertas)
 * @param {{ conCv: Set<string>|string[], hechosHoy?: number, umbral?: number, max?: number }} opciones
 */
export function ofertasParaCvAuto(ofertas, { conCv, hechosHoy = 0, umbral = UMBRAL_CV_AUTO, max = MAX_CV_AUTO_DIA }) {
  const tienen = new Set(conCv);
  const quedan = Math.max(0, max - hechosHoy);
  return ofertas
    // Sin la descripción (las del correo solo traen el título) no se puede adaptar bien un CV
    .filter((o) => o.puntaje >= umbral && !tienen.has(o.id) && o.marca !== "oculta" && !(o.alertas ?? []).length && String(o.texto ?? "").length >= 300)
    .sort((a, b) => b.puntaje - a.puntaje)
    .slice(0, quedan);
}

/**
 * La búsqueda de trabajo en pocas líneas, para que Aksu sepa cómo vas.
 * @param {{ ofertas?: object[], cvs?: object[], postulaciones?: object[], hoy: string }} datos
 */
export function resumenBusqueda({ ofertas = [], cvs = [], postulaciones = [], hoy }) {
  const buenas = ofertas.filter((o) => o.puntaje >= PUNTAJE_BUENA && o.marca !== "oculta");
  const nuevas = buenas.filter((o) => o.nueva);
  const mejor = buenas.reduce((m, o) => (!m || o.puntaje > m.puntaje ? o : m), null);
  const recientes = cvs.filter((c) => c.fecha && diasEntre(c.fecha, hoy) <= 7);
  const sinUsar = cvs.filter((c) => !postulaciones.some((p) => p.enlace && p.enlace === c.url));
  const porEtapa = {};
  for (const p of postulaciones) porEtapa[p.etapa ?? "por-postular"] = (porEtapa[p.etapa ?? "por-postular"] ?? 0) + 1;
  const esperando = postulaciones.filter((p) => p.etapa === "enviada" && p.enviadaEl && diasEntre(p.enviadaEl.slice(0, 10), hoy) >= 7);
  const lineas = [
    `Ofertas que le convienen (${PUNTAJE_BUENA}/100 o más): ${buenas.length}${nuevas.length ? `, ${nuevas.length} nuevas desde su última visita` : ""}.`,
    mejor ? `La mejor: "${mejor.titulo}" en ${mejor.empresa || mejor.fuente} (${mejor.puntaje}/100).` : "",
    cvs.length
      ? `CV hechos para ofertas: ${cvs.length} en total, ${recientes.length} esta semana${sinUsar.length ? `; ${sinUsar.length} todavía sin postular` : ""}.`
      : "Todavía no hizo ningún CV para una oferta.",
    postulaciones.length
      ? `Postulaciones: ${Object.entries(porEtapa)
          .map(([etapa, n]) => `${n} ${etapa}`)
          .join(", ")}.`
      : "No registró ninguna postulación.",
    esperando.length ? `${esperando.length} enviadas hace 7 días o más sin respuesta (toca escribir para hacer seguimiento).` : "",
  ];
  return lineas.filter(Boolean).join("\n");
}

/** Toca contarle cómo va su búsqueda cada 3 días (y el primer día que hay datos). */
export const tocaResumenBusqueda = (hoy, ultimo) => !ultimo || diasEntre(ultimo, hoy) >= 3;
