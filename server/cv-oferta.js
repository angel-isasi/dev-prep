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

export const CV_BASE_INICIAL = `# PERFIL
Estudiante de 5.º ciclo de Ingeniería de Sistemas en la UNICA, orientado al desarrollo frontend. Entrego sitios web a clientes reales como freelance, trabajo en equipo en un portal universitario en producción y practico a diario con una app propia de preparación técnica. Busco mi primera experiencia práctica para aportar en el desarrollo y la mejora de plataformas web dentro de un equipo.

# EXPERIENCIA
## Desarrollador web en equipo | Rimay, portal de la Facultad de Ciencias de la Comunicación, Turismo y Arqueología (UNICA) | 2026 – Actualidad
rimay.lat · equipo de 3 desarrolladores
- Módulo Festival de Cortometrajes UNICA 2026: publicación simultánea de los cortos, votación con cuenta de Google y estadísticas por video. En producción desde el 17/11/2026.
- Responsable de votación, seguridad y pruebas: revisión del flujo de voto con Google OAuth, protección contra bots con Cloudflare Turnstile y límites por persona.
- Integración continua con PHPUnit (pruebas automáticas en cada pull request) y revisión cruzada de código entre el equipo.
- Stack: Laravel (PHP), MariaDB/MySQL, Alpine.js, Tailwind CSS, Docker; trabajo con ramas y pull requests en GitHub.

## Desarrollador web freelance | Clientes en Guatemala, remoto | 2026 – Actualidad
- La Silenciosa (lasilenciosa.com): sitio de un restaurante con catálogo de productos y pedidos por WhatsApp, con Next.js y CSS, desplegado en Vercel. En producción, con mantenimiento mensual a mi cargo.
- Landing de productos para La Silenciosa (en desarrollo): nueva sección del sitio.
- Landing page de un ebook: página de venta con Next.js y Tailwind CSS, animaciones al desplazarse con IntersectionObserver, desplegada en Vercel.

# PROYECTOS
- dev-prep (dev-prep.angel-isasi.com · github.com/angel-isasi/dev-prep): app que uso a diario para prepararme para entrevistas frontend: ejercicios con tests en vivo (Vitest) al guardar en VS Code, PWA instalable en el celular y progreso sincronizado con AWS Lambda y DynamoDB. React, Vite, Node.js/Express, TypeScript.
- Portafolio personal (angel-isasi.com): Next.js y Tailwind CSS, desplegado en Vercel con dominio propio en Cloudflare.
- Sistema de turnos UNICA: gestión de turnos para servicios administrativos de la universidad. Responsable de la arquitectura y el frontend (React, Vite, Tailwind CSS); backend con FastAPI y MySQL en desarrollo.
- Mini OneDrive en AWS: almacenamiento de archivos serverless con autenticación, carpetas y papelera (Cognito, S3, API Gateway, Lambda, DynamoDB, CloudFront). Participé en el diseño de la arquitectura y los wireframes.

# EDUCACIÓN
## Universidad Nacional San Luis Gonzaga (UNICA) | 2024 – Actualidad
Ingeniería de Sistemas: 5.º ciclo
## Formación complementaria | 2025 – Actualidad
Cursos de desarrollo web en Frontend Masters y Platzi (JavaScript, React) y de cloud en AWS Skill Builder.

# HABILIDADES
- Con soltura: HTML, CSS, diseño responsivo, Git, GitHub, Vercel
- En aprendizaje: JavaScript, React, Next.js, Tailwind CSS, TypeScript, Node.js
- Nivel básico: Python, SQL, PHP (Laravel), pruebas con Vitest y PHPUnit, Docker, AWS (S3, Lambda), Cloudflare (DNS)
- Herramientas: VS Code, Claude Code
- Metodologías: Scrum, trabajo con ramas y pull requests

# CURSOS Y CERTIFICADOS
- JavaScript: The Hard Parts, v3: Frontend Masters, 2026
- Complete Intro to Web Development v3: Frontend Masters, 2026
- AWS Cloud Practitioner Essentials (curso): AWS Skill Builder, 2026
- Scrum Fundamentals Certified (SFC): SCRUMstudy, 2026
- Upper Intermediate English B2: Platzi, 2026

# IDIOMAS
Español (nativo), Inglés (intermedio alto, B2)
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
    .filter((o) => o.puntaje >= umbral && !tienen.has(o.id) && o.marca !== "oculta" && !(o.alertas ?? []).length)
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
