// Uso de la laptop: qué programa tienes delante y cuánto tiempo pasas en cada cosa. Lo usa Aksu para
// saber si estás estudiando o en otra cosa, sin interrumpirte cuando estás concentrado.
//
// Privacidad: solo se mira el nombre del programa y el título de su ventana (nunca la pantalla). El
// título se usa aquí para clasificar (por ejemplo, distinguir YouTube de dev-prep en el navegador) y
// no se guarda ni sale de esta laptop: lo único que se guarda es "VS Code: 2 h", "YouTube: 40 min".
import { spawn } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const CADA_SEG = 15;
/** Más de 5 minutos sin tocar teclado ni mouse (y no es un video o un juego): no estás. */
export const QUIETO_SEG = 300;
const DIAS_GUARDADOS = 30;

const NAVEGADORES = /^(chrome|msedge|firefox|brave|opera|vivaldi)$/i;
const SITIOS = [
  [/dev-prep|localhost:4321/i, "dev-prep", "estudio"],
  [/youtube/i, "YouTube", "distraccion"],
  [/netflix|twitch|prime video|disney\+|crunchyroll|kick/i, "Videos y streams", "distraccion"],
  [/facebook|instagram|tiktok|twitter| \/ x$|reddit|9gag/i, "Redes sociales", "distraccion"],
  [/whatsapp|messenger|telegram/i, "Chat", "distraccion"],
  [/mdn|stack overflow|github|react\.dev|developer\.mozilla|w3schools|vite|npm|typescript|javascript|claude|chatgpt/i, "Documentación", "estudio"],
];
const PROGRAMAS = [
  [/^code( - insiders)?$|^cursor$/i, "VS Code", "estudio"],
  [/^(windowsterminal|powershell|pwsh|cmd|wt|git-bash|mintty)$/i, "Terminal", "estudio"],
  [/^dota2$/i, "Dota 2", "distraccion"],
  [/^(steam|steamwebhelper|epicgameslauncher|riotclient.*|leagueclient.*|valorant.*|cs2)$/i, "Juegos", "distraccion"],
  [/^(discord|whatsapp|telegram)$/i, "Chat", "distraccion"],
  [/^(spotify|vlc)$/i, "Música y video", "neutral"],
];

/**
 * Clasifica lo que está delante. Función pura.
 * @returns {{ nombre: string, tipo: "estudio"|"distraccion"|"neutral" } | null} null = nada que contar
 */
export function clasificar(app, titulo = "") {
  const a = String(app ?? "").trim();
  if (!a || /^(lockapp|logonui|searchhost|shellexperiencehost|idle)$/i.test(a)) return null;
  if (NAVEGADORES.test(a)) {
    const sitio = SITIOS.find(([re]) => re.test(titulo));
    return sitio ? { nombre: sitio[1], tipo: sitio[2] } : { nombre: "Navegador (otras páginas)", tipo: "neutral" };
  }
  const programa = PROGRAMAS.find(([re]) => re.test(a));
  if (programa) return { nombre: programa[1], tipo: programa[2] };
  if (/^explorer$/i.test(a)) return { nombre: "Explorador de archivos", tipo: "neutral" };
  return { nombre: a.charAt(0).toUpperCase() + a.slice(1), tipo: "neutral" };
}

export const diaVacio = (fecha) => ({ fecha, apps: {}, horas: {} });

/** Suma una muestra al día. `horas` lleva los segundos de estudio de cada hora (para "tus mejores horas"). */
export function sumar(dia, cosa, segundos, hora) {
  const previo = dia.apps[cosa.nombre] ?? { tipo: cosa.tipo, segundos: 0 };
  const apps = { ...dia.apps, [cosa.nombre]: { tipo: cosa.tipo, segundos: previo.segundos + segundos } };
  const horas = cosa.tipo === "estudio" ? { ...dia.horas, [hora]: (dia.horas[hora] ?? 0) + segundos } : dia.horas;
  return { ...dia, apps, horas };
}

/** El día en una lista ordenada, con totales. */
export function resumen(dia) {
  const lista = Object.entries(dia?.apps ?? {})
    .map(([nombre, v]) => ({ nombre, tipo: v.tipo, segundos: v.segundos }))
    .filter((x) => x.segundos >= 60)
    .sort((x, y) => y.segundos - x.segundos);
  const total = (tipo) => lista.filter((x) => x.tipo === tipo).reduce((s, x) => s + x.segundos, 0);
  return { fecha: dia?.fecha ?? null, lista, estudio: total("estudio"), distraccion: total("distraccion") };
}

/** Las horas del día en las que más estudias, con al menos 3 días de datos. @returns {number[]} hasta 3 horas */
export function mejoresHoras(dias) {
  const conDatos = dias.filter((d) => Object.keys(d.horas ?? {}).length);
  if (conDatos.length < 3) return [];
  const suma = {};
  for (const d of conDatos) for (const [h, s] of Object.entries(d.horas)) suma[h] = (suma[h] ?? 0) + s;
  return Object.entries(suma)
    .filter(([, s]) => s >= 20 * 60)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([h]) => Number(h))
    .sort((a, b) => a - b);
}

const fechaLocal = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/**
 * Arranca el seguimiento (solo en Windows).
 * @param {{ datosDir: string, ahora?: () => Date }} p
 */
export function crearUsoLaptop({ datosDir, ahora = () => new Date() }) {
  const archivo = path.join(datosDir, "uso-laptop.json");
  let dias = []; // del más viejo al de hoy
  let actual = null; // { nombre, tipo, desde } lo que está delante ahora
  let proceso = null;
  let sucio = false;

  const hoy = () => {
    const fecha = fechaLocal(ahora());
    if (dias.at(-1)?.fecha !== fecha) dias = [...dias, diaVacio(fecha)].slice(-DIAS_GUARDADOS);
    return dias.at(-1);
  };

  function muestra({ app, titulo, quieto }) {
    const cosa = clasificar(app, titulo);
    const momento = ahora();
    // Sin tocar nada hace rato: solo cuenta si es algo que se mira sin tocar (video, juego)
    const ausente = quieto >= QUIETO_SEG && !(cosa && /YouTube|Videos|Dota|Juegos/.test(cosa.nombre));
    if (!cosa || ausente) {
      actual = null;
      return;
    }
    const dia = hoy(); // primero: puede abrir un día nuevo
    dias[dias.length - 1] = sumar(dia, cosa, CADA_SEG, momento.getHours());
    sucio = true;
    actual = actual?.nombre === cosa.nombre ? actual : { ...cosa, desde: momento.getTime() };
  }

  async function guardar() {
    if (!sucio) return;
    sucio = false;
    await writeFile(archivo, JSON.stringify({ dias })).catch(() => {});
  }

  async function iniciar() {
    if (process.platform !== "win32") return;
    try {
      const guardado = JSON.parse(await readFile(archivo, "utf8"));
      if (Array.isArray(guardado?.dias)) dias = guardado.dias.filter((d) => d?.fecha && d.apps).slice(-DIAS_GUARDADOS);
    } catch {
      // primera vez o archivo dañado: se empieza de cero
    }
    const guion = path.join(path.dirname(fileURLToPath(import.meta.url)), "ventana-activa.ps1");
    proceso = spawn("powershell.exe", ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", guion], { windowsHide: true, stdio: ["ignore", "pipe", "ignore"] });
    let resto = "";
    proceso.stdout.setEncoding("utf8");
    proceso.stdout.on("data", (trozo) => {
      const lineas = (resto + trozo).split(/\r?\n/);
      resto = lineas.pop() ?? "";
      for (const linea of lineas) {
        try {
          if (linea.trim()) muestra(JSON.parse(linea));
        } catch {
          // una línea rota se ignora
        }
      }
    });
    proceso.on("error", () => {});
    const reloj = setInterval(guardar, 60_000);
    reloj.unref?.();
    proceso.unref?.();
  }

  return {
    iniciar,
    /** Lo que ve la app: el día de hoy, lo que tienes delante y tus mejores horas. Sin títulos de ventana. */
    estado() {
      const momento = ahora().getTime();
      return {
        activo: !!proceso,
        actual: actual ? { nombre: actual.nombre, tipo: actual.tipo, minutos: Math.floor((momento - actual.desde) / 60_000) } : null,
        hoy: resumen(hoy()),
        mejoresHoras: mejoresHoras(dias),
      };
    },
    detener() {
      proceso?.kill();
      return guardar();
    },
    // para los tests
    _muestra: muestra,
  };
}
